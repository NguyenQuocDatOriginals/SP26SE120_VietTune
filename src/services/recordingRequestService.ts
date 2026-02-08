/**
 * Yêu cầu xóa bản thu (Contributor → Admin → Expert) và yêu cầu chỉnh sửa bản thu (Contributor → Admin).
 * Thông báo sau khi xóa bản thu cho Người đóng góp, Chuyên gia, Quản trị viên.
 */

import { setItem, getItemAsync } from "@/services/storageService";
import type {
  DeleteRecordingRequest,
  EditRecordingRequest,
  EditSubmissionForReview,
  AppNotification,
} from "@/types";
import { UserRole } from "@/types";

const PENDING_DELETE_KEY = "pending_delete_recording_requests";
const PENDING_EDIT_KEY = "pending_edit_recording_requests";
const PENDING_EDIT_REVIEW_KEY = "pending_edit_submissions_for_review";
const APPROVED_EDIT_KEY = "approved_edit_recording_requests";
const APPROVED_DELETE_KEY = "approved_delete_recording_requests";
const NOTIFICATIONS_KEY = "app_notifications";

function parseList<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as T[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function getListAsync<T>(key: string): Promise<T[]> {
  const raw = await getItemAsync(key);
  return parseList<T>(raw);
}

export const recordingRequestService = {
  // --- Xóa bản thu ---

  /** Người đóng góp: gửi yêu cầu xóa bản thu (chỉ bản thu của mình, đã duyệt). */
  async requestDeleteRecording(
    recordingId: string,
    recordingTitle: string,
    contributorId: string,
    contributorName: string
  ): Promise<void> {
    const raw = await getItemAsync(PENDING_DELETE_KEY);
    const list = parseList<DeleteRecordingRequest>(raw);
    if (list.some((r) => r.recordingId === recordingId && r.contributorId === contributorId)) return;
    list.push({
      id: `del_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      recordingId,
      recordingTitle,
      contributorId,
      contributorName,
      requestedAt: new Date().toISOString(),
      status: "pending_admin",
    });
    await setItem(PENDING_DELETE_KEY, JSON.stringify(list));
  },

  /** Admin: lấy danh sách yêu cầu xóa bản thu (pending_admin). */
  async getDeleteRecordingRequests(): Promise<DeleteRecordingRequest[]> {
    return getListAsync<DeleteRecordingRequest>(PENDING_DELETE_KEY);
  },

  /** Admin: chuyển yêu cầu xóa đến Chuyên gia (expert sẽ thực hiện xóa). */
  async forwardDeleteToExpert(
    requestId: string,
    expertId: string
  ): Promise<void> {
    const raw = await getItemAsync(PENDING_DELETE_KEY);
    const list = parseList<DeleteRecordingRequest>(raw);
    const now = new Date().toISOString();
    const updated = list.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: "forwarded_to_expert" as const,
            forwardedToExpertId: expertId,
            forwardedAt: now,
          }
        : r
    );
    await setItem(PENDING_DELETE_KEY, JSON.stringify(updated));
  },

  /** Chuyên gia: lấy yêu cầu xóa đã được Admin chuyển cho mình. */
  async getForwardedDeleteRequestsForExpert(expertId: string): Promise<DeleteRecordingRequest[]> {
    const list = await getListAsync<DeleteRecordingRequest>(PENDING_DELETE_KEY);
    return list.filter(
      (r) => r.status === "forwarded_to_expert" && r.forwardedToExpertId === expertId
    );
  },

  /** Chuyên gia: xóa bản thu khỏi hệ thống và gỡ yêu cầu; tạo thông báo cho Contributor, Expert, Admin. */
  async completeDeleteRecording(
    requestId: string,
    removeRecordingFromStorage: (id: string) => Promise<void>
  ): Promise<{ recordingId: string; recordingTitle: string } | null> {
    const raw = await getItemAsync(PENDING_DELETE_KEY);
    const list = parseList<DeleteRecordingRequest>(raw);
    const req = list.find((r) => r.id === requestId);
    if (!req) return null;
    await removeRecordingFromStorage(req.recordingId);
    const remaining = list.filter((r) => r.id !== requestId);
    await setItem(PENDING_DELETE_KEY, JSON.stringify(remaining));

    await this.addNotification({
      type: "recording_deleted",
      title: "Bản thu đã được xóa khỏi hệ thống",
      body: `Bản thu "${req.recordingTitle}" đã được xóa hoàn toàn khỏi hệ thống.`,
      forRoles: [UserRole.ADMIN, UserRole.CONTRIBUTOR, UserRole.EXPERT],
      recordingId: req.recordingId,
    });

    return { recordingId: req.recordingId, recordingTitle: req.recordingTitle };
  },

  /** Xóa một yêu cầu xóa (sau khi đã xử lý hoặc hủy). */
  async removeDeleteRequest(requestId: string): Promise<void> {
    const raw = await getItemAsync(PENDING_DELETE_KEY);
    const list = parseList<DeleteRecordingRequest>(raw).filter((r) => r.id !== requestId);
    await setItem(PENDING_DELETE_KEY, JSON.stringify(list));
  },

  /** Danh sách recordingId mà contributor đã gửi yêu cầu xóa nhưng chưa bị expert từ chối/xử lý (Contributor dùng). */
  async getPendingDeleteRecordingIdsForContributor(contributorId: string): Promise<string[]> {
    const list = await getListAsync<DeleteRecordingRequest>(PENDING_DELETE_KEY);
    return list
      .filter((r) => r.contributorId === contributorId)
      .map((r) => r.recordingId);
  },

  /** Danh sách recordingId mà admin đã cho phép contributor xóa (Contributor dùng). */
  async getDeleteApprovedRecordingIdsForContributor(contributorId: string): Promise<string[]> {
    const raw = await getItemAsync(APPROVED_DELETE_KEY);
    const list = parseList<{ recordingId: string; contributorId: string }>(raw);
    return list.filter((a) => a.contributorId === contributorId).map((a) => a.recordingId);
  },

  /** Admin: cho phép contributor xóa bản thu (sau khi contributor đã gửi yêu cầu xóa). */
  async approveDeleteForContributor(recordingId: string, contributorId: string): Promise<void> {
    const raw = await getItemAsync(APPROVED_DELETE_KEY);
    const list = parseList<{ recordingId: string; contributorId: string }>(raw);
    if (list.some((a) => a.recordingId === recordingId && a.contributorId === contributorId)) return;
    list.push({ recordingId, contributorId });
    await setItem(APPROVED_DELETE_KEY, JSON.stringify(list));
  },

  /** Gỡ quyền xóa sau khi contributor đã xóa bản thu (hoặc admin thu hồi). */
  async revokeDeleteApproval(recordingId: string, contributorId: string): Promise<void> {
    const raw = await getItemAsync(APPROVED_DELETE_KEY);
    const list = parseList<{ recordingId: string; contributorId: string }>(raw).filter(
      (a) => !(a.recordingId === recordingId && a.contributorId === contributorId)
    );
    await setItem(APPROVED_DELETE_KEY, JSON.stringify(list));
  },

  // --- Chỉnh sửa bản thu (đã duyệt) ---

  /** Người đóng góp: gửi yêu cầu chỉnh sửa bản thu đã được duyệt. */
  async requestEditRecording(
    recordingId: string,
    recordingTitle: string,
    contributorId: string,
    contributorName: string
  ): Promise<void> {
    const raw = await getItemAsync(PENDING_EDIT_KEY);
    const list = parseList<EditRecordingRequest>(raw);
    if (list.some((r) => r.recordingId === recordingId && r.contributorId === contributorId && r.status === "pending")) return;
    list.push({
      id: `edit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      recordingId,
      recordingTitle,
      contributorId,
      contributorName,
      requestedAt: new Date().toISOString(),
      status: "pending",
    });
    await setItem(PENDING_EDIT_KEY, JSON.stringify(list));
  },

  /** Admin: lấy danh sách yêu cầu chỉnh sửa (pending). */
  async getEditRecordingRequests(): Promise<EditRecordingRequest[]> {
    return getListAsync<EditRecordingRequest>(PENDING_EDIT_KEY);
  },

  /** Admin: duyệt yêu cầu chỉnh sửa → Người đóng góp có thể chỉnh sửa, sau đó gửi Chuyên gia kiểm duyệt. */
  async approveEditRequest(requestId: string): Promise<void> {
    const raw = await getItemAsync(PENDING_EDIT_KEY);
    const list = parseList<EditRecordingRequest>(raw);
    const req = list.find((r) => r.id === requestId);
    if (!req) return;
    const updated = list.map((r) =>
      r.id === requestId
        ? { ...r, status: "approved" as const, approvedAt: new Date().toISOString() }
        : r
    );
    await setItem(PENDING_EDIT_KEY, JSON.stringify(updated));

    const approvedRaw = await getItemAsync(APPROVED_EDIT_KEY);
    const approvedList = parseList<{ recordingId: string; approvedAt: string }>(approvedRaw);
    if (!approvedList.some((a) => a.recordingId === req.recordingId)) {
      approvedList.push({ recordingId: req.recordingId, approvedAt: new Date().toISOString() });
      await setItem(APPROVED_EDIT_KEY, JSON.stringify(approvedList));
    }
  },

  /** Kiểm tra bản thu đã được Admin duyệt cho phép chỉnh sửa (Contributor dùng). */
  async isEditApprovedForRecording(recordingId: string): Promise<boolean> {
    const raw = await getItemAsync(APPROVED_EDIT_KEY);
    const list = parseList<{ recordingId: string }>(raw);
    return list.some((a) => a.recordingId === recordingId);
  },

  /** Danh sách recordingId mà contributor đã gửi yêu cầu chỉnh sửa nhưng admin chưa duyệt (Contributor dùng). */
  async getPendingEditRecordingIdsForContributor(contributorId: string): Promise<string[]> {
    const list = await getListAsync<EditRecordingRequest>(PENDING_EDIT_KEY);
    return list
      .filter((r) => r.contributorId === contributorId && r.status === "pending")
      .map((r) => r.recordingId);
  },

  /** (Tùy chọn) Gỡ khỏi danh sách đã duyệt chỉnh sửa sau khi Chuyên gia đã duyệt phiên bản mới. */
  async revokeApprovedEdit(recordingId: string): Promise<void> {
    const raw = await getItemAsync(APPROVED_EDIT_KEY);
    const list = parseList<{ recordingId: string; approvedAt: string }>(raw).filter(
      (a) => a.recordingId !== recordingId
    );
    await setItem(APPROVED_EDIT_KEY, JSON.stringify(list));
  },

  // --- Chỉnh sửa chờ chuyên gia duyệt (contributor bấm "Hoàn tất chỉnh sửa" → chờ expert duyệt) ---

  /** Contributor: gửi chỉnh sửa chờ chuyên gia kiểm duyệt (sau khi bấm "Hoàn tất chỉnh sửa"). */
  async submitEditForExpertReview(
    recordingId: string,
    recordingTitle: string,
    contributorId: string,
    contributorName: string
  ): Promise<void> {
    const raw = await getItemAsync(PENDING_EDIT_REVIEW_KEY);
    const list = parseList<EditSubmissionForReview>(raw);
    if (list.some((r) => r.recordingId === recordingId && r.contributorId === contributorId)) return;
    list.push({
      id: `edit_sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      recordingId,
      recordingTitle,
      contributorId,
      contributorName,
      submittedAt: new Date().toISOString(),
    });
    await setItem(PENDING_EDIT_REVIEW_KEY, JSON.stringify(list));
  },

  /** Expert: lấy danh sách chỉnh sửa chờ duyệt. */
  async getPendingEditSubmissionsForExpert(): Promise<EditSubmissionForReview[]> {
    return getListAsync<EditSubmissionForReview>(PENDING_EDIT_REVIEW_KEY);
  },

  /** Expert: duyệt chỉnh sửa → gỡ quyền chỉnh sửa của contributor, thông báo. */
  async approveEditSubmission(submissionId: string): Promise<{ recordingId: string; recordingTitle: string } | null> {
    const raw = await getItemAsync(PENDING_EDIT_REVIEW_KEY);
    const list = parseList<EditSubmissionForReview>(raw);
    const req = list.find((r) => r.id === submissionId);
    if (!req) return null;
    const remaining = list.filter((r) => r.id !== submissionId);
    await setItem(PENDING_EDIT_REVIEW_KEY, JSON.stringify(remaining));
    await this.revokeApprovedEdit(req.recordingId);
    await this.addNotification({
      type: "edit_submission_approved",
      title: "Chỉnh sửa bản thu đã được chuyên gia duyệt",
      body: `Chỉnh sửa bản thu "${req.recordingTitle}" đã được chuyên gia duyệt. Bạn đã hoàn tất chỉnh sửa.`,
      forRoles: [UserRole.ADMIN, UserRole.CONTRIBUTOR, UserRole.EXPERT],
      recordingId: req.recordingId,
    });
    return { recordingId: req.recordingId, recordingTitle: req.recordingTitle };
  },

  /** Danh sách recordingId mà contributor đã gửi chỉnh sửa chờ chuyên gia duyệt (Contributor dùng). */
  async getPendingEditSubmissionRecordingIdsForContributor(contributorId: string): Promise<string[]> {
    const list = await getListAsync<EditSubmissionForReview>(PENDING_EDIT_REVIEW_KEY);
    return list
      .filter((r) => r.contributorId === contributorId)
      .map((r) => r.recordingId);
  },

  // --- Thông báo ---

  async addNotification(n: Omit<AppNotification, "id" | "createdAt" | "read">): Promise<void> {
    const raw = await getItemAsync(NOTIFICATIONS_KEY);
    const list = parseList<AppNotification>(raw);
    list.push({
      ...n,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
      read: false,
    });
    await setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
  },

  /** Lấy thông báo cho vai trò hiện tại (theo user.role). */
  async getNotificationsForRole(role: UserRole): Promise<AppNotification[]> {
    const raw = await getItemAsync(NOTIFICATIONS_KEY);
    const list = parseList<AppNotification>(raw);
    return list.filter((n) => n.forRoles.includes(role)).sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  },

  async markNotificationRead(id: string): Promise<void> {
    const raw = await getItemAsync(NOTIFICATIONS_KEY);
    const list = parseList<AppNotification>(raw);
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    await setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  },

  async markNotificationUnread(id: string): Promise<void> {
    const raw = await getItemAsync(NOTIFICATIONS_KEY);
    const list = parseList<AppNotification>(raw);
    const updated = list.map((n) => (n.id === id ? { ...n, read: false } : n));
    await setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  },

  /** Đánh dấu tất cả thông báo hiển thị cho vai trò hiện tại là đã đọc. */
  async markAllNotificationsReadForRole(role: UserRole): Promise<void> {
    const raw = await getItemAsync(NOTIFICATIONS_KEY);
    const list = parseList<AppNotification>(raw);
    const updated = list.map((n) =>
      n.forRoles.includes(role) ? { ...n, read: true } : n
    );
    await setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  },

  /** Đánh dấu tất cả thông báo hiển thị cho vai trò hiện tại là chưa đọc. */
  async markAllNotificationsUnreadForRole(role: UserRole): Promise<void> {
    const raw = await getItemAsync(NOTIFICATIONS_KEY);
    const list = parseList<AppNotification>(raw);
    const updated = list.map((n) =>
      n.forRoles.includes(role) ? { ...n, read: false } : n
    );
    await setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  },
};
