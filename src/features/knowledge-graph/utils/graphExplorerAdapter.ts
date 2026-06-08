import type { ApiEntityType, GraphLink, GraphNode, GraphNodeType, KnowledgeGraphData } from '@/types/graph';
import type {
  GraphExplorerLinkDto,
  GraphExplorerNodeDto,
  GraphExplorerResponseDto,
  GraphExplorerNeighborSummaryDto,
  GraphExplorerNodeDetailDto,
  GraphExplorerPathResponseDto,
} from '@/types/graphExplorerApi';

const VALID_API_ENTITY_TYPES: ReadonlySet<ApiEntityType> = new Set<ApiEntityType>([
  'EthnicGroup',
  'Instrument',
  'Ceremony',
  'Recording',
  'Province',
  'VocalStyle',
  'MusicalScale',
  'Tag',
]);

function isValidApiEntityType(value: string): value is ApiEntityType {
  return VALID_API_ENTITY_TYPES.has(value as ApiEntityType);
}

/** Composite viewer node id: `${entityType}:${entityId}` or `${entityType}:local:${slug}`. */
function buildViewerNodeId(
  entityType: ApiEntityType,
  entityId: string | null | undefined,
  fallbackSlug?: string,
): string {
  if (entityId && entityId.trim()) return `${entityType}:${entityId.trim()}`;
  return `${entityType}:local:${(fallbackSlug ?? 'unknown').trim() || 'unknown'}`;
}

const NEO4J_GROUP_TO_VIEWER: Record<string, GraphNodeType> = {
  Recording: 'recording',
  Instrument: 'instrument',
  EthnicGroup: 'ethnic_group',
  Ceremony: 'ceremony',
  Province: 'province',
  VocalStyle: 'vocal_style',
  MusicalScale: 'musical_scale',
  Tag: 'tag',
  Location: 'province',
  District: 'province',
  Commune: 'province',
  KBEntry: 'tag',
};

/** Neo4j node label (`group`) → viewer node type. */
export function neo4jGroupToViewerType(group: string): GraphNodeType {
  return NEO4J_GROUP_TO_VIEWER[group] ?? 'recording';
}

function neo4jGroupToApiEntityType(group: string): ApiEntityType {
  if (isValidApiEntityType(group)) return group;
  if (group === 'Location' || group === 'District' || group === 'Commune') return 'Province';
  if (group === 'KBEntry') return 'Tag';
  return 'Recording';
}

function pickRecord<T extends object>(row: unknown, keys: (keyof T)[]): Partial<T> {
  if (!row || typeof row !== 'object') return {};
  const o = row as Record<string, unknown>;
  const out: Partial<T> = {};
  for (const k of keys) {
    const camel = String(k);
    const pascal = camel.charAt(0).toUpperCase() + camel.slice(1);
    const v = o[camel] ?? o[pascal];
    if (v !== undefined) (out as Record<string, unknown>)[camel] = v;
  }
  return out;
}

export function parseGraphExplorerNode(raw: unknown): GraphExplorerNodeDto | null {
  const p = pickRecord<GraphExplorerNodeDto>(raw, ['id', 'label', 'group']);
  const id = typeof p.id === 'string' ? p.id.trim() : '';
  const label = typeof p.label === 'string' ? p.label.trim() : '';
  const group = typeof p.group === 'string' ? p.group.trim() : '';
  if (!id || !group) return null;
  return { id, label: label || id, group };
}

export function parseGraphExplorerLink(raw: unknown): GraphExplorerLinkDto | null {
  const p = pickRecord<GraphExplorerLinkDto>(raw, ['source', 'target', 'type']);
  const source = typeof p.source === 'string' ? p.source.trim() : '';
  const target = typeof p.target === 'string' ? p.target.trim() : '';
  const type = typeof p.type === 'string' ? p.type.trim() : '';
  if (!source || !target) return null;
  return { source, target, type: type || 'RELATED' };
}

export function parseGraphExplorerSearchResponse(raw: unknown): GraphExplorerNodeDto[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(parseGraphExplorerNode).filter(Boolean) as GraphExplorerNodeDto[];
}

export function parseGraphExplorerExpandResponse(raw: unknown): GraphExplorerResponseDto {
  if (!raw || typeof raw !== 'object') {
    return { nodes: [], links: [] };
  }
  const o = raw as Record<string, unknown>;
  const nodesRaw = o.nodes ?? o.Nodes;
  const linksRaw = o.links ?? o.Links;
  const nodes = Array.isArray(nodesRaw)
    ? (nodesRaw.map(parseGraphExplorerNode).filter(Boolean) as GraphExplorerNodeDto[])
    : [];
  const links = Array.isArray(linksRaw)
    ? (linksRaw.map(parseGraphExplorerLink).filter(Boolean) as GraphExplorerLinkDto[])
    : [];
  return { nodes, links };
}

export function graphExplorerNodeToGraphNode(dto: GraphExplorerNodeDto): GraphNode {
  const entityType = neo4jGroupToApiEntityType(dto.group);
  const viewerType = neo4jGroupToViewerType(dto.group);
  const entityId = dto.id.trim();
  const viewerNodeId = buildViewerNodeId(entityType, entityId, dto.label);
  return {
    id: viewerNodeId,
    viewerNodeId,
    entityId,
    entityType,
    explorable: true,
    backendId: entityId,
    name: dto.label?.trim() ? dto.label : entityId,
    type: viewerType,
    apiEntityType: dto.group,
    val: 1,
  };
}

