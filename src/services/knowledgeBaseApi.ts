import { api } from '@/services/api';
import { extractArray } from '@/utils/apiHelpers';

export const knowledgeBaseApi = {
  async countKnowledgeBaseItems(): Promise<number> {
    // /api/KnowledgeBase (GET) exists; count by list length.
    const res = await api.get<unknown>('/KnowledgeBase');
    return extractArray<unknown>(res).length;
  },

  async countRevisions(): Promise<number> {
    // /api/KBRevision (GET) exists; count by list length.
    const res = await api.get<unknown>('/KBRevision');
    return extractArray<unknown>(res).length;
  },

  async countEntries(): Promise<number> {
    // /api/KBEntry (GET) exists; count by list length.
    const res = await api.get<unknown>('/KBEntry');
    return extractArray<unknown>(res).length;
  },
};
