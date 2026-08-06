/**
 * Love template package.
 *
 * The engine knows zero about Love: it simply consumes the JSON
 * below (manifest → theme → sections → animations → assets).
 * This file is the only place Love-ish wiring exists.
 */

import { createTemplatePackage } from "../../engine";
import manifest from "./manifest.json";
import theme from "./theme.json";
import animations from "./animations/animations.json";
import preview from "./preview.png";
import type { SectionConfig } from "../../engine";

const sectionModules = import.meta.glob("./sections/*.json", {
  eager: true,
  import: "default"
});

const assetModules = import.meta.glob("./assets/**/*", {
  eager: true,
  query: "?url",
  import: "default"
}) as Record<string, string>;

const sections = Object.values(sectionModules) as unknown as SectionConfig[];

export default createTemplatePackage({
  id: "love",
  name: "Love",
  version: "1.0.0",
  description: "A cinematic, mobile-first digital love letter — rose gold on midnight.",
  theme,
  manifest,
  sections,
  animations,
  preview,
  globAssets: assetModules
});