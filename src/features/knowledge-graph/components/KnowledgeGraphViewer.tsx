import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';

import {
  adaptiveForceParams,
  buildGraphDataSafe,
  buildNeighborMap,
  CANVAS_LABEL_MAX_LEN,
  CANVAS_LABEL_MAX_LEN_ACTIVE,
  clampedVisualRadius,
  colorMap,
  computeTopHubIds,
  getNodeFocusTier,
  nodeColor,
  nodeIdOf,
  nodeSize,
  shouldRenderNodeLabel,
  tierAlpha,
  truncateLabel,
  TYPE_LABELS,
  type FocusTier,
} from '@/features/knowledge-graph/utils/graphViewerHelpers';
import {
  tabMatchesViewerType,
  type ResearcherGraphTabView,
} from '@/features/knowledge-graph/utils/researcherGraphUx';
import type { GraphLink, GraphNode, KnowledgeGraphData } from '@/types/graph';
import type { GraphExplorerPathResponseDto } from '@/types/graphExplorerApi';

const ZOOM_PADDING = 60;
const ZOOM_DURATION_MS = 500;
const FOCUS_ZOOM = 2.35;

function useContainerDimensions(myRef: React.RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const read = () => ({
      width: myRef.current?.offsetWidth ?? 0,
      height: myRef.current?.offsetHeight ?? 0,
    });
    const ro = new ResizeObserver(() => setDimensions(read()));
    if (myRef.current) {
      setDimensions(read());
      ro.observe(myRef.current);
    }
    const onWin = () => setDimensions(read());
    window.addEventListener('resize', onWin);
    return () => {
      window.removeEventListener('resize', onWin);
      ro.disconnect();
    };
  }, [myRef]);
  return dimensions;
}

function graphLayoutKey(g: KnowledgeGraphData): string {
  if (!g.nodes.length) return '0|0';
  const ids = g.nodes.map((n) => n.id).sort().join(',');
  const es = g.links
    .map((l) => `${nodeIdOf(l.source)}>${nodeIdOf(l.target)}`)
    .sort()
    .join(',');
  return `${g.nodes.length}|${g.links.length}|${ids.slice(0, 2000)}|${es.slice(0, 2000)}`;
}

export interface KnowledgeGraphViewerProps {
  data: KnowledgeGraphData;
  onNodeClick?: (node: GraphNode, event: MouseEvent) => void;
  onNodeDoubleClick?: (node: GraphNode) => void;
  selectedNodeId?: string | null;
  maxNodes?: number;
  compactLayout?: boolean;
  /** Tab from researcher portal — nodes that do not belong to the tab are dimmed (overview = no extra dim). */
  tabFilter?: ResearcherGraphTabView | null;
  /** Neo4j mode: show relation labels and directional arrows on links. */
  showDirectedLinks?: boolean;
  /** Override center message when the graph has no nodes. */
  emptyStateMessage?: string;
  emptyStateHint?: string;
  pinnedNodeId?: string | null;
  shortestPathData?: GraphExplorerPathResponseDto | null;
}

type GraphLinkEdge = GraphLink & {
  source: string | GraphNode;
  target: string | GraphNode;
};

