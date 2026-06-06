import { describe, expect, it } from 'vitest';

import {
  ReviewDecision,
  reviewDecisionFromSubmissionStatus,
  reviewDecisionLabelVi,
} from '@/types/reviewDecision';

describe('reviewDecisionFromSubmissionStatus', () => {
  it('maps rejected submission status to Reject', () => {
    expect(reviewDecisionFromSubmissionStatus(3)).toBe(ReviewDecision.Reject);
  });

  it('maps request-update submission status to RequestUpdate', () => {
    expect(reviewDecisionFromSubmissionStatus(4)).toBe(ReviewDecision.RequestUpdate);
  });

  it('returns undefined for other statuses', () => {
    expect(reviewDecisionFromSubmissionStatus(0)).toBeUndefined();
    expect(reviewDecisionFromSubmissionStatus(2)).toBeUndefined();
    expect(reviewDecisionFromSubmissionStatus(99)).toBeUndefined();
  });
});

describe('reviewDecisionLabelVi', () => {
  it('returns Vietnamese labels for review decisions', () => {
    expect(reviewDecisionLabelVi(ReviewDecision.RequestUpdate)).toBe('Yêu cầu cập nhật');
    expect(reviewDecisionLabelVi(ReviewDecision.Reject)).toBe('Từ chối');
  });
});
