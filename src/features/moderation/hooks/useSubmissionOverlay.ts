// [VI] Nhập (import) các phụ thuộc cho file.
import { useCallback } from 'react';

// [VI] Nhập (import) các phụ thuộc cho file.
import { expertWorkflowService } from '@/services/expertWorkflowService';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { LocalRecording } from '@/types';

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Phase 2.3: keep claim/unclaim locking invariant behind overlay service.
// [VI] Thực thi một bước trong luồng xử lý.
 * UI should call these wrappers instead of touching lock state directly.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function useSubmissionOverlay() {
// [VI] Khai báo biến/hằng số.
  const claimSubmission = useCallback(
// [VI] Khai báo hàm/biểu thức hàm.
    (submissionId: string, userId: string, username: string) =>
// [VI] Thực thi một bước trong luồng xử lý.
      expertWorkflowService.claimSubmission(submissionId, userId, username),
// [VI] Thực thi một bước trong luồng xử lý.
    [],
// [VI] Thực thi một bước trong luồng xử lý.
  );

// [VI] Khai báo biến/hằng số.
  const unclaimSubmission = useCallback(
// [VI] Khai báo hàm/biểu thức hàm.
    (submissionId: string) => expertWorkflowService.unclaimSubmission(submissionId),
// [VI] Thực thi một bước trong luồng xử lý.
    [],
// [VI] Thực thi một bước trong luồng xử lý.
  );

// [VI] Khai báo biến/hằng số.
  const applyOverlayToRecording = useCallback(
// [VI] Khai báo hàm/biểu thức hàm.
    (recording: LocalRecording) => expertWorkflowService.applyOverlayToRecording(recording),
// [VI] Thực thi một bước trong luồng xử lý.
    [],
// [VI] Thực thi một bước trong luồng xử lý.
  );

// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    claimSubmission,
// [VI] Thực thi một bước trong luồng xử lý.
    unclaimSubmission,
// [VI] Thực thi một bước trong luồng xử lý.
    applyOverlayToRecording,
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}
