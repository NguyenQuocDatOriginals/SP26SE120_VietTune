// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from '@/services/api';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { ServiceApiClient } from '@/services/serviceApiClient';
// [VI] Nhập (import) các phụ thuộc cho file.
import { logServiceError } from '@/services/serviceLogger';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface QAMessageRequest {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  conversationId: string;
// [VI] Thực thi một bước trong luồng xử lý.
  role: number;
// [VI] Thực thi một bước trong luồng xử lý.
  content: string;
// [VI] Thực thi một bước trong luồng xử lý.
  sourceRecordingIdsJson?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  sourceKBEntryIdsJson?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  confidenceScore?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  flaggedByExpert?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  correctedByExpertId?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  expertCorrection?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  createdAt: string;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function createQAMessageService(client: ServiceApiClient) {
// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Khai báo hàm/biểu thức hàm.
    createQAMessage: async (data: QAMessageRequest): Promise<void> => {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
      try {
// [VI] Thực thi một bước trong luồng xử lý.
        await client.post('/QAMessage', data);
// [VI] Thực thi một bước trong luồng xử lý.
      } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
        logServiceError('Lỗi khi lưu tin nhắn', err);
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
        throw err;
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    },

// [VI] Khai báo hàm/biểu thức hàm.
    fetchConversationMessages: async (conversationId: string): Promise<QAMessageRequest[]> => {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
      try {
// [VI] Khai báo biến/hằng số.
        const res = await client.get<{ data?: QAMessageRequest[] } | QAMessageRequest[]>(
// [VI] Thực thi một bước trong luồng xử lý.
          '/QAMessage/get-by-conversation',
// [VI] Thực thi một bước trong luồng xử lý.
          {
// [VI] Thực thi một bước trong luồng xử lý.
            params: { conversationId },
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
        logServiceError('Lỗi khi lấy tin nhắn hội thoại', err);
// [VI] Trả về kết quả từ hàm.
        return [];
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    },

// [VI] Khai báo hàm/biểu thức hàm.
    flagMessage: async (messageId: string): Promise<void> => {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
      try {
// [VI] Thực thi một bước trong luồng xử lý.
        await client.put('/QAMessage/flagged', { id: messageId });
// [VI] Thực thi một bước trong luồng xử lý.
      } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
        logServiceError('Lỗi khi flag tin nhắn', err);
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
        throw err;
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    },

// [VI] Khai báo hàm/biểu thức hàm.
    unflagMessage: async (messageId: string): Promise<void> => {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
      try {
// [VI] Thực thi một bước trong luồng xử lý.
        await client.put('/QAMessage/unflagged', { id: messageId });
// [VI] Thực thi một bước trong luồng xử lý.
      } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
        logServiceError('Lỗi khi unflag tin nhắn', err);
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
        throw err;
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo biến/hằng số.
const qaMessageService = createQAMessageService(api);
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const createQAMessage = qaMessageService.createQAMessage;
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const fetchConversationMessages = qaMessageService.fetchConversationMessages;
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const flagMessage = qaMessageService.flagMessage;
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const unflagMessage = qaMessageService.unflagMessage;
