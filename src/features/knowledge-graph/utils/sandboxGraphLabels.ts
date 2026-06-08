import type { GraphLink, GraphNode } from '@/types/graph';

type D3Node = GraphNode & { x?: number; y?: number; fx?: number; fy?: number };
type D3Link = Omit<GraphLink, 'source' | 'target'> & {
  source: string | D3Node;
  target: string | D3Node;
};

const RELATION_LABELS: Record<string, string> = {
  BELONGS_TO_ETHNIC_GROUP: 'Thuộc về dân tộc',
  ETHNIC_GROUP_HAS_INSTRUMENT: 'Nhạc cụ đặc trưng',
  HAS_INSTRUMENT: 'Nhạc cụ liên quan',
  USES_INSTRUMENT: 'Sử dụng nhạc cụ',
  USED_IN_RECORDING: 'Sử dụng trong bản ghi',
  HAS_CEREMONY: 'Nghi lễ đặc trưng',
  PERFORMED_BY_ETHNIC_GROUP: 'Thực hiện bởi dân tộc',
  FEATURED_IN_RECORDING: 'Có trong bản ghi',
  PERFORMED_IN_CEREMONY: 'Biểu diễn trong nghi lễ',
  HAS_RECORDING: 'Bản ghi âm nhạc',
  HAS_VOCAL_STYLE: 'Lối hát đặc trưng',
  HAS_SCALE: 'Điệu/Hệ âm',
  HAS_TAG: 'Từ khóa liên quan',
  TAGGED_RECORDING: 'Bản ghi liên quan',
  ASSOCIATED_WITH: 'Liên kết với',
  BELONGS_TO_CULTURE: 'Thuộc văn hóa',
  ORIGINATES_FROM: 'Xuất xứ từ',
  USED_BY_ETHNIC_GROUP: 'Sử dụng bởi dân tộc',
};

export function getRelationshipLabel(
  relationType: string,
  direction: 'IN' | 'OUT',
  sourceGroup: string,
  targetGroup: string,
): string {
  const isOut = direction === 'OUT';

  switch (relationType) {
    case 'PERFORMED_DURING':
      return isOut ? 'Trình diễn trong nghi lễ' : 'Bao gồm bản ghi âm';
    case 'USES_INSTRUMENT':
      return isOut ? 'Sử dụng nhạc cụ' : 'Được sử dụng trong bản ghi';
    case 'BELONGS_TO_CULTURE':
      return isOut ? 'Thuộc về dân tộc' : 'Sở hữu bản ghi âm';
    case 'HAS_VOCAL_STYLE':
      return isOut ? 'Thể hiện lối hát' : 'Được thể hiện trong bản ghi';
    case 'USES_SCALE':
      return isOut ? 'Sử dụng thang âm' : 'Được sử dụng trong bản ghi';
    case 'RECORDED_AT':
      return isOut ? 'Được thu âm tại' : 'Nơi thu âm của';
    case 'HAS_TAG':
      return isOut ? 'Gắn thẻ' : 'Được gắn cho bản ghi âm';
    case 'ORIGINATES_FROM':
      return isOut ? 'Có nguồn gốc từ dân tộc' : 'Là nguồn gốc của nhạc cụ';
    case 'USED_BY_ETHNIC_GROUP':
      return isOut ? 'Được sử dụng bởi dân tộc' : 'Sử dụng nhạc cụ';
    case 'HAS_CEREMONY':
      return isOut ? 'Có nghi lễ truyền thống' : 'Thuộc về dân tộc';
    case 'ASSOCIATED_WITH':
      return isOut ? 'Gắn liền với dân tộc' : 'Đặc trưng bởi lối hát';
    case 'PART_OF': {
      const cleanSource = sourceGroup.replace('Location:', '');
      const cleanTarget = targetGroup.replace('Location:', '');
      if (isOut) {
        if (cleanSource === 'Commune' || cleanTarget === 'District') return 'Trực thuộc Huyện';
        if (cleanSource === 'District' || cleanTarget === 'Province') return 'Trực thuộc Tỉnh';
        return 'Trực thuộc';
      }
      if (cleanSource === 'Province' || cleanTarget === 'District') return 'Bao gồm Huyện';
      if (cleanSource === 'District' || cleanTarget === 'Commune') return 'Bao gồm Xã';
      return 'Bao gồm';
    }
    default:
      return RELATION_LABELS[relationType] || relationType;
  }
}

export const getLinkLabel = (link: D3Link, nodes: D3Node[]) => {
  const source = typeof link.source === 'object' ? (link.source as D3Node) : nodes.find((n) => n.id === link.source);
  const target = typeof link.target === 'object' ? (link.target as D3Node) : nodes.find((n) => n.id === link.target);

  if (!source || !target || !link.type) return link.type || '';

  const sourceGroup = source.apiEntityType || source.entityType || '';
  const targetGroup = target.apiEntityType || target.entityType || '';

  return getRelationshipLabel(link.type, 'OUT', sourceGroup, targetGroup);
};

const NODE_GROUP_LABELS: Record<string, string> = {
  Recording: 'Bản ghi',
  Instrument: 'Nhạc cụ',
  EthnicGroup: 'Dân tộc',
  Ceremony: 'Nghi lễ',
  Province: 'Tỉnh/Thành',
  VocalStyle: 'Lối hát',
  MusicalScale: 'Hệ âm',
  Tag: 'Từ khóa',
  Location: 'Địa điểm',
  District: 'Quận/Huyện',
  Commune: 'Phường/Xã',
  KBEntry: 'Mục từ điển',
};

export const getGroupLabel = (group: string) => NODE_GROUP_LABELS[group] || group;
