/**
 * ============================================================
 *  Template Engine — Core Types
 * ============================================================
 *  The engine is 100% template-agnostic. Every visual element
 *  is derived from configuration, never from hardcoded content.
 *
 *  A "template package" is a self-contained folder (e.g. love/)
 *  that provides: manifest, theme, sections, animations, assets.
 */

import type { ComponentType } from "react";

/** Open set — new section types can be registered at any time. */
export type SectionType = string;

export type Mode = "dark" | "light";

/** A single frame target for an animation (subset of framer-motion Variant). */
export interface Frame {
  opacity?: number;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  filter?: string;
}

/** Data-driven animation configuration attached to every section. */
export interface AnimationEntry {
  /** Name of a preset in the template's animations.json (falls back to built-ins). */
  preset?: string;
  delay?: number;
  duration?: number;
  /** Ease keyword: "easeOut" | "easeIn" | "easeInOut" | "linear". */
  ease?: string;
  /** Animate only once (default true). */
  once?: boolean;
  /** 0..1 fraction of element visible before animating. */
  viewAmount?: number;
  /** Explicit variants override the preset. */
  hidden?: Frame;
  show?: Frame;
  /** Seconds between staggered children (used by list sections). */
  stagger?: number;
  /** Delay before staggered children begin. */
  staggerDelay?: number;
}

export interface AnimationPreset {
  hidden?: Frame;
  show?: Frame;
}

export type AnimationPresets = Record<string, AnimationPreset>;

/** Particle / background effect configuration (theme or section level). */
export interface ParticleSettings {
  enabled?: boolean;
  count?: number;
  /** RGB triplets — e.g. [[232,182,166],[255,255,255]]. */
  colors?: number[][];
  /** 0..1 */
  maxOpacity?: number;
  /** px per second drift. */
  speed?: number;
  /** min/max radius. */
  size?: [number, number];
  /** Soft glow (blur) or crisp dots. */
  glow?: boolean;
}

export interface ThemeBackground {
  /** CSS background value. */
  gradient?: string;
  image?: string;
  video?: string;
  overlay?: string;
  particles?: ParticleSettings;
  /** Subtle film grain overlay. */
  grain?: boolean;
  vignette?: boolean;
}

export interface ThemeColors {
  primary: string;
  primarySoft: string;
  primaryDeep: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surface2: string;
  text: string;
  textMuted: string;
  border: string;
  textOnPrimary: string;
  gradientText: string;
  [key: string]: string | undefined;
}

export interface ThemeFonts {
  display: string;
  body: string;
  script: string;
}

export interface ThemeTypography {
  /** Root font-size scale steps for responsive type. */
  stepH1?: string;
  stepH2?: string;
  stepH3?: string;
  stepBody?: string;
  letterSpacingWide?: string;
}

export interface ThemeButtons {
  variant?: string;
  radius?: string;
  paddingX?: string;
  paddingY?: string;
  letterSpacing?: string;
  textTransform?: string;
}

/**
 * theme.json schema — everything a template uses to control
 * its entire look. The engine applies these as CSS custom
 * properties and reads them in components.
 */
export interface ThemeConfig {
  id: string;
  name?: string;
  mode: Mode;
  colors: ThemeColors;
  fonts: ThemeFonts;
  typography?: ThemeTypography;
  buttons?: ThemeButtons;
  spacing?: {
    section?: string;
    sectionMobile?: string;
    gap?: string;
  };
  radius?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    pill?: string;
  };
  shadows?: {
    sm?: string;
    md?: string;
    lg?: string;
    glow?: string;
  };
  background?: ThemeBackground;
  motion?: {
    /** Master switch for heavy canvas effects. */
    particles?: boolean;
    /** Default transition duration for sections. */
    duration?: number;
  };
}

export type SectionContent = unknown;

/**
 * Per-section rose-themed background layer.
 * Each section gets its own image/crop, kept on a consistent dark
 * base with a uniform overlay so text contrast never changes.
 */
export interface SectionBackdrop {
  /** Asset path (e.g. "assets/backgrounds/rose-bokeh.jpg") or URL. */
  image?: string;
  /** CSS object-position — which part of the image each section shows. */
  position?: string;
  /** Peak visibility cap 0..1 (default 1) — lets sections be subtle or bold. */
  opacity?: number;
  /** Blur in px (default 0). */
  blur?: number;
  /** Overlay color — defaults to the shared "rgba(10,5,8,0.75)". */
  overlay?: string;
}

