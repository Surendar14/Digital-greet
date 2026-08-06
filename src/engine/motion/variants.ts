/**
 * Data-driven animation system.
 *
 * Sections describe their motion declaratively (`animation.preset`),
 * the engine looks it up in the template's `animations.json`, falling
 * back to these built-in presets when the template omits entries.
 */

import type {
  AnimationEntry,
  AnimationPreset,
  AnimationPresets,
  RevealProps,
  StaggerResult
} from "../types";

export const defaultPresets: AnimationPresets = {
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  fadeUp: { hidden: { opacity: 0, y: 42 }, show: { opacity: 1, y: 0 } },
  fadeDown: { hidden: { opacity: 0, y: -42 }, show: { opacity: 1, y: 0 } },
  fadeLeft: { hidden: { opacity: 0, x: -56 }, show: { opacity: 1, x: 0 } },
  fadeRight: { hidden: { opacity: 0, x: 56 }, show: { opacity: 1, x: 0 } },
  zoom: { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } },
  zoomIn: { hidden: { opacity: 0, scale: 1.12 }, show: { opacity: 1, scale: 1 } },
  blur: { hidden: { opacity: 0, filter: "blur(14px)" }, show: { opacity: 1, filter: "blur(0px)" } },
  rotate: { hidden: { opacity: 0, rotate: -4, y: 30 }, show: { opacity: 1, rotate: 0, y: 0 } },
  rise: { hidden: { opacity: 0, y: 90 }, show: { opacity: 1, y: 0 } }
};

/** Accepts either a preset name string or a full AnimationEntry object. */
export function toEntry(entry: AnimationEntry | string | undefined): AnimationEntry {
  if (typeof entry === "string") return { preset: entry };
  return entry ?? {};
}

const EASE_MAP: Record<string, string> = {
  linear: "linear",
  easeIn: "easeIn",
  easeOut: "easeOut",
  easeInOut: "easeInOut"
};

function pickPreset(entry: AnimationEntry, presets: AnimationPresets): AnimationPreset {
  const name = entry.preset || "fadeUp";
  return (
    presets[name] ??
    defaultPresets[name] ?? {
      hidden: { opacity: 0, y: 42 },
      show: { opacity: 1, y: 0 }
    }
  );
}

/** Build motion props for a whole-section reveal. */
export function buildReveal(
  entry: AnimationEntry | string | undefined,
  presets: AnimationPresets,
  overrides?: { duration?: number }
): RevealProps {
  const e = toEntry(entry);
  const preset = pickPreset(e, presets);
  const hidden = { ...preset.hidden, ...e.hidden };
  const show = { ...preset.show, ...e.show };
  const duration = e.duration ?? overrides?.duration ?? 1;
  return {
    initial: hidden,
    whileInView: show,
    viewport: { once: e.once ?? true, amount: e.viewAmount ?? 0.18 },
    transition: { duration, delay: e.delay ?? 0, ease: EASE_MAP[e.ease ?? "easeOut"] ?? "easeOut" }
  };
}

/** Build container + item variants for staggered lists (cards/timeline). */
export function buildStagger(
  entry: AnimationEntry | string | undefined,
  presets: AnimationPresets
): StaggerResult {
  const e = toEntry(entry);
  const preset = pickPreset(e, presets);
  const hidden = { ...preset.hidden, ...e.hidden };
  const show = { ...preset.show, ...e.show };
  const stagger = e.stagger ?? 0.09;
  return {
    container: {
      initial: "hidden" as unknown as Record<string, unknown>,
      whileInView: "show" as unknown as Record<string, unknown>,
      viewport: { once: e.once ?? true, amount: e.viewAmount ?? 0.12 },
      transition: { duration: e.duration ?? 0.7, staggerChildren: stagger, delayChildren: e.staggerDelay ?? 0.05 },
      variants: { hidden, show }
    },
    item: {
      variants: { hidden, show }
    }
  };
}