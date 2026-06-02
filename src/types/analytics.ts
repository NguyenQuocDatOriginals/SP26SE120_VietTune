import type { components } from '@/api';

/** Swagger: `OverviewMetricsDto` — `GET /api/Analytics/overview` */
export type OverviewMetricsDto =
  components['schemas']['VietTuneArchive.Application.Mapper.DTOs.AnalyticsDto.OverviewMetricsDto'];

/** Swagger: `SubmissionAnalyticsDto` — `GET /api/Analytics/submissions` */
export type SubmissionAnalyticsDto =
  components['schemas']['VietTuneArchive.Application.Mapper.DTOs.AnalyticsDto.SubmissionAnalyticsDto'];

/** Swagger: `CoverageChartDto` — `GET /api/Analytics/coverage` */
export type CoverageRow =
  components['schemas']['VietTuneArchive.Application.Mapper.DTOs.AnalyticsDto.CoverageChartDto'];

/** Swagger: `ContributorLeaderboardDto` — `GET /api/Analytics/contributors` */
export type ContributorLeaderboardDto =
  components['schemas']['VietTuneArchive.Application.Mapper.DTOs.AnalyticsDto.ContributorLeaderboardDto'];

/**
 * Contributor row for admin analytics UI.
 * Extends swagger DTO with FE-only aliases used when merging with `adminApi.getUsers()`.
 */
export type ContributorRow = ContributorLeaderboardDto & {
  /** FE-only: alias for `userId` in merged user tables */
  id?: string;
  /** FE-only: alias for `contributionCount` */
  submissions?: number;
};

/** Swagger: `ExpertPerformanceResponseDto` — `GET /api/Analytics/experts` */
export type ExpertPerformanceDto =
  components['schemas']['VietTuneArchive.Application.Mapper.DTOs.AnalyticsDto.ExpertPerformanceResponseDto'];

/** Swagger: `ContentAnalyticsResponseDto` — `GET /api/Analytics/content` */
export type ContentAnalyticsDto =
  components['schemas']['VietTuneArchive.Application.Mapper.DTOs.AnalyticsDto.ContentAnalyticsResponseDto'];

/**
 * Overview payload from `analyticsApi.getOverview()`.
 * Contract fields follow `OverviewMetricsDto`; legacy name kept until dashboard mapping (T3).
 */
export type AnalyticsOverview = OverviewMetricsDto & {
  /**
   * @deprecated Prefer `totalSongs` from `OverviewMetricsDto`. Still read in `useAdminDashboardData` (T3).
   */
  totalRecordings?: number;
};
