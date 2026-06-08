import { ChevronDown, ChevronUp, GitMerge, Loader2, Network, X } from 'lucide-react';
import React, { useState } from 'react';

import { useGraphNodeDetail } from '@/features/knowledge-graph/hooks/useGraphNodeDetail';
import { TYPE_LABELS } from '@/features/knowledge-graph/utils/graphViewerHelpers';
import { neo4jGroupToViewerType } from '@/features/knowledge-graph/utils/graphExplorerAdapter';
import { formatRelationType } from '@/constants/relationLabels';
import type { GraphExplorerNeighborSummaryDto } from '@/types/graphExplorerApi';
import type { GraphNodeType } from '@/types/graph';

const NEIGHBORS_PER_GROUP_DEFAULT = 5;

const TYPE_COLORS: Record<string, string> = {
  ethnic_group: 'bg-red-100 text-red-800 border-red-200',
  instrument: 'bg-blue-100 text-blue-800 border-blue-200',
  ceremony: 'bg-violet-100 text-violet-800 border-violet-200',
  recording: 'bg-slate-100 text-slate-700 border-slate-200',
  province: 'bg-amber-100 text-amber-800 border-amber-200',
  vocal_style: 'bg-purple-100 text-purple-800 border-purple-200',
  musical_scale: 'bg-lime-100 text-lime-800 border-lime-200',
  tag: 'bg-gray-100 text-gray-700 border-gray-200',
};

function getTypeBadgeClass(group: string): string {
  const viewerType = neo4jGroupToViewerType(group) as GraphNodeType;
  return TYPE_COLORS[viewerType] ?? 'bg-neutral-100 text-neutral-700 border-neutral-200';
}

interface NeighborGroupProps {
  relationType: string;
  neighbors: GraphExplorerNeighborSummaryDto[];
}

function NeighborGroup({ relationType, neighbors }: NeighborGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? neighbors : neighbors.slice(0, NEIGHBORS_PER_GROUP_DEFAULT);
  const hasMore = neighbors.length > NEIGHBORS_PER_GROUP_DEFAULT;
  const label = formatRelationType(relationType);

  return (
    <div className="border border-neutral-100 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-neutral-50">
        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide truncate">
          {label}
        </span>
        <span className="text-[10px] font-medium text-neutral-400 shrink-0 ml-1">
          {neighbors.length}
        </span>
      </div>
      <ul className="divide-y divide-neutral-50">
        {visible.map((nb) => {
          const viewerType = neo4jGroupToViewerType(nb.group);
          const typeLabel = TYPE_LABELS[viewerType] ?? nb.group;
          return (
            <li
              key={`${nb.id}-${nb.direction}`}
              className="px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-neutral-50/80 transition-colors"
            >
              <span
                className={`inline-flex items-center shrink-0 rounded border px-1 py-px text-[9px] font-medium ${getTypeBadgeClass(nb.group)}`}
              >
                {typeLabel}
              </span>
              <span className="text-[11px] text-neutral-700 truncate" title={nb.label}>
                {nb.label}
              </span>
              {nb.direction === 'IN' && (
                <span className="ml-auto shrink-0 text-[9px] text-neutral-300" title="Quan hệ đến">←</span>
              )}
            </li>
          );
        })}
      </ul>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] text-neutral-400 hover:text-primary-600 hover:bg-primary-50/50 transition-colors border-t border-neutral-100"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Thu gọn
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Xem thêm ({neighbors.length - NEIGHBORS_PER_GROUP_DEFAULT})
            </>
          )}
        </button>
      )}
    </div>
  );
}

