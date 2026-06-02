import { apiFetch, apiOk, openApiQueryRecord } from '@/api';

import {
  graphExplorerToViewerData,
  parseGraphExplorerExpandResponse,
  parseGraphExplorerSearchResponse,
} from '@/features/knowledge-graph/utils/graphExplorerAdapter';
import type { GraphExplorerNodeDto } from '@/types/graphExplorerApi';
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
};
