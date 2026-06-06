import { Loader2, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  getReviewBySubmissionId,
  type ContributorSubmissionReview,
} from '@/services/reviewService';
import {
  reviewDecisionFromSubmissionStatus,
  reviewDecisionLabelVi,
} from '@/types/reviewDecision';

export interface ContributorReviewFeedbackBannerProps {
  submissionId: string;
  /** Used to show decision label when ReviewDto omits Decision. */
  submissionStatus?: number;
}

export default function ContributorReviewFeedbackBanner({
  submissionId,
  submissionStatus,
}: ContributorReviewFeedbackBannerProps) {
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<ContributorSubmissionReview | null>(null);

  useEffect(() => {
    const id = submissionId.trim();
    if (!id) {
      setReview(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      const result = await getReviewBySubmissionId(id);
      if (cancelled) return;
      setReview(result);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [submissionId]);

  if (loading) {
    return (
      <div
        className="rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-cream-50/50 p-4 shadow-sm"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-700" aria-hidden />
          Đang tải phản hồi từ kiểm duyệt...
        </div>
      </div>
    );
  }

  if (!review?.comments?.trim()) {
    return null;
  }

  const effectiveDecision =
    review.decision ?? reviewDecisionFromSubmissionStatus(submissionStatus ?? -1);

  return (
    <div className="rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-cream-50/50 p-4 shadow-sm">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-950/90">
        <MessageSquare className="h-4 w-4 shrink-0 text-amber-700" strokeWidth={2} aria-hidden />
        Phản hồi từ kiểm duyệt
      </h3>
      <div className="space-y-2">
        {effectiveDecision !== undefined && (
          <p className="text-sm font-semibold text-neutral-900">
            Quyết định: {reviewDecisionLabelVi(effectiveDecision)}
          </p>
        )}
        <p className="whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-neutral-800">
          {review.comments}
        </p>
      </div>
    </div>
  );
}
