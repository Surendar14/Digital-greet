const STORAGE_KEY = "dg-overrides";

export function getOverrides(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setOverrides(fields: Record<string, unknown>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
}

export function clearOverrides(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasOverrides(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function encodeShareData(fields: Record<string, unknown>): string {
  const json = JSON.stringify(fields);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeShareData(encoded: string): Record<string, unknown> | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function buildShareUrl(fields: Record<string, unknown>): string {
  const data = encodeShareData(fields);
  const base = window.location.origin + window.location.pathname;
  return `${base}?data=${data}`;
}

export function readUrlOverrides(): Record<string, unknown> | null {
  const params = new URLSearchParams(window.location.search);
  const data = params.get("data");
  if (!data) return null;
  return decodeShareData(data);
}
