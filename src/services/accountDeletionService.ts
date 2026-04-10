// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Xóa tài khoản: Người đóng góp xóa trực tiếp; Chuyên gia phải qua kiểm duyệt Quản trị viên.
// [VI] Thực thi một bước trong luồng xử lý.
 */

// [VI] Nhập (import) các phụ thuộc cho file.
import { authService } from '@/services/authService';
// [VI] Nhập (import) các phụ thuộc cho file.
import { getItem, setItem } from '@/services/storageService';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { ExpertAccountDeletionRequest } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { UserRole } from '@/types';

// [VI] Khai báo biến/hằng số.
const PENDING_EXPERT_DELETION_KEY = 'pending_expert_deletion_requests';

// [VI] Khai báo hàm/biểu thức hàm.
function parseList<T>(raw: string | null): T[] {
// [VI] Rẽ nhánh điều kiện (if).
  if (!raw) return [];
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Khai báo biến/hằng số.
    const arr = JSON.parse(raw) as T[];
// [VI] Trả về kết quả từ hàm.
    return Array.isArray(arr) ? arr : [];
// [VI] Thực thi một bước trong luồng xử lý.
  } catch {
// [VI] Trả về kết quả từ hàm.
    return [];
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const accountDeletionService = {
// [VI] Thực thi một bước trong luồng xử lý.
  /** Người đóng góp: xóa tài khoản ngay (logout + xóa khỏi overrides). */
// [VI] Thực thi một bước trong luồng xử lý.
  async deleteAccountContributor(userId: string): Promise<void> {
// [VI] Khai báo biến/hằng số.
    const oRaw = getItem('users_overrides');
// [VI] Khai báo biến/hằng số.
    const overrides = oRaw ? (JSON.parse(oRaw) as Record<string, unknown>) : {};
// [VI] Thực thi một bước trong luồng xử lý.
    delete overrides[userId];
// [VI] Thực thi một bước trong luồng xử lý.
    await setItem('users_overrides', JSON.stringify(overrides));
// [VI] Thực thi một bước trong luồng xử lý.
    await authService.logout();
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Chuyên gia: gửi yêu cầu xóa tài khoản (Admin sẽ duyệt). */
// [VI] Thực thi một bước trong luồng xử lý.
  async requestExpertAccountDeletion(
// [VI] Thực thi một bước trong luồng xử lý.
    request: Omit<ExpertAccountDeletionRequest, 'requestedAt'>,
// [VI] Thực thi một bước trong luồng xử lý.
  ): Promise<void> {
// [VI] Khai báo biến/hằng số.
    const raw = getItem(PENDING_EXPERT_DELETION_KEY);
// [VI] Khai báo biến/hằng số.
    const list = parseList<ExpertAccountDeletionRequest>(raw);
// [VI] Khai báo biến/hằng số.
    const newReq: ExpertAccountDeletionRequest = {
// [VI] Thực thi một bước trong luồng xử lý.
      ...request,
// [VI] Thực thi một bước trong luồng xử lý.
      requestedAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Khai báo hàm/biểu thức hàm.
    if (list.some((r) => r.expertId === newReq.expertId)) return; // đã có yêu cầu
// [VI] Thực thi một bước trong luồng xử lý.
    list.push(newReq);
// [VI] Thực thi một bước trong luồng xử lý.
    await setItem(PENDING_EXPERT_DELETION_KEY, JSON.stringify(list));
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Admin: lấy danh sách yêu cầu xóa tài khoản Chuyên gia. */
// [VI] Thực thi một bước trong luồng xử lý.
  getPendingExpertDeletionRequests(): ExpertAccountDeletionRequest[] {
// [VI] Khai báo biến/hằng số.
    const raw = getItem(PENDING_EXPERT_DELETION_KEY);
// [VI] Trả về kết quả từ hàm.
    return parseList<ExpertAccountDeletionRequest>(raw);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Admin: duyệt xóa tài khoản Chuyên gia → xóa khỏi overrides, nếu đang đăng nhập là expert đó thì logout. */
// [VI] Thực thi một bước trong luồng xử lý.
  async approveExpertAccountDeletion(
// [VI] Thực thi một bước trong luồng xử lý.
    expertId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    currentUserId: string | undefined,
// [VI] Thực thi một bước trong luồng xử lý.
    currentUserRole: string | undefined,
// [VI] Thực thi một bước trong luồng xử lý.
  ): Promise<void> {
// [VI] Khai báo biến/hằng số.
    const raw = getItem(PENDING_EXPERT_DELETION_KEY);
// [VI] Khai báo biến/hằng số.
    const list = parseList<ExpertAccountDeletionRequest>(raw).filter(
// [VI] Khai báo hàm/biểu thức hàm.
      (r) => r.expertId !== expertId,
// [VI] Thực thi một bước trong luồng xử lý.
    );
// [VI] Thực thi một bước trong luồng xử lý.
    await setItem(PENDING_EXPERT_DELETION_KEY, JSON.stringify(list));

// [VI] Khai báo biến/hằng số.
    const oRaw = getItem('users_overrides');
// [VI] Khai báo biến/hằng số.
    const overrides = oRaw ? (JSON.parse(oRaw) as Record<string, unknown>) : {};
// [VI] Thực thi một bước trong luồng xử lý.
    delete overrides[expertId];
// [VI] Thực thi một bước trong luồng xử lý.
    await setItem('users_overrides', JSON.stringify(overrides));

// [VI] Rẽ nhánh điều kiện (if).
    if (currentUserId === expertId && currentUserRole === UserRole.EXPERT) {
// [VI] Thực thi một bước trong luồng xử lý.
      await authService.logout();
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
};
