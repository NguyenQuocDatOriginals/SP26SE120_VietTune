import { PERFORMANCE_TYPES } from '@/features/upload/uploadConstants';
import { isUnknownValue } from '@/features/upload/unknownValueUtils';
import type { DetectedInstrument } from '@/types/instrumentDetection';

export type PerformanceTypeKey = (typeof PERFORMANCE_TYPES)[number]['key'];

/** Canonical form values for submit + UI (keys, not Vietnamese labels). */
export const PERFORMANCE_TYPE = {
  INSTRUMENTAL: 'instrumental',
  ACAPELLA: 'acappella',
  VOCAL_ACCOMPANIMENT: 'vocal_accompaniment',
} as const satisfies Record<string, PerformanceTypeKey>;

const CANONICAL_KEYS = new Set<string>(PERFORMANCE_TYPES.map((p) => p.key));

const ALIAS_TO_KEY: Record<string, PerformanceTypeKey> = {
  instrumental: 'instrumental',
  instrumental_solo: 'instrumental',
  instrumental_ensemble: 'instrumental',
  acappella: 'acappella',
  unaccompanied_vocal: 'acappella',
  vocal_accompaniment: 'vocal_accompaniment',
  accompanied_vocal: 'vocal_accompaniment',
  vocal: 'vocal_accompaniment',
  mixed: 'vocal_accompaniment',
  instrument: 'instrumental',
  'hát với nhạc cụ': 'vocal_accompaniment',
  'hat voi nhac cu': 'vocal_accompaniment',
  'hát không đệm': 'acappella',
  'hat khong dem': 'acappella',
  'nhạc cụ': 'instrumental',
  'nhac cu': 'instrumental',
};

/**
 * Maps stored or AI-provided performance type strings to a wizard form key, or '' if unknown.
 */
export function normalizePerformanceTypeKey(value: string | null | undefined): PerformanceTypeKey | '' {
  const trimmed = (value ?? '').trim();
  if (!trimmed || isUnknownValue(trimmed)) return '';
  if (CANONICAL_KEYS.has(trimmed)) return trimmed as PerformanceTypeKey;
  const mapped = ALIAS_TO_KEY[trimmed.toLowerCase()];
  return mapped ?? '';
}

export function hasValidDetectedInstruments(
  items: readonly (DetectedInstrument | { name?: string | null } | string | null | undefined)[],
): boolean {
  for (const item of items) {
    if (!item) continue;
    if (typeof item === 'string') {
      if (!isUnknownValue(item)) return true;
      continue;
    }
    const name = typeof item === 'object' && 'name' in item ? item.name : undefined;
    if (typeof name === 'string' && !isUnknownValue(name)) return true;
  }
  return false;
}

export function mergeInstrumentDetectionSignals(
  detected: readonly DetectedInstrument[],
  instrumentNames: readonly string[],
): DetectedInstrument[] {
  const seen = new Set<string>();
  const out: DetectedInstrument[] = [];

  const pushName = (raw: string) => {
    const name = raw.trim();
    if (!name || isUnknownValue(name)) return;
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ name, confidence: null });
  };

  for (const d of detected) pushName(d.name ?? '');
  for (const n of instrumentNames) pushName(n);
  return out;
}
