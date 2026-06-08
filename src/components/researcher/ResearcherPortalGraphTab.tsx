import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useGraphShortestPath } from '@/features/knowledge-graph/hooks/useGraphShortestPath';
import GraphNodeDetailPanel from '@/features/knowledge-graph/components/GraphNodeDetailPanel';
import KnowledgeGraphViewer from '@/features/knowledge-graph/components/KnowledgeGraphViewer';
import { useKnowledgeGraphController } from '@/features/knowledge-graph/hooks/useKnowledgeGraphController';
import {
  nodeMatchesListSelection,
  viewerTypeToApiEntityType,
} from '@/features/knowledge-graph/utils/researcherGraphUx';
import type { Recording } from '@/types';
import type { KnowledgeGraphData } from '@/types/graph';

const TAB_CLASS =
  'px-2.5 py-1.5 rounded-lg font-medium text-xs cursor-pointer transition-colors whitespace-nowrap';
const TAB_ACTIVE = 'bg-primary-600 text-white shadow-sm';
const TAB_IDLE = 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200';

const TYPE_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'EthnicGroup', label: 'Dân tộc' },
  { value: 'Instrument', label: 'Nhạc cụ' },
  { value: 'Ceremony', label: 'Nghi lễ' },
  { value: 'Recording', label: 'Bản thu' },
  { value: 'Province', label: 'Địa phương' },
];

export interface ResearcherPortalGraphTabProps {
  fallbackGraphData: KnowledgeGraphData;
  approvedRecordings: Recording[];
  onRecordingDetail: (recording: Recording) => void;
}

