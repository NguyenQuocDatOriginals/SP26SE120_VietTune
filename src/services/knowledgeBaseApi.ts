// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from '@/services/api';
// [VI] Nhập (import) các phụ thuộc cho file.
import { extractArray } from '@/utils/apiHelpers';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const knowledgeBaseApi = {
// [VI] Thực thi một bước trong luồng xử lý.
  async countKnowledgeBaseItems(): Promise<number> {
// [VI] Thực thi một bước trong luồng xử lý.
    // /api/KnowledgeBase (GET) exists; count by list length.
// [VI] Khai báo biến/hằng số.
    const res = await api.get<unknown>('/KnowledgeBase');
// [VI] Trả về kết quả từ hàm.
    return extractArray<unknown>(res).length;
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  async countRevisions(): Promise<number> {
// [VI] Thực thi một bước trong luồng xử lý.
    // /api/KBRevision (GET) exists; count by list length.
// [VI] Khai báo biến/hằng số.
    const res = await api.get<unknown>('/KBRevision');
// [VI] Trả về kết quả từ hàm.
    return extractArray<unknown>(res).length;
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  async countEntries(): Promise<number> {
// [VI] Thực thi một bước trong luồng xử lý.
    // /api/KBEntry (GET) exists; count by list length.
// [VI] Khai báo biến/hằng số.
    const res = await api.get<unknown>('/KBEntry');
// [VI] Trả về kết quả từ hàm.
    return extractArray<unknown>(res).length;
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
};
