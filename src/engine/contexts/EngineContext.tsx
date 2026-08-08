import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import type { AnimationEntry, EngineApi, TemplatePackage } from "../types";
import { buildReveal, buildStagger } from "../motion/variants";

const EngineContext = createContext<EngineApi | null>(null);

export function useEngine(): EngineApi {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error("useEngine must be used inside <TemplateHost>");
  return ctx;
}

/** Builds the engine API surface for a template package. */
export function useEngineApi(pkg: TemplatePackage): EngineApi {
  const frameRef = useRef<number | null>(null);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (!el) return;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const start = window.scrollY;
    const target = Math.max(0, el.getBoundingClientRect().top + start);
    const delta = target - start;
    const duration = reduce ? 400 : 2400;
    const t0 = performance.now();
    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      window.scrollTo(0, start + delta * ease(t));
      if (t < 1) frameRef.current = requestAnimationFrame(step);
      else frameRef.current = null;
    };
    frameRef.current = requestAnimationFrame(step);
  }, []);

  return useMemo<EngineApi>(
    () => ({
      pkg,
      theme: pkg.theme,
      fields: pkg.fields,
      animations: pkg.animations,
      revealFor: (entry?: AnimationEntry | string) =>
        buildReveal(entry, pkg.animations, { duration: pkg.theme.motion?.duration }),
      staggerFor: (entry?: AnimationEntry | string) => buildStagger(entry, pkg.animations),
      scrollToSection
    }),
    [pkg, scrollToSection]
  );
}

export function EngineProvider({
  api,
  children
}: {
  api: EngineApi;
  children: React.ReactNode;
}) {
  return <EngineContext.Provider value={api}>{children}</EngineContext.Provider>;
}