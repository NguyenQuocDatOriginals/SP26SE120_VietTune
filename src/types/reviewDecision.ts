export enum ReviewDecision {
  Reject = 0,
  RequestUpdate = 1,
  Approve = 2,
}

/** Map submission status to review decision when API omits Decision on ReviewDto. */
export function reviewDecisionFromSubmissionStatus(status: number): ReviewDecision | undefined {
  if (status === 2) return ReviewDecision.Approve;
  if (status === 3) return ReviewDecision.Reject;
  if (status === 4) return ReviewDecision.RequestUpdate;
  return undefined;
}

export function reviewDecisionLabelVi(decision: ReviewDecision | number): string {
  if (decision === ReviewDecision.Approve) return 'Chấp nhận';
  if (decision === ReviewDecision.RequestUpdate) return 'Yêu cầu cập nhật';
  return 'Từ chối';
}
