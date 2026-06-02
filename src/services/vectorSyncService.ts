/**
 * Vector Sync API — embedding index sync (swagger: `/api/vector-sync/*`).
 *
 * Note: `VectorSyncController` is currently commented out in the backend repo, so
 * deployed APIs often return 404. Do not call on app init unless
 * `VITE_ENABLE_VECTOR_SYNC=true` and the endpoint is live.
 */

import { legacyGet, legacyPost, legacyDelete } from '@/api/legacyHttp';
import { logServiceInfo, logServiceWarn } from '@/services/serviceLogger';
import { getHttpStatus } from '@/utils/httpError';

/** Opt-in: POST /api/vector-sync/resync on first MainLayout mount. */
export const VECTOR_SYNC_ON_INIT_ENABLED =
  import.meta.env.VITE_ENABLE_VECTOR_SYNC === 'true';

function isVectorSyncUnavailable(err: unknown): boolean {
  const status = getHttpStatus(err);
  return status === 404 || status === 405 || status === 501;
}

async function callVectorSync<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    if (isVectorSyncUnavailable(err)) {
      if (import.meta.env.DEV) {
        logServiceWarn('[VectorSync] endpoint not available (skipped)', err);
      }
      return null;
    }
    throw err;
  }
}

export const vectorSyncService = {
  /** Check current sync status. Returns null if endpoint is not deployed. */
  getStatus: async (): Promise<unknown | null> => {
    return callVectorSync(() => legacyGet<unknown>('/vector-sync/status'));
  },

  /**
   * Sync delta — only recordings missing embeddings.
   * No-op when the API is not deployed (404).
   */
  resync: async (): Promise<void> => {
    const result = await callVectorSync(() => legacyPost<unknown>('/vector-sync/resync'));
    if (result != null) {
      logServiceInfo('[VectorSync] resync triggered successfully');
    }
  },

  /** Full rebuild — admin only. Rebuilds entire vector store. */
  syncAll: async (): Promise<void> => {
    await callVectorSync(() => legacyPost<unknown>('/vector-sync/all'));
  },

  /** Sync a single recording's embedding. */
  syncRecording: async (recordingId: string): Promise<void> => {
    await callVectorSync(() =>
      legacyPost<unknown>(`/vector-sync/${encodeURIComponent(recordingId)}`),
    );
  },

  /** Remove a recording from the vector index. */
  removeRecording: async (recordingId: string): Promise<void> => {
    await callVectorSync(() =>
      legacyDelete<unknown>(`/vector-sync/${encodeURIComponent(recordingId)}`),
    );
  },
};
