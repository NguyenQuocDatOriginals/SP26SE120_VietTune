import { useEffect, useRef, useState } from 'react';

import { graphExplorerService } from '@/services/graphExplorerService';
import type { GraphExplorerNodeDetailDto } from '@/types/graphExplorerApi';
import { getErrorMessage } from '@/utils/httpError';

const CACHE_TTL_MS = 60_000; // 60 seconds TTL

interface CacheEntry {
  data: GraphExplorerNodeDetailDto;
  at: number;
}

/**
 * Fetch detailed node properties and neighbors from Neo4j.
 *
 * @param nodeId - Neo4j entity GUID (NOT the composite viewerNodeId).
 */
export function useGraphNodeDetail(nodeId: string | null) {
  const [data, setData] = useState<GraphExplorerNodeDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  useEffect(() => {
    if (!nodeId) {
      setData(null);
      setError(null);
      return;
    }

    // Check valid cache
    const cached = cacheRef.current.get(nodeId);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      setData(cached.data);
      setError(null);
      return;
    }

    // Abort pending request
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setIsLoading(true);
    setError(null);

    graphExplorerService
      .getNodeDetail(nodeId, { signal: ac.signal })
      .then((result) => {
        if (ac.signal.aborted) return;
        if (result) {
          cacheRef.current.set(nodeId, { data: result, at: Date.now() });
        }
        setData(result);
      })
      .catch((err) => {
        if (ac.signal.aborted) return;
        setError(getErrorMessage(err, 'Không tải được thông tin nút. Thử lại sau.'));
      })
      .finally(() => {
        if (!ac.signal.aborted) setIsLoading(false);
      });

    return () => {
      ac.abort();
    };
  }, [nodeId]);

  return { data, isLoading, error };
}