/** Style surface every section may use (data-driven). */
export interface SectionStyle {
  /** Vertical rhythm: "compact" | "default" | "spacious". */
  density?: "compact" | "default" | "spacious";
  /** Content column width. */
  maxWidth?: string;
  align?: "center" | "left" | "right";
  /** Extra inline padding top/bottom (px). */
  paddingBlock?: string;
  /** force full viewport height (hero etc). */
  fullHeight?: boolean;
  /** section minimum height. */
  minHeight?: string;
  /** Extra CSS class hook for template styling. */
  className?: string;
  /** Backdrop: rose image config, or just an asset path string. */
  background?: SectionBackdrop | string;
  /** text-align / color overrides */
  textColor?: string;
  [key: string]: unknown;
}

/**
 * The universal section interface. The renderer does nothing but:
 *  sort → filter enabled → resolve content → render via registry.
 */
export interface SectionConfig {
  /** Unique within the template. */
  id: string;
  type: SectionType;
  enabled?: boolean;
  order?: number;
  animation?: AnimationEntry;
  content?: SectionContent;
  style?: SectionStyle;
  settings?: Record<string, unknown>;
  /** Optional semantic label for accessibility (aria-label). */
  label?: string;
}

/** Editable, template-specific fields (everything user-facing). */
export type TemplateFields = Record<string, unknown>;

export interface Manifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  theme: string;
  mode: Mode;
  preview?: string;
  /** All editable copy/media. Never hardcode content in components. */
  fields: TemplateFields;
}

export interface TemplatePackage {
  id: string;
  name: string;
  version: string;
  description: string;
  preview?: string;
  theme: ThemeConfig;
  manifest: Manifest;
  /** Sections from the template package (raw, unsorted). */
  sections: SectionConfig[];
  animations: AnimationPresets;
  /** Resolve an asset name (e.g. "ambient.wav") to a bundled URL. */
  asset: (name: string) => string | undefined;
  /** Engine-level "fields", asset-resolved once at load time. */
  fields: TemplateFields;
  /** Allows a template to register its own custom section types. */
  register?: (api: SectionRegistryApi) => void;
}

/** API exposed to templates that want custom section types. */
export interface SectionRegistryApi {
  register: (type: string, component: ComponentType<SectionProps>) => void;
}

/** Props passed to every section component. */
export interface SectionProps {
  section: SectionConfig;
  /** Resolved content for THIS section (asset refs already URL-ified). */
  content: SectionContent;
  /** Engine-level resolved editable fields. */
  fields: TemplateFields;
  index: number;
  total: number;
  /** Jump to another section by id (smooth scroll). */
  scrollToSection: (id: string) => void;
}

/** Resolved animation props ready for framer-motion. */
export interface RevealProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  whileInView: any;
  viewport: { once: boolean; amount: number };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transition: any;
}

export interface StaggerResult {
  container: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initial: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    whileInView: any;
    viewport: { once: boolean; amount: number };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variants: any;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: { variants: any };
}

export interface EngineApi {
  pkg: TemplatePackage;
  theme: ThemeConfig;
  fields: TemplateFields;
  animations: AnimationPresets;
  /** Reveal props for a section (merges template presets + section entry). */
  revealFor: (entry?: AnimationEntry | string) => RevealProps;
  staggerFor: (entry?: AnimationEntry | string) => StaggerResult;
  scrollToSection: (id: string) => void;
}

export interface MusicTrack {
  src: string;
  title?: string;
  artist?: string;
  /** When set, the track is played as a YouTube embed instead of <audio>. */
  youtubeId?: string;
  /** Attempt autoplay where browser policies permit. */
  autoplay?: boolean;
  loop?: boolean;
}

export interface LightboxImage {
  src: string;
  title?: string;
  description?: string;
  /** CSS object-position for the photo frame crop, e.g. "center 35%". Defaults to "center". */
  objectPosition?: string;
}

export interface LightboxApi {
  open: (images: LightboxImage[], startIndex?: number, opts?: { title?: string; subtitle?: string }) => void;
  close: () => void;
}
