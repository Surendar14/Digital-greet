/**
 * Template registry — discovers every template package by folder.
 * A new template = a new folder with a `template.ts`; no engine edits.
 */

import {
  registerBuiltinSections,
  registerSection,
  type TemplatePackage
} from "../engine";

const modules = import.meta.glob("../templates/*/template.ts", {
  eager: true,
  import: "default"
}) as Record<string, unknown>;

let loaded = false;
const packages = new Map<string, TemplatePackage>();

export function getTemplatePackages(): TemplatePackage[] {
  ensureLoaded();
  return Array.from(packages.values());
}

export function findTemplateById(id: string): TemplatePackage | undefined {
  ensureLoaded();
  return packages.get(id);
}

export async function loadTemplate(id: string): Promise<TemplatePackage> {
  const pkg = findTemplateById(id);
  if (!pkg) throw new Error(`Template not found: "${id}".`);
  return pkg;
}

function ensureLoaded(): void {
  if (loaded) return;
  loaded = true;
  registerBuiltinSections();
  for (const raw of Object.values(modules)) {
    const pkg = raw as TemplatePackage;
    if (!pkg || typeof pkg.id !== "string") continue;
    pkg.register?.({ register: registerSection });
    packages.set(pkg.id, pkg);
  }
}