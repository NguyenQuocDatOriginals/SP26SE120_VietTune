import type { ContributorRow } from '@/types/analytics';

export type NormalizedContributor = {
  id: string;
  name: string;
  username: string;
  contributionCount: number;
  approvedCount: number;
  rejectedCount: number;
};

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function normalizeContributorLeaderboard(rows: ContributorRow[]): NormalizedContributor[] {
  return rows
    .map((row, idx) => {
      const id = String(row.userId ?? row.id ?? `unknown-${idx}`);
      const username = String(row.username ?? '').trim();
      const fullName = String(row.fullName ?? '').trim();
      return {
        id,
        name: fullName || username || `Người đóng góp #${idx + 1}`,
        username: username || '—',
        contributionCount: toNumber(row.contributionCount ?? row.submissions),
        approvedCount: toNumber(row.approvedCount),
        rejectedCount: toNumber(row.rejectedCount),
      };
    })
    .sort((a, b) => b.contributionCount - a.contributionCount);
}
