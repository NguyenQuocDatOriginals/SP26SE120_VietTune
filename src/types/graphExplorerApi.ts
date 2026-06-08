/**
 * Neo4j GraphExplorer REST payloads (`Application.DTOs`).
 * @see backend/VietTuneArchive.Application/DTOs/GraphExplorerDtos.cs
 */

export interface GraphExplorerNodeDto {
  id: string;
  /** GUID gốc từ Neo4j (chỉ có khi node được tạo từ shortest-path response). */
  backendId?: string;
  label: string;
  group: string;
}

export interface GraphExplorerLinkDto {
  source: string;
  target: string;
  type: string;
}

export interface GraphExplorerResponseDto {
  nodes: GraphExplorerNodeDto[];
  links: GraphExplorerLinkDto[];
}

// ── Node Detail ──────────────────────────────────────────────────────────────

/** Một neighbor trong danh sách kề của node (GET /api/graph-explorer/node/{id}). */
export interface GraphExplorerNeighborSummaryDto {
  id: string;
  label: string;
  group: string;
  /** Tên quan hệ Neo4j, e.g. "ETHNIC_GROUP_HAS_INSTRUMENT". */
  relationType: string;
  /** Chiều của quan hệ tính từ node được query. */
  direction: 'IN' | 'OUT';
}

/** Response từ GET /api/graph-explorer/node/{id}. */
export interface GraphExplorerNodeDetailDto {
  id: string;
  label: string;
  /** Neo4j label, e.g. "EthnicGroup" | "Instrument" | "Ceremony". */
  group: string;
  /** Các thuộc tính bổ sung từ Neo4j node (tuỳ entity type). */
  properties?: Record<string, unknown>;
  /** Tổng số edges kề (in + out). */
  degreeCount: number;
  neighbors: GraphExplorerNeighborSummaryDto[];
}

// ── Shortest Path ────────────────────────────────────────────────────────────

/** Response từ GET /api/graph-explorer/shortest-path. */
export interface GraphExplorerPathResponseDto {
  pathFound: boolean;
  /** Số edges trên đường đi ngắn nhất (undefined khi pathFound = false). */
  pathLength?: number;
  /** Nodes theo thứ tự trên path (empty khi pathFound = false). */
  nodes: GraphExplorerNodeDto[];
  /** Links theo thứ tự trên path (empty khi pathFound = false). */
  links: GraphExplorerLinkDto[];
}

// ── Top Connected & Common Points ─────────────────────────────────────────────

export interface ConnectedNodeRankDto {
  id: string;
  label: string;
  group: string;
  degreeCount: number;
}

export interface TopConnectedNodesResponseDto {
  group?: string;
  limit: number;
  rankList: ConnectedNodeRankDto[];
}

export interface CommonPointsResponseDto {
  nodeId1: string;
  nodeId2: string;
  maxDepth: number;
  commonNodesCount: number;
  nodes: GraphExplorerNodeDto[];
  links: GraphExplorerLinkDto[];
}
