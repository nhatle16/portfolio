"use client";

import { useEffect, useRef } from "react";
import { Coffee, Cpu, Gamepad2, Headphones, Keyboard, MemoryStick, Mouse, Send, Tablet } from "lucide-react";

const SIZE = 28; // icon size in px
const MAX_OBJECTS = 3; // most objects on screen at once
const SPAWN_MS = 2200; // average gap between new objects
const TRAIL_VISIBLE_MS = 3000; // each trail piece stays this long…
const TRAIL_FADE_MS = 1000; // …then fades out over this long
const OPACITY = 0.85; // how strong objects and trails are

// Isometric Rubik's cube with a 3x3 grid on each face (lucide has no Rubik's cube).
function RubiksCube({ size, strokeWidth }: { size: number; strokeWidth: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round">
      <path d="M12 2 21 7v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10" />
      <path d="M9 3.67 18 8.67M6 5.33l9 5M15 3.67 6 8.67M18 5.33l-9 5" />
      <path d="M6 8.67v10M9 10.33v10M3 10.33l9 5M3 13.67l9 5" />
      <path d="M15 10.33v10M18 8.67v10M12 15.33l9-5M12 18.67l9-5" />
    </svg>
  );
}

const ICONS = [RubiksCube, Keyboard, MemoryStick, Tablet, Send, Cpu, Mouse, Headphones, Gamepad2, Coffee];
const PAPER_PLANE = ICONS.indexOf(Send); // points along its path instead of spinning

// Snake-like steering: the heading drifts randomly (curvy, random direction) and a sine wave
// pushes the object side to side as it goes (wavy).
const MAX_TURN = 1.2; // fastest turn, radians per second
const TURN_JITTER = 4; // how quickly the turning changes
const WANDER_MS = 20000; // after this, stop turning so the object heads off-screen
const PERSONAL_SPACE = 260; // px; objects closer than this steer away from each other
const AVOID_STRENGTH = 2.5; // how hard they turn away, radians per second at full strength

// Each object gets its own mix of these, so no two move quite alike.
type Motion = {
  wobble: number; // deg: rocks back and forth by up to this much
  wobbleSpeed: number; // rocks per second
  pulse: number; // grows/shrinks by up to this fraction ("breathing")
  pulseSpeed: number;
  flipSpeed: number; // turns over like a spinning coin; 0 = no flip
  phase: number; // random start so they don't sync up
};

// Pick a random personality: a steady spinner, a rocker, or a coin-flipper, all gently breathing.
const randomMotion = (): { spin: number; motion: Motion } => {
  const r = Math.random;
  const style = Math.floor(r() * 3);
  return {
    spin: style === 0 ? (r() < 0.5 ? -1 : 1) * (40 + r() * 80) : 0,
    motion: {
      wobble: style === 1 ? 20 + r() * 25 : 6 + r() * 6,
      wobbleSpeed: 0.4 + r() * 0.6,
      pulse: 0.08 + r() * 0.12,
      pulseSpeed: 0.3 + r() * 0.5,
      flipSpeed: style === 2 ? 0.3 + r() * 0.4 : 0,
      phase: r() * Math.PI * 2,
    },
  };
};

type Point = { x: number; y: number; t: number };
type FloatingObject = {
  el: SVGElement;
  cx: number; // centre of the slither (the wave is added on top)
  cy: number;
  heading: number; // radians
  turn: number; // radians per second, wanders randomly
  speed: number; // px per second
  travelled: number; // px, drives the wave
  born: number;
  wave: { amplitude: number; wavelength: number; phase: number }; // side-to-side slither
  rot: number;
  spin: number; // deg per second of steady rotation (0 for wobblers and flippers)
  motion: Motion;
  plane: boolean;
  trail: Point[];
  gone: boolean; // left the screen; its trail may still be fading
};

