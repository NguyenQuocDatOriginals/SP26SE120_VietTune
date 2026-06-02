import { describe, expect, it } from 'vitest';

import { parseSubmissionsTrendPayload } from './parseSubmissionsTrend';

describe('parseSubmissionsTrendPayload', () => {
  it('returns legacy monthly map unchanged', () => {
    expect(parseSubmissionsTrendPayload({ '2024-01': 2, '2024-03': 5 })).toEqual({
      '2024-01': 2,
      '2024-03': 5,
    });
  });

  it('returns {} for SubmissionAnalyticsDto without byMonth (client fallback)', () => {
    expect(
      parseSubmissionsTrendPayload({
        total: 12,
        byStatus: { Pending: 4, Approved: 8 },
        avgReviewTime: '2d',
        topEthnicGroups: ['Kinh'],
      }),
    ).toEqual({});
  });

  it('extracts byMonth from SubmissionAnalyticsDto when BE provides it', () => {
    expect(
      parseSubmissionsTrendPayload({
        total: 12,
        byMonth: { '2025-11': 3, '2025-12': 9 },
        byStatus: { Approved: 12 },
      }),
    ).toEqual({ '2025-11': 3, '2025-12': 9 });
  });

  it('supports snake_case by_month', () => {
    expect(parseSubmissionsTrendPayload({ by_month: { '2024-06': 1 } })).toEqual({
      '2024-06': 1,
    });
  });

  it('returns {} for null/invalid input', () => {
    expect(parseSubmissionsTrendPayload(null)).toEqual({});
    expect(parseSubmissionsTrendPayload([])).toEqual({});
  });

  it('returns {} for BE stub empty SubmissionAnalyticsDto', () => {
    expect(parseSubmissionsTrendPayload({ total: 0, byStatus: {} })).toEqual({});
  });
});
