// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Recording request service — now uses real backend API endpoints.
// [VI] Thực thi một bước trong luồng xử lý.
 *
// [VI] Thực thi một bước trong luồng xử lý.
 * Endpoints used:
// [VI] Thực thi một bước trong luồng xử lý.
 *  - /api/Notification          — notifications CRUD
// [VI] Thực thi một bước trong luồng xử lý.
 *  - /api/Review                — review/moderation workflows
// [VI] Thực thi một bước trong luồng xử lý.
 *  - /api/Submission            — submissions management
// [VI] Thực thi một bước trong luồng xử lý.
 *  - /api/Admin/submissions     — admin submission management
// [VI] Thực thi một bước trong luồng xử lý.
 */

// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from '@/services/api';
// [VI] Nhập (import) các phụ thuộc cho file.
import { logServiceError, logServiceWarn } from '@/services/serviceLogger';
// [VI] Nhập (import) các phụ thuộc cho file.
import type {
// [VI] Thực thi một bước trong luồng xử lý.
  DeleteRecordingRequest,
// [VI] Thực thi một bước trong luồng xử lý.
  EditRecordingRequest,
// [VI] Thực thi một bước trong luồng xử lý.
  EditSubmissionForReview,
// [VI] Thực thi một bước trong luồng xử lý.
  AppNotification,
// [VI] Thực thi một bước trong luồng xử lý.
} from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { UserRole } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { extractArray } from '@/utils/apiHelpers';

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Map backend NotificationDto → frontend AppNotification.
// [VI] Thực thi một bước trong luồng xử lý.
 * BE fields: message, isRead, relatedId
