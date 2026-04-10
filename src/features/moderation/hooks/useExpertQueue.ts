// [VI] Nhập (import) các phụ thuộc cho file.
import { useCallback, useMemo, useRef, useState } from 'react';

// [VI] Nhập (import) các phụ thuộc cho file.
import type { LocalRecordingMini } from '@/features/moderation/types/localRecordingQueue.types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { projectModerationLists } from '@/features/moderation/utils/expertQueueProjection';
// [VI] Nhập (import) các phụ thuộc cho file.
import { buildQueueStatusMeta } from '@/features/moderation/utils/queueStatusMeta';
// [VI] Nhập (import) các phụ thuộc cho file.
import { expertWorkflowService } from '@/services/expertWorkflowService';
// [VI] Nhập (import) các phụ thuộc cho file.
import { migrateVideoDataToVideoData } from '@/utils/helpers';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function useExpertQueue(opts: {
// [VI] Thực thi một bước trong luồng xử lý.
  userId: string | undefined;
// [VI] Thực thi một bước trong luồng xử lý.
  statusFilter: string;
// [VI] Thực thi một bước trong luồng xử lý.
  dateSort: 'newest' | 'oldest';
// [VI] Thực thi một bước trong luồng xử lý.
}) {
// [VI] Khai báo biến/hằng số.
  const { userId, statusFilter, dateSort } = opts;
// [VI] Khai báo biến/hằng số.
  const [items, setItems] = useState<LocalRecordingMini[]>([]);
// [VI] Khai báo biến/hằng số.
  const [allItems, setAllItems] = useState<LocalRecordingMini[]>([]);
// [VI] Khai báo biến/hằng số.
  const queueLoadInFlightRef = useRef(false);

// [VI] Khai báo biến/hằng số.
  const load = useCallback(async () => {
// [VI] Rẽ nhánh điều kiện (if).
    if (queueLoadInFlightRef.current) return;
// [VI] Thực thi một bước trong luồng xử lý.
    queueLoadInFlightRef.current = true;
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const all = (await expertWorkflowService.getQueue()) as LocalRecordingMini[];
// [VI] Khai báo biến/hằng số.
      const migrated = migrateVideoDataToVideoData(all);
// [VI] Khai báo biến/hằng số.
      const { expertItems, visibleItems } = projectModerationLists(
// [VI] Thực thi một bước trong luồng xử lý.
        migrated,
// [VI] Thực thi một bước trong luồng xử lý.
        userId,
// [VI] Thực thi một bước trong luồng xử lý.
        statusFilter,
// [VI] Thực thi một bước trong luồng xử lý.
        dateSort,
// [VI] Thực thi một bước trong luồng xử lý.
      );
// [VI] Thực thi một bước trong luồng xử lý.
      setAllItems(expertItems);
// [VI] Thực thi một bước trong luồng xử lý.
      setItems(visibleItems);
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      console.error(err);
// [VI] Thực thi một bước trong luồng xử lý.
      setItems([]);
// [VI] Thực thi một bước trong luồng xử lý.
      setAllItems([]);
// [VI] Thực thi một bước trong luồng xử lý.
    } finally {
// [VI] Thực thi một bước trong luồng xử lý.
      queueLoadInFlightRef.current = false;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  }, [userId, statusFilter, dateSort]);

// [VI] Khai báo biến/hằng số.
  const queueStatusMeta = useMemo(() => buildQueueStatusMeta(allItems), [allItems]);

// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    items,
// [VI] Thực thi một bước trong luồng xử lý.
    setItems,
// [VI] Thực thi một bước trong luồng xử lý.
    allItems,
// [VI] Thực thi một bước trong luồng xử lý.
    setAllItems,
// [VI] Thực thi một bước trong luồng xử lý.
    load,
// [VI] Thực thi một bước trong luồng xử lý.
    queueStatusMeta,
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}
