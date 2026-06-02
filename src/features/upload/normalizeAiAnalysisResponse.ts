import { macroRegionDisplayNameFromProvinceRegionCode } from '@/config/provinceRegionCodes';
import { isUnknownValue, sanitizeAiString } from '@/features/upload/unknownValueUtils';

export type NormalizedAiInstrument = {
  id?: string;
  name: string;
  confidence?: number | null;
  confidenceScore?: number;
  max_confidence?: number;
};

export type NormalizedAiAnalysisPayload = {
  title?: string;
  composer?: string;
  recordingLocation?: string;
  language?: string | null;
  instruments: NormalizedAiInstrument[];
  ethnicGroup?: { name: string };
  vocalStyle?: { name: string };
  musicalScale?: { name: string };
  ceremony?: { name: string };
  performanceContext?: string;
  regionSuggestion?: { region: string; detail?: string };
  classification?: {
    performanceType?: string;
    culturalContext?: string;
    tags?: string[] | null;
  };
  overallConfidence?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Unwrap nested API envelopes from legacyPost / OpenAPI shapes. */
export function unwrapAiAnalyzeOnlyResponse(raw: unknown): Record<string, unknown> | null {
  let cur: unknown = raw;
  for (let i = 0; i < 12; i++) {
    if (!isRecord(cur)) return null;
    const nested =
      cur.result ?? cur.value ?? cur.data ?? cur.payload ?? cur.body ?? null;
    if (isRecord(nested)) {
      if (
        nested.title !== undefined ||
        nested.language !== undefined ||
        nested.instruments !== undefined ||
        nested.classification !== undefined ||
        nested.performanceContext !== undefined
      ) {
        return nested;
      }
      cur = nested;
      continue;
    }
    return cur;
  }
  return isRecord(cur) ? cur : null;
}

function sanitizeNamedField(raw: unknown): { name: string } | undefined {
  if (!isRecord(raw)) return undefined;
  const name = sanitizeAiString(raw.name);
  return name ? { name } : undefined;
}

function parseInstruments(raw: unknown): NormalizedAiInstrument[] {
  if (!Array.isArray(raw)) return [];
  const out: NormalizedAiInstrument[] = [];
  for (const item of raw) {
    if (typeof item === 'string') {
      const name = sanitizeAiString(item);
      if (name) out.push({ name });
      continue;
    }
    if (!isRecord(item)) continue;
    const name = sanitizeAiString(item.name);
    if (!name) continue;
    out.push({
      name,
      ...(typeof item.id === 'string' && item.id.trim() ? { id: item.id.trim() } : {}),
      ...(typeof item.confidence === 'number' ? { confidence: item.confidence } : {}),
      ...(typeof item.confidenceScore === 'number' ? { confidenceScore: item.confidenceScore } : {}),
      ...(typeof item.max_confidence === 'number' ? { max_confidence: item.max_confidence } : {}),
    });
  }
  return out;
}

/**
 * Safe normalize for `POST /AIAnalysis/analyze-only`.
 * Drops unknown/null/empty placeholders so callers never fill the form with "unknown".
 */
export function normalizeAiAnalyzeOnlyResponse(raw: unknown): NormalizedAiAnalysisPayload | null {
  const payload = unwrapAiAnalyzeOnlyResponse(raw);
  if (!payload) return null;

  const classificationRaw = isRecord(payload.classification) ? payload.classification : null;
  const performanceTypeRaw = classificationRaw?.performanceType;
  const performanceType = sanitizeAiString(performanceTypeRaw) ?? undefined;

  const regionBlock = isRecord(payload.regionSuggestion) ? payload.regionSuggestion : null;
  const region = sanitizeAiString(regionBlock?.region);
  const regionDetail = sanitizeAiString(regionBlock?.detail);

  const languageRaw = payload.language;
  const language =
    languageRaw === undefined || languageRaw === null
      ? undefined
      : isUnknownValue(languageRaw)
        ? null
        : sanitizeAiString(languageRaw);

  const normalized: NormalizedAiAnalysisPayload = {
    instruments: parseInstruments(payload.instruments),
  };

  const title = sanitizeAiString(payload.title);
  if (title) normalized.title = title;

  const composer = sanitizeAiString(payload.composer);
  if (composer) normalized.composer = composer;

  const recordingLocation = sanitizeAiString(payload.recordingLocation);
  if (recordingLocation) normalized.recordingLocation = recordingLocation;

  if (language !== undefined) normalized.language = language;

  const performanceContext = sanitizeAiString(payload.performanceContext);
  if (performanceContext) normalized.performanceContext = performanceContext;

  const ethnicGroup = sanitizeNamedField(payload.ethnicGroup);
  if (ethnicGroup) normalized.ethnicGroup = ethnicGroup;

  const vocalStyle = sanitizeNamedField(payload.vocalStyle);
  if (vocalStyle) normalized.vocalStyle = vocalStyle;

  const musicalScale = sanitizeNamedField(payload.musicalScale);
  if (musicalScale) normalized.musicalScale = musicalScale;

  const ceremony = sanitizeNamedField(payload.ceremony);
  if (ceremony) normalized.ceremony = ceremony;

  if (region || regionDetail) {
    const regionDisplay =
      macroRegionDisplayNameFromProvinceRegionCode(region ?? regionDetail) ||
      region ||
      regionDetail ||
      '';
    normalized.regionSuggestion = {
      region: regionDisplay,
      ...(regionDetail && region && regionDetail !== regionDisplay
        ? { detail: regionDetail }
        : {}),
    };
  }

  if (performanceType || classificationRaw) {
    normalized.classification = {
      ...(performanceType ? { performanceType } : {}),
      ...(sanitizeAiString(classificationRaw?.culturalContext)
        ? { culturalContext: sanitizeAiString(classificationRaw?.culturalContext)! }
        : {}),
      ...(Array.isArray(classificationRaw?.tags) ? { tags: classificationRaw.tags } : {}),
    };
  }

  if (typeof payload.overallConfidence === 'number' && Number.isFinite(payload.overallConfidence)) {
    normalized.overallConfidence = payload.overallConfidence;
  }

  return normalized;
}

/** True when normalized payload has at least one field worth showing/applying (excludes language-only `null` / unknown). */
export function hasMeaningfulNormalizedAiData(ai: NormalizedAiAnalysisPayload): boolean {
  if (ai.instruments.length > 0) return true;
  if (ai.title || ai.composer || ai.recordingLocation) return true;
  if (ai.ethnicGroup || ai.vocalStyle || ai.musicalScale || ai.ceremony) return true;
  if (ai.performanceContext) return true;
  if (ai.classification?.performanceType) return true;
  if (ai.regionSuggestion?.region) return true;
  if (typeof ai.language === 'string' && ai.language.length > 0) return true;
  return false;
}

export function debugLogAiAnalyzeOnly(
  raw: unknown,
  normalized: NormalizedAiAnalysisPayload | null,
): void {
  if (!import.meta.env.DEV) return;
  console.debug('[AI analyze-only raw]', raw);
  console.debug('[AI analyze-only normalized]', normalized);
}
