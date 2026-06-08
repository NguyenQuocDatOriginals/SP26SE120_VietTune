import { describe, expect, it } from 'vitest';

import {
  collectUniqueSources,
  shouldShowPerRowSource,
} from '@/components/features/upload/metadata-suggestions/formatCompactSource';
import type { MetadataSuggestion } from '@/types/instrumentDetection';
import { groupMetadataSuggestionsForAdvisory } from '@/utils/instrumentMetadataMapper';
import { normalizeMetadataSuggestionGroups } from '@/utils/metadataSuggestionNormalize';

describe('formatCompactSource helpers', () => {
  it('dedupes when advisory group shares one instrument source', () => {
    const suggestions: MetadataSuggestion[] = [
      { field: 'eventType', value: 'Biểu diễn', sourceInstrument: 'Đàn bầu', confidence: 0.98 },
      { field: 'eventType', value: 'Lễ hội', sourceInstrument: 'Đàn bầu', confidence: 0.95 },
    ];
    const groups = normalizeMetadataSuggestionGroups(
      groupMetadataSuggestionsForAdvisory(suggestions),
    );
    const group = groups.find((g) => g.id === 'eventType');
    expect(group).toBeDefined();
    const items = [...(group!.primary ? [group!.primary] : []), ...(group!.secondary ?? [])];
    expect(collectUniqueSources(items)).toEqual(['Nguồn: Đàn bầu']);
    expect(shouldShowPerRowSource(items)).toBe(false);
  });
});