const KnowledgeGraphViewer: React.FC<KnowledgeGraphViewerProps> = ({
  data,
  onNodeClick,
  onNodeDoubleClick,
  selectedNodeId,
  maxNodes = 100,
  compactLayout = true,
  tabFilter = 'overview',
  showDirectedLinks = false,
  emptyStateMessage,
  emptyStateHint,
  pinnedNodeId,
  shortestPathData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerDimensions(containerRef);
  const fgRef = useRef<ForceGraphMethods<GraphNode, GraphLinkEdge>>();

  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [clickPulseId, setClickPulseId] = useState<string | null>(null);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastNodeClickRef = useRef<{ id: string; at: number } | null>(null);

  // RAF-throttled tooltip position via DOM mutation; avoids React re-render storm during hover.
  const tooltipRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const tooltipRafRef = useRef<number | null>(null);

  const cleanData = useMemo(() => buildGraphDataSafe(data, maxNodes), [data, maxNodes]);
  const neighbors = useMemo(() => buildNeighborMap(cleanData), [cleanData]);
  const topHubIds = useMemo(() => computeTopHubIds(cleanData, neighbors), [cleanData, neighbors]);

  const layoutKey = useMemo(() => graphLayoutKey(cleanData), [cleanData]);
  const pendingZoomRef = useRef(true);
  /** When true the user has manually panned/zoomed → suppress automatic zoomToFit. */
  const userInteractedRef = useRef(false);
  useEffect(() => {
    pendingZoomRef.current = true;
    userInteractedRef.current = false;
  }, [layoutKey, width, height]);

  /** Selection from parent (e.g. auto-pick) does not fire `onNodeClick` — refocus after sim assigns x/y on same node refs as `cleanData`. */
  useEffect(() => {
    if (!selectedNodeId || cleanData.nodes.length === 0) return;
    const t = window.setTimeout(() => {
      const fg = fgRef.current;
      const n = cleanData.nodes.find((x) => x.id === selectedNodeId);
      if (fg && n && typeof n.x === 'number' && typeof n.y === 'number') {
        try {
          fg.centerAt(n.x, n.y, 420);
          fg.zoom(FOCUS_ZOOM, 520);
        } catch {
          /* ignore */
        }
      }
    }, 200);
    return () => clearTimeout(t);
  }, [selectedNodeId, layoutKey, cleanData.nodes]);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg || cleanData.nodes.length === 0) return;

    const force = adaptiveForceParams(cleanData.nodes.length, compactLayout);

    const linkForce = fg.d3Force('link') as unknown as {
      distance?: (d: number | ((link: GraphLinkEdge) => number)) => unknown;
    } | undefined;
    if (linkForce?.distance) linkForce.distance(force.linkDistance);

    /* Avoid importing `d3-force` (optional dep — missing install breaks Vite). */
    const charge = fg.d3Force('charge') as unknown as { strength?: (v: number) => unknown } | undefined;
    if (charge?.strength) charge.strength(force.charge);

    /* Try to register collide force if d3-force expose is available; ignore otherwise. */
    const existingCollide = fg.d3Force('collide') as unknown as { radius?: (v: number) => unknown } | undefined;
    if (existingCollide?.radius) existingCollide.radius(force.collideRadius);

    fg.d3ReheatSimulation();
  }, [layoutKey, cleanData.nodes.length, compactLayout, width, height]);

  const runZoomToFit = useCallback(() => {
    const fg = fgRef.current;
    if (!fg || cleanData.nodes.length === 0) return;
    if (userInteractedRef.current) return; // user took control → don't fight them
    try { fg.zoomToFit(ZOOM_DURATION_MS, ZOOM_PADDING); } catch { /* ignore */ }
  }, [cleanData.nodes.length]);

  const onEngineStop = useCallback(() => {
    if (!pendingZoomRef.current) return;
    pendingZoomRef.current = false;
    requestAnimationFrame(runZoomToFit);
  }, [runZoomToFit]);

  /** Mark user interaction so subsequent `zoomToFit` is suppressed. */
  const markUserInteracted = useCallback(() => {
    userInteractedRef.current = true;
  }, []);

  const handleNodeClick = useCallback(
    (graphNode: GraphNode, event: MouseEvent) => {
      const now = Date.now();
      const last = lastNodeClickRef.current;
      const isDouble =
        Boolean(onNodeDoubleClick) &&
        last &&
        last.id === graphNode.id &&
        now - last.at < 450;

      if (isDouble) {
        lastNodeClickRef.current = null;
        onNodeDoubleClick?.(graphNode);
      } else {
        lastNodeClickRef.current = { id: graphNode.id, at: now };
      }

      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      setClickPulseId(graphNode.id);
      pulseTimerRef.current = setTimeout(() => { setClickPulseId(null); pulseTimerRef.current = null; }, 480);
      onNodeClick?.(graphNode, event);
      if (fgRef.current && graphNode.x !== undefined && graphNode.y !== undefined) {
        fgRef.current.centerAt(graphNode.x, graphNode.y, 480);
        fgRef.current.zoom(FOCUS_ZOOM + 0.15, 560);
      }
    },
    [onNodeClick, onNodeDoubleClick],
  );

  const linkLabel = useCallback(
    (link: GraphLinkEdge) => {
      if (!showDirectedLinks) return '';
      const t = link.type?.trim();
      return t && t.length <= 28 ? t : t ? `${t.slice(0, 25)}…` : '';
    },
    [showDirectedLinks],
  );

  const handleNodeHover = useCallback((node: GraphNode | null) => setHoverNode(node), []);

  const isLinkInShortestPath = useCallback(
    (s: string, t: string) => {
      if (!shortestPathData || !shortestPathData.pathFound || !shortestPathData.links) return false;
      return shortestPathData.links.some(
        (l) => (l.source === s && l.target === t) || (l.source === t && l.target === s),
      );
    },
    [shortestPathData],
  );

  /* ── link styling: lighter, thinner ─────────────────────────────── */

  /** Phase 1: edge color follows tier of farther endpoint to focus; LOD hides Tier 3 at low zoom. */
  const getLinkColor = useCallback(
    (link: GraphLinkEdge) => {
      const s = nodeIdOf(link.source);
      const t = nodeIdOf(link.target);

      if (isLinkInShortestPath(s, t)) return 'rgba(59, 130, 246, 0.95)'; // bright blue

      const activeId = hoverNode?.id ?? selectedNodeId;
      if (!activeId) return link.color || 'rgba(148, 163, 184, 0.35)';
      
      const incident = s === activeId || t === activeId;
      if (incident) return 'rgba(71, 85, 105, 0.78)';
      
      const isPinnedIncident = pinnedNodeId && (s === pinnedNodeId || t === pinnedNodeId);
      if (isPinnedIncident) return 'rgba(71, 85, 105, 0.5)';

      // 2-hop edges: subtle
      const oneHop = neighbors.get(activeId);
      if (oneHop && (oneHop.has(s) || oneHop.has(t))) return 'rgba(148, 163, 184, 0.28)';
      return 'rgba(203, 213, 225, 0.16)';
    },
    [hoverNode, selectedNodeId, pinnedNodeId, neighbors, isLinkInShortestPath],
  );

  const getLinkWidth = useCallback(
    (link: unknown) => {
      const edge = link as GraphLinkEdge;
      const s = nodeIdOf(edge.source);
      const t = nodeIdOf(edge.target);

      if (isLinkInShortestPath(s, t)) return 2.6;

      const strength = Math.max(0.5, Math.min(3, (edge.value ?? 1) * 0.8));
      const activeId = hoverNode?.id ?? selectedNodeId;
      if (!activeId) return strength;
      
      if (s === activeId || t === activeId) return Math.max(strength, 1.6);
      if (pinnedNodeId && (s === pinnedNodeId || t === pinnedNodeId)) return Math.max(strength, 1.25);
      
      const oneHop = neighbors.get(activeId);
      if (oneHop && (oneHop.has(s) || oneHop.has(t))) return Math.max(0.6, strength * 0.6);
      return 0.35;
    },
    [hoverNode, selectedNodeId, pinnedNodeId, neighbors, isLinkInShortestPath],
  );

  /* ── node painting ──────────────────────────────────────────────── */

  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale?: number) => {
      const degree = neighbors.get(node.id)?.size ?? 0;
      const r = clampedVisualRadius(node, degree);
      const nx = node.x ?? 0;
      const ny = node.y ?? 0;

      const scale = (typeof globalScale === 'number' && globalScale > 0) ? globalScale : 1;

      const isPinned = pinnedNodeId === node.id;
      const isInPath =
        shortestPathData?.pathFound &&
        shortestPathData.nodes.some((n) => n.id === node.id);

      const isHovered = hoverNode?.id === node.id;
      const isSelected = selectedNodeId === node.id;
      const isPulse = clickPulseId === node.id;
      const activeId = hoverNode?.id ?? selectedNodeId;
      const matchesTab =
        tabFilter == null || tabFilter === 'overview' || tabMatchesViewerType(tabFilter, node.type);

      // 4-tier alpha: focus(0)=1, neighbor(1)=0.85, 2-hop(2)=0.35, unrelated(3)=0.08.
      let tier: FocusTier = activeId ? getNodeFocusTier(node.id, activeId, neighbors) : 0;
      if (!matchesTab && !isHovered && !isSelected) {
        // Off-tab nodes always render heavily dimmed (cap at tier 3) but stay on canvas.
        tier = 3;
      }
      const alpha = isHovered || isSelected || isPinned || isInPath ? 1 : tierAlpha(tier);
      ctx.globalAlpha = alpha;

      if (isPinned) {
        ctx.beginPath();
        ctx.arc(nx, ny, r + 5.5 / scale, 0, 2 * Math.PI);
        ctx.strokeStyle = '#d97706'; // amber-600
        ctx.lineWidth = 2.5 / scale;
        ctx.stroke();
      }

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(nx, ny, r + 3.5 / scale, 0, 2 * Math.PI);
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2.2 / scale;
        ctx.setLineDash([4 / scale, 3 / scale]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (isInPath) {
        ctx.beginPath();
        ctx.arc(nx, ny, r + 3.5 / scale, 0, 2 * Math.PI);
        ctx.strokeStyle = '#3b82f6'; // blue-500
        ctx.lineWidth = 2.0 / scale;
        ctx.setLineDash([3 / scale, 2 / scale]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (isPulse) {
        ctx.beginPath();
        ctx.arc(nx, ny, r + 7 / scale, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.35)';
        ctx.lineWidth = 1.6 / scale;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(nx, ny, r, 0, 2 * Math.PI);
      ctx.fillStyle = nodeColor(node);
      ctx.fill();
      ctx.strokeStyle = isSelected || isPulse || isInPath ? '#2563eb' : isPinned ? '#d97706' : 'rgba(255,255,255,0.85)';
      ctx.lineWidth = (isSelected || isPulse || isInPath || isPinned ? 2 : 1) / scale;
      ctx.stroke();

      // Adaptive label: focus / hover / top-K hubs only (no static degree threshold).
      const showLabel = shouldRenderNodeLabel({
        nodeId: node.id,
        focusId: selectedNodeId ?? null,
        hoverId: hoverNode?.id ?? null,
        topHubIds,
        scale: scale,
      });
      if (showLabel) {
        const maxLen = isHovered || isSelected ? CANVAS_LABEL_MAX_LEN_ACTIVE : CANVAS_LABEL_MAX_LEN;
        const fontSize = 11 / scale;
        ctx.font = `${isHovered || isSelected ? '600 ' : ''}${fontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = isHovered || isSelected ? '#0f172a' : tier >= 2 ? '#94a3b8' : '#475569';
        ctx.shadowColor = 'rgba(255,255,255,0.9)';
        ctx.shadowBlur = 3;
        ctx.fillText(truncateLabel(node.name, maxLen), nx, ny + r + 2);
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1;
    },
    [hoverNode, selectedNodeId, clickPulseId, neighbors, tabFilter, topHubIds],
  );

  /* ── pointer area: larger than visual node for easier clicking ──── */

  /**
   * Phase 5: low-zoom cluster overlays — when zoomed out, draw a translucent disc per
   * entity-type cluster so researchers can read graph macrostructure at a glance.
   */
  const renderClusterHullsPre = useCallback(
    (ctx: CanvasRenderingContext2D, globalScale?: number) => {
      const scale = (typeof globalScale === 'number' && globalScale > 0) ? globalScale : 1;
      if (scale > 0.45) return;
      const nodes = cleanData.nodes;
      if (nodes.length < 8) return;
      type Bucket = { sx: number; sy: number; n: number; nodes: typeof nodes };
      const groups = new Map<string, Bucket>();
      for (const n of nodes) {
        if (typeof n.x !== 'number' || typeof n.y !== 'number') continue;
        const key = n.type;
        const g = groups.get(key) ?? { sx: 0, sy: 0, n: 0, nodes: [] as typeof nodes };
        g.sx += n.x;
        g.sy += n.y;
        g.n += 1;
        g.nodes.push(n);
        groups.set(key, g);
      }
      for (const [type, g] of groups) {
        if (g.n < 3) continue;
        const cx = g.sx / g.n;
        const cy = g.sy / g.n;
        let maxR = 0;
        for (const n of g.nodes) {
          const dx = (n.x ?? cx) - cx;
          const dy = (n.y ?? cy) - cy;
          const r = Math.hypot(dx, dy);
          if (r > maxR) maxR = r;
        }
        const padding = 18 / scale;
        const baseColor =
          colorMap[type as keyof typeof colorMap] || '#94a3b8';
        ctx.beginPath();
        ctx.arc(cx, cy, maxR + padding, 0, Math.PI * 2);
        ctx.fillStyle = `${baseColor}22`;
        ctx.strokeStyle = `${baseColor}66`;
        ctx.lineWidth = 1.5 / scale;
        ctx.fill();
        ctx.stroke();

        const labelFontSize = 11 / scale;
        ctx.font = `600 ${labelFontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#0f172a';
        ctx.shadowColor = 'rgba(255,255,255,0.85)';
        ctx.shadowBlur = 4;
        const label = TYPE_LABELS[type] ?? type;
        ctx.fillText(`${label} · ${g.n}`, cx, cy - (maxR + padding) - 4 / scale);
        ctx.shadowBlur = 0;
      }
    },
    [cleanData.nodes],
  );

  const paintPointerArea = useCallback(
    (node: GraphNode, paintColor: string, ctx: CanvasRenderingContext2D, globalScale?: number) => {
      if (typeof node.x !== 'number' || typeof node.y !== 'number') return;
      const degree = neighbors.get(node.id)?.size ?? 0;
      const r = clampedVisualRadius(node, degree);
      const scale = (typeof globalScale === 'number' && globalScale > 0) ? globalScale : 1;
      const hitR = Math.max(r + 6 / scale, 10 / scale);
      
      if (Number.isFinite(hitR) && hitR > 0) {
        ctx.fillStyle = paintColor;
        ctx.beginPath();
        ctx.arc(node.x, node.y, hitR, 0, 2 * Math.PI);
        ctx.fill();
      }
    },
    [neighbors],
  );

  /** Apply the latest pointer position to the tooltip via direct DOM mutation. */
  const applyTooltipPos = useCallback(() => {
    tooltipRafRef.current = null;
    const el = tooltipRef.current;
    const cont = containerRef.current;
    if (!el || !cont) return;
    const tw = el.offsetWidth || 200;
    const th = el.offsetHeight || 100;
    const cw = cont.offsetWidth || 1;
    const ch = cont.offsetHeight || 1;
    const pad = 8;
    const offset = 12;
    const left = Math.min(mousePosRef.current.x + offset, Math.max(pad, cw - tw - pad));
    const top = Math.min(mousePosRef.current.y + offset, Math.max(pad, ch - th - pad));
    el.style.transform = `translate3d(${left}px, ${top}px, 0)`;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mousePosRef.current = { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
    if (tooltipRafRef.current != null) return;
    tooltipRafRef.current = requestAnimationFrame(applyTooltipPos);
  }, [applyTooltipPos]);

  /** Position the tooltip immediately when hover starts (mount). */
  useLayoutEffect(() => {
    if (!hoverNode) return;
    applyTooltipPos();
  }, [hoverNode, applyTooltipPos]);

  useEffect(
    () => () => {
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      if (tooltipRafRef.current != null) cancelAnimationFrame(tooltipRafRef.current);
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-0 bg-slate-50 relative rounded-xl border border-slate-200 overflow-hidden"
      onMouseMove={handleMouseMove}
      onWheel={markUserInteracted}
      onPointerDown={markUserInteracted}
    >
      {width > 0 && height > 0 && cleanData.nodes.length > 0 && (
        <ForceGraph2D
          ref={fgRef}
          width={width}
          height={height}
          graphData={cleanData}
          nodeColor={nodeColor}
          nodeVal={nodeSize}
          nodeCanvasObjectMode="replace"
          nodeCanvasObject={paintNode}
          nodePointerAreaPaint={paintPointerArea}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          linkColor={getLinkColor}
          linkWidth={getLinkWidth}
          linkLabel={showDirectedLinks ? linkLabel : undefined}
          linkDirectionalArrowLength={showDirectedLinks ? 4 : 0}
          linkDirectionalArrowRelPos={1}
          linkDirectionalParticles={0}
          d3VelocityDecay={0.38}
          d3AlphaDecay={0.045}
          warmupTicks={50}
          cooldownTicks={90}
          onEngineStop={onEngineStop}
          onRenderFramePre={renderClusterHullsPre}
          enableNodeDrag
          minZoom={0.3}
          maxZoom={10}
        />
      )}

      {hoverNode && (
        <div
          ref={tooltipRef}
          className="absolute top-0 left-0 z-10 pointer-events-none bg-white/95 shadow-md rounded-lg px-3 py-2.5 border border-slate-100 flex flex-col min-w-[180px] max-w-[260px] will-change-transform"
          style={{ transform: 'translate3d(0,0,0)' }}
          role="tooltip"
        >
          <div className="flex items-start gap-2">
            {hoverNode.imgUrl && (
              <img
                src={hoverNode.imgUrl}
                alt=""
                className="w-9 h-9 rounded object-cover border border-slate-100 shrink-0"
                onLoad={applyTooltipPos}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                {TYPE_LABELS[hoverNode.type] || hoverNode.type}
              </p>
              <p className="font-semibold text-slate-800 text-[13px] leading-snug break-words">{hoverNode.name}</p>
            </div>
          </div>
          <div className="mt-1.5 pt-1 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
            <span>{neighbors.get(hoverNode.id)?.size ?? 0} liên kết</span>
            <span className="text-blue-500 font-medium">Nhấn để xem</span>
          </div>
        </div>
      )}

      {cleanData.nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none px-6 text-center">
          <svg className="w-10 h-10 mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
          <p className="text-sm font-medium text-slate-500">
            {emptyStateMessage ?? 'Không có dữ liệu'}
          </p>
          {emptyStateHint ? (
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">{emptyStateHint}</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraphViewer;
