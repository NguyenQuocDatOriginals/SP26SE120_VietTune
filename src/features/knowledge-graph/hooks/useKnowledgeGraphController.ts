import { useCallback, useEffect, useMemo, useState } from 'react';

import { useNeo4jExplore } from '@/features/knowledge-graph/hooks/useNeo4jExplore';
import {
  resolveNeo4jExpandLabel,
  resolveNeo4jSearchLabel,
} from '@/features/knowledge-graph/utils/neo4jSearchLabel';
import {
  apiEntityTypeToViewerType,
  enrichGraphWithDegreeVal,
  viewerTypeToApiEntityType,
  type ResearcherGraphSelection,
  type ResearcherGraphTabView,
} from '@/features/knowledge-graph/utils/researcherGraphUx';
import { useDebounce } from '@/hooks/useDebounce';
import type { GraphNode, KnowledgeGraphData } from '@/types/graph';

export interface ExploreHistoryStep {
  entityId: string;
  entityType: string;
  label: string;
  viewerNodeId: string;
}

export interface KnowledgeGraphControllerOptions {
  fallbackGraphData: KnowledgeGraphData;
}

/**
 * Diff-merge two subgraphs into a stable union (no flicker, deterministic ordering).
 * Existing nodes retain their force-graph runtime fields (x/y/vx/vy) by reference.
 */
export function mergeSubgraph(
  acc: KnowledgeGraphData,
  next: KnowledgeGraphData,
): KnowledgeGraphData {
  if (!acc.nodes.length) return { ...next, nodes: [...next.nodes], links: [...next.links] };
  const nodeMap = new Map<string, GraphNode>();
  for (const n of acc.nodes) nodeMap.set(n.id, n);
  for (const n of next.nodes) {
    if (!nodeMap.has(n.id)) nodeMap.set(n.id, n);
    else {
      const ext = nodeMap.get(n.id)!;
      ext.val = Math.max(ext.val ?? 0, n.val ?? 0);
      if (!ext.entityId && n.entityId) ext.entityId = n.entityId;
      if (!ext.entityType && n.entityType) ext.entityType = n.entityType;
      if (!ext.explorable && n.explorable) ext.explorable = n.explorable;
    }
  }
  const linkKey = (l: any) => {
    const s = typeof l.source === 'string' ? l.source : l.source.id;
    const t = typeof l.target === 'string' ? l.target : l.target.id;
    const lo = s < t ? s : t;
    const hi = s < t ? t : s;
    return `${lo}\0${hi}\0${l.type}`;
  };
  const linkSeen = new Set<string>();
  const links: any[] = [];
  for (const l of [...acc.links, ...next.links]) {
    const k = linkKey(l);
    if (linkSeen.has(k)) continue;
    linkSeen.add(k);
    links.push(l);
  }
  return {
    nodes: Array.from(nodeMap.values()),
    links,
  };
}