/** Converts Neo4j expand payload to viewer graph (composite node ids). */
export function graphExplorerToViewerData(dto: GraphExplorerResponseDto): KnowledgeGraphData {
  const nodes = dto.nodes.map(graphExplorerNodeToGraphNode);
  const idMap = new Map<string, string>();
  for (let i = 0; i < dto.nodes.length; i++) {
    const guid = dto.nodes[i]?.id;
    if (guid && nodes[i]?.id) idMap.set(guid, nodes[i].id);
  }
  const links: GraphLink[] = dto.links.map((l) => ({
    source: idMap.get(l.source) ?? l.source,
    target: idMap.get(l.target) ?? l.target,
    type: l.type,
    value: 1,
  }));
  return { nodes, links };
}

// ── Node Detail parsers ───────────────────────────────────────────────────────

export function parseGraphExplorerNeighborSummary(raw: unknown): GraphExplorerNeighborSummaryDto | null {
  const p = pickRecord<GraphExplorerNeighborSummaryDto>(raw, [
    'id', 'label', 'group', 'relationType', 'direction',
  ]);
  const id = typeof p.id === 'string' ? p.id.trim() : '';
  const group = typeof p.group === 'string' ? p.group.trim() : '';
  const relationType = typeof p.relationType === 'string' ? p.relationType.trim() : '';
  const direction = p.direction === 'IN' || p.direction === 'OUT' ? p.direction : 'OUT';
  if (!id || !group) return null;
  return {
    id,
    label: typeof p.label === 'string' ? p.label.trim() : id,
    group,
    relationType: relationType || 'RELATED',
    direction,
  };
}

export function parseGraphExplorerNodeDetail(raw: unknown): GraphExplorerNodeDetailDto | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = (o.id ?? o.Id);
  const label = (o.label ?? o.Label);
  const group = (o.group ?? o.Group);
  const degreeCount = (o.degreeCount ?? o.DegreeCount);
  const neighborsRaw = o.neighbors ?? o.Neighbors;
  const propertiesRaw = o.properties ?? o.Properties;

  if (typeof id !== 'string' || !id.trim()) return null;
  if (typeof group !== 'string' || !group.trim()) return null;

  const neighbors = Array.isArray(neighborsRaw)
    ? (neighborsRaw.map(parseGraphExplorerNeighborSummary).filter(Boolean) as GraphExplorerNeighborSummaryDto[])
    : [];

  return {
    id: id.trim(),
    label: typeof label === 'string' ? label.trim() : id.trim(),
    group: group.trim(),
    properties: propertiesRaw && typeof propertiesRaw === 'object'
      ? (propertiesRaw as Record<string, unknown>)
      : undefined,
    degreeCount: typeof degreeCount === 'number' ? degreeCount : 0,
    neighbors,
  };
}

// ── Shortest Path parsers ─────────────────────────────────────────────────────

export function parseGraphExplorerPathResponse(raw: unknown): GraphExplorerPathResponseDto {
  const empty: GraphExplorerPathResponseDto = { pathFound: false, nodes: [], links: [] };
  if (!raw || typeof raw !== 'object') return empty;
  const o = raw as Record<string, unknown>;
  const pathFound = Boolean(o.pathFound ?? o.PathFound ?? false);
  const pathLength = typeof (o.pathLength ?? o.PathLength) === 'number'
    ? (o.pathLength ?? o.PathLength) as number
    : undefined;
  
  const nodesRaw = o.nodes ?? o.Nodes;
  const linksRaw = o.links ?? o.Links;
  
  const rawNodes = Array.isArray(nodesRaw)
    ? (nodesRaw.map(parseGraphExplorerNode).filter(Boolean) as GraphExplorerNodeDto[])
    : [];
    
  const rawLinks = Array.isArray(linksRaw)
    ? (linksRaw.map(parseGraphExplorerLink).filter(Boolean) as GraphExplorerLinkDto[])
    : [];
    
  // Map GUIDs to viewerNodeIds, đồng thời lưu GUID gốc vào backendId
  const guidToViewerNodeIdMap = new Map<string, string>();
  const mappedNodes: GraphExplorerNodeDto[] = rawNodes.map((n) => {
    const entityType = neo4jGroupToApiEntityType(n.group);
    const viewerNodeId = buildViewerNodeId(entityType, n.id, n.label);
    guidToViewerNodeIdMap.set(n.id, viewerNodeId);
    return {
      ...n,
      id: viewerNodeId,      // viewerNodeId để match với graphData
      backendId: n.id,       // GUID gốc để gọi API (getShortestPath, getNodeDetail...)
    };
  });
  
  const mappedLinks: GraphExplorerLinkDto[] = rawLinks.map((l) => ({
    ...l,
    source: guidToViewerNodeIdMap.get(l.source) ?? l.source,
    target: guidToViewerNodeIdMap.get(l.target) ?? l.target,
  }));
  
  return {
    pathFound,
    pathLength,
    nodes: mappedNodes,
    links: mappedLinks,
  };
}
