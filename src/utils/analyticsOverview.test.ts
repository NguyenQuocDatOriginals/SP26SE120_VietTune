import { describe, expect, it } from 'vitest';

import { resolveOverviewTotalRecordings } from './analyticsOverview';

describe('resolveOverviewTotalRecordings', () => {
  it('prefers totalSongs over legacy totalRecordings', () => {
    expect(resolveOverviewTotalRecordings({ totalSongs: 10, totalRecordings: 99 })).toBe(10);
  });

  it('falls back to totalRecordings', () => {
    expect(resolveOverviewTotalRecordings({ totalRecordings: 5 })).toBe(5);
  });

  it('reads totalSongs from swagger OverviewMetricsDto', () => {
    expect(
      resolveOverviewTotalRecordings({
        totalSongs: 42,
        totalViews: 100,
        activeUsers: 3,
        newSubmissions: 1,
        growthRate: 0.5,
      }),
    ).toBe(42);
  });

  it('returns undefined when no numeric total', () => {
    expect(resolveOverviewTotalRecordings({})).toBeUndefined();
    expect(resolveOverviewTotalRecordings(null)).toBeUndefined();
  });
});
