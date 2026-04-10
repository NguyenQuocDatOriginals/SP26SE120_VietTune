// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from '@/services/api';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { ServiceApiClient } from '@/services/serviceApiClient';
// [VI] Nhập (import) các phụ thuộc cho file.
import { logServiceError } from '@/services/serviceLogger';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface QAConversationRequest {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  userId: string;
// [VI] Thực thi một bước trong luồng xử lý.
  title: string;
// [VI] Thực thi một bước trong luồng xử lý.
  createdAt: string;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function createQAConversationService(client: ServiceApiClient) {
// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Khai báo hàm/biểu thức hàm.
    createQAConversation: async (data: QAConversationRequest): Promise<void> => {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
      try {
// [VI] Thực thi một bước trong luồng xử lý.
        await client.post('/QAConversation', data);
// [VI] Thực thi một bước trong luồng xử lý.
      } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
        logServiceError('Lỗi khi tạo conversation', err);
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
        throw err;
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Khai báo hàm/biểu thức hàm.
    fetchUserConversations: async (userId: string): Promise<QAConversationRequest[]> => {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
      try {
// [VI] Khai báo biến/hằng số.
        const res = await client.get<{ data?: QAConversationRequest[] } | QAConversationRequest[]>(
// [VI] Thực thi một bước trong luồng xử lý.
          '/QAConversation/get-by-user',
// [VI] Thực thi một bước trong luồng xử lý.
          {
// [VI] Thực thi một bước trong luồng xử lý.
            params: { userId },
// [VI] Thực thi một bước trong luồng xử lý.
          },
// [VI] Thực thi một bước trong luồng xử lý.
        );
// [VI] Rẽ nhánh điều kiện (if).
        if (Array.isArray(res)) return res;
// [VI] Trả về kết quả từ hàm.
        return res?.data || [];
// [VI] Thực thi một bước trong luồng xử lý.
      } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
        logServiceError('Lỗi khi lấy lịch sử hội thoại', err);
// [VI] Trả về kết quả từ hàm.
        return [];
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo biến/hằng số.
const qaConversationService = createQAConversationService(api);
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const createQAConversation = qaConversationService.createQAConversation;
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const fetchUserConversations = qaConversationService.fetchUserConversations;
