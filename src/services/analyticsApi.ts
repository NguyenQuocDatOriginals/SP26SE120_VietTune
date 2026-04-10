// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from '@/services/api';
// [VI] Nhập (import) các phụ thuộc cho file.
import { extractArray, extractObject } from '@/utils/apiHelpers';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type AnalyticsOverview = {
// [VI] Thực thi một bước trong luồng xử lý.
  totalRecordings?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  totalSubmissions?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  totalUsers?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  totalContributors?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  totalExperts?: number;
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type CoverageRow = {
// [VI] Thực thi một bước trong luồng xử lý.
  name?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  label?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  ethnicity?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  region?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  count?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  value?: number;
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type ContributorRow = {
// [VI] Thực thi một bước trong luồng xử lý.
  userId?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  id?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  username?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  fullName?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  contributionCount?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  submissions?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  approvedCount?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  rejectedCount?: number;
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const analyticsApi = {
// [VI] Thực thi một bước trong luồng xử lý.
  async getOverview(): Promise<AnalyticsOverview | null> {
// [VI] Khai báo biến/hằng số.
    const res = await api.get<unknown>('/Analytics/overview');
// [VI] Trả về kết quả từ hàm.
    return extractObject(res) as AnalyticsOverview | null;
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  async getCoverage(): Promise<CoverageRow[]> {
// [VI] Khai báo biến/hằng số.
    const res = await api.get<unknown>('/Analytics/coverage');
// [VI] Trả về kết quả từ hàm.
    return extractArray<CoverageRow>(res);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  async getSubmissionsTrend(): Promise<Record<string, number>> {
// [VI] Thực thi một bước trong luồng xử lý.
    // Prefer server aggregation; if server returns rows, caller can map.
// [VI] Khai báo biến/hằng số.
    const res = await api.get<unknown>('/Analytics/submissions');
// [VI] Khai báo biến/hằng số.
    const obj = extractObject(res);
// [VI] Rẽ nhánh điều kiện (if).
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
// [VI] Thực thi một bước trong luồng xử lý.
      // if already returned as { "2026-03": 12, ... }
// [VI] Khai báo biến/hằng số.
      const entries = Object.entries(obj);
// [VI] Khai báo hàm/biểu thức hàm.
      if (entries.every(([, v]) => typeof v === 'number')) return obj as Record<string, number>;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
    // otherwise return empty and let UI fallback.
// [VI] Trả về kết quả từ hàm.
    return {};
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  async getContributors(): Promise<ContributorRow[]> {
// [VI] Khai báo biến/hằng số.
    const res = await api.get<unknown>('/Analytics/contributors');
// [VI] Trả về kết quả từ hàm.
    return extractArray<ContributorRow>(res);
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
};
