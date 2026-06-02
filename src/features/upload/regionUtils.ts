import { macroRegionDisplayNameFromProvinceRegionCode } from '@/config/provinceRegionCodes';

function normalizeRegionKey(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Maps AI/DB region codes (e.g. DBSCL) or free text to the label used in the upload dropdown (`REGIONS`).
 */
export function resolveUploadRegionLabel(
  raw: string | null | undefined,
  availableRegions: readonly string[],
): string {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return '';

  const fromCode = macroRegionDisplayNameFromProvinceRegionCode(trimmed);
  const candidate = fromCode || trimmed;
  const key = normalizeRegionKey(candidate);

  for (const r of availableRegions) {
    if (normalizeRegionKey(r) === key) return r;
  }
  for (const r of availableRegions) {
    const rk = normalizeRegionKey(r);
    if (key.includes(rk) || rk.includes(key)) return r;
  }

  return candidate;
}
