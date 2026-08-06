/**
 * Lightweight canvas celebration — used by the Final Surprise section.
 * Falls a romantic mix of shapes: red hearts (dominant), sparkles,
 * rose petals and glowing dots. Colors pulled from the active theme
 * plus deep reds. Honors reduced motion.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import type { ThemeConfig } from "../types";

type Shape = "heart" | "sparkle" | "petal" | "dot";

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  life: number;
  shape: Shape;
  sway: number;
  swaySpeed: number;
}

function toRgb(hex: string): string {
  const m = hex.replace("#", "");
  const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(v, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

const NEON_REDS = ["#FF2E4D", "#FF1F3D", "#E3003C", "#FF4065"];
const GOLDS = ["#D9A441", "#E6B84A", "#F0C65C"];

function pickShape(): Shape {
  const r = Math.random();
  if (r < 0.68) return "heart";
  if (r < 0.86) return "sparkle";
  if (r < 0.95) return "petal";
  return "dot";
}

function drawHeart(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.4);
  ctx.bezierCurveTo(-s * 0.5, -s * 0.05, -s * 0.35, -s * 0.55, 0, -s * 0.22);
  ctx.bezierCurveTo(s * 0.35, -s * 0.55, s * 0.5, -s * 0.05, 0, s * 0.4);
  ctx.closePath();
  ctx.fill();
}

function drawSparkle(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const r = i % 2 === 0 ? s : s * 0.28;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawPetal(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.55, s * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawDot(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

export function Confetti({ theme, duration = 3600 }: { theme: ThemeConfig; duration?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduce = useReducedMotion();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const c = themeRef.current.colors;
    const heartPalette = [
      ...NEON_REDS,
      ...GOLDS,
      `rgba(${toRgb(c.primary)},1)`,
      `rgba(${toRgb(c.primaryDeep)},1)`
    ];
    const accentPalette = [
      ...GOLDS,
      `rgba(${toRgb(c.primarySoft)},1)`,
      `rgba(${toRgb(c.accent)},1)`,
      `rgba(${toRgb(c.secondary)},1)`,
      `rgba(${toRgb(c.primary)},1)`
    ];

    const pieces: Piece[] = Array.from({ length: 150 }, () => {
      const shape = pickShape();
      const heart = shape === "heart";
      const size = heart ? 13 + Math.random() * 11 : 6 + Math.random() * 9;
      const color = heart
        ? heartPalette[Math.floor(Math.random() * heartPalette.length)]
        : accentPalette[Math.floor(Math.random() * accentPalette.length)];
      return {
        x: Math.random() * w,
        y: -24 - Math.random() * h * 0.55,
        vx: (Math.random() - 0.5) * 3,
        vy: heart ? 2.2 + Math.random() * 3.2 : 3 + Math.random() * 5,
        size,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.22,
        color,
        life: 1,
        shape,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.02
      };
    });

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      for (const p of pieces) {
        if (elapsed > duration || p.y > h + 60) continue;
        alive = true;
        p.sway += p.swaySpeed;
        p.x += p.vx + Math.sin(p.sway) * 0.8;
        p.y += p.vy;
        p.vy *= 1.002;
        p.rot += p.vr;
        p.life = Math.max(0, 1 - (elapsed / duration) * 1.15);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        if (p.shape === "heart") {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 14;
          drawHeart(ctx, p.size);
          ctx.shadowBlur = 0;
        } else if (p.shape === "sparkle") drawSparkle(ctx, p.size);
        else if (p.shape === "petal") drawPetal(ctx, p.size);
        else drawDot(ctx, p.size);
        ctx.restore();
      }
      if (alive) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [reduce, duration]);

  if (reduce) return null;
  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />;
}