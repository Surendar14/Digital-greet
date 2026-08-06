import { createContext, useCallback, useContext, useMemo } from "react";
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
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
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