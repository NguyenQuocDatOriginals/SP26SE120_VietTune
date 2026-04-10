// [VI] Nhập (import) các phụ thuộc cho file.
import type { UserRole } from '@/types/user';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface ExpertAccountDeletionRequest {
// [VI] Thực thi một bước trong luồng xử lý.
  expertId: string;
// [VI] Thực thi một bước trong luồng xử lý.
  expertUsername: string;
// [VI] Thực thi một bước trong luồng xử lý.
  expertFullName?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  requestedAt: string;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface DeleteRecordingRequest {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingId: string;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingTitle: string;
// [VI] Thực thi một bước trong luồng xử lý.
  contributorId: string;
// [VI] Thực thi một bước trong luồng xử lý.
  contributorName: string;
// [VI] Thực thi một bước trong luồng xử lý.
  requestedAt: string;
// [VI] Thực thi một bước trong luồng xử lý.
  status: 'pending_admin' | 'forwarded_to_expert';
// [VI] Thực thi một bước trong luồng xử lý.
  forwardedToExpertId?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  forwardedAt?: string;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface EditRecordingRequest {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingId: string;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingTitle: string;
// [VI] Thực thi một bước trong luồng xử lý.
  contributorId: string;
// [VI] Thực thi một bước trong luồng xử lý.
  contributorName: string;
// [VI] Thực thi một bước trong luồng xử lý.
  requestedAt: string;
// [VI] Thực thi một bước trong luồng xử lý.
  status: 'pending' | 'approved';
// [VI] Thực thi một bước trong luồng xử lý.
  approvedAt?: string;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface EditSubmissionForReview {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingId: string;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingTitle: string;
// [VI] Thực thi một bước trong luồng xử lý.
  contributorId: string;
// [VI] Thực thi một bước trong luồng xử lý.
  contributorName: string;
// [VI] Thực thi một bước trong luồng xử lý.
  submittedAt: string;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface AppNotification {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  type:
// [VI] Thực thi một bước trong luồng xử lý.
    | 'recording_deleted'
// [VI] Thực thi một bước trong luồng xử lý.
    | 'recording_edited'
// [VI] Thực thi một bước trong luồng xử lý.
    | 'expert_account_deletion_approved'
// [VI] Thực thi một bước trong luồng xử lý.
    | 'delete_request_rejected'
// [VI] Thực thi một bước trong luồng xử lý.
    | 'edit_submission_approved';
// [VI] Thực thi một bước trong luồng xử lý.
  title: string;
// [VI] Thực thi một bước trong luồng xử lý.
  body: string;
// [VI] Thực thi một bước trong luồng xử lý.
  forRoles: UserRole[];
// [VI] Thực thi một bước trong luồng xử lý.
  recordingId?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  createdAt: string;
// [VI] Thực thi một bước trong luồng xử lý.
  read?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
}
