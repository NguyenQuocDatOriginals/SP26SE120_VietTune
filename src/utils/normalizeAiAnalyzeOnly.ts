import type { DetectedInstrument } from '@/types/instrumentDetection';
import { mapInstrumentDetectionRow, peelAiAnalysisEnvelope } from '@/utils/mapInstrumentDetectionRow';

export type NormalizedAiAnalyzeOnly = {
  instruments: DetectedInstrument[];
};

function extractInstrumentsArray(raw: unknown): unknown[] {
  const peeled = peelAiAnalysisEnvelope(raw);
  if (peeled && Array.isArray(peeled.instruments)) {
    return peeled.instruments;
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r.instruments)) return r.instruments;
  }
  return [];
}

/**
 * Normalizes `/AIAnalysis/analyze-only` responses to a flat instrument list.
 * Returns null when no instrument rows could be parsed.
 */
export function normalizeAiAnalyzeOnly(raw: unknown): NormalizedAiAnalyzeOnly | null {
  const rawInstruments = extractInstrumentsArray(raw);
  const instruments = rawInstruments
    .map(mapInstrumentDetectionRow)
    .filter((item): item is DetectedInstrument => !!item);
  if (instruments.length === 0) return null;
  return { instruments };
}
