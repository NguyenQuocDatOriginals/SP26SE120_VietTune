import { BarChart3, Server } from 'lucide-react';

import AdminAuditLogPanel from '@/components/admin/AdminAuditLogPanel';
import { AdminAnalyticsStatGrid } from '@/components/admin/AdminStatsCards';
import AdminSystemHealthCard from '@/components/admin/AdminSystemHealthCard';
import ContentAnalyticsPanel from '@/components/features/analytics/ContentAnalyticsPanel';
import ContributorLeaderboard, {
  type ContributorLeaderboardLoadState,
} from '@/components/features/analytics/ContributorLeaderboard';
import CoverageGapChart from '@/components/features/analytics/CoverageGapChart';
import MonthlyTrendChart from '@/components/features/analytics/MonthlyTrendChart';
import type { ContributorRow } from '@/types/analytics';

type RemoteInstruments = { id: string; name: string; category: string | undefined }[] | null;

export default function AdminDashboardAnalyticsPanel({
  remoteTotalRecordings,
  recordingsLength,
  remoteEthnicGroupsLoadState,
  ethnicGroupCount,
  allUsersCount,
  remoteInstrumentCount,
  remoteInstruments,
  monthlyCountsFinal,
  monthlyTrendIsEstimated,
  analyticsContributors,
  analyticsContributorsLoadState,
  onRefreshDashboard,
}: {
  remoteTotalRecordings: number | null;
  recordingsLength: number;
  remoteEthnicGroupsLoadState: 'idle' | 'loading' | 'ok' | 'error';
  ethnicGroupCount: number;
  allUsersCount: number;
  remoteInstrumentCount: number | null;
  remoteInstruments: RemoteInstruments;
  monthlyCountsFinal: Record<string, number>;
  monthlyTrendIsEstimated: boolean;
  analyticsContributors: ContributorRow[] | null;
  analyticsContributorsLoadState: ContributorLeaderboardLoadState;
  onRefreshDashboard: () => void;
}) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-3">
        <div className="p-2 bg-secondary-100/90 rounded-lg shadow-sm">
          <BarChart3 className="h-5 w-5 text-secondary-600" strokeWidth={2.5} />
        </div>
        Phân tích bộ sưu tập
      </h2>
      <p className="text-neutral-700 font-medium leading-relaxed mb-6">
        Khoảng trống theo dân tộc, xu hướng đóng góp theo tháng, người đóng góp tích cực.
      </p>
      <AdminAnalyticsStatGrid
        remoteTotalRecordings={remoteTotalRecordings}
        recordingsLength={recordingsLength}
        remoteEthnicGroupsLoadState={remoteEthnicGroupsLoadState}
        ethnicGroupCount={ethnicGroupCount}
        allUsersCount={allUsersCount}
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl bg-surface-panel">
          <h3 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center justify-between gap-3">
            <span>Nhạc cụ</span>
            <span className="text-primary-600 font-bold">{remoteInstrumentCount ?? '—'}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {!remoteInstruments && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-700 text-sm font-semibold">
                Đang tải…
              </span>
            )}
            {remoteInstruments && remoteInstruments.length === 0 && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-700 text-sm font-semibold">
                Chưa có dữ liệu.
              </span>
            )}
            {remoteInstruments && remoteInstruments.length > 0 && (
              <>
                {remoteInstruments.slice(0, 24).map((ins) => (
                  <span
                    key={ins.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                    title={ins.category ? `Nhóm: ${ins.category}` : undefined}
                  >
                    {ins.name}
                  </span>
                ))}
                {remoteInstruments.length > 24 && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-700 text-sm font-semibold">
                    +{remoteInstruments.length - 24}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        <CoverageGapChart />
        <ContentAnalyticsPanel />
        <MonthlyTrendChart
          data={monthlyCountsFinal}
          isEstimatedData={monthlyTrendIsEstimated}
        />
        <ContributorLeaderboard
          contributors={analyticsContributors}
          loadState={analyticsContributorsLoadState}
          onRefresh={onRefreshDashboard}
        />

        <details className="group rounded-2xl border border-neutral-200/80 bg-surface-panel p-6 shadow-lg open:shadow-xl">
          <summary className="cursor-pointer list-none text-xl font-semibold text-neutral-900 [&::-webkit-details-marker]:hidden">
            <span className="inline-flex w-full flex-wrap items-center gap-3">
              <span className="flex shrink-0 items-center justify-center rounded-lg bg-neutral-100 p-2">
                <Server className="h-5 w-5 text-neutral-700" strokeWidth={2.5} aria-hidden />
              </span>
              Vận hành hệ thống
              <span className="ml-auto text-sm font-medium text-primary-700 group-open:hidden">
                Mở
              </span>
              <span className="ml-auto hidden text-sm font-medium text-primary-700 group-open:inline">
                Thu gọn
              </span>
            </span>
          </summary>
          <p className="mt-3 text-sm font-medium text-neutral-600">
            Sức khỏe dịch vụ và nhật ký kiểm toán (API Admin, không thuộc Analytics).
          </p>
          <div className="mt-6 space-y-6 border-t border-neutral-200/80 pt-6">
            <AdminSystemHealthCard />
            <AdminAuditLogPanel />
          </div>
        </details>
      </div>
    </div>
  );
}