// Decorative background: icons slither across the screen like snakes, leaving dashed trails
// whose pieces fade 3 seconds after they're drawn. Off for visitors who prefer reduced motion.
export function FloatingObjects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const layer = layerRef.current;
    const templates = templatesRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !layer || !templates || !ctx) return;

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Light mode only: dark mode shows SpaceBackground instead, so pause while the sun/moon toggle says dark.
    const color = "#000";
    let dark = false;
    const readTheme = () => {
      dark = document.documentElement.dataset.theme === "dark";
    };
    readTheme();
    const themeObserver = new MutationObserver(readTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const objects: FloatingObject[] = [];

    const spawn = () => {
      const kind = Math.floor(Math.random() * ICONS.length);
      const el = templates.children[kind].cloneNode(true) as SVGElement;
      el.style.position = "absolute";
      el.style.left = "0";
      el.style.top = "0";
      layer.appendChild(el);

      // Start just outside a random edge, first heading towards a point on screen; from there the steering
      // takes over. Try a few random options and keep the one farthest from the objects already on screen,
      // so they spread over the whole screen instead of bunching up.
      const m = SIZE;
      const live = objects.filter((o) => !o.gone);
      const nearest = (x: number, y: number) =>
        live.reduce((d, o) => Math.min(d, Math.hypot(o.cx - x, o.cy - y)), Infinity);
      let best = { sx: 0, sy: 0, aimX: 0, aimY: 0, score: -1 };
      for (let tries = 0; tries < 8; tries++) {
        const [sx, sy] = [
          [-m, Math.random() * height],
          [width + m, Math.random() * height],
          [Math.random() * width, -m],
          [Math.random() * width, height + m],
        ][Math.floor(Math.random() * 4)];
        const aimX = width * (0.15 + Math.random() * 0.7);
        const aimY = height * (0.15 + Math.random() * 0.7);
        const score = Math.min(nearest(sx, sy), nearest(aimX, aimY));
        if (score > best.score) best = { sx, sy, aimX, aimY, score };
      }
      const { sx, sy, aimX, aimY } = best;

      objects.push({
        el,
        cx: sx,
        cy: sy,
        heading: Math.atan2(aimY - sy, aimX - sx),
        turn: 0,
        speed: 70 + Math.random() * 70,
        travelled: 0,
        born: performance.now(),
        wave: {
          amplitude: 15 + Math.random() * 20, // px to each side
          wavelength: 180 + Math.random() * 160, // px between crests
          phase: Math.random() * Math.PI * 2,
        },
        rot: Math.random() * 360,
        ...randomMotion(),
        plane: kind === PAPER_PLANE,
        trail: [],
        gone: false,
      });
    };

    let last = performance.now();
    let nextSpawn = last + 300;
    let raf = 0;

    const frame = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000; // cap so a background tab doesn't teleport objects
      last = now;
      if (dark) {
        raf = requestAnimationFrame(frame); // hidden in dark mode: skip the work, keep listening
        return;
      }

      if (now >= nextSpawn && objects.filter((o) => !o.gone).length < MAX_OBJECTS) {
        spawn();
        nextSpawn = now + SPAWN_MS * (0.6 + Math.random() * 0.8);
      }

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);

      for (const o of objects) {
        if (!o.gone) {
          // Steering: nudge the turn rate randomly, keep it gentle, and drift the heading with it.
          // After WANDER_MS it stops turning so the object eventually leaves the screen.
          if (now - o.born < WANDER_MS) {
            o.turn += (Math.random() - 0.5) * TURN_JITTER * dt;
            o.turn = Math.max(-MAX_TURN, Math.min(MAX_TURN, o.turn * (1 - 0.3 * dt)));
          } else {
            o.turn = 0;
          }
          o.heading += o.turn * dt;

          // Avoidance: add up "push away" from every object inside PERSONAL_SPACE (stronger when closer)
          // and turn towards that escape direction.
          let pushX = 0;
          let pushY = 0;
          for (const other of objects) {
            if (other === o || other.gone) continue;
            const dx = o.cx - other.cx;
            const dy = o.cy - other.cy;
            const d = Math.hypot(dx, dy);
            if (d > 0 && d < PERSONAL_SPACE) {
              const w = 1 - d / PERSONAL_SPACE;
              pushX += (dx / d) * w;
              pushY += (dy / d) * w;
            }
          }
          const push = Math.hypot(pushX, pushY);
          if (push > 0) {
            // Signed angle from the current heading to the escape direction, wrapped to -π..π.
            let diff = Math.atan2(pushY, pushX) - o.heading;
            diff = Math.atan2(Math.sin(diff), Math.cos(diff));
            o.heading += Math.sign(diff) * Math.min(Math.abs(diff), AVOID_STRENGTH * Math.min(push, 1) * dt);
          }

          o.cx += Math.cos(o.heading) * o.speed * dt;
          o.cy += Math.sin(o.heading) * o.speed * dt;
          o.travelled += o.speed * dt;
          o.rot += o.spin * dt;

          // Wave: push the object sideways (perpendicular to its heading) by a sine of the distance travelled.
          const { amplitude, wavelength, phase } = o.wave;
          const angleRad = (2 * Math.PI * o.travelled) / wavelength + phase;
          const side = amplitude * Math.sin(angleRad);
          const x = o.cx - Math.sin(o.heading) * side;
          const y = o.cy + Math.cos(o.heading) * side;
          // The paper-plane icon points up-right (45°), so turn it to face its direction of travel,
          // tilting with the wave (the slope of the sine adds to the heading).
          const tilt = Math.atan((2 * Math.PI * amplitude * Math.cos(angleRad)) / wavelength);
          // Personality on top of the movement: rock back and forth, breathe in and out, maybe flip like a coin.
          const secs = (now - o.born) / 1000;
          const m = o.motion;
          const wobble = m.wobble * Math.sin(2 * Math.PI * m.wobbleSpeed * secs + m.phase);
          const scale = 1 + m.pulse * Math.sin(2 * Math.PI * m.pulseSpeed * secs + m.phase * 1.7);
          const flip = m.flipSpeed ? Math.cos(2 * Math.PI * m.flipSpeed * secs + m.phase) : 1;
          // The paper plane keeps facing where it flies (a small wobble only), and never flips.
          const angle = o.plane ? ((o.heading + tilt) * 180) / Math.PI + 45 + wobble / 3 : o.rot + wobble;
          const scaleX = o.plane ? scale : scale * flip;
          o.el.style.transform = `translate(${x - SIZE / 2}px, ${y - SIZE / 2}px) rotate(${angle}deg) scale(${scaleX}, ${scale})`;

          const tail = o.trail[o.trail.length - 1];
          if (!tail || Math.hypot(x - tail.x, y - tail.y) > 4) o.trail.push({ x, y, t: now });

          // Gone once it has wandered well past an edge (the 1s grace lets it enter from outside first).
          const margin = 3 * SIZE;
          const outside = o.cx < -margin || o.cx > width + margin || o.cy < -margin || o.cy > height + margin;
          if (outside && now - o.born > 1000) {
            o.gone = true;
            o.el.remove();
          }
        }

        // Drop trail pieces that have fully faded, then draw the rest piece by piece with its own fade.
        while (o.trail.length && now - o.trail[0].t > TRAIL_VISIBLE_MS + TRAIL_FADE_MS) o.trail.shift();
        let dashOffset = 0;
        for (let k = 1; k < o.trail.length; k++) {
          const a = o.trail[k - 1];
          const b = o.trail[k];
          const age = now - a.t;
          const fade = age < TRAIL_VISIBLE_MS ? 1 : 1 - (age - TRAIL_VISIBLE_MS) / TRAIL_FADE_MS;
          ctx.globalAlpha = OPACITY * fade;
          ctx.lineDashOffset = dashOffset; // keeps the dash pattern continuous across pieces
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          dashOffset += Math.hypot(b.x - a.x, b.y - a.y);
        }
      }
      ctx.globalAlpha = 1;

      for (let k = objects.length - 1; k >= 0; k--) {
        if (objects[k].gone && objects[k].trail.length < 2) objects.splice(k, 1);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      themeObserver.disconnect();
      objects.forEach((o) => o.el.remove());
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden dark:hidden">
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      {/* Objects are cloned from the hidden templates below and moved directly, without React re-renders. */}
      <div ref={layerRef} className="absolute inset-0 text-black" style={{ opacity: OPACITY }} />
      <div ref={templatesRef} hidden>
        {ICONS.map((Icon, i) => (
          <Icon key={i} size={SIZE} strokeWidth={1.5} />
        ))}
      </div>
    </div>
  );
}
