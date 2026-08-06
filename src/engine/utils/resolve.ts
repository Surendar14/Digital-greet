/** Shared resolution & small utils for the engine. */

const REF_MARKER = "@";
const ASSET_PREFIX = "assets/";

export interface ResolveContext {
  fields: Record<string, unknown>;
  asset: (name: string) => string | undefined;
}

/**
 * Recursively resolves a section's content against the template's
 * editable fields and bundled assets:
 *
 *   "@recipient_name"        → manifest.fields["recipient_name"]
 *   "assets/photo-1.svg"     → bundled URL for that asset
 *   everything else          → passed through untouched
 */
export function resolveContent(value: unknown, ctx: ResolveContext): unknown {
  if (typeof value === "string") {
    if (value.startsWith(REF_MARKER)) {
      // supports dotted paths: "@music_meta.title"
      let field: unknown = ctx.fields;
      let found = true;
      for (const part of value.slice(1).split(".")) {
        if (field && typeof field === "object" && part in (field as Record<string, unknown>)) {
          field = (field as Record<string, unknown>)[part];
        } else {
          found = false;
          break;
        }
      }
      if (!found) return "";
      return resolveContent(field, ctx);
    }
    if (value.startsWith(ASSET_PREFIX)) {
      return ctx.asset(value.slice(ASSET_PREFIX.length)) ?? value;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveContent(item, ctx));
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = resolveContent(v, ctx);
    }
    return out;
  }
  return value;
}

/** Joins css class names, dropping falsy entries. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Coerce a JSON value into a non-empty string. */
export function asText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

/** Read a nested object key from settings/style with a default. */
export function getSetting<T>(
  obj: Record<string, unknown> | undefined,
  key: string,
  fallback: T
): T {
  const value = obj?.[key];
  return (value as T | undefined) ?? fallback;
}

/** Insert a PX value from a possibly-undefined config number. */
export function px(value: number | undefined, fallback: string): string {
  return typeof value === "number" ? `${value}px` : fallback;
}

/** Build a rgba() color string from an RGB triplet. */
export function rgba(rgb: number[] | undefined, alpha: number): string {
  if (!rgb || rgb.length < 3) return `rgba(232,182,166,${alpha})`;
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
}

/** Parse "2027-02-14T20:00:00" (or epoch ms) into a Date. */
export function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}
