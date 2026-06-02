import { describe, expect, it } from 'vitest';

import { normalizeContributorLeaderboard } from './normalizeContributorLeaderboard';

describe('normalizeContributorLeaderboard', () => {
  it('maps swagger fields and FE aliases', () => {
    const rows = normalizeContributorLeaderboard([
      {
        userId: 'u1',
        username: 'alice',
        fullName: 'Alice Nguyen',
        contributionCount: 4,
        approvedCount: 3,
        rejectedCount: 1,
      },
      { id: 'u2', submissions: 7, approvedCount: 5, rejectedCount: 2 },
    ]);

    expect(rows.find((r) => r.id === 'u1')).toMatchObject({
      name: 'Alice Nguyen',
      username: 'alice',
      contributionCount: 4,
    });
    expect(rows.find((r) => r.id === 'u2')).toMatchObject({
      contributionCount: 7,
    });
    expect(rows[0]!.contributionCount).toBeGreaterThanOrEqual(rows[1]!.contributionCount);
  });
});
