/**
 * ============================================================
 *  Template Engine — Public API
 * ============================================================
 *  Everything a template package (or a new section type) needs.
 *  Importing this barrel must never leak template specifics.
 */

export * from "./types";

export { createTemplatePackage } from "./pkg/builder";

export { registerSection, getSectionComponent, hasSectionType, listRegisteredTypes } from "./sections/registry";
export { registerBuiltinSections } from "./sections/index";

export { TemplateHost, themeVars } from "./TemplateHost";
export { SectionRenderer } from "./SectionRenderer";

export { useEngine, EngineProvider } from "./contexts/EngineContext";
export { useMusic, MusicProvider } from "./contexts/MusicContext";
export { useLightbox, LightboxProvider } from "./contexts/LightboxContext";

export { Reveal } from "./components/Reveal";
export { Button } from "./components/Button";
export { Particles } from "./components/Particles";
export { Confetti } from "./components/Confetti";
export { LazyImage } from "./components/LazyImage";
export { SectionShell, SectionHeading } from "./components/SectionShell";
export { Icon } from "./components/Icon";

export { defaultPresets } from "./motion/variants";
export { resolveContent, cx, asText, getSetting, rgba, parseDate, prefersReducedMotion } from "./utils/resolve";