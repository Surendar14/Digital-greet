/**
 * Canvas particle field — data-driven by theme. Gradient + subtle
 * drifting particles give templates their cinematic background.
 * 60fps, pauses offscreen, honors reduced motion.
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { ParticleSettings } from "../types";
import { rgba } from "../utils/resolve";

interface P {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  tw: number;
  fade: number[];
}

export function Particles({ settings, className }: { settings?: ParticleSettings; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const count = reduce ? 0 : settings?.count ?? 70;
    const colors = (settings?.colors as number[][]) ?? [[232, 182, 166], [244, 198, 198], [255, 255, 255]];
    const maxOpacity = settings?.maxOpacity ?? 0.5;
    const speed = settings?.speed ?? 0.14;
    const [minR, maxR] = settings?.size ?? [1, 2.6];

    let raf = 0;
    let running = false;
    let particles: P[] = [];
    const parent = canvas.parentElement ?? document.body;
    let w = 0;
    let h = 0;

    const init = () => {
      const rect = parent.getBoundingClientRect();
      w = rect.width || window.innerWidth;
      h = (rect.height || window.innerHeight);
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: minR + Math.random() * (maxR - minR),
        vx: (Math.random() - 0.5) * speed * 2,
        vy: -(0.02 + Math.random() * speed),
        a: Math.random() * 0.6 + 0.2,
        tw: Math.random() * Math.PI * 2,
        fade: colors[Math.floor(Math.random() * colors.length)]
      }));
    };

    const step = (t: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.tw += 0.02;
        if (p.y < -8) { p.y = h + 8; p.x = Math.random() * w; }
        if (p.x < -8) p.x = w + 8;
        if (p.x > w + 8) p.x = -8;
        const alpha = p.a * (0.55 + 0.45 * Math.sin(p.tw)) * maxOpacity;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grad.addColorStop(0, rgba(p.fade, alpha));
        grad.addColorStop(1, rgba(p.fade, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(step);
    };

    /** Pause rendering when offscreen (perf). */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(step);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "120px" }
    );
    io.observe(canvas);

    const resize = () => init();
    window.addEventListener("resize", resize, { passive: true });
    init();
    running = true;
    raf = requestAnimationFrame(step);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.count, settings?.colors, reduce, active]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "particles-canvas"}
      aria-hidden="true"
      data-active={active}
    />
  );
}