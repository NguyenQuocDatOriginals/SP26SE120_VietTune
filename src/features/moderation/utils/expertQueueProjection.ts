// [VI] Nhập (import) các phụ thuộc cho file.
import type { LocalRecordingMini } from '@/features/moderation/types/localRecordingQueue.types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { mapApiSubmissionStatusToModeration } from '@/services/submissionApiMapper';
// [VI] Nhập (import) các phụ thuộc cho file.
import { ModerationStatus } from '@/types';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function normalizeQueueStatus(
// [VI] Thực thi một bước trong luồng xử lý.
  status?: ModerationStatus | string,
// [VI] Thực thi một bước trong luồng xử lý.
): ModerationStatus | string {
// [VI] Trả về kết quả từ hàm.
  return mapApiSubmissionStatusToModeration(status);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** Same expert + filter + sort rules as queue `load()` — for optimistic list updates without refetch. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function projectModerationLists(
// [VI] Thực thi một bước trong luồng xử lý.
  migrated: LocalRecordingMini[],
// [VI] Thực thi một bước trong luồng xử lý.
  userId: string | undefined,
// [VI] Thực thi một bước trong luồng xử lý.
  statusFilter: string,
// [VI] Thực thi một bước trong luồng xử lý.
  dateSort: 'newest' | 'oldest',
// [VI] Thực thi một bước trong luồng xử lý.
): { expertItems: LocalRecordingMini[]; visibleItems: LocalRecordingMini[] } {
// [VI] Khai báo biến/hằng số.
  const expertItems = migrated.filter((r) => {
// [VI] Khai báo biến/hằng số.
    const status = normalizeQueueStatus(r.moderation?.status);
// [VI] Rẽ nhánh điều kiện (if).
    if (r.moderation?.claimedBy === userId) return true;
// [VI] Rẽ nhánh điều kiện (if).
    if (!r.moderation?.claimedBy && status === ModerationStatus.PENDING_REVIEW) return true;
// [VI] Rẽ nhánh điều kiện (if).
    if (r.moderation?.reviewerId === userId) return true;
// [VI] Trả về kết quả từ hàm.
    return false;
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Khai báo biến/hằng số.
  let filtered = expertItems;
// [VI] Rẽ nhánh điều kiện (if).
  if (statusFilter !== 'ALL') {
// [VI] Khai báo hàm/biểu thức hàm.
    filtered = filtered.filter((r) => normalizeQueueStatus(r.moderation?.status) === statusFilter);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Khai báo hàm/biểu thức hàm.
  filtered = [...filtered].sort((a, b) => {
// [VI] Khai báo biến/hằng số.
    const aDate =
// [VI] Thực thi một bước trong luồng xử lý.
      (a as LocalRecordingMini & { uploadedDate?: string }).uploadedDate ||
// [VI] Thực thi một bước trong luồng xử lý.
      a.uploadedAt ||
// [VI] Thực thi một bước trong luồng xử lý.
      a.moderation?.reviewedAt ||
// [VI] Thực thi một bước trong luồng xử lý.
      '';
// [VI] Khai báo biến/hằng số.
    const bDate =
// [VI] Thực thi một bước trong luồng xử lý.
      (b as LocalRecordingMini & { uploadedDate?: string }).uploadedDate ||
// [VI] Thực thi một bước trong luồng xử lý.
      b.uploadedAt ||
// [VI] Thực thi một bước trong luồng xử lý.
      b.moderation?.reviewedAt ||
// [VI] Thực thi một bước trong luồng xử lý.
      '';
// [VI] Khai báo biến/hằng số.
    const dateA = new Date(aDate || 0).getTime();
// [VI] Khai báo biến/hằng số.
    const dateB = new Date(bDate || 0).getTime();
// [VI] Trả về kết quả từ hàm.
    return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Trả về kết quả từ hàm.
  return { expertItems, visibleItems: filtered };
// [VI] Thực thi một bước trong luồng xử lý.
}
