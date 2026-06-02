const UNKNOWN_STRINGS = new Set([
  '',
  'unknown',
  'null',
  'undefined',
  'none',
  'n/a',
  'na',
  'không rõ',
  'khong ro',
  'không có',
  'khong co',
  'no language',
]);

/** True when value is null/empty or an AI/backend placeholder (not real metadata). */
export function isUnknownValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value !== 'string') return false;
  return UNKNOWN_STRINGS.has(value.trim().toLowerCase());
}

/** Returns trimmed string for form fill, or null if unknown/empty. */
export function sanitizeAiString(value: unknown): string | null {
  if (value == null || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (isUnknownValue(trimmed)) return null;
  return trimmed;
}

/** Apply AI string only when the target form field is still empty. */
export function applyAiStringIfEmpty(
  current: string,
  next: unknown,
  set: (value: string) => void,
): boolean {
  if (current.trim()) return false;
  const sanitized = sanitizeAiString(next);
  if (!sanitized) return false;
  set(sanitized);
  return true;
}
