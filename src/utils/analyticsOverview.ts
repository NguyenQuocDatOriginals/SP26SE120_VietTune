import type { AnalyticsOverview } from '@/types/analytics';

/**
 * Total collection size from `GET /api/Analytics/overview`.
 * Prefers swagger `totalSongs`, then legacy `totalRecordings`.
 */
export function resolveOverviewTotalRecordings(
  overview: AnalyticsOverview | null | undefined,
): number | undefined {
  if (!overview) return undefined;
  if (typeof overview.totalSongs === 'number' && Number.isFinite(overview.totalSongs)) {
    return overview.totalSongs;
  }
  if (typeof overview.totalRecordings === 'number' && Number.isFinite(overview.totalRecordings)) {
    return overview.totalRecordings;
  }
  return undefined;
}
