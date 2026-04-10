// [VI] Nhập (import) các phụ thuộc cho file.
import type { LocalRecordingMini } from '@/features/moderation/types/localRecordingQueue.types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { normalizeQueueStatus } from '@/features/moderation/utils/expertQueueProjection';
// [VI] Nhập (import) các phụ thuộc cho file.
import { ModerationStatus } from '@/types';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type ModerationQueueStatusItem = { key: string; label: string; count: number };
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type ModerationQueueStatusGroup = { title: string; items: ModerationQueueStatusItem[] };
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type ModerationQueueStatusMeta = {
// [VI] Thực thi một bước trong luồng xử lý.
  counts: Record<string, number>;
// [VI] Thực thi một bước trong luồng xử lý.
  groups: ModerationQueueStatusGroup[];
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function buildQueueStatusMeta(allItems: LocalRecordingMini[]): ModerationQueueStatusMeta {
// [VI] Khai báo biến/hằng số.
  const counts = allItems.reduce<Record<string, number>>((acc, item) => {
// [VI] Khai báo biến/hằng số.
    const key = String(normalizeQueueStatus(item.moderation?.status));
// [VI] Thực thi một bước trong luồng xử lý.
    acc[key] = (acc[key] ?? 0) + 1;
// [VI] Trả về kết quả từ hàm.
    return acc;
// [VI] Thực thi một bước trong luồng xử lý.
  }, {});

// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    counts,
// [VI] Thực thi một bước trong luồng xử lý.
    groups: [
// [VI] Thực thi một bước trong luồng xử lý.
      {
// [VI] Thực thi một bước trong luồng xử lý.
        title: 'Đang xử lý',
// [VI] Thực thi một bước trong luồng xử lý.
        items: [
// [VI] Thực thi một bước trong luồng xử lý.
          { key: 'ALL', label: 'Tất cả', count: allItems.length },
// [VI] Thực thi một bước trong luồng xử lý.
          {
// [VI] Thực thi một bước trong luồng xử lý.
            key: ModerationStatus.PENDING_REVIEW,
// [VI] Thực thi một bước trong luồng xử lý.
            label: 'Chờ được kiểm duyệt',
// [VI] Thực thi một bước trong luồng xử lý.
            count: counts[ModerationStatus.PENDING_REVIEW] ?? 0,
// [VI] Thực thi một bước trong luồng xử lý.
          },
// [VI] Thực thi một bước trong luồng xử lý.
          {
// [VI] Thực thi một bước trong luồng xử lý.
            key: ModerationStatus.IN_REVIEW,
// [VI] Thực thi một bước trong luồng xử lý.
            label: 'Đang được kiểm duyệt',
// [VI] Thực thi một bước trong luồng xử lý.
            count: counts[ModerationStatus.IN_REVIEW] ?? 0,
// [VI] Thực thi một bước trong luồng xử lý.
          },
// [VI] Thực thi một bước trong luồng xử lý.
        ],
// [VI] Thực thi một bước trong luồng xử lý.
      },
// [VI] Thực thi một bước trong luồng xử lý.
      {
// [VI] Thực thi một bước trong luồng xử lý.
        title: 'Đã xử lý',
// [VI] Thực thi một bước trong luồng xử lý.
        items: [
// [VI] Thực thi một bước trong luồng xử lý.
          {
// [VI] Thực thi một bước trong luồng xử lý.
            key: ModerationStatus.APPROVED,
// [VI] Thực thi một bước trong luồng xử lý.
            label: 'Đã được kiểm duyệt',
// [VI] Thực thi một bước trong luồng xử lý.
            count: counts[ModerationStatus.APPROVED] ?? 0,
// [VI] Thực thi một bước trong luồng xử lý.
          },
// [VI] Thực thi một bước trong luồng xử lý.
          {
// [VI] Thực thi một bước trong luồng xử lý.
            key: ModerationStatus.REJECTED,
// [VI] Thực thi một bước trong luồng xử lý.
            label: 'Đã bị từ chối vĩnh viễn',
// [VI] Thực thi một bước trong luồng xử lý.
            count: counts[ModerationStatus.REJECTED] ?? 0,
// [VI] Thực thi một bước trong luồng xử lý.
          },
// [VI] Thực thi một bước trong luồng xử lý.
          {
// [VI] Thực thi một bước trong luồng xử lý.
            key: ModerationStatus.TEMPORARILY_REJECTED,
// [VI] Thực thi một bước trong luồng xử lý.
            label: 'Đã bị từ chối tạm thời',
// [VI] Thực thi một bước trong luồng xử lý.
            count: counts[ModerationStatus.TEMPORARILY_REJECTED] ?? 0,
// [VI] Thực thi một bước trong luồng xử lý.
          },
// [VI] Thực thi một bước trong luồng xử lý.
        ],
// [VI] Thực thi một bước trong luồng xử lý.
      },
// [VI] Thực thi một bước trong luồng xử lý.
    ],
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}