// [VI] Thực thi một bước trong luồng xử lý.
 * FE fields: body, read, recordingId
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Khai báo hàm/biểu thức hàm.
function mapNotificationDto(raw: Record<string, unknown>): AppNotification {
// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    id: String(raw.id ?? ''),
// [VI] Thực thi một bước trong luồng xử lý.
    type: (raw.type ?? 'recording_edited') as AppNotification['type'],
// [VI] Thực thi một bước trong luồng xử lý.
    title: String(raw.title ?? ''),
// [VI] Thực thi một bước trong luồng xử lý.
    body: String(raw.message ?? raw.body ?? ''),
// [VI] Thực thi một bước trong luồng xử lý.
    forRoles: Array.isArray(raw.forRoles) ? (raw.forRoles as UserRole[]) : [],
// [VI] Thực thi một bước trong luồng xử lý.
    recordingId: String(raw.relatedId ?? raw.recordingId ?? '') || undefined,
// [VI] Thực thi một bước trong luồng xử lý.
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
// [VI] Thực thi một bước trong luồng xử lý.
    read:
// [VI] Thực thi một bước trong luồng xử lý.
      typeof raw.isRead === 'boolean'
// [VI] Thực thi một bước trong luồng xử lý.
        ? raw.isRead
// [VI] Thực thi một bước trong luồng xử lý.
        : typeof raw.read === 'boolean'
// [VI] Thực thi một bước trong luồng xử lý.
          ? raw.read
// [VI] Thực thi một bước trong luồng xử lý.
          : false,
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** Loose shape returned by `/Review/*` list/detail endpoints */
// [VI] Khai báo kiểu (type) để mô tả dữ liệu.
type ReviewDecisionRow = {
// [VI] Thực thi một bước trong luồng xử lý.
  id?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  submissionId?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingId?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  decision?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  stage?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingTitle?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  comments?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  status?: string;
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Khai báo hàm/biểu thức hàm.
function asReviewRowRecord(res: unknown): Record<string, unknown> | null {
// [VI] Rẽ nhánh điều kiện (if).
  if (!res || typeof res !== 'object') return null;
// [VI] Khai báo biến/hằng số.
  const top = res as Record<string, unknown>;
// [VI] Khai báo biến/hằng số.
  const inner = top.data;
// [VI] Rẽ nhánh điều kiện (if).
  if (inner && typeof inner === 'object' && !Array.isArray(inner))
// [VI] Trả về kết quả từ hàm.
    return inner as Record<string, unknown>;
// [VI] Trả về kết quả từ hàm.
  return top;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const recordingRequestService = {
// [VI] Thực thi một bước trong luồng xử lý.
  // --- Delete recording requests ---

// [VI] Thực thi một bước trong luồng xử lý.
  /** Contributor: send delete recording request */
// [VI] Thực thi một bước trong luồng xử lý.
  async requestDeleteRecording(
// [VI] Thực thi một bước trong luồng xử lý.
    recordingId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    recordingTitle: string,
// [VI] Thực thi một bước trong luồng xử lý.
    contributorId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    contributorName: string,
// [VI] Thực thi một bước trong luồng xử lý.
  ): Promise<void> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Thực thi một bước trong luồng xử lý.
      await api.post('/Review', {
// [VI] Thực thi một bước trong luồng xử lý.
        submissionId: recordingId,
// [VI] Thực thi một bước trong luồng xử lý.
        reviewerId: contributorId,
// [VI] Thực thi một bước trong luồng xử lý.
        decision: 'delete_request',
// [VI] Thực thi một bước trong luồng xử lý.
        stage: 'pending_admin',
// [VI] Thực thi một bước trong luồng xử lý.
        comments: `Yêu cầu xóa bản thu "${recordingTitle}" bởi ${contributorName}`,
// [VI] Thực thi một bước trong luồng xử lý.
      });
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Failed to request delete recording', err);
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
      throw err;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Admin: get pending delete requests */
// [VI] Thực thi một bước trong luồng xử lý.
  async getDeleteRecordingRequests(): Promise<DeleteRecordingRequest[]> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const res = await api.get('/Review/decision/delete_request');
// [VI] Trả về kết quả từ hàm.
      return extractArray<DeleteRecordingRequest>(res);
// [VI] Thực thi một bước trong luồng xử lý.
    } catch {
// [VI] Trả về kết quả từ hàm.
      return [];
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Admin: forward delete to expert */
// [VI] Thực thi một bước trong luồng xử lý.
  async forwardDeleteToExpert(requestId: string, expertId: string): Promise<void> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Thực thi một bước trong luồng xử lý.
      await api.put(`/Review/${requestId}`, {
// [VI] Thực thi một bước trong luồng xử lý.
        decision: 'forwarded_to_expert',
// [VI] Thực thi một bước trong luồng xử lý.
        reviewerId: expertId,
// [VI] Thực thi một bước trong luồng xử lý.
      });
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Failed to forward delete to expert', err);
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Expert: get forwarded delete requests */
// [VI] Thực thi một bước trong luồng xử lý.
  async getForwardedDeleteRequestsForExpert(expertId: string): Promise<DeleteRecordingRequest[]> {
// [VI] Rẽ nhánh điều kiện (if).
    if (!expertId) return [];
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const res = await api.get(`/Review/reviewer/${expertId}`);
// [VI] Khai báo biến/hằng số.
      const all = extractArray<DeleteRecordingRequest & { decision?: string }>(res);
// [VI] Trả về kết quả từ hàm.
      return all.filter(
// [VI] Khai báo hàm/biểu thức hàm.
        (r) => r.decision === 'forwarded_to_expert' || r.status === 'forwarded_to_expert',
// [VI] Thực thi một bước trong luồng xử lý.
      );
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err: unknown) {
// [VI] Thực thi một bước trong luồng xử lý.
      // 400/404 = no data yet from backend; not a real error
// [VI] Khai báo biến/hằng số.
      const status = (err as { response?: { status?: number } })?.response?.status;
// [VI] Rẽ nhánh điều kiện (if).
      if (status === 400 || status === 404) return [];
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceWarn(
// [VI] Thực thi một bước trong luồng xử lý.
        '[recordingRequestService] getForwardedDeleteRequestsForExpert failed',
// [VI] Thực thi một bước trong luồng xử lý.
        status,
// [VI] Thực thi một bước trong luồng xử lý.
      );
// [VI] Trả về kết quả từ hàm.
      return [];
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Expert: complete delete recording */
// [VI] Thực thi một bước trong luồng xử lý.
  async completeDeleteRecording(
// [VI] Thực thi một bước trong luồng xử lý.
    requestId: string,
// [VI] Khai báo hàm/biểu thức hàm.
    removeRecordingFromStorage: (id: string) => Promise<void>,
// [VI] Thực thi một bước trong luồng xử lý.
  ): Promise<{ recordingId: string; recordingTitle: string } | null> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Thực thi một bước trong luồng xử lý.
      // Get the request details first
// [VI] Khai báo biến/hằng số.
      const res = await api.get<unknown>(`/Review/${requestId}`);
// [VI] Khai báo biến/hằng số.
      const req = asReviewRowRecord(res);
// [VI] Rẽ nhánh điều kiện (if).
      if (!req) return null;

// [VI] Khai báo biến/hằng số.
      const recordingId = String(req.submissionId ?? req.recordingId ?? '');
// [VI] Rẽ nhánh điều kiện (if).
      if (!recordingId) return null;
// [VI] Khai báo biến/hằng số.
      const recordingTitle = String(req.recordingTitle ?? req.comments ?? 'Bản thu');

// [VI] Thực thi một bước trong luồng xử lý.
      await removeRecordingFromStorage(recordingId);

// [VI] Thực thi một bước trong luồng xử lý.
      // Mark as completed
// [VI] Thực thi một bước trong luồng xử lý.
      await api.put(`/Review/${requestId}`, { decision: 'completed' });

// [VI] Trả về kết quả từ hàm.
      return { recordingId, recordingTitle };
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Failed to complete delete recording', err);
// [VI] Trả về kết quả từ hàm.
      return null;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Remove a delete request */
// [VI] Thực thi một bước trong luồng xử lý.
  async removeDeleteRequest(requestId: string): Promise<void> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Thực thi một bước trong luồng xử lý.
      await api.delete(`/Review/${requestId}`);
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Failed to remove delete request', err);
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Get pending delete recording IDs for contributor */
// [VI] Thực thi một bước trong luồng xử lý.
  async getPendingDeleteRecordingIdsForContributor(contributorId: string): Promise<string[]> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const res = await api.get(`/Review/reviewer/${contributorId}`);
// [VI] Khai báo biến/hằng số.
      const all = extractArray<ReviewDecisionRow>(res);
// [VI] Trả về kết quả từ hàm.
      return all
// [VI] Khai báo hàm/biểu thức hàm.
        .filter((r) => r.decision === 'delete_request')
// [VI] Khai báo hàm/biểu thức hàm.
        .map((r) => r.submissionId || r.recordingId)
// [VI] Khai báo hàm/biểu thức hàm.
        .filter((id): id is string => !!id);
// [VI] Thực thi một bước trong luồng xử lý.
    } catch {
// [VI] Trả về kết quả từ hàm.
      return [];
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Get delete-approved recording IDs for contributor */
// [VI] Thực thi một bước trong luồng xử lý.
  async getDeleteApprovedRecordingIdsForContributor(contributorId: string): Promise<string[]> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const res = await api.get(`/Review/reviewer/${contributorId}`);
// [VI] Khai báo biến/hằng số.
      const all = extractArray<ReviewDecisionRow>(res);
// [VI] Trả về kết quả từ hàm.
      return all
// [VI] Khai báo hàm/biểu thức hàm.
        .filter((r) => r.decision === 'delete_approved')
// [VI] Khai báo hàm/biểu thức hàm.
        .map((r) => r.submissionId || r.recordingId)
// [VI] Khai báo hàm/biểu thức hàm.
        .filter((id): id is string => !!id);
// [VI] Thực thi một bước trong luồng xử lý.
    } catch {
// [VI] Trả về kết quả từ hàm.
      return [];
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Admin: approve delete for contributor */
// [VI] Thực thi một bước trong luồng xử lý.
  async approveDeleteForContributor(recordingId: string, contributorId: string): Promise<void> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Thực thi một bước trong luồng xử lý.
      await api.post('/Review', {
// [VI] Thực thi một bước trong luồng xử lý.
        submissionId: recordingId,
// [VI] Thực thi một bước trong luồng xử lý.
        reviewerId: contributorId,
// [VI] Thực thi một bước trong luồng xử lý.
        decision: 'delete_approved',
// [VI] Thực thi một bước trong luồng xử lý.
        stage: 'approved',
// [VI] Thực thi một bước trong luồng xử lý.
      });
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Failed to approve delete for contributor', err);
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Revoke delete approval */
// [VI] Thực thi một bước trong luồng xử lý.
  async revokeDeleteApproval(recordingId: string, contributorId: string): Promise<void> {
// [VI] Thực thi một bước trong luồng xử lý.
    void contributorId;
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Thực thi một bước trong luồng xử lý.
      // Find and remove the approval review
// [VI] Khai báo biến/hằng số.
      const res = await api.get(`/Review/decision/delete_approved`);
// [VI] Khai báo biến/hằng số.
      const all = extractArray<ReviewDecisionRow>(res);
// [VI] Khai báo biến/hằng số.
      const match = all.find((r) => (r.submissionId || r.recordingId) === recordingId);
// [VI] Rẽ nhánh điều kiện (if).
      if (match) {
// [VI] Thực thi một bước trong luồng xử lý.
        await api.delete(`/Review/${match.id}`);
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Failed to revoke delete approval', err);
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // --- Edit recording requests ---

// [VI] Thực thi một bước trong luồng xử lý.
  /** Contributor: request to edit an approved recording */
// [VI] Thực thi một bước trong luồng xử lý.
  async requestEditRecording(
// [VI] Thực thi một bước trong luồng xử lý.
    recordingId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    recordingTitle: string,
// [VI] Thực thi một bước trong luồng xử lý.
    contributorId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    contributorName: string,
// [VI] Thực thi một bước trong luồng xử lý.
  ): Promise<void> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Thực thi một bước trong luồng xử lý.
      await api.post('/Review', {
// [VI] Thực thi một bước trong luồng xử lý.
        submissionId: recordingId,
// [VI] Thực thi một bước trong luồng xử lý.
        reviewerId: contributorId,
// [VI] Thực thi một bước trong luồng xử lý.
        decision: 'edit_request',
// [VI] Thực thi một bước trong luồng xử lý.
        stage: 'pending',
// [VI] Thực thi một bước trong luồng xử lý.
        comments: `Yêu cầu chỉnh sửa bản thu "${recordingTitle}" bởi ${contributorName}`,
// [VI] Thực thi một bước trong luồng xử lý.
      });
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Failed to request edit recording', err);
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
      throw err;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Admin: get edit recording requests */
// [VI] Thực thi một bước trong luồng xử lý.
  async getEditRecordingRequests(): Promise<EditRecordingRequest[]> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const res = await api.get('/Review/decision/edit_request');
// [VI] Trả về kết quả từ hàm.
      return extractArray<EditRecordingRequest>(res);
// [VI] Thực thi một bước trong luồng xử lý.
    } catch {
// [VI] Trả về kết quả từ hàm.
      return [];
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Admin: approve edit request */
// [VI] Thực thi một bước trong luồng xử lý.
  async approveEditRequest(requestId: string): Promise<void> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Thực thi một bước trong luồng xử lý.
      await api.put(`/Review/${requestId}`, {
// [VI] Thực thi một bước trong luồng xử lý.
        decision: 'edit_approved',
// [VI] Thực thi một bước trong luồng xử lý.
        stage: 'approved',
// [VI] Thực thi một bước trong luồng xử lý.
      });
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Failed to approve edit request', err);
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Check if edit is approved for a recording */
// [VI] Thực thi một bước trong luồng xử lý.
  async isEditApprovedForRecording(recordingId: string): Promise<boolean> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const res = await api.get('/Review/decision/edit_approved');
// [VI] Khai báo biến/hằng số.
      const all = extractArray<ReviewDecisionRow>(res);
// [VI] Khai báo hàm/biểu thức hàm.
      return all.some((r) => (r.submissionId || r.recordingId) === recordingId);
// [VI] Thực thi một bước trong luồng xử lý.
    } catch {
// [VI] Trả về kết quả từ hàm.
      return false;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Get pending edit recording IDs for contributor */
// [VI] Thực thi một bước trong luồng xử lý.
  async getPendingEditRecordingIdsForContributor(contributorId: string): Promise<string[]> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const res = await api.get(`/Review/reviewer/${contributorId}`);
// [VI] Khai báo biến/hằng số.
      const all = extractArray<ReviewDecisionRow>(res);
// [VI] Trả về kết quả từ hàm.
      return all
// [VI] Khai báo hàm/biểu thức hàm.
        .filter((r) => r.decision === 'edit_request' && r.stage === 'pending')
// [VI] Khai báo hàm/biểu thức hàm.
        .map((r) => r.submissionId || r.recordingId)
// [VI] Khai báo hàm/biểu thức hàm.
        .filter((id): id is string => !!id);
// [VI] Thực thi một bước trong luồng xử lý.
    } catch {
// [VI] Trả về kết quả từ hàm.
      return [];
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Revoke approved edit */
// [VI] Thực thi một bước trong luồng xử lý.
  async revokeApprovedEdit(recordingId: string): Promise<void> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const res = await api.get('/Review/decision/edit_approved');
// [VI] Khai báo biến/hằng số.
      const all = extractArray<ReviewDecisionRow>(res);
// [VI] Khai báo biến/hằng số.
      const match = all.find((r) => (r.submissionId || r.recordingId) === recordingId);
// [VI] Rẽ nhánh điều kiện (if).
      if (match) {
// [VI] Thực thi một bước trong luồng xử lý.
        await api.delete(`/Review/${match.id}`);
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Failed to revoke approved edit', err);
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // --- Edit submissions for expert review ---

// [VI] Thực thi một bước trong luồng xử lý.
  /** Contributor: submit edit for expert review */
// [VI] Thực thi một bước trong luồng xử lý.
  async submitEditForExpertReview(
// [VI] Thực thi một bước trong luồng xử lý.
    recordingId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    recordingTitle: string,
// [VI] Thực thi một bước trong luồng xử lý.
    contributorId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    contributorName: string,
// [VI] Thực thi một bước trong luồng xử lý.
  ): Promise<void> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Thực thi một bước trong luồng xử lý.
      await api.post('/Review', {
// [VI] Thực thi một bước trong luồng xử lý.
        submissionId: recordingId,
// [VI] Thực thi một bước trong luồng xử lý.
        reviewerId: contributorId,
// [VI] Thực thi một bước trong luồng xử lý.
        decision: 'edit_submission',
// [VI] Thực thi một bước trong luồng xử lý.
        stage: 'pending_expert',
// [VI] Thực thi một bước trong luồng xử lý.
        comments: `Chỉnh sửa bản thu "${recordingTitle}" bởi ${contributorName} chờ chuyên gia duyệt`,
// [VI] Thực thi một bước trong luồng xử lý.
      });
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Failed to submit edit for expert review', err);
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Expert: get pending edit submissions */
// [VI] Thực thi một bước trong luồng xử lý.
  async getPendingEditSubmissionsForExpert(): Promise<EditSubmissionForReview[]> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const res = await api.get('/Review/decision/edit_submission');
// [VI] Trả về kết quả từ hàm.
      return extractArray<EditSubmissionForReview>(res);
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err: unknown) {
// [VI] Thực thi một bước trong luồng xử lý.
      // 400/404 = no data yet from backend; not a real error
// [VI] Khai báo biến/hằng số.
      const status = (err as { response?: { status?: number } })?.response?.status;
// [VI] Rẽ nhánh điều kiện (if).
      if (status === 400 || status === 404) return [];
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceWarn('[recordingRequestService] getPendingEditSubmissionsForExpert failed', status);
// [VI] Trả về kết quả từ hàm.
      return [];
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Expert: approve edit submission */
// [VI] Thực thi một bước trong luồng xử lý.
  async approveEditSubmission(
// [VI] Thực thi một bước trong luồng xử lý.
    submissionId: string,
// [VI] Thực thi một bước trong luồng xử lý.
  ): Promise<{ recordingId: string; recordingTitle: string } | null> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const res = await api.get<unknown>(`/Review/${submissionId}`);
// [VI] Khai báo biến/hằng số.
      const req = asReviewRowRecord(res);
// [VI] Rẽ nhánh điều kiện (if).
      if (!req) return null;

// [VI] Thực thi một bước trong luồng xử lý.
      await api.put(`/Review/${submissionId}`, {
// [VI] Thực thi một bước trong luồng xử lý.
        decision: 'edit_submission_approved',
// [VI] Thực thi một bước trong luồng xử lý.
        stage: 'completed',
// [VI] Thực thi một bước trong luồng xử lý.
      });

// [VI] Trả về kết quả từ hàm.
      return {
// [VI] Thực thi một bước trong luồng xử lý.
        recordingId: String(req.submissionId ?? req.recordingId ?? ''),
// [VI] Thực thi một bước trong luồng xử lý.
        recordingTitle: String(req.recordingTitle ?? ''),
// [VI] Thực thi một bước trong luồng xử lý.
      };
// [VI] Thực thi một bước trong luồng xử lý.
    } catch {
// [VI] Trả về kết quả từ hàm.
      return null;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Get pending edit submission recording IDs for contributor */
// [VI] Thực thi một bước trong luồng xử lý.
  async getPendingEditSubmissionRecordingIdsForContributor(
// [VI] Thực thi một bước trong luồng xử lý.
    contributorId: string,
// [VI] Thực thi một bước trong luồng xử lý.
  ): Promise<string[]> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const res = await api.get(`/Review/reviewer/${contributorId}`);
// [VI] Khai báo biến/hằng số.
      const all = extractArray<ReviewDecisionRow>(res);
// [VI] Trả về kết quả từ hàm.
      return all
// [VI] Khai báo hàm/biểu thức hàm.
        .filter((r) => r.decision === 'edit_submission')
// [VI] Khai báo hàm/biểu thức hàm.
        .map((r) => r.submissionId || r.recordingId)
// [VI] Khai báo hàm/biểu thức hàm.
        .filter((id): id is string => !!id);
// [VI] Thực thi một bước trong luồng xử lý.
    } catch {
// [VI] Trả về kết quả từ hàm.
      return [];
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // --- Notifications (uses /api/Notification endpoints) ---

// [VI] Thực thi một bước trong luồng xử lý.
  async addNotification(n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<void> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Thực thi một bước trong luồng xử lý.
      await api.post('/Notification', {
// [VI] Thực thi một bước trong luồng xử lý.
        type: n.type,
// [VI] Thực thi một bước trong luồng xử lý.
        title: n.title,
// [VI] Thực thi một bước trong luồng xử lý.
        message: n.body,
// [VI] Thực thi một bước trong luồng xử lý.
        relatedId: n.recordingId,
// [VI] Thực thi một bước trong luồng xử lý.
      });
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Failed to add notification', err);
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Get notifications for current user (JWT-based, backend filters by user) */
// [VI] Thực thi một bước trong luồng xử lý.
  async getNotificationsForRole(role: UserRole): Promise<AppNotification[]> {
// [VI] Thực thi một bước trong luồng xử lý.
    void role;
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const res = await api.get('/Notification');
// [VI] Khai báo biến/hằng số.
      const rawItems = extractArray<Record<string, unknown>>(res);
// [VI] Trả về kết quả từ hàm.
      return rawItems.map(mapNotificationDto);
// [VI] Thực thi một bước trong luồng xử lý.
    } catch {
// [VI] Trả về kết quả từ hàm.
      return [];
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  async markNotificationRead(id: string): Promise<void> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Thực thi một bước trong luồng xử lý.
      await api.put(`/Notification/${id}/read`, {});
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Failed to mark notification read', err);
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Mark all notifications as read for current role */
// [VI] Thực thi một bước trong luồng xử lý.
  async markAllNotificationsReadForRole(role: UserRole): Promise<void> {
// [VI] Thực thi một bước trong luồng xử lý.
    void role;
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Thực thi một bước trong luồng xử lý.
      await api.put('/Notification/read-all', {});
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Failed to mark all notifications read', err);
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
};
