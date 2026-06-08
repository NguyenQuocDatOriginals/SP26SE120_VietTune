import { useEffect, useRef, useState } from 'react';

import { graphExplorerService } from '@/services/graphExplorerService';
import type { GraphExplorerPathResponseDto } from '@/types/graphExplorerApi';
import { getErrorMessage } from '@/utils/httpError';

const CACHE_TTL_MS = 60_000;

interface CacheEntry {
  data: GraphExplorerPathResponseDto;
  at: number;
}

/**
 * Fetch shortest path between two nodes from Neo4j.
 *
 * @param fromId - source entity GUID.
 * @param toId - target entity GUID.
 * @param maxDepth - maximum path depth.
 */
export function useGraphShortestPath(fromId: string | null, toId: string | null, maxDepth = 6) {
  const [data, setData] = useState<GraphExplorerPathResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  useEffect(() => {
    if (!fromId || !toId || fromId === toId) {
      setData(null);
      setError(null);
      return;
    }

    const cacheKey = `${fromId}-${toId}-${maxDepth}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      setData(cached.data);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setIsLoading(true);
    setError(null);

    graphExplorerService
      .getShortestPath(fromId, toId, { maxDepth, signal: ac.signal })
      .then((result) => {
        if (ac.signal.aborted) return;
        cacheRef.current.set(cacheKey, { data: result, at: Date.now() });
        setData(result);
      })
      .catch((err) => {
        if (ac.signal.aborted) return;
        setError(getErrorMessage(err, 'Không tìm được đường đi. Thử lại sau.'));
      })
      .finally(() => {
        if (!ac.signal.aborted) setIsLoading(false);
      });

    return () => {
      ac.abort();
    };
  }, [fromId, toId, maxDepth]);

  return { data, isLoading, error };
}
