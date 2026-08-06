/**
 * Template package factory.
 *
 * Each template folder exports a `template.ts` that calls this once:
 * it wires the template's JSON (manifest/theme/sections/animations)
 * together with its bundled assets and returns a ready `TemplatePackage`
 * the engine can render — nothing else is required.
 */

import type { TemplatePackage } from "../types";
import { resolveContent } from "../utils/resolve";

export interface TemplatePackageInput {
  id: string;
  name: string;
  version: string;
  description: string;
  theme: object;
  manifest: object;
  sections: object[];
  animations: object;
  preview?: string;
  /** Vite glob output: "./assets/<name>" → bundled URL. */
  globAssets: Record<string, string>;
}

export function createTemplatePackage(input: TemplatePackageInput): TemplatePackage {
  const theme = input.theme as TemplatePackage["theme"];
  const manifest = input.manifest as TemplatePackage["manifest"];

  const asset = (name: string): string | undefined => {
    const key = `./assets/${name.replace(/\\/g, "/")}`;
    const direct = input.globAssets[key];
    if (direct) return direct;
    const nested = Object.entries(input.globAssets).find(([k]) => k.endsWith(`/${name}`));
    return nested ? nested[1] : undefined;
  };

  const fields = resolveContent(manifest.fields ?? {}, { fields: {}, asset });

  return {
    id: input.id,
    name: input.name,
    version: input.version,
    description: input.description,
    theme,
    manifest,
    sections: input.sections as TemplatePackage["sections"],
    animations: input.animations as TemplatePackage["animations"],
    asset,
    fields: fields as Record<string, unknown>
  };
}