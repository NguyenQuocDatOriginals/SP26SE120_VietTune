import { useCallback, useRef, useState } from 'react';

import { mergeSubgraph } from '@/features/knowledge-graph/hooks/useKnowledgeGraphController';
import { graphExplorerNodeToGraphNode } from '@/features/knowledge-graph/utils/graphExplorerAdapter';
import { NEO4J_SEARCH_MIN_LENGTH } from '@/features/knowledge-graph/utils/neo4jSearchLabel';
import { graphExplorerService } from '@/services/graphExplorerService';
import type { GraphExplorerNodeDto } from '@/types/graphExplorerApi';
import type { KnowledgeGraphData } from '@/types/graph';
import { getErrorMessage } from '@/utils/httpError';

export { NEO4J_SEARCH_MIN_LENGTH };

export type UseNeo4jExploreOptions = {
  /** Applied to entity search only. */
  searchLabelFilter?: string;
  /** Applied to expand only when user explicitly filters by type. */
  expandLabelFilter?: string;
};

export function useNeo4jExplore(options: UseNeo4jExploreOptions = {}) {
  const searchLabelFilter = options.searchLabelFilter?.trim() || undefined;
  const expandLabelFilter = options.expandLabelFilter?.trim() || undefined;

  const [graphData, setGraphData] = useState<KnowledgeGraphData>({ nodes: [], links: [] });
  const [searchResults, setSearchResults] = useState<GraphExplorerNodeDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [expandError, setExpandError] = useState<string | null>(null);

  const expandAbortRef = useRef<AbortController | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    expandAbortRef.current?.abort();
    searchAbortRef.current?.abort();
    setGraphData({ nodes: [], links: [] });
    setSearchResults([]);
    setSearchError(null);
    setExpandError(null);
    setIsSearching(false);
    setIsExpanding(false);
  }, []);

  const search = useCallback(
    async (keyword: string) => {
      const q = keyword.trim();
      if (q.length < NEO4J_SEARCH_MIN_LENGTH) {
        setSearchResults([]);
        setSearchError(null);
        return;
      }
      searchAbortRef.current?.abort();
      const ac = new AbortController();
      searchAbortRef.current = ac;
      setIsSearching(true);
      setSearchError(null);
      try {
        const hits = await graphExplorerService.searchEntities(q, {
          label: searchLabelFilter,
          signal: ac.signal,
        });
        if (!ac.signal.aborted) setSearchResults(hits);
      } catch (err) {
        if (!ac.signal.aborted) {
          setSearchResults([]);
          setSearchError(
            getErrorMessage(err, 'Không tìm được thực thể. Kiểm tra API và dữ liệu Neo4j.'),
          );
        }
      } finally {
        if (!ac.signal.aborted) setIsSearching(false);
      }
    },
    [searchLabelFilter],
  );

  const expand = useCallback(
    async (sourceId: string) => {
      const id = sourceId.trim();
      if (!id) return;
      expandAbortRef.current?.abort();
      const ac = new AbortController();
      expandAbortRef.current = ac;
      setIsExpanding(true);
      setExpandError(null);
      try {
        const chunk = await graphExplorerService.expandNode(id, {
          targetLabel: expandLabelFilter,
          signal: ac.signal,
        });
        if (!ac.signal.aborted) {
          setGraphData((prev) => mergeSubgraph(prev, chunk));
        }
      } catch (err) {
        if (!ac.signal.aborted) {
          setExpandError(
            getErrorMessage(err, 'Không mở rộng được nút. Thử nút khác hoặc bỏ lọc loại.'),
          );
        }
      } finally {
        if (!ac.signal.aborted) setIsExpanding(false);
      }
    },
    [expandLabelFilter],
  );

  const seedFromSearchHit = useCallback(
    (hit: GraphExplorerNodeDto) => {
      const node = graphExplorerNodeToGraphNode(hit);
      setGraphData({ nodes: [node], links: [] });
      setSearchResults([]);
      void expand(hit.id);
    },
    [expand],
  );

  return {
    graphData,
    searchResults,
    isSearching,
    isExpanding,
    searchError,
    expandError,
    search,
    expand,
    reset,
    seedFromSearchHit,
  };
}
