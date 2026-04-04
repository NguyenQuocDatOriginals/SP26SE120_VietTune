import { api } from '@/services/api';
import type { ServiceApiClient } from '@/services/serviceApiClient';
import { logServiceError } from '@/services/serviceLogger';

export interface QAConversationRequest {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
}

export function createQAConversationService(client: ServiceApiClient) {
  return {
    createQAConversation: async (data: QAConversationRequest): Promise<void> => {
      try {
        await client.post('/QAConversation', data);
      } catch (err) {
        logServiceError('Lỗi khi tạo conversation', err);
        throw err;
      }
    },
    fetchUserConversations: async (userId: string): Promise<QAConversationRequest[]> => {
      try {
        const res = await client.get<{ data?: QAConversationRequest[] } | QAConversationRequest[]>(
          '/QAConversation/get-by-user',
          {
            params: { userId },
          },
        );
        if (Array.isArray(res)) return res;
        return res?.data || [];
      } catch (err) {
        logServiceError('Lỗi khi lấy lịch sử hội thoại', err);
        return [];
      }
    },
  };
}

const qaConversationService = createQAConversationService(api);
export const createQAConversation = qaConversationService.createQAConversation;
export const fetchUserConversations = qaConversationService.fetchUserConversations;
