import { useEffect, useRef, useState } from "react";
import type { SectionBackdrop as BackdropConfig } from "../types";
import { prefersReducedMotion } from "../utils/resolve";

/** Smoothstep easing — soft luxury curve, no hard linear ramps. */
function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

export interface BackdropState {
  opacity: number;
  y: number;
  scale: number;
  blurIn: number;
}

/**
 * A single section's rose-themed background layer.
 *
 * Sits inside `.section-frame` at z-index 0 so content paints above it.
 * As each section arrives, the backdrop performs a premium reveal:
 *  - opacity ramps with smoothstep easing (no hard cuts at boundaries)
 *  - the image de-blurs from 8px → sharp while it fades in
 *  - a slow Ken Burns drift (scale 1.16 → ~1.06) plus a subtle parallax glide
 * The peak opacity is capped by the section's `opacity` setting and the
 * overlay is configurable, so text contrast is always controlled.
 */
export function SectionBackdrop({ bg }: { bg?: BackdropConfig | string | null }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<BackdropState>({
    opacity: 0,
    y: 0,
    scale: 1.16,
    blurIn: 8,
  });

  let config: BackdropConfig | null = null;
  if (typeof bg === "string") config = { image: bg };
  else if (bg && typeof bg === "object") config = bg;
  if (!config?.image) return null;

  useEffect(() => {
    const reduce = prefersReducedMotion();
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      if (rect.bottom < 0 || rect.top > vh) {
        setState((s) =>
          s.opacity === 0 && s.blurIn >= 8 ? s : { opacity: 0, y: 0, scale: 1.16, blurIn: 8 }
        );
        return;
      }
      const center = rect.top + rect.height / 2 - vh / 2;
      const spread = Math.max(vh * 0.92, rect.height * 0.5);
      const raw = Math.min(1, Math.max(0, 1 - Math.abs(center) / spread));
      const eased = ease(raw);
      const y = reduce ? 0 : -center * 0.055;
      const scale = 1.16 - eased * 0.1;
      const blurIn = (1 - eased) * 8;
      setState((s) =>
        Math.abs(s.opacity - eased) < 0.0005 &&
        Math.abs(s.y - y) < 0.5 &&
        Math.abs(s.scale - scale) < 0.0005
          ? s
          : { opacity: eased, y, scale, blurIn }
      );
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [config.image]);

  const overlay = config.overlay ?? "rgba(10,5,8,0.75)";
  const blur = config.blur ?? 0;
  const peak = config.opacity ?? 1;

  return (
    <div
      ref={ref}
      className="section-bg"
      aria-hidden="true"
      style={{ opacity: state.opacity * peak }}
    >
      <div
        className="section-bg__img"
        style={{
          filter: `blur(${blur + state.blurIn}px)`,
          transform: `translate3d(0, ${state.y}px, 0) scale(${state.scale})`,
        }}
      >
        <img src={config.image} alt="" draggable={false} style={{ objectPosition: config.position }} />
      </div>
      <div className="section-bg__overlay" style={{ background: overlay }} />
    </div>
  );
}