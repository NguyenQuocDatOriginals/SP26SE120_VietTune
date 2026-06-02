import { describe, expect, it } from 'vitest';

import { normalizeCoverageRows } from './normalizeCoverageRows';

describe('normalizeCoverageRows', () => {
  it('uses count, then value, and maps name/label/ethnicity aliases', () => {
    const result = normalizeCoverageRows([
      { name: 'Tày', value: 3, region: 'Bắc' },
      { ethnicity: 'Thái', count: 5, label: 'Thái (label)' },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ ethnicity: 'Thái', label: 'Thái (label)', count: 5, region: '' });
    expect(result[1]).toMatchObject({ ethnicity: 'Tày', label: 'Tày', count: 3, region: 'Bắc' });
  });

  it('sorts descending by count', () => {
    const result = normalizeCoverageRows([
      { name: 'A', count: 1 },
      { name: 'B', count: 9 },
      { name: 'C', count: 4 },
    ]);
    expect(result.map((r) => r.count)).toEqual([9, 4, 1]);
  });

  it('clamps invalid counts to zero', () => {
    const result = normalizeCoverageRows([{ name: 'X', count: Number.NaN, value: undefined }]);
    expect(result[0]?.count).toBe(0);
  });

  it('returns empty array for empty input', () => {
    expect(normalizeCoverageRows([])).toEqual([]);
  });
});
