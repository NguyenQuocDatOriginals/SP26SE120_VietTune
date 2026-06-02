import { describe, expect, it } from 'vitest';

import type { AdvisoryMetadataSuggestion } from '@/types/instrumentDetection';
import {
  formatInferenceSource,
  normalizeMetadataSuggestionGroups,
} from '@/utils/metadataSuggestionNormalize';

describe('metadataSuggestionNormalize', () => {
  it('maps advisory groups to primary/secondary with formatted source', () => {
    const advisory: AdvisoryMetadataSuggestion[] = [
      {
        field: 'eventType',
        candidates: [
          {
            value: 'Biểu diễn',
            label: 'Biểu diễn',
            score: 0.98,
            sourceInstruments: ['Đàn bầu'],
          },
          {
            value: 'Lễ hội',
            label: 'Lễ hội',
            score: 0.95,
            sourceInstrument: 'Đàn tranh',
          },
        ],
        conflictDetected: false,
        requiresExpert: true,
      },
    ];

    const groups = normalizeMetadataSuggestionGroups(advisory);
    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe('Loại sự kiện gợi ý');
    expect(groups[0].requiresExpertVerification).toBe(true);
    expect(groups[0].primary?.label).toBe('Biểu diễn');
    expect(groups[0].primary?.source).toBe('Nguồn suy luận: Đàn bầu');
    expect(groups[0].secondary?.[0].source).toBe('Nguồn suy luận: Đàn tranh');
  });

  it('formats AI analysis source label', () => {
    expect(formatInferenceSource('Phân tích AI')).toBe('Nguồn suy luận: Phân tích AI');
  });
});
