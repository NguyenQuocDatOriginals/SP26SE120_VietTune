import { describe, expect, it } from 'vitest';

import {
  hasMeaningfulNormalizedAiData,
  normalizeAiAnalyzeOnlyResponse,
} from '@/features/upload/normalizeAiAnalysisResponse';

describe('normalizeAiAnalyzeOnlyResponse', () => {
  it('unwraps nested envelopes and drops unknown fields', () => {
    const normalized = normalizeAiAnalyzeOnlyResponse({
      data: {
        result: {
          title: 'Ma sap',
          language: 'unknown',
          instruments: [],
          classification: { performanceType: 'unknown' },
          regionSuggestion: { region: 'unknown' },
          ceremony: { name: 'Lễ hội Lồng Tồng' },
        },
      },
    });

    expect(normalized?.title).toBe('Ma sap');
    expect(normalized?.language).toBeNull();
    expect(normalized?.instruments).toEqual([]);
    expect(normalized?.classification?.performanceType).toBeUndefined();
    expect(normalized?.regionSuggestion).toBeUndefined();
    expect(normalized?.ceremony?.name).toBe('Lễ hội Lồng Tồng');
    expect(normalized && hasMeaningfulNormalizedAiData(normalized)).toBe(true);
  });

  it('treats all-unknown payload as not meaningful', () => {
    const normalized = normalizeAiAnalyzeOnlyResponse({
      language: 'unknown',
      instruments: [],
      classification: { performanceType: 'unknown' },
    });
    expect(normalized).not.toBeNull();
    expect(hasMeaningfulNormalizedAiData(normalized!)).toBe(false);
  });

  it('maps region codes to display names', () => {
    const normalized = normalizeAiAnalyzeOnlyResponse({
      regionSuggestion: { region: 'DBSCL' },
    });
    expect(normalized?.regionSuggestion?.region).toBe('Đồng bằng sông Cửu Long');
  });

  it('keeps valid instruments and language', () => {
    const normalized = normalizeAiAnalyzeOnlyResponse({
      language: 'tiếng Việt',
      instruments: [{ name: 'Đàn bầu', confidence: 0.8 }],
      classification: { performanceType: 'instrumental' },
    });

    expect(normalized?.language).toBe('tiếng Việt');
    expect(normalized?.instruments).toHaveLength(1);
    expect(normalized?.classification?.performanceType).toBe('instrumental');
  });
});
