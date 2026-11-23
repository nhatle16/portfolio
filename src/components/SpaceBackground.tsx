"use client";

import { useEffect, useRef } from "react";

// Dark-mode background: a slowly drifting, twinkling starfield with coloured star shapes, a navy nebula wash,
// illustrated planets that bob gently, shooting stars, and the odd rocket or UFO flying across. Everything is drawn on one canvas.
// It only runs while <html data-theme="dark">; in light mode the canvas is cleared and the loop stops.

const STAR_DENSITY = 3500; // one star per this many px² of screen
const MAX_STARS = 450;
const SHOOTING_STAR_MS = [2500, 7000]; // random gap between shooting stars
const SHIP_MS = [6000, 14000]; // random gap between spaceships
const PLANET_ALPHA = 0.85; // planets sit behind text, so keep them a little see-through
const SHAPE_STAR_DENSITY = 28000; // one coloured star shape per this many px²
const MAX_SHAPE_STARS = 40;

type Star = { x: number; y: number; r: number; speed: number; alpha: number; twinkle: number; phase: number; color: string };
type ShapeStar = { x: number; y: number; size: number; points: 4 | 5; rot: number; spin: number; phase: number; color: string };
type ShootingStar = { x: number; y: number; vx: number; vy: number; age: number; life: number };
type Ship = { kind: "rocket" | "ufo"; x: number; y: number; vx: number; baseY: number; phase: number; age: number };
type Puff = { x: number; y: number; age: number };

// Illustrated planets, after the storybook-style reference: painted bands, land masses or craters,
// sketchy multi-line rings, a shaded night side and a soft highlight.
// fx/fy are fractions of the screen; r is scaled down on small screens.
type PlanetSpec = {
  fx: number; fy: number; r: number; base: string; tilt: number; bob: number;
  bands?: string[]; land?: string[]; craters?: string; ring?: string; glow?: string;
};
const PLANETS: PlanetSpec[] = [
  // Saturn-like: pale blue-white bands with golden rings
  { fx: 0.9, fy: 0.2, r: 70, base: "#dbe4ee", bands: ["#9ec5e8", "#f8fafc", "#7393b3", "#c9d6e3"], ring: "#e9c46a", tilt: -0.35, bob: 0.25 },
  // Earth-like: blue ocean with warm continents and a thin atmosphere
  { fx: 0.07, fy: 0.78, r: 48, base: "#3d7fb8", land: ["#e9c46a", "#d9893d", "#f4a261", "#8fae7e", "#e76f51"], glow: "#bae6fd", tilt: 0.2, bob: 0.18 },
  // Jupiter-like: orange with red and cream stripes
  { fx: 0.96, fy: 0.62, r: 32, base: "#f4a340", bands: ["#e4572e", "#fcd88a", "#c2410c", "#fde68a"], tilt: 0.12, bob: 0.3 },
  // Mars-like: small, red, cratered
  { fx: 0.58, fy: 0.93, r: 17, base: "#d9573f", craters: "#8c2f22", tilt: 0, bob: 0.4 },
  // Tiny teal planet with its own little ring
  { fx: 0.34, fy: 0.07, r: 10, base: "#5eadc4", bands: ["#8fd3e3", "#3d8aa1"], ring: "#f1e3b5", tilt: 0.5, bob: 0.5 },
];

const STAR_COLORS = ["#ffffff", "#ffffff", "#ffffff", "#bfdbfe", "#fde68a", "#fbbf24", "#f87171"];
const SHAPE_COLORS = ["#facc15", "#fbbf24", "#ef4444", "#f8fafc", "#93c5fd", "#fb7185"];
const between = ([lo, hi]: number[]) => lo + Math.random() * (hi - lo);
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

