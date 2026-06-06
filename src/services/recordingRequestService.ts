/**
 * Recording request service — aligned to swagger.json contract.
 *
 * Endpoints used:
 *  - /api/Notification          — notifications CRUD
 *  - /api/Review/create|update|get-by-id|get-by-submissionid — legacy review mutations only
 *  - /api/Submission/*          — edit/delete workflow (edit-request, confirm-edit, DELETE)
 *  - /api/Admin/submissions     — list + assign reviewer
 */

import { apiFetch, apiFetchLoose, apiOk, asApiEnvelope, openApiQueryRecord } from '@/api';
import { PAGE_SIZE_DEFAULT } from '@/config/pagination';
import {
  deriveDeleteRecordingRequests,
  deriveEditRecordingRequests,
  parseAdminSubmissionRows,
} from '@/features/admin/adminSubmissionRequests';
import { adminApi } from '@/services/adminApi';
import { logServiceError, logServiceWarn } from '@/services/serviceLogger';
import { submissionService } from '@/services/submissionService';
import type {
  DeleteRecordingRequest,
  EditRecordingRequest,
  EditSubmissionForReview,
  AppNotification,
} from '@/types';
import { UserRole } from '@/types';
import { extractArray } from '@/utils/apiHelpers';
import { normalizeBENotificationType } from '@/utils/notificationTypeMap';

/**
 * Map backend NotificationDto / SignalR payload → frontend AppNotification.
 */
export function mapNotificationFromApiRecord(raw: Record<string, unknown>): AppNotification {
  const rawType = String(raw.type ?? '');
  const normalizedType = normalizeBENotificationType(rawType) || rawType || 'recording_edited';
  return {
    id: String(raw.id ?? ''),
    type: normalizedType as AppNotification['type'],
    title: String(raw.title ?? ''),
    body: String(raw.message ?? raw.body ?? ''),
    forRoles: Array.isArray(raw.forRoles) ? (raw.forRoles as UserRole[]) : [],
    recordingId:
      String(raw.relatedId ?? raw.recordingId ?? raw.relatedEntityId ?? '') || undefined,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    read:
      typeof raw.isRead === 'boolean'
        ? raw.isRead
        : typeof raw.read === 'boolean'
          ? raw.read
          : false,
  };
}

/** Swagger-documented Review routes only (no list/collection endpoints). */
const REVIEW_ENDPOINTS = {
  getById: '/api/Review/get-by-id/{id}',
  getBySubmissionId: '/api/Review/get-by-submissionid/{submissionId}',
  create: '/api/Review/create',
  update: '/api/Review/update',
} as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asReviewRowRecord(res: unknown): Record<string, unknown> | null {
  if (!res || typeof res !== 'object') return null;
  const top = res as Record<string, unknown>;
  const inner = top.data;
  if (inner && typeof inner === 'object' && !Array.isArray(inner))
    return inner as Record<string, unknown>;
  return top;
}

async function reviewCreate(body: Record<string, unknown>): Promise<void> {
  await apiOk(asApiEnvelope<unknown>(apiFetchLoose.POST(REVIEW_ENDPOINTS.create, { body })));
}

async function reviewGetById(id: string): Promise<unknown> {
  return apiOk(
    asApiEnvelope<unknown>(
      apiFetchLoose.GET(REVIEW_ENDPOINTS.getById, { params: { path: { id } } }),
    ),
  );
}

async function reviewUpdate(body: Record<string, unknown>): Promise<void> {
  const top = asRecord(body) ?? {};
  const reviewId = String(top.id ?? '').trim();
  await apiOk(
    asApiEnvelope<unknown>(
      apiFetchLoose.PUT(REVIEW_ENDPOINTS.update, {
        body: {
          id: reviewId,
          comments: top.comments ?? null,
        },
      }),
    ),
  );
}

/** Derive admin request lists from already-fetched submission rows (no extra HTTP). */
export function deriveRecordingRequestsFromSubmissions(
  submissionRows: Record<string, unknown>[],
  userNameById?: Map<string, string>,
): { deleteRequests: DeleteRecordingRequest[]; editRequests: EditRecordingRequest[] } {
  const parsed = parseAdminSubmissionRows(submissionRows);
  return {
    deleteRequests: deriveDeleteRecordingRequests(parsed),
    editRequests: deriveEditRecordingRequests(parsed, userNameById),
  };
}

