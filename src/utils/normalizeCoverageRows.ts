import type { CoverageRow } from '@/types/analytics';

export type NormalizedCoverageRow = {
  key: string;
  label: string;
  ethnicity: string;
  region: string;
  count: number;
};

/** Maps API coverage rows to chart-ready rows (count/value/name aliases). */
export function normalizeCoverageRows(rows: CoverageRow[]): NormalizedCoverageRow[] {
  return rows
    .map((row, idx) => {
      const rawCount = row.count ?? row.value ?? 0;
      const count = Number.isFinite(rawCount) ? Math.max(0, Number(rawCount)) : 0;
      const ethnicity = (row.ethnicity ?? row.name ?? `Unknown-${idx}`).trim();
      const region = (row.region ?? '').trim();
      const label = (row.label ?? row.name ?? ethnicity).trim();
      return {
        key: `${ethnicity}-${region || 'na'}-${idx}`,
        label: label || ethnicity,
        ethnicity,
        region,
        count,
      };
    })
    .filter((row) => !!row.label)
    .sort((a, b) => b.count - a.count);
}