function SkeletonPanel() {
  return (
    <div className="animate-pulse space-y-3 p-3">
      <div className="h-4 bg-neutral-100 rounded w-3/4" />
      <div className="h-3 bg-neutral-100 rounded w-1/3" />
      <div className="h-px bg-neutral-100 my-2" />
      <div className="h-3 bg-neutral-100 rounded w-1/2" />
      <div className="space-y-2 mt-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-neutral-100 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export interface GraphNodeDetailPanelProps {
  /** Neo4j entityId (GUID) of the node. null = hide panel. */
  nodeId: string | null;
  nodeName?: string;
  nodeGroup?: string;
  onClose: () => void;
  onExpandNode?: () => void;
  onPinForPath?: () => void;
}

const GraphNodeDetailPanel: React.FC<GraphNodeDetailPanelProps> = ({
  nodeId,
  nodeName,
  nodeGroup,
  onClose,
  onExpandNode,
  onPinForPath,
}) => {
  const { data, isLoading, error } = useGraphNodeDetail(nodeId);
  const isVisible = Boolean(nodeId);

  // Group neighbors by relationType
  const neighborGroups = React.useMemo(() => {
    if (!data?.neighbors.length) return [];
    const map = new Map<string, GraphExplorerNeighborSummaryDto[]>();
    for (const nb of data.neighbors) {
      const key = nb.relationType || 'RELATED';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(nb);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [data?.neighbors]);

  const displayName = data?.label ?? nodeName ?? '…';
  const displayGroup = data?.group ?? nodeGroup ?? '';
  const viewerType = displayGroup ? neo4jGroupToViewerType(displayGroup) : 'recording';
  const typeBadgeClass = displayGroup ? getTypeBadgeClass(displayGroup) : 'bg-neutral-100 text-neutral-700';
  const typeLabel = TYPE_LABELS[viewerType] ?? displayGroup;

  return (
    <>
      {/* Backdrop */}
      {isVisible && (
        <div
          className="fixed inset-0 z-40 bg-black/10"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Slide Panel */}
      <div
        className={[
          'fixed top-0 right-0 bottom-0 z-50',
          'w-[min(320px,90vw)]',
          'flex flex-col',
          'bg-white border-l border-neutral-200 shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          isVisible ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        role="complementary"
        aria-label="Chi tiết thực thể"
      >
        {/* Header */}
        <div className="flex items-start gap-2 px-3 pt-3 pb-2 border-b border-neutral-100">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-neutral-900 text-[13px] leading-snug break-words">
              {displayName}
            </p>
            {displayGroup && (
              <span
                className={`mt-1 inline-flex items-center rounded border px-1.5 py-px text-[10px] font-semibold ${typeBadgeClass}`}
              >
                {typeLabel}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-1 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            title="Đóng"
            aria-label="Đóng panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <SkeletonPanel />
          ) : error ? (
            <div className="p-3">
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            </div>
          ) : data ? (
            <div className="p-3 space-y-3">
              {/* Degree */}
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <Network className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                <span>
                  <span className="font-semibold text-neutral-800">{data.degreeCount}</span>
                  {' '}kết nối
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {onExpandNode && (
                  <button
                    type="button"
                    onClick={onExpandNode}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-1.5 text-[11px] font-semibold text-primary-800 hover:bg-primary-100 transition-colors"
                  >
                    <Network className="h-3 w-3" />
                    Mở rộng
                  </button>
                )}
                {onPinForPath && (
                  <button
                    type="button"
                    onClick={onPinForPath}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-violet-800 hover:bg-violet-100 transition-colors"
                    title="Chọn làm điểm xuất phát tìm đường"
                  >
                    <GitMerge className="h-3 w-3" />
                    Tìm đường
                  </button>
                )}
              </div>

              {/* Neighbors */}
              {neighborGroups.length > 0 && (
                <div className="border-t border-neutral-100 pt-2">
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mb-2">
                    Quan hệ · {data.neighbors.length} liên kết
                  </p>
                  <div className="space-y-2">
                    {neighborGroups.map(([relationType, neighbors]) => (
                      <NeighborGroup
                        key={relationType}
                        relationType={relationType}
                        neighbors={neighbors}
                      />
                    ))}
                  </div>
                </div>
              )}

              {neighborGroups.length === 0 && (
                <p className="text-xs text-neutral-400 text-center py-4">
                  Không có quan hệ nào được ghi nhận.
                </p>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer loading */}
        {isLoading && (
          <div className="flex items-center gap-1.5 px-3 py-2 border-t border-neutral-100 text-[11px] text-neutral-400 bg-neutral-50/50">
            <Loader2 className="h-3 w-3 animate-spin text-primary-600" />
            Đang tải dữ liệu...
          </div>
        )}
      </div>
    </>
  );
};

export default GraphNodeDetailPanel;