export const recordingRequestService = {
  deriveRecordingRequestsFromSubmissions,

  // --- Delete recording requests ---

  /** Contributor: notify admin of delete intent (no swagger delete-request endpoint). */
  async requestDeleteRecording(
    recordingId: string,
    recordingTitle: string,
    contributorId: string,
    contributorName: string,
  ): Promise<void> {
    void contributorId;
    try {
      await this.addNotification({
        type: 'recording_deleted',
        title: 'Yêu cầu xóa bản thu',
        body: `${contributorName} yêu cầu xóa bản thu "${recordingTitle}".`,
        forRoles: [UserRole.ADMIN],
        recordingId,
      });
    } catch (err) {
      logServiceError('Failed to request delete recording', err);
      throw err;
    }
  },

  /** Admin: derive pending delete requests from submission rows (usually empty). */
  getDeleteRecordingRequestsFromRows(
    submissionRows: Record<string, unknown>[],
  ): DeleteRecordingRequest[] {
    return deriveDeleteRecordingRequests(parseAdminSubmissionRows(submissionRows));
  },

  /** @deprecated Prefer getDeleteRecordingRequestsFromRows — no list endpoint in swagger. */
  async getDeleteRecordingRequests(): Promise<DeleteRecordingRequest[]> {
    return [];
  },

  /** Admin: forward delete review to expert via POST /api/Admin/submissions/{id}/assign */
  async forwardDeleteToExpert(requestId: string, expertId: string): Promise<void> {
    try {
      await adminApi.assignSubmissionReviewer(requestId, expertId);
    } catch (err) {
      logServiceError('Failed to forward delete to expert', err);
      throw err;
    }
  },

  /** Expert: no reviewer list endpoint in swagger — returns empty. */
  async getForwardedDeleteRequestsForExpert(expertId: string): Promise<DeleteRecordingRequest[]> {
    void expertId;
    return [];
  },

  /** Expert: delete submission then remove local storage copy. */
  async completeDeleteRecording(
    requestId: string,
    removeRecordingFromStorage: (id: string) => Promise<void>,
  ): Promise<{ recordingId: string; recordingTitle: string } | null> {
    try {
      const res = await reviewGetById(requestId);
      const req = asReviewRowRecord(res);
      const recordingId = String(req?.submissionId ?? req?.recordingId ?? requestId);
      const recordingTitle = String(req?.recordingTitle ?? req?.comments ?? 'Bản thu');

      await submissionService.deleteSubmission(recordingId);
      await removeRecordingFromStorage(recordingId);

      return { recordingId, recordingTitle };
    } catch (err) {
      logServiceError('Failed to complete delete recording', err);
      return null;
    }
  },

  async removeDeleteRequest(requestId: string): Promise<void> {
    void requestId;
    logServiceWarn('[recordingRequestService] removeDeleteRequest: no DELETE /api/Review/{id} in swagger');
  },

  async getPendingDeleteRecordingIdsForContributor(contributorId: string): Promise<string[]> {
    void contributorId;
    return [];
  },

  async getDeleteApprovedRecordingIdsForContributor(contributorId: string): Promise<string[]> {
    void contributorId;
    return [];
  },

  async approveDeleteForContributor(recordingId: string, contributorId: string): Promise<void> {
    try {
      await submissionService.deleteSubmission(recordingId);
      await this.addNotification({
        type: 'recording_deleted',
        title: 'Yêu cầu xóa được duyệt',
        body: 'Yêu cầu xóa bản thu của bạn đã được quản trị viên duyệt.',
        forRoles: [UserRole.CONTRIBUTOR],
        recordingId,
      });
      void contributorId;
    } catch (err) {
      logServiceError('Failed to approve delete for contributor', err);
    }
  },

  async revokeDeleteApproval(recordingId: string, contributorId: string): Promise<void> {
    void recordingId;
    void contributorId;
    logServiceWarn('[recordingRequestService] revokeDeleteApproval: no list endpoint in swagger');
  },

  // --- Edit recording requests ---

  /** Contributor: PUT /api/Submission/edit-request-submission */
  async requestEditRecording(
    recordingId: string,
    recordingTitle: string,
    contributorId: string,
    contributorName: string,
  ): Promise<void> {
    void contributorId;
    void contributorName;
    try {
      await submissionService.requestEditSubmission(recordingId);
    } catch (err) {
      logServiceError(`Failed to request edit recording "${recordingTitle}"`, err);
      throw err;
    }
  },

  /** Admin: derive edit requests from submission rows. */
  getEditRecordingRequestsFromRows(
    submissionRows: Record<string, unknown>[],
    userNameById?: Map<string, string>,
  ): EditRecordingRequest[] {
    return deriveEditRecordingRequests(parseAdminSubmissionRows(submissionRows), userNameById);
  },

  /** @deprecated Prefer getEditRecordingRequestsFromRows — no list endpoint in swagger. */
  async getEditRecordingRequests(): Promise<EditRecordingRequest[]> {
    return [];
  },

  /** Admin: PUT /api/Submission/confirm-edit-submission */
  async approveEditRequest(requestId: string): Promise<void> {
    try {
      await submissionService.confirmEditSubmission(requestId);
    } catch (err) {
      logServiceError('Failed to approve edit request', err);
      throw err;
    }
  },

  async isEditApprovedForRecording(recordingId: string): Promise<boolean> {
    try {
      const rows = await adminApi.getSubmissions({ page: 1, pageSize: 200 });
      const parsed = parseAdminSubmissionRows(rows);
      const row = parsed.find((r) => r.id === recordingId);
      if (!row) return false;
      const s = row.status.trim().toLowerCase().replace(/[\s_-]+/g, '');
      return s === 'pending' || s === '1';
    } catch {
      return false;
    }
  },

  async getPendingEditRecordingIdsForContributor(contributorId: string): Promise<string[]> {
    void contributorId;
    return [];
  },

  async revokeApprovedEdit(recordingId: string): Promise<void> {
    void recordingId;
    logServiceWarn('[recordingRequestService] revokeApprovedEdit: no list endpoint in swagger');
  },

  // --- Edit submissions for expert review ---

  async submitEditForExpertReview(
    recordingId: string,
    recordingTitle: string,
    contributorId: string,
    contributorName: string,
  ): Promise<void> {
    try {
      await reviewCreate({
        submissionId: recordingId,
        reviewerId: contributorId,
        decision: 1,
        comments: `Chỉnh sửa bản thu "${recordingTitle}" bởi ${contributorName} chờ chuyên gia duyệt`,
      });
    } catch (err) {
      logServiceError('Failed to submit edit for expert review', err);
    }
  },

  async getPendingEditSubmissionsForExpert(): Promise<EditSubmissionForReview[]> {
    return [];
  },

  async approveEditSubmission(
    submissionId: string,
  ): Promise<{ recordingId: string; recordingTitle: string } | null> {
    try {
      const res = await reviewGetById(submissionId);
      const req = asReviewRowRecord(res);
      if (!req) return null;

      await reviewUpdate({
        id: submissionId,
        comments: String(req.comments ?? ''),
      });

      return {
        recordingId: String(req.submissionId ?? req.recordingId ?? submissionId),
        recordingTitle: String(req.recordingTitle ?? ''),
      };
    } catch {
      return null;
    }
  },

  async getPendingEditSubmissionRecordingIdsForContributor(contributorId: string): Promise<string[]> {
    void contributorId;
    return [];
  },

  // --- Notifications (uses /api/Notification endpoints) ---

  async addNotification(n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    try {
      await apiOk(
        asApiEnvelope<unknown>(
          apiFetchLoose.POST('/api/Notification', {
            body: {
              type: n.type,
              title: n.title,
              message: n.body,
              relatedId: n.recordingId,
            },
          }),
        ),
      );
    } catch (err) {
      logServiceError('Failed to add notification', err);
    }
  },

  async getNotifications(params?: {
    page?: number;
    pageSize?: number;
    unreadOnly?: boolean;
  }): Promise<{ items: AppNotification[]; page: number; pageSize: number; total: number }> {
    try {
      const body = (await apiOk(
        asApiEnvelope<unknown>(
          apiFetch.GET('/api/Notification', {
            params: { query: params ? openApiQueryRecord(params) : {} },
          }),
        ),
      )) as Record<string, unknown>;
      const rawItems = Array.isArray(body?.items) ? (body.items as Array<Record<string, unknown>>) : [];
      const page = typeof body?.page === 'number' ? (body.page as number) : Number(params?.page ?? 1);
      const pageSize =
        typeof body?.pageSize === 'number' ? (body.pageSize as number) : Number(params?.pageSize ?? PAGE_SIZE_DEFAULT);
      const total = typeof body?.total === 'number' ? (body.total as number) : rawItems.length;
      return {
        items: rawItems.map(mapNotificationFromApiRecord),
        page,
        pageSize,
        total,
      };
    } catch {
      return { items: [], page: Number(params?.page ?? 1), pageSize: Number(params?.pageSize ?? PAGE_SIZE_DEFAULT), total: 0 };
    }
  },

  async getUnreadCount(): Promise<{ unread: number; total: number }> {
    try {
      const body = (await apiOk(
        asApiEnvelope<unknown>(apiFetch.GET('/api/Notification/unread-count')),
      )) as Record<string, unknown>;
      return {
        unread: typeof body.unread === 'number' ? body.unread : 0,
        total: typeof body.total === 'number' ? body.total : 0,
      };
    } catch {
      return { unread: 0, total: 0 };
    }
  },

  async deleteNotification(id: string): Promise<void> {
    await apiOk(
      asApiEnvelope<unknown>(
        apiFetch.DELETE('/api/Notification/{id}', { params: { path: { id } } }),
      ),
    );
  },

  async getNotificationsForRole(role: UserRole): Promise<AppNotification[]> {
    void role;
    try {
      const res = await apiOk(asApiEnvelope<unknown>(apiFetch.GET('/api/Notification')));
      const rawItems = extractArray<Record<string, unknown>>(res);
      return rawItems.map(mapNotificationFromApiRecord);
    } catch {
      return [];
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      await apiOk(
        asApiEnvelope<unknown>(
          apiFetch.PUT('/api/Notification/{id}/read', { params: { path: { id } } }),
        ),
      );
    } catch (err) {
      logServiceError('Failed to mark notification read', err);
    }
  },

  async markAllNotificationsReadForRole(role: UserRole): Promise<void> {
    void role;
    try {
      await apiOk(asApiEnvelope<unknown>(apiFetch.PUT('/api/Notification/read-all')));
    } catch (err) {
      logServiceError('Failed to mark all notifications read', err);
    }
  },
};