// Rings are several thin, slightly uneven ellipses, like the hand-drawn reference. Drawn in two halves
// so the back half sits behind the planet and the front half crosses over it.
function paintRing(g: CanvasRenderingContext2D, p: PlanetSpec, r: number, half: "back" | "front", radii: number[]) {
  g.save();
  g.rotate(p.tilt);
  const [start, end] = half === "back" ? [Math.PI, Math.PI * 2] : [0, Math.PI];
  g.strokeStyle = p.ring!;
  g.globalAlpha = 0.18; // faint fill between the lines
  g.lineWidth = r * 0.55 * 0.3;
  g.beginPath();
  g.ellipse(0, 0, r * 1.62, r * 1.62 * 0.3, 0, start, end);
  g.stroke();
  radii.forEach((rr, i) => {
    g.globalAlpha = 0.55 + (i % 3) * 0.15;
    g.lineWidth = Math.max(0.8, r * (i % 2 ? 0.02 : 0.035));
    g.beginPath();
    g.ellipse(0, 0, r * rr, r * rr * 0.3, 0, start, end);
    g.stroke();
  });
  g.restore();
}

// Smooth random blob, for continents and cloud-like patches.
function blob(g: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  const n = 12;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const d = radius * (0.6 + Math.random() * 0.6);
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8];
  });
  g.beginPath();
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(pts[n - 1], pts[0]);
  g.moveTo(start[0], start[1]);
  pts.forEach((p, i) => {
    const m = mid(p, pts[(i + 1) % n]);
    g.quadraticCurveTo(p[0], p[1], m[0], m[1]);
  });
  g.fill();
}

// Paints one planet (with rings) into its own small canvas once, so each frame only has to copy it.
function paintPlanet(p: PlanetSpec, r: number, dpr: number): HTMLCanvasElement {
  const reach = p.ring ? r * 2.15 : r * 1.2;
  const size = Math.ceil(reach * 2 + 6);
  const c = document.createElement("canvas");
  c.width = c.height = Math.ceil(size * dpr);
  const g = c.getContext("2d")!;
  g.scale(dpr, dpr);
  g.translate(size / 2, size / 2);
  const ringRadii = p.ring ? [1.3, 1.42, 1.55, 1.68, 1.82, 1.96].map((v) => v + (Math.random() - 0.5) * 0.04) : [];

  if (p.ring) paintRing(g, p, r, "back", ringRadii);

  g.save();
  g.beginPath();
  g.arc(0, 0, r, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = p.base;
  g.fillRect(-r, -r, r * 2, r * 2);

  g.save();
  g.rotate(p.tilt);
  if (p.bands) {
    // Wavy painted stripes of varying thickness, like gas-giant cloud bands.
    const count = Math.max(5, Math.round(r / 6));
    for (let i = 0; i < count; i++) {
      const y = -r + ((i + 0.5) * 2 * r) / count + (Math.random() - 0.5) * r * 0.12;
      const freq = 2 + Math.random() * 3;
      const ph = Math.random() * 6;
      g.strokeStyle = pick(p.bands);
      g.globalAlpha = 0.55 + Math.random() * 0.4;
      g.lineWidth = r * (0.04 + Math.random() * 0.14);
      g.lineCap = "round";
      g.beginPath();
      for (let x = -r * 1.2; x <= r * 1.2; x += r / 12) {
        const yy = y + Math.sin((x / r) * freq + ph) * r * 0.05;
        if (x === -r * 1.2) g.moveTo(x, yy);
        else g.lineTo(x, yy);
      }
      g.stroke();
    }
  }
  if (p.land) {
    // Continents: a big blob in one colour with a smaller blob of another on top for relief.
    for (let k = 0; k < 7; k++) {
      const cx = (Math.random() - 0.5) * r * 1.7;
      const cy = (Math.random() - 0.5) * r * 1.7;
      const size = r * (0.18 + Math.random() * 0.28);
      g.globalAlpha = 0.95;
      g.fillStyle = pick(p.land);
      blob(g, cx, cy, size);
      g.fillStyle = pick(p.land);
      blob(g, cx + size * 0.15, cy + size * 0.1, size * 0.5);
    }
    // Wispy clouds
    g.fillStyle = "#ffffff";
    for (let k = 0; k < 4; k++) {
      g.globalAlpha = 0.18;
      blob(g, (Math.random() - 0.5) * r * 1.6, (Math.random() - 0.5) * r * 1.6, r * 0.18);
    }
  }
  if (p.craters) {
    for (let k = 0; k < 6; k++) {
      const cx = (Math.random() - 0.5) * r * 1.5;
      const cy = (Math.random() - 0.5) * r * 1.5;
      const cr = r * (0.08 + Math.random() * 0.14);
      g.globalAlpha = 0.45;
      g.fillStyle = p.craters;
      g.beginPath();
      g.arc(cx, cy, cr, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 0.25; // lit lower-right rim
      g.strokeStyle = "#ffffff";
      g.lineWidth = Math.max(0.6, cr * 0.25);
      g.beginPath();
      g.arc(cx, cy, cr, 0.1 * Math.PI, 0.7 * Math.PI);
      g.stroke();
    }
  }
  // Painterly grain
  for (let k = 0; k < r * 4; k++) {
    g.globalAlpha = 0.08 + Math.random() * 0.08;
    g.fillStyle = Math.random() < 0.5 ? "#ffffff" : "#000000";
    g.beginPath();
    g.arc((Math.random() - 0.5) * r * 2, (Math.random() - 0.5) * r * 2, 0.4 + Math.random() * 0.8, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();

  // Night side: light comes from the top-left, so the bottom-right falls into a soft navy shadow.
  g.globalAlpha = 1;
  const shade = g.createRadialGradient(-r * 0.45, -r * 0.45, r * 0.3, -r * 0.2, -r * 0.2, r * 1.45);
  shade.addColorStop(0, "rgba(8,12,32,0)");
  shade.addColorStop(0.55, "rgba(8,12,32,0.05)");
  shade.addColorStop(1, "rgba(8,12,32,0.8)");
  g.fillStyle = shade;
  g.fillRect(-r, -r, r * 2, r * 2);
  const light = g.createRadialGradient(-r * 0.45, -r * 0.5, 0, -r * 0.45, -r * 0.5, r * 0.75);
  light.addColorStop(0, "rgba(255,255,255,0.28)");
  light.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = light;
  g.fillRect(-r, -r, r * 2, r * 2);
  g.restore(); // drop the clip

  if (p.glow) {
    // Thin atmosphere on the lit edge
    g.strokeStyle = p.glow;
    g.globalAlpha = 0.6;
    g.lineWidth = Math.max(1, r * 0.04);
    g.shadowColor = p.glow;
    g.shadowBlur = r * 0.25;
    g.beginPath();
    g.arc(0, 0, r, Math.PI * 0.75, Math.PI * 1.85);
    g.stroke();
    g.shadowBlur = 0;
    g.globalAlpha = 1;
  }

  if (p.ring) paintRing(g, p, r, "front", ringRadii);
  return c;
}

// 4- or 5-pointed star outline, like the coloured stars sprinkled through the reference.
function starPath(g: CanvasRenderingContext2D, x: number, y: number, size: number, points: number, rot: number) {
  const inner = size * (points === 4 ? 0.32 : 0.45);
  g.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = rot + (i * Math.PI) / points - Math.PI / 2;
    const d = i % 2 ? inner : size;
    if (i === 0) g.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
    else g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
  }
  g.closePath();
}

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let scale = 1;
    let stars: Star[] = [];
    let shapeStars: ShapeStar[] = [];
    let sprites: { p: PlanetSpec; img: HTMLCanvasElement; size: number }[] = [];
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      scale = Math.min(1, width / 1200);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Three depths: far stars are small, dim and slow; near ones bigger, brighter and faster (parallax).
      const count = Math.min(MAX_STARS, Math.round((width * height) / STAR_DENSITY));
      stars = Array.from({ length: count }, () => {
        const depth = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.4 + depth * 1.2,
          speed: 2 + depth * 10,
          alpha: 0.35 + depth * 0.65,
          twinkle: 0.5 + Math.random() * 2,
          phase: Math.random() * Math.PI * 2,
          color: pick(STAR_COLORS),
        };
      });
      const shapes = Math.min(MAX_SHAPE_STARS, Math.round((width * height) / SHAPE_STAR_DENSITY));
      shapeStars = Array.from({ length: shapes }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 3 + Math.random() * 6,
        points: Math.random() < 0.5 ? 4 : 5,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.4,
        phase: Math.random() * Math.PI * 2,
        color: pick(SHAPE_COLORS),
      }));
      sprites = PLANETS.map((p) => {
        const r = p.r * Math.max(0.55, scale);
        return { p, img: paintPlanet(p, r, dpr), size: 0 };
      }).map((s) => ({ ...s, size: s.img.width / dpr }));
    };

    let shooting: ShootingStar[] = [];
    let ships: Ship[] = [];
    let puffs: Puff[] = [];
    let nextShooting = 0;
    let nextShip = 0;

    const drawNebula = () => {
      const glow = (fx: number, fy: number, rgb: string, a: number) => {
        const x = fx * width;
        const y = fy * height;
        const r = Math.max(width, height) * 0.55;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${rgb},${a})`);
        g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      };
      // Deep navy wash like the reference, with a hint of violet and teal.
      glow(0.5, 0.5, "23,37,84", 0.35); // navy
      glow(0.2, 0.3, "91,33,182", 0.1); // violet
      glow(0.85, 0.75, "14,116,144", 0.12); // teal
    };

    const drawShapeStars = (t: number, dt: number) => {
      for (const s of shapeStars) {
        s.x -= 6 * dt; // drift with the nearest stars
        if (s.x < -10) s.x += width + 20;
        s.rot += s.spin * dt;
        const twinkle = 0.8 + 0.2 * Math.sin(t * 1.5 + s.phase);
        ctx.globalAlpha = 0.85 * twinkle;
        ctx.fillStyle = s.color;
        starPath(ctx, s.x, s.y, s.size * twinkle, s.points, s.rot);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const drawStars = (t: number, dt: number) => {
      for (const s of stars) {
        s.x -= s.speed * dt;
        if (s.x < 0) s.x += width;
        ctx.globalAlpha = s.alpha * (0.6 + 0.4 * Math.sin(t * s.twinkle + s.phase));
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const drawPlanets = (t: number) => {
      ctx.globalAlpha = PLANET_ALPHA;
      for (const { p, img, size } of sprites) {
        const x = p.fx * width;
        const y = p.fy * height + Math.sin(t * p.bob + p.fx * 10) * 6; // slow bob
        ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };

    const drawShootingStars = (dt: number) => {
      for (const s of shooting) {
        s.age += dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const fade = 1 - s.age / s.life;
        const tailX = s.x - s.vx * 0.12;
        const tailY = s.y - s.vy * 0.12;
        const g = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        g.addColorStop(0, `rgba(255,255,255,${fade})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }
      shooting = shooting.filter((s) => s.age < s.life);
    };

    // Drawn pointing right (+x), about 36px long, then rotated to the flight direction.
    const drawRocket = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      const flame = 8 + Math.random() * 7; // flickers every frame
      const fg = ctx.createLinearGradient(-14, 0, -14 - flame, 0);
      fg.addColorStop(0, "#fde047");
      fg.addColorStop(0.5, "#f97316");
      fg.addColorStop(1, "rgba(239,68,68,0)");
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(-14, -4);
      ctx.lineTo(-14 - flame, 0);
      ctx.lineTo(-14, 4);
      ctx.fill();
      ctx.fillStyle = "#ef4444"; // fins
      ctx.beginPath();
      ctx.moveTo(-6, -5);
      ctx.lineTo(-16, -12);
      ctx.lineTo(-14, -5);
      ctx.moveTo(-6, 5);
      ctx.lineTo(-16, 12);
      ctx.lineTo(-14, 5);
      ctx.fill();
      ctx.fillStyle = "#e5e7eb"; // body
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.quadraticCurveTo(10, -7, -14, -6);
      ctx.lineTo(-14, 6);
      ctx.quadraticCurveTo(10, 7, 18, 0);
      ctx.fill();
      ctx.fillStyle = "#ef4444"; // nose cone
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.quadraticCurveTo(15, -4, 10, -5.5);
      ctx.lineTo(10, 5.5);
      ctx.quadraticCurveTo(15, 4, 18, 0);
      ctx.fill();
      ctx.fillStyle = "#38bdf8"; // window
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(2, 0, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    const drawUfo = (x: number, y: number, t: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(t * 2) * 0.12); // gentle rocking
      ctx.fillStyle = "rgba(125,211,252,0.7)"; // glass dome
      ctx.beginPath();
      ctx.ellipse(0, -4, 8, 7, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      const g = ctx.createLinearGradient(0, -6, 0, 6);
      g.addColorStop(0, "#d1d5db");
      g.addColorStop(1, "#4b5563");
      ctx.fillStyle = g; // saucer
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      [-12, -4, 4, 12].forEach((lx, i) => {
        ctx.fillStyle = Math.floor(t * 4 + i) % 2 ? "#facc15" : "#f472b6"; // blinking lights
        ctx.beginPath();
        ctx.arc(lx, 1, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    };

    const drawShips = (t: number, dt: number) => {
      // Exhaust smoke behind rockets: small puffs that grow and fade.
      for (const p of puffs) p.age += dt;
      puffs = puffs.filter((p) => p.age < 1.2);
      for (const p of puffs) {
        ctx.globalAlpha = 0.35 * (1 - p.age / 1.2);
        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5 + p.age * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (const s of ships) {
        s.age += dt;
        s.x += s.vx * dt;
        if (s.kind === "rocket") {
          // Gentle S-curve: y follows a sine, and the nose follows the slope of that path.
          s.y = s.baseY + Math.sin(s.age * 0.8 + s.phase) * 30;
          const vy = Math.cos(s.age * 0.8 + s.phase) * 30 * 0.8;
          const angle = Math.atan2(vy, s.vx);
          puffs.push({ x: s.x - Math.cos(angle) * 18, y: s.y - Math.sin(angle) * 18, age: 0 }); // at the tail
          drawRocket(s.x, s.y, angle);
        } else {
          s.y = s.baseY + Math.sin(s.age * 1.6 + s.phase) * 14; // hovering bob
          drawUfo(s.x, s.y, t);
        }
      }
      ships = ships.filter((s) => s.x > -80 && s.x < width + 80);
    };

    const spawnShootingStar = () => {
      const angle = Math.PI * 0.75 + (Math.random() - 0.5) * 0.4; // heading down-left
      const speed = 650 + Math.random() * 350;
      shooting.push({
        x: width * (0.3 + Math.random() * 0.7),
        y: height * Math.random() * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        age: 0,
        life: 0.6 + Math.random() * 0.5,
      });
    };

    const spawnShip = () => {
      const fromLeft = Math.random() < 0.5;
      const kind = Math.random() < 0.6 ? "rocket" : "ufo";
      const speed = kind === "rocket" ? 90 + Math.random() * 60 : 55 + Math.random() * 35;
      const y = height * (0.15 + Math.random() * 0.65);
      ships.push({ kind, x: fromLeft ? -60 : width + 60, y, baseY: y, vx: fromLeft ? speed : -speed, phase: Math.random() * 6, age: 0 });
    };

    let raf = 0;
    let last = 0;
    const frame = (nowMs: number) => {
      const dt = Math.min(nowMs - last, 50) / 1000; // cap so a background tab doesn't jump
      last = nowMs;
      const t = nowMs / 1000;
      if (nowMs >= nextShooting) {
        spawnShootingStar();
        nextShooting = nowMs + between(SHOOTING_STAR_MS);
      }
      if (nowMs >= nextShip) {
        spawnShip();
        nextShip = nowMs + between(SHIP_MS);
      }
      ctx.clearRect(0, 0, width, height);
      drawNebula();
      drawStars(t, dt);
      drawShapeStars(t, dt);
      drawPlanets(t);
      drawShootingStars(dt);
      drawShips(t, dt);
      raf = requestAnimationFrame(frame);
    };

    // Reduced motion: one still picture of the stars, nebula and planets; no movement.
    const drawStill = () => {
      ctx.clearRect(0, 0, width, height);
      drawNebula();
      drawStars(0, 0);
      drawShapeStars(0, 0);
      drawPlanets(0);
    };

    const isDark = () => document.documentElement.dataset.theme === "dark";
    const update = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      ctx.clearRect(0, 0, width, height);
      if (!isDark()) return;
      if (reduced) return drawStill();
      last = performance.now();
      nextShooting = last + 1500;
      nextShip = last + 2500;
      raf = requestAnimationFrame(frame);
    };

    resize();
    update();
    const onResize = () => {
      resize();
      if (reduced && isDark()) drawStill();
    };
    window.addEventListener("resize", onResize);
    const themeObserver = new MutationObserver(update);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      themeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 size-full" />;
}
