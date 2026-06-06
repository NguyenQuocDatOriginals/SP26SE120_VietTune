import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ContributorReviewFeedbackBanner from '@/components/features/upload/ContributorReviewFeedbackBanner';
import * as reviewService from '@/services/reviewService';

vi.mock('@/services/reviewService', () => ({
  getReviewBySubmissionId: vi.fn(),
}));

describe('ContributorReviewFeedbackBanner', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
  it('shows expert feedback after loading', async () => {
    vi.mocked(reviewService.getReviewBySubmissionId).mockResolvedValue({
      comments: 'Vui lòng bổ sung nguồn ghi âm.',
      decision: 1,
    });

    render(
      <ContributorReviewFeedbackBanner submissionId="sub-1" submissionStatus={4} />,
    );

    expect(screen.getByRole('status')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Phản hồi từ kiểm duyệt')).toBeTruthy();
    });

    expect(screen.getByText('Quyết định: Yêu cầu cập nhật')).toBeTruthy();
    expect(screen.getByText('Vui lòng bổ sung nguồn ghi âm.')).toBeTruthy();
  });

  it('infers decision label from submissionStatus when review omits decision', async () => {
    vi.mocked(reviewService.getReviewBySubmissionId).mockResolvedValue({
      comments: 'Không đủ thông tin metadata.',
      decision: undefined,
    });

    render(
      <ContributorReviewFeedbackBanner submissionId="sub-2" submissionStatus={3} />,
    );

    await waitFor(() => {
      expect(screen.getByText('Quyết định: Từ chối')).toBeTruthy();
    });
  });

  it('renders nothing when review has no comments', async () => {
    vi.mocked(reviewService.getReviewBySubmissionId).mockResolvedValue(null);

    const { container } = render(
      <ContributorReviewFeedbackBanner submissionId="sub-3" submissionStatus={4} />,
    );

    await waitFor(() => {
      expect(reviewService.getReviewBySubmissionId).toHaveBeenCalled();
    });

    expect(container.innerHTML).toBe('');
  });
});
