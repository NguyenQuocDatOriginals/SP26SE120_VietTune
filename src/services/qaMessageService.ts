import { api } from '@/services/api';
import type { ServiceApiClient } from '@/services/serviceApiClient';
import { logServiceError } from '@/services/serviceLogger';

export interface QAMessageRequest {
  id: string;
  conversationId: string;
  role: number;
  content: string;
  sourceRecordingIdsJson?: string | null;
  sourceKBEntryIdsJson?: string | null;
  confidenceScore?: number;
  flaggedByExpert?: boolean;
  correctedByExpertId?: string | null;
  expertCorrection?: string | null;
  createdAt: string;
}

export function createQAMessageService(client: ServiceApiClient) {
  return {
    createQAMessage: async (data: QAMessageRequest): Promise<void> => {
      try {
        await client.post('/QAMessage', data);
      } catch (err) {
        logServiceError('Lỗi khi lưu tin nhắn', err);
        throw err;
      }
    },

    fetchConversationMessages: async (conversationId: string): Promise<QAMessageRequest[]> => {
      try {
        const res = await client.get<{ data?: QAMessageRequest[] } | QAMessageRequest[]>(
          '/QAMessage/get-by-conversation',
          {
            params: { conversationId },
          },
        );
        if (Array.isArray(res)) return res;
        return res?.data || [];
      } catch (err) {
        logServiceError('Lỗi khi lấy tin nhắn hội thoại', err);
        return [];
      }
    },

    flagMessage: async (messageId: string): Promise<void> => {
      try {
        await client.put('/QAMessage/flagged', { id: messageId });
      } catch (err) {
        logServiceError('Lỗi khi flag tin nhắn', err);
        throw err;
      }
    },

    unflagMessage: async (messageId: string): Promise<void> => {
      try {
        await client.put('/QAMessage/unflagged', { id: messageId });
      } catch (err) {
        logServiceError('Lỗi khi unflag tin nhắn', err);
        throw err;
      }
    },
  };
}

const qaMessageService = createQAMessageService(api);
export const createQAMessage = qaMessageService.createQAMessage;
export const fetchConversationMessages = qaMessageService.fetchConversationMessages;
export const flagMessage = qaMessageService.flagMessage;
export const unflagMessage = qaMessageService.unflagMessage;
