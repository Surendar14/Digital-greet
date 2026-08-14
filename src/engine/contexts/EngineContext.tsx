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
  const cancelRef = useRef<(() => void) | null>(null);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (!el) return;

    // Stop any in-flight animation and detach its listeners.
    cancelRef.current?.();
    cancelRef.current = null;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }

    // CSS `scroll-behavior: smooth` fights a JS-driven loop, so suppress
    // it for the duration of the animation and restore it afterwards.
    const root = document.documentElement;
    const saved = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    // Lock backdrop updates during programmatic scroll to prevent
    // cascading getBoundingClientRect() calls across all sections.
    const win = window as unknown as Record<string, unknown>;
    win.__dgScrollLock = true;

    // Re-read the target every frame: images may still load and shift
    // the page, so a snapshot taken at click time drifts and looks laggy.
    const duration = 1300;
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    const t0 = performance.now();
    let done = false;

    const onUserInput = () => {
      if (!done) stop();
    };
    const detach = () => {
      window.removeEventListener("wheel", onUserInput);
      window.removeEventListener("touchstart", onUserInput);
      window.removeEventListener("keydown", onUserInput);
    };

    const stop = () => {
      detach();
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      cancelRef.current = null;
      win.__dgScrollLock = false;
      if (root.style.scrollBehavior !== saved) root.style.scrollBehavior = saved;
    };
    cancelRef.current = stop;

    window.addEventListener("wheel", onUserInput, { passive: true });
    window.addEventListener("touchstart", onUserInput, { passive: true });
    window.addEventListener("keydown", onUserInput);

    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const start = window.scrollY;
      const target = Math.max(0, el.getBoundingClientRect().top + start);
      window.scrollTo(0, start + (target - start) * easeOutQuart(t));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        done = true;
        frameRef.current = null;
        stop();
      }
    };
    frameRef.current = requestAnimationFrame(step);

    return stop;
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