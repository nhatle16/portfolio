"use client";

import { useEffect, useRef } from "react";

// Dark-mode background: a slowly drifting, twinkling starfield with coloured star shapes, a navy nebula wash,
// illustrated planets that bob gently, shooting stars, and the odd rocket or UFO flying across. Everything is drawn on one canvas.
// It only runs while <html data-theme="dark">; in light mode the canvas is cleared and the loop stops.

const STAR_DENSITY = 3500; // one star per this many px² of screen
const MAX_STARS = 450;
const SHOOTING_STAR_MS = [2500, 7000]; // random gap between shooting stars
const SHIP_MS = [6000, 14000]; // random gap between spaceships
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
  spin: number; // rotation speed, radians per second (one full turn takes 2π / spin seconds)
  bands?: string[]; craters?: string; ring?: string; glow?: string;
  // Earth: land = [coast, main land colour, ...inland patch colours]; ice for the polar caps;
  // shallows for lighter patches of sea; terminator for a crisp day/night edge.
  land?: string[]; ice?: string[]; shallows?: string; terminator?: boolean;
};
const PLANETS: PlanetSpec[] = [
  // Saturn-like: pale blue-white bands with golden rings
  { fx: 0.9, fy: 0.2, r: 70, base: "#dbe4ee", bands: ["#9ec5e8", "#f8fafc", "#7393b3", "#c9d6e3"], ring: "#e9c46a", tilt: -0.35, bob: 0.25, spin: 0.1 },
  // Earth, after the illustrated reference: blue ocean, big sandy continents with red-orange coasts and
  // olive/green inland, pale polar ice, a crisp night side and a warm glow on the lit edge
  {
    fx: 0.07, fy: 0.78, r: 56, base: "#3f7cb5", shallows: "#6aa5d6",
    land: ["#e4572e", "#ecc06a", "#f4a261", "#a3a04c", "#8fae7e", "#d9893d"], ice: ["#f6efe2", "#f3c4c0"],
    glow: "#fde9c4", terminator: true, tilt: 0.2, bob: 0.18, spin: 0.12,
  },
  // Jupiter-like: orange with red and cream stripes
  { fx: 0.96, fy: 0.62, r: 32, base: "#f4a340", bands: ["#e4572e", "#fcd88a", "#c2410c", "#fde68a"], tilt: 0.12, bob: 0.3, spin: 0.18 },
  // Mars-like: small, red, cratered
  { fx: 0.58, fy: 0.93, r: 17, base: "#d9573f", craters: "#8c2f22", tilt: 0, bob: 0.4, spin: 0.15 },
  // Tiny teal planet with its own little ring
  { fx: 0.34, fy: 0.07, r: 10, base: "#5eadc4", bands: ["#8fd3e3", "#3d8aa1"], ring: "#f1e3b5", tilt: 0.5, bob: 0.5, spin: 0.25 },
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

// Smooth random blob, for continents and cloud-like patches. Its points are made once so the same
// shape can be painted twice (either side of the texture's seam).
function blobPoints(cx: number, cy: number, radius: number) {
  const n = 12;
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const d = radius * (0.6 + Math.random() * 0.6);
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8];
  });
}
function fillBlob(g: CanvasRenderingContext2D, pts: number[][], dx: number) {
  const n = pts.length;
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2 + dx, (a[1] + b[1]) / 2];
  g.beginPath();
  const start = mid(pts[n - 1], pts[0]);
  g.moveTo(start[0], start[1]);
  pts.forEach((p, i) => {
    const m = mid(p, pts[(i + 1) % n]);
    g.quadraticCurveTo(p[0] + dx, p[1], m[0], m[1]);
  });
  g.fill();
}

const makeCanvas = (w: number, h: number, dpr: number) => {
  const c = document.createElement("canvas");
  c.width = Math.ceil(w * dpr);
  c.height = Math.ceil(h * dpr);
  const g = c.getContext("2d")!;
  g.scale(dpr, dpr);
  return { c, g };
};

// A planet is drawn in three layers: the back half of its ring, the spinning surface, and on top the
// fixed lighting, atmosphere and front half of the ring. Only the surface moves.
export type PlanetLayers = { r: number; size: number; dpr: number; span: number; back: HTMLCanvasElement; surface: HTMLCanvasElement; front: HTMLCanvasElement };

// The surface is painted flat, like a world map: one full turn is `span` = 2πr px wide (so 1px of map
// = 1px at the planet's centre). A quarter turn is repeated past the right edge so a slice never wraps.
function paintSurface(p: PlanetSpec, r: number, dpr: number) {
  const span = 2 * Math.PI * r;
  const extra = span * 0.25;
  const h = r * 2;
  const { c, g } = makeCanvas(span + extra, h, dpr);
  g.fillStyle = p.base;
  g.fillRect(0, 0, span + extra, h);
  const seam = [0, -span]; // anything crossing the right edge also shows at the left edge

  if (p.bands) {
    // Wavy painted stripes of varying thickness, like gas-giant cloud bands. A whole number of waves per
    // turn keeps them seamless.
    const count = Math.max(5, Math.round(r / 6));
    for (let i = 0; i < count; i++) {
      const y = ((i + 0.5) * h) / count + (Math.random() - 0.5) * r * 0.12;
      const waves = 2 + Math.floor(Math.random() * 4);
      const ph = Math.random() * 6;
      g.strokeStyle = pick(p.bands);
      g.globalAlpha = 0.55 + Math.random() * 0.4;
      g.lineWidth = r * (0.04 + Math.random() * 0.14);
      g.lineCap = "round";
      g.beginPath();
      for (let x = 0; x <= span + extra + r; x += r / 12) {
        const yy = y + Math.sin((x / span) * Math.PI * 2 * waves + ph) * r * 0.05;
        if (x === 0) g.moveTo(x, yy);
        else g.lineTo(x, yy);
      }
      g.stroke();
    }
  }
  if (p.shallows) {
    // Lighter, shallower sea in soft patches
    g.fillStyle = p.shallows;
    g.globalAlpha = 0.3;
    for (let k = 0; k < 8; k++) {
      const patch = blobPoints(Math.random() * span, h * (0.15 + Math.random() * 0.7), r * (0.3 + Math.random() * 0.3));
      for (const dx of seam) fillBlob(g, patch, dx);
    }
  }
  if (p.land) {
    // Continents are clusters of overlapping blobs, so they get irregular coastlines and peninsulas.
    // Each is painted in layers: a slightly bigger red-orange coast, the sandy land on top, then
    // smaller olive, green and orange patches inland, like the relief colours in the reference.
    const [coast, main, ...patches] = p.land;
    const continents = 5;
    for (let k = 0; k < continents; k++) {
      const cx = ((k + Math.random() * 0.6) * span) / continents;
      const cy = h * (0.3 + Math.random() * 0.4);
      const size = r * (0.45 + Math.random() * 0.35);
      const parts = Array.from({ length: 6 + Math.floor(Math.random() * 4) }, () => {
        const a = Math.random() * Math.PI * 2;
        const d = size * Math.random() * 0.9;
        const pr = size * (0.35 + Math.random() * 0.4);
        return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 1.3, pr };
      });
      const coastShapes = parts.map((q) => blobPoints(q.x, q.y, q.pr * 1.1));
      const landShapes = parts.map((q) => blobPoints(q.x, q.y, q.pr));
      const inland = parts.flatMap((q) =>
        Math.random() < 0.8 ? [{ pts: blobPoints(q.x + (Math.random() - 0.5) * q.pr, q.y + (Math.random() - 0.5) * q.pr, q.pr * (0.3 + Math.random() * 0.3)), color: pick(patches) }] : [],
      );
      for (const dx of seam) {
        g.globalAlpha = 1;
        g.fillStyle = coast;
        coastShapes.forEach((s) => fillBlob(g, s, dx));
        g.fillStyle = main;
        landShapes.forEach((s) => fillBlob(g, s, dx));
        g.globalAlpha = 0.85;
        inland.forEach(({ pts, color }) => {
          g.fillStyle = color;
          fillBlob(g, pts, dx);
        });
      }
    }
    // Wispy clouds
    g.fillStyle = "#ffffff";
    g.globalAlpha = 0.16;
    for (let k = 0; k < 8; k++) {
      const cloud = blobPoints(Math.random() * span, h * (0.1 + Math.random() * 0.8), r * 0.18);
      for (const dx of seam) fillBlob(g, cloud, dx);
    }
  }
  if (p.ice) {
    // Polar caps: a wavy pale band along the top and bottom of the map, with a pink tinge at the edge.
    const [snow, tint] = p.ice;
    for (const [color, depth] of [[tint, 0.13], [snow, 0.1]] as const) {
      g.fillStyle = color;
      g.globalAlpha = 1;
      for (const top of [true, false]) {
        g.beginPath();
        const edge = top ? 0 : h;
        g.moveTo(0, edge);
        for (let x = 0; x <= span + extra + r; x += r / 8) {
          const d = h * depth * (0.7 + 0.3 * Math.sin((x / span) * Math.PI * 2 * 5));
          g.lineTo(x, top ? d : h - d);
        }
        g.lineTo(span + extra + r, edge);
        g.fill();
      }
    }
  }
  if (p.craters) {
    for (let k = 0; k < 9; k++) {
      const cx = Math.random() * span;
      const cy = h * (0.2 + Math.random() * 0.6);
      const cr = r * (0.08 + Math.random() * 0.14);
      for (const dx of seam) {
        g.globalAlpha = 0.45;
        g.fillStyle = p.craters;
        g.beginPath();
        g.arc(cx + dx, cy, cr, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = 0.25; // lit lower-right rim
        g.strokeStyle = "#ffffff";
        g.lineWidth = Math.max(0.6, cr * 0.25);
        g.beginPath();
        g.arc(cx + dx, cy, cr, 0.1 * Math.PI, 0.7 * Math.PI);
        g.stroke();
      }
    }
  }
  // Painterly grain
  for (let k = 0; k < r * 12; k++) {
    g.globalAlpha = 0.08 + Math.random() * 0.08;
    g.fillStyle = Math.random() < 0.5 ? "#ffffff" : "#000000";
    g.beginPath();
    g.arc(Math.random() * span, Math.random() * h, 0.4 + Math.random() * 0.8, 0, Math.PI * 2);
    g.fill();
  }
  // Repeat the first quarter turn past the right edge, pixel for pixel.
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  const spanPx = Math.round(span * dpr);
  g.drawImage(c, 0, 0, c.width - spanPx, c.height, spanPx, 0, c.width - spanPx, c.height);
  return { surface: c, span: spanPx / dpr };
}

// Paints the planet's layers once, so each frame only copies them (and slices the surface).
function paintPlanet(p: PlanetSpec, r: number, dpr: number): PlanetLayers {
  const reach = p.ring ? r * 2.15 : r * 1.2;
  const size = Math.ceil(reach * 2 + 6);
  const ringRadii = p.ring ? [1.3, 1.42, 1.55, 1.68, 1.82, 1.96].map((v) => v + (Math.random() - 0.5) * 0.04) : [];

  const back = makeCanvas(size, size, dpr);
  back.g.translate(size / 2, size / 2);
  if (p.ring) {
    paintRing(back.g, p, r, "back", ringRadii);
    // Cut the planet's disc out of the back ring, so it can't show through the see-through planet.
    back.g.globalCompositeOperation = "destination-out";
    back.g.beginPath();
    back.g.arc(0, 0, r, 0, Math.PI * 2);
    back.g.fill();
  }

  const { c: front, g } = makeCanvas(size, size, dpr);
  g.translate(size / 2, size / 2);
  g.save();
  g.beginPath();
  g.arc(0, 0, r, 0, Math.PI * 2);
  g.clip();

  // Night side: light comes from the top-left, so the bottom-right falls into a soft navy shadow.
  g.globalAlpha = 1;
  const shade = g.createRadialGradient(-r * 0.45, -r * 0.45, r * 0.3, -r * 0.2, -r * 0.2, r * 1.45);
  shade.addColorStop(0, "rgba(8,12,32,0)");
  shade.addColorStop(0.55, "rgba(8,12,32,0.05)");
  shade.addColorStop(1, "rgba(8,12,32,0.8)");
  g.fillStyle = shade;
  g.fillRect(-r, -r, r * 2, r * 2);
  if (p.terminator) {
    // Crisp day/night edge: everything outside a circle shifted to the top-left falls into shadow,
    // leaving a dark crescent on the bottom-right like the reference.
    const night = g.createRadialGradient(-r * 0.32, -r * 0.32, r * 0.95, -r * 0.32, -r * 0.32, r * 1.12);
    night.addColorStop(0, "rgba(10,16,40,0)");
    night.addColorStop(1, "rgba(10,16,40,0.78)");
    g.fillStyle = night;
    g.fillRect(-r, -r, r * 2, r * 2);
  }
  const light = g.createRadialGradient(-r * 0.45, -r * 0.5, 0, -r * 0.45, -r * 0.5, r * 0.75);
  light.addColorStop(0, "rgba(255,255,255,0.28)");
  light.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = light;
  g.fillRect(-r, -r, r * 2, r * 2);
  g.restore(); // drop the clip

  if (p.glow) {
    // Thin atmosphere glowing along the lit edge
    g.strokeStyle = p.glow;
    g.globalAlpha = 0.7;
    g.lineWidth = Math.max(1, r * 0.045);
    g.shadowColor = p.glow;
    g.shadowBlur = r * 0.3;
    g.beginPath();
    g.arc(0, 0, r, Math.PI * 0.6, Math.PI * 2.05);
    g.stroke();
    g.shadowBlur = 0;
    g.globalAlpha = 1;
  }

  if (p.ring) paintRing(g, p, r, "front", ringRadii);
  return { r, size, dpr, back: back.c, front, ...paintSurface(p, r, dpr) };
}

// Draws the spinning surface: the disc is cut into thin vertical slices, and each slice copies the strip
// of map at its longitude. Slices near the edge take a wider strip squeezed thin, so the surface looks
// like it curves around the sphere instead of sliding past flat.
function drawSurface(g: CanvasRenderingContext2D, L: PlanetLayers, tilt: number, turn: number) {
  const { r, span, dpr, surface } = L;
  g.save();
  g.beginPath();
  g.arc(0, 0, r, 0, Math.PI * 2);
  g.clip();
  g.rotate(tilt);
  const slices = Math.max(12, Math.round(r));
  const w = (2 * r) / slices;
  for (let i = 0; i < slices; i++) {
    const x0 = -r + i * w;
    const lon = Math.asin(Math.max(-0.999, Math.min(0.999, (x0 + w / 2) / r)));
    let u = ((lon - turn) * r) % span; // map px per radian = r
    if (u < 0) u += span;
    const srcW = Math.min(span * 0.24, w / Math.cos(lon));
    g.drawImage(surface, u * dpr, 0, srcW * dpr, 2 * r * dpr, x0, -r * 1.05, w + 0.6, r * 2.1);
  }
  g.restore();
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
    let planets: { p: PlanetSpec; layers: PlanetLayers }[] = [];
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
      planets = PLANETS.map((p) => ({ p, layers: paintPlanet(p, p.r * Math.max(0.55, scale), dpr) }));
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
      // Fully opaque: the surface is drawn as overlapping slices, which would show as lines if see-through.
      ctx.globalAlpha = 1;
      for (const { p, layers } of planets) {
        const x = p.fx * width;
        const y = p.fy * height + Math.sin(t * p.bob + p.fx * 10) * 6; // slow bob
        const half = layers.size / 2;
        ctx.save();
        ctx.translate(x, y);
        ctx.drawImage(layers.back, -half, -half, layers.size, layers.size);
        drawSurface(ctx, layers, p.tilt, t * p.spin);
        ctx.drawImage(layers.front, -half, -half, layers.size, layers.size);
        ctx.restore();
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
