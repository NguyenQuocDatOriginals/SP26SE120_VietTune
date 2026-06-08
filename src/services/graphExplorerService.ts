import { apiFetch, apiOk, openApiQueryRecord } from '@/api';

import {
  graphExplorerToViewerData,
  parseGraphExplorerExpandResponse,
  parseGraphExplorerSearchResponse,
  parseGraphExplorerNodeDetail,
  parseGraphExplorerPathResponse,
} from '@/features/knowledge-graph/utils/graphExplorerAdapter';
import type {
  GraphExplorerNodeDto,
  GraphExplorerNodeDetailDto,
  GraphExplorerPathResponseDto,
} from '@/types/graphExplorerApi';
import type { KnowledgeGraphData } from '@/types/graph';

export const graphExplorerService = {
  async searchEntities(
    keyword: string,
    options?: { label?: string; signal?: AbortSignal },
  ): Promise<GraphExplorerNodeDto[]> {
    const trimmed = keyword.trim();
    if (trimmed.length < 2) return [];

    const raw = await apiOk(
      apiFetch.GET('/api/graph-explorer/search', {
        params: {
          query: openApiQueryRecord({
            keyword: trimmed,
            label: options?.label || undefined,
          }),
        },
        signal: options?.signal,
      }),
    );
    return parseGraphExplorerSearchResponse(raw);
  },

  async expandNode(
    sourceId: string,
    options?: { targetLabel?: string; relType?: string; signal?: AbortSignal },
  ): Promise<KnowledgeGraphData> {
    const id = sourceId.trim();
    if (!id) return { nodes: [], links: [] };

    const raw = await apiOk(
      apiFetch.GET('/api/graph-explorer/expand', {
        params: {
          query: openApiQueryRecord({
            sourceId: id,
            targetLabel: options?.targetLabel || undefined,
            relType: options?.relType || undefined,
          }),
        },
        signal: options?.signal,
      }),
    );
    return graphExplorerToViewerData(parseGraphExplorerExpandResponse(raw));
  },

  /** GET /api/graph-explorer/node/{id} — chi tiết node: degree, neighbors nhóm theo relationType. */
  async getNodeDetail(
    id: string,
    options?: { signal?: AbortSignal },
  ): Promise<GraphExplorerNodeDetailDto | null> {
    const trimmed = id.trim();
    if (!trimmed) return null;

    const raw = await apiOk(
      apiFetch.GET('/api/graph-explorer/node/{id}', {
        params: { path: { id: trimmed } },
        signal: options?.signal,
      }),
    );
    return parseGraphExplorerNodeDetail(raw);
  },

  /**
   * GET /api/graph-explorer/shortest-path — tìm đường nối ngắn nhất giữa 2 node.
   * @param maxDepth Độ sâu tìm kiếm tối đa (default 6).
   */
  async getShortestPath(
    fromId: string,
    toId: string,
    options?: { maxDepth?: number; signal?: AbortSignal },
  ): Promise<GraphExplorerPathResponseDto> {
    const from = fromId.trim();
    const to = toId.trim();
    if (!from || !to) return { pathFound: false, nodes: [], links: [] };

    const raw = await apiOk(
      apiFetch.GET('/api/graph-explorer/shortest-path', {
        params: {
          query: openApiQueryRecord({
            fromId: from,
            toId: to,
            maxDepth: options?.maxDepth ?? 6,
          }),
        },
        signal: options?.signal,
      }),
    );
    return parseGraphExplorerPathResponse(raw);
  },
};
