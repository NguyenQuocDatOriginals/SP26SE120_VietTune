import { api } from '@/services/api';
import { extractArray, extractObject } from '@/utils/apiHelpers';

export type AnalyticsOverview = {
  totalRecordings?: number;
  totalSubmissions?: number;
  totalUsers?: number;
  totalContributors?: number;
  totalExperts?: number;
};

export type CoverageRow = {
  name?: string;
  label?: string;
  ethnicity?: string;
  region?: string;
  count?: number;
  value?: number;
};

export type ContributorRow = {
  userId?: string;
  id?: string;
  username?: string;
  fullName?: string;
  contributionCount?: number;
  submissions?: number;
  approvedCount?: number;
  rejectedCount?: number;
};

export const analyticsApi = {
  async getOverview(): Promise<AnalyticsOverview | null> {
    const res = await api.get<unknown>('/Analytics/overview');
    return extractObject(res) as AnalyticsOverview | null;
  },

  async getCoverage(): Promise<CoverageRow[]> {
    const res = await api.get<unknown>('/Analytics/coverage');
    return extractArray<CoverageRow>(res);
  },

  async getSubmissionsTrend(): Promise<Record<string, number>> {
    // Prefer server aggregation; if server returns rows, caller can map.
    const res = await api.get<unknown>('/Analytics/submissions');
    const obj = extractObject(res);
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      // if already returned as { "2026-03": 12, ... }
      const entries = Object.entries(obj);
      if (entries.every(([, v]) => typeof v === 'number')) return obj as Record<string, number>;
    }
    // otherwise return empty and let UI fallback.
    return {};
  },

  async getContributors(): Promise<ContributorRow[]> {
    const res = await api.get<unknown>('/Analytics/contributors');
    return extractArray<ContributorRow>(res);
  },
};
