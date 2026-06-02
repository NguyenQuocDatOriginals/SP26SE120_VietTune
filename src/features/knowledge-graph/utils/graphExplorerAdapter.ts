import { buildViewerNodeId, isValidApiEntityType } from '@/features/knowledge-graph/utils/knowledgeGraphApiAdapter';
import type {
  GraphExplorerLinkDto,
  GraphExplorerNodeDto,
  GraphExplorerResponseDto,
} from '@/types/graphExplorerApi';
import type { ApiEntityType, GraphLink, GraphNode, GraphNodeType, KnowledgeGraphData } from '@/types/graph';

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