export default function ResearcherPortalGraphTab({
  fallbackGraphData,
  approvedRecordings: _approvedRecordings,
  onRecordingDetail: _onRecordingDetail,
}: ResearcherPortalGraphTabProps) {
  const ctrl = useKnowledgeGraphController({ fallbackGraphData });

  const selectedNode = ctrl.selectedNodeId
    ? ctrl.displayGraph.nodes.find((n) => n.id === ctrl.selectedNodeId)
    : null;

  let selectedEntityId: string | null = null;
  if (selectedNode) {
    selectedEntityId = selectedNode.entityId ?? selectedNode.backendId ?? null;
  } else if (ctrl.selectedNodeId) {
    const idx = ctrl.selectedNodeId.indexOf(':');
    selectedEntityId = idx !== -1 ? ctrl.selectedNodeId.slice(idx + 1) : ctrl.selectedNodeId;
  }

  const pinnedNode = ctrl.pinnedNodeId
    ? ctrl.displayGraph.nodes.find((n) => n.id === ctrl.pinnedNodeId)
    : null;

  let pinnedEntityId: string | null = null;
  if (pinnedNode) {
    pinnedEntityId = pinnedNode.entityId ?? pinnedNode.backendId ?? null;
  } else if (ctrl.pinnedNodeId) {
    const idx = ctrl.pinnedNodeId.indexOf(':');
    pinnedEntityId = idx !== -1 ? ctrl.pinnedNodeId.slice(idx + 1) : ctrl.pinnedNodeId;
  }

  const { data: shortestPathData, isLoading: shortestPathLoading, error: shortestPathError } =
    useGraphShortestPath(pinnedEntityId, selectedEntityId);

  const neo4jSearchErrorBanner = ctrl.neo4jSearchError ? (
    <p className="text-xs text-red-600 bg-red-50/80 border border-red-200 rounded-lg px-3 py-1.5 mb-2">
      {ctrl.neo4jSearchError}
    </p>
  ) : null;

  const neo4jExpandErrorBanner = ctrl.neo4jExpandError ? (
    <p className="text-xs text-red-600 bg-red-50/80 border border-red-200 rounded-lg px-3 py-1.5 mb-2">
      {ctrl.neo4jExpandError}
    </p>
  ) : null;

  const neo4jHintBanner = ctrl.displayGraph.nodes.length === 0 ? (
    <p className="text-xs text-cyan-900 bg-cyan-50/90 border border-cyan-200 rounded-lg px-3 py-1.5 mb-2">
      Nhập từ khóa thực thể (tối thiểu 2 ký tự) ở cột trái để tìm kiếm trên Neo4j. Click chọn thực thể từ danh sách để khởi tạo đồ thị.
    </p>
  ) : null;

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-3">
      <div className="rounded-2xl border border-secondary-200/50 bg-gradient-to-br from-surface-panel via-cream-50/80 to-secondary-50/50 shadow-sm backdrop-blur-sm p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-base sm:text-lg font-semibold text-primary-800">Biểu đồ tri thức (Neo4j)</h2>
          <button
            type="button"
            onClick={ctrl.refreshAll}
            disabled={ctrl.busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary-300 bg-white px-3 py-1.5 text-xs font-semibold text-primary-800 shadow-sm hover:bg-primary-50 disabled:opacity-60"
          >
            {ctrl.busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            )}
            Làm mới
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3" role="tablist" aria-label="Chế độ đồ thị">
          {(
            [
              ['overview', 'Tổng quan'],
              ['instruments', 'Nhạc cụ'],
              ['ethnicity', 'Dân tộc'],
              ['ceremony', 'Nghi lễ'],
              ['recordings', 'Bản thu'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={ctrl.graphView === id}
              className={`${TAB_CLASS} ${ctrl.graphView === id ? TAB_ACTIVE : TAB_IDLE}`}
              onClick={() => ctrl.setGraphView(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {neo4jSearchErrorBanner}
        {neo4jExpandErrorBanner}
        {neo4jHintBanner}

        <div className="flex gap-3 mt-3">
          {ctrl.leftOpen ? (
            <aside className="w-[11.5rem] shrink-0 rounded-xl border border-neutral-200/80 bg-white/90 p-2 flex flex-col max-h-[min(500px,64vh)]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={ctrl.listQuery}
                    onChange={(e) => ctrl.setListQuery(e.target.value)}
                    placeholder="Tìm thực thể..."
                    className="w-full rounded-md border border-neutral-200 bg-white py-1.5 pl-7 pr-2 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none"
                    aria-label="Tìm thực thể Neo4j"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => ctrl.setLeftOpen(false)}
                  className="ml-1 p-1 rounded hover:bg-neutral-100 text-neutral-400"
                  title="Thu gọn"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
              <select
                value={ctrl.typeFilter}
                onChange={(e) => ctrl.setTypeFilter(e.target.value)}
                title="Lọc theo loại thực thể"
                className="mb-1.5 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700"
              >
                {TYPE_FILTER_OPTIONS.map((o) => (
                  <option key={o.value || '_'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ul className="flex-1 overflow-y-auto space-y-px text-xs min-h-[80px]">
                {ctrl.debouncedListQuery.trim().length === 0 &&
                ctrl.listNodesFromGraph.length === 0 ? (
                  <li className="text-neutral-500 text-[11px] px-2 py-2 leading-relaxed">
                    Nhập ít nhất 2 ký tự để tìm trên Neo4j, chọn kết quả để khởi tạo đồ thị.
                  </li>
                ) : ctrl.debouncedListQuery.trim().length > 0 &&
                  ctrl.debouncedListQuery.trim().length < 2 ? (
                  <li className="text-neutral-500 text-[11px] px-2 py-2">
                    Nhập thêm ký tự để tìm kiếm.
                  </li>
                ) : ctrl.debouncedListQuery.trim().length >= 2 ? (
                  ctrl.neo4jSearchLoading ? (
                    <li className="flex items-center gap-1.5 text-neutral-400 py-3 px-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                      Đang tìm (Neo4j)...
                    </li>
                  ) : ctrl.neo4jSearchError ? (
                    <li className="text-red-500 text-[11px] px-2 py-2">{ctrl.neo4jSearchError}</li>
                  ) : !ctrl.neo4jSearchResults.length ? (
                    <li className="text-neutral-400 text-[11px] px-2 py-2">
                      Không có kết quả. Thử bộ lọc khác.
                    </li>
                  ) : (
                    ctrl.neo4jSearchResults.map((hit) => {
                      const viewerNodeId = `${hit.group}:${hit.id}`;
                      const active =
                        ctrl.selection?.source === 'graph' &&
                        ctrl.selection.id === viewerNodeId;
                      return (
                        <li key={`${hit.group}-${hit.id}`}>
                          <button
                            type="button"
                            onClick={() => ctrl.handleNeo4jSearchResultClick(hit)}
                            className={`w-full truncate text-left px-2 py-1 rounded-md transition-colors ${
                              active
                                ? 'bg-primary-100 text-primary-900 font-semibold'
                                : 'hover:bg-neutral-50'
                            }`}
                            title={hit.label}
                          >
                            <span className="text-[9px] uppercase text-neutral-400 block leading-none mb-px">
                              {hit.group}
                            </span>
                            {hit.label}
                          </button>
                        </li>
                      );
                    })
                  )
                ) : ctrl.listNodesFromGraph.length === 0 ? (
                  <li className="text-neutral-400 text-[11px] px-2 py-2">Trống.</li>
                ) : (
                  ctrl.listNodesFromGraph.map((n) => {
                    const active = nodeMatchesListSelection(ctrl.selection, n);
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => ctrl.handleListNodeClick(n)}
                          className={`w-full truncate text-left px-2 py-1 rounded-md transition-colors ${
                            active
                              ? 'bg-primary-100 text-primary-900 font-semibold'
                              : 'hover:bg-neutral-50'
                          }`}
                          title={n.name}
                        >
                          {n.name}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </aside>
          ) : (
            <button
              type="button"
              onClick={() => ctrl.setLeftOpen(true)}
              className="shrink-0 self-start mt-1 p-1 rounded-lg border border-neutral-200 bg-white/90 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 shadow-sm"
              title="Mở danh sách"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          <section className="flex-1 min-w-0 relative min-h-[min(480px,64vh)] rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
            {ctrl.busy && (
              <div className="absolute right-2 top-2 z-20 flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[11px] text-neutral-500 shadow-sm border border-neutral-200">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                {ctrl.exploreInFlight ? 'Mở rộng...' : 'Tải...'}
              </div>
            )}

            {pinnedNode && selectedNode && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-lg bg-white/95 px-3 py-1.5 text-xs text-slate-700 shadow-md border border-slate-200/80 backdrop-blur-sm max-w-[90%]">
                {shortestPathLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500 shrink-0" />
                    <span>
                      Đang tìm đường đi giữa <strong>{pinnedNode.name}</strong> và{' '}
                      <strong>{selectedNode.name}</strong>...
                    </span>
                  </>
                ) : shortestPathError ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span className="text-red-600 font-medium">Lỗi: {shortestPathError}</span>
                  </>
                ) : shortestPathData?.pathFound ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>
                      Đường đi giữa <strong>{pinnedNode.name}</strong> và{' '}
                      <strong>{selectedNode.name}</strong>:{' '}
                      <span className="font-semibold text-blue-600">
                        {shortestPathData.pathLength} bước
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => ctrl.setPinnedNodeId(null)}
                      className="ml-2 hover:text-red-500 text-slate-400 font-medium"
                      title="Bỏ ghim"
                    >
                      Bỏ ghim
                    </button>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>
                      Không tìm thấy đường đi giữa <strong>{pinnedNode.name}</strong> và{' '}
                      <strong>{selectedNode.name}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => ctrl.setPinnedNodeId(null)}
                      className="ml-2 hover:text-red-500 text-slate-400 font-medium"
                      title="Bỏ ghim"
                    >
                      Bỏ ghim
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="w-full h-[min(560px,68vh)] min-h-[min(420px,55vh)] pt-9">
              <KnowledgeGraphViewer
                data={ctrl.displayGraph}
                onNodeClick={ctrl.handleGraphNodeClick}
                onNodeDoubleClick={ctrl.handleGraphNodeDoubleClick}
                selectedNodeId={ctrl.selectedNodeId}
                pinnedNodeId={ctrl.pinnedNodeId}
                shortestPathData={shortestPathData}
                maxNodes={100}
                compactLayout={false}
                tabFilter={ctrl.graphView}
                showDirectedLinks={true}
                emptyStateMessage="Chưa có đồ thị Neo4j"
                emptyStateHint="Tìm kiếm thực thể ở cột bên trái và chọn một kết quả để khởi tạo đồ thị. Nhấp đúp vào nút để mở rộng quan hệ."
              />
            </div>
          </section>

          <aside className="w-44 shrink-0 rounded-xl border border-neutral-200/80 bg-white/95 p-2.5 flex flex-col gap-2 min-h-[200px] max-h-[min(500px,64vh)] overflow-y-auto">
            <h3 className="text-xs font-semibold text-primary-800 border-b border-neutral-100 pb-1.5">
              Chi tiết
            </h3>
            {!ctrl.selection ? (
              <p className="text-xs text-neutral-400">Chọn nút trên đồ thị.</p>
            ) : (
              <div className="text-xs space-y-1.5">
                <p className="font-semibold text-neutral-900 break-words leading-snug">
                  {ctrl.selection.source === 'graph' ? ctrl.selection.label : ctrl.selection.name}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {ctrl.selection.source === 'graph'
                    ? ctrl.selection.apiEntityType
                    : viewerTypeToApiEntityType(ctrl.selection.viewerType)}
                </p>
                {ctrl.selection.source === 'graph' && (
                  <p className="text-[11px] text-cyan-800 bg-cyan-50/80 border border-cyan-100 rounded-md px-2 py-1.5">
                    Nhấp đúp nút trên đồ thị để mở rộng lân cận (1-hop).
                  </p>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-neutral-200/80 bg-white/80 px-4 py-2 text-[11px] text-neutral-600">
        <Stat label="Nút hiển thị" value={ctrl.displayGraph.nodes.length} />
        <Stat label="Cạnh hiển thị" value={ctrl.displayGraph.links.length} />
      </div>

      <GraphNodeDetailPanel
        nodeId={selectedEntityId}
        nodeName={selectedNode?.name}
        nodeGroup={selectedNode?.apiEntityType}
        onClose={ctrl.clearSelection}
        onExpandNode={selectedNode ? () => ctrl.handleGraphNodeDoubleClick(selectedNode) : undefined}
        onPinForPath={selectedNode ? () => ctrl.setPinnedNodeId(selectedNode.id) : undefined}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <span>
      <span className="text-neutral-400">{label}</span>{' '}
      <span className="font-semibold text-neutral-800">{value}</span>
    </span>
  );
}