export function useKnowledgeGraphController({
  fallbackGraphData: _fallbackGraphData,
}: KnowledgeGraphControllerOptions) {
  // ── Tab + filters ───────────────────────────────────────────────────
  const [graphView, setGraphView] = useState<ResearcherGraphTabView>('overview');
  const [listQuery, setListQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // ── Selection + exploration ─────────────────────────────────────────
  const [selection, setSelection] = useState<ResearcherGraphSelection>(null);
  const [pinnedNodeId, setPinnedNodeId] = useState<string | null>(null);

  // ── Sidebar collapse state (UX) ─────────────────────────────────────
  const [leftOpen, setLeftOpen] = useState(true);

  // ── Neo4j Explorer hook ─────────────────────────────────────────────
  const neo4jSearchLabel = useMemo(
    () => resolveNeo4jSearchLabel(typeFilter, graphView),
    [typeFilter, graphView],
  );
  const neo4jExpandLabel = useMemo(() => resolveNeo4jExpandLabel(typeFilter), [typeFilter]);
  const neo4j = useNeo4jExplore({
    searchLabelFilter: neo4jSearchLabel,
    expandLabelFilter: neo4jExpandLabel,
  });

  const debouncedListQuery = useDebounce(listQuery, 350);

  const neo4jSearch = neo4j.search;
  useEffect(() => {
    void neo4jSearch(debouncedListQuery);
  }, [debouncedListQuery, neo4jSearch]);

  // Reset selection khi chuyển Tab
  useEffect(() => {
    setSelection(null);
    setPinnedNodeId(null);
    neo4j.reset();
  }, [graphView]);

  const displayGraph: KnowledgeGraphData = useMemo(() => {
    return enrichGraphWithDegreeVal(neo4j.graphData);
  }, [neo4j.graphData]);

  const selectedNodeId = useMemo(() => {
    if (!selection) return null;
    return selection.source === 'graph' ? selection.id : selection.id ?? null;
  }, [selection]);

  // ── Derived collections ─────────────────────────────────────────────
  const listNodesFromGraph = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    return displayGraph.nodes
      .filter((n) => !q || n.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [displayGraph.nodes, listQuery]);

  // ── Handlers & Actions ──────────────────────────────────────────────
  const handleGraphNodeClick = useCallback(
    (node: GraphNode, event?: MouseEvent) => {
      const apiType = node.entityType ?? node.apiEntityType ?? viewerTypeToApiEntityType(node.type);
      
      // Ctrl+Click/Cmd+Click để Ghim nút nguồn (Shortest Path)
      if (event && (event.ctrlKey || event.metaKey)) {
        setPinnedNodeId((prev) => (prev === node.id ? null : node.id));
        return;
      }

      // Nhấp thường: Chọn node để xem thông tin
      // Chỉ huỷ ghim nếu click trùng vào nút đã ghim
      if (pinnedNodeId === node.id) {
        setPinnedNodeId(null);
      }

      setSelection({
        source: 'graph',
        id: node.id,
        apiEntityType: apiType,
        label: node.name,
        viewerType: node.type,
      });
    },
    [pinnedNodeId],
  );

  const handleSearchResultClick = useCallback(
    (hit: { id: string; type: string; label: string }) => {
      const viewerType = apiEntityTypeToViewerType(hit.type);
      const viewerNodeId = `${hit.type}:${hit.id}`;
      
      setSelection({
        source: 'graph',
        id: viewerNodeId,
        apiEntityType: hit.type,
        label: hit.label,
        viewerType,
      });

      neo4j.seedFromSearchHit({ id: hit.id, label: hit.label, group: hit.type });
    },
    [neo4j],
  );

  const handleNeo4jSearchResultClick = useCallback(
    (hit: { id: string; group: string; label: string }) => {
      handleSearchResultClick({ id: hit.id, type: hit.group, label: hit.label });
    },
    [handleSearchResultClick],
  );

  const handleListNodeClick = useCallback(
    (n: GraphNode) => {
      setSelection({ source: 'list', viewerType: n.type, name: n.name, id: n.id });
    },
    [],
  );

  const handleGraphNodeDoubleClick = useCallback(
    (node: GraphNode) => {
      const entityId = node.entityId ?? node.backendId;
      if (!entityId) return;
      void neo4j.expand(entityId);
    },
    [neo4j],
  );

  const resetToOverview = useCallback(() => {
    setSelection(null);
    setPinnedNodeId(null);
    neo4j.reset();
  }, [neo4j]);

  const refreshAll = useCallback(() => {
    resetToOverview();
  }, [resetToOverview]);

  const clearSelection = useCallback(() => {
    setSelection(null);
    setPinnedNodeId(null);
  }, []);

  const busy = neo4j.isSearching || neo4j.isExpanding;
  const exploreInFlight = neo4j.isExpanding;

  return {
    // state
    graphView,
    setGraphView,
    listQuery,
    setListQuery,
    debouncedListQuery,
    typeFilter,
    setTypeFilter,
    selection,
    selectedNodeId,
    leftOpen,
    setLeftOpen,
    pinnedNodeId,
    setPinnedNodeId,
    // derived data
    displayGraph,
    listNodesFromGraph,
    // queries
    neo4jSearchResults: neo4j.searchResults,
    neo4jSearchLoading: neo4j.isSearching,
    neo4jSearchError: neo4j.searchError,
    neo4jExpandError: neo4j.expandError,
    // status flags
    busy,
    exploreInFlight,
    // actions
    handleGraphNodeClick,
    handleGraphNodeDoubleClick,
    handleSearchResultClick,
    handleNeo4jSearchResultClick,
    handleListNodeClick,
    resetToOverview,
    refreshAll,
    clearSelection,
  };
}

export type KnowledgeGraphController = ReturnType<typeof useKnowledgeGraphController>;
