import type {
  AdvisoryMetadataSuggestion,
  AdvisoryMetadataSuggestionField,
  MetadataSuggestionCandidate,
} from '@/types/instrumentDetection';

export type MetadataSuggestionItem = {
  label: string;
  confidence?: number | null;
  source?: string | null;
};

export type MetadataSuggestionGroup = {
  id: AdvisoryMetadataSuggestionField;
  title: string;
  requiresExpertVerification?: boolean;
  conflictDetected?: boolean;
  primary?: MetadataSuggestionItem | null;
  secondary?: MetadataSuggestionItem[];
};

const GROUP_TITLES: Record<AdvisoryMetadataSuggestionField, string> = {
  ethnicGroup: 'Nhóm dân tộc gợi ý',
  eventType: 'Loại sự kiện gợi ý',
  musicalScale: 'Âm giai gợi ý',
  region: 'Khu vực gợi ý',
  vocalStyle: 'Lời hát gợi ý',
};

/** Stable display order for formal advisory layout. */
export const METADATA_SUGGESTION_GROUP_ORDER: AdvisoryMetadataSuggestionField[] = [
  'ethnicGroup',
  'eventType',
  'musicalScale',
  'region',
  'vocalStyle',
];

export function formatInferenceSource(source?: string | null): string | null {
  if (!source?.trim()) return null;
  const trimmed = source.trim();
  if (/phân tích\s*ai/i.test(trimmed)) {
    return 'Nguồn suy luận: Phân tích AI';
  }
  return `Nguồn suy luận: ${trimmed}`;
}

function resolveSourceLabel(candidate: MetadataSuggestionCandidate): string | null {
  const joined =
    candidate.sourceInstruments && candidate.sourceInstruments.length > 0
      ? candidate.sourceInstruments.join(', ')
      : candidate.sourceInstrument;
  return formatInferenceSource(joined);
}

function candidateToItem(candidate: MetadataSuggestionCandidate): MetadataSuggestionItem {
  return {
    label: candidate.label,
    confidence: Number.isFinite(candidate.score) ? candidate.score : null,
    source: resolveSourceLabel(candidate),
  };
}

/**
 * Map advisory groups (from instrument mapper) into card-ready UI groups.
 * Only includes groups that have at least one candidate.
 */
export function normalizeMetadataSuggestionGroups(
  advisory: readonly AdvisoryMetadataSuggestion[],
): MetadataSuggestionGroup[] {
  const byField = new Map(advisory.map((row) => [row.field, row]));

  const groups: MetadataSuggestionGroup[] = [];
  for (const field of METADATA_SUGGESTION_GROUP_ORDER) {
    const row = byField.get(field);
    if (!row || row.candidates.length === 0) continue;

    const [primaryCandidate, ...rest] = row.candidates;
    groups.push({
      id: field,
      title: GROUP_TITLES[field],
      requiresExpertVerification: row.requiresExpert,
      conflictDetected: row.conflictDetected,
      primary: candidateToItem(primaryCandidate),
      secondary: rest.map(candidateToItem),
    });
  }

  return groups;
}

export function advisoryFieldToLegacyField(
  field: AdvisoryMetadataSuggestionField,
): 'ethnicity' | 'region' | 'vocalStyle' | 'eventType' | 'musicalScale' {
  if (field === 'ethnicGroup') return 'ethnicity';
  return field;
}
