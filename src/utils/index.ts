/**
 * Pure utility helpers that are not React-specific.
 * Prefer `@/lib/utils` for UI className helpers (`cn`).
 */

export function absoluteUrl(path: string, baseUrl: string) {
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return path;
  }
}
