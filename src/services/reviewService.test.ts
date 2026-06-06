import { describe, expect, it } from 'vitest';

import { normalizeContributorReviewPayload } from '@/services/reviewService';

describe('normalizeContributorReviewPayload', () => {
  it('unwraps envelope when data is a non-empty review array (BE get-by-submissionid)', () => {
    const result = normalizeContributorReviewPayload({
      isSuccess: true,
      data: [
        {
          comments: 'Thiếu thông tin nguồn ghi âm.',
          decision: 1,
        },
      ],
    });

    expect(result).toEqual({
      comments: 'Thiếu thông tin nguồn ghi âm.',
      decision: 1,
    });
  });

  it('returns null for empty data array', () => {
    expect(
      normalizeContributorReviewPayload({
        isSuccess: true,
        data: [],
      }),
    ).toBeNull();
  });

  it('supports single-object data envelope (backward compatible)', () => {
    const result = normalizeContributorReviewPayload({
      isSuccess: true,
      data: {
        Comments: 'Cần bổ sung nhạc cụ.',
        Decision: 0,
      },
    });

    expect(result).toEqual({
      comments: 'Cần bổ sung nhạc cụ.',
      decision: 0,
    });
  });

  it('accepts PascalCase fields on the root payload', () => {
    const result = normalizeContributorReviewPayload({
      Comments: '  Ghi chú từ chuyên gia  ',
    });

    expect(result).toEqual({
      comments: 'Ghi chú từ chuyên gia',
      decision: undefined,
    });
  });

  it('returns null when envelope reports failure', () => {
    expect(
      normalizeContributorReviewPayload({
        isSuccess: false,
        data: [{ comments: 'ignored' }],
      }),
    ).toBeNull();
  });

  it('returns null when there is no comments and no decision', () => {
    expect(
      normalizeContributorReviewPayload({
        isSuccess: true,
        data: [{ comments: '   ', decision: undefined }],
      }),
    ).toBeNull();
  });

  it('returns decision-only payload when comments are empty', () => {
    expect(
      normalizeContributorReviewPayload({
        data: { comments: '', decision: 1 },
      }),
    ).toEqual({ comments: null, decision: 1 });
  });
});
