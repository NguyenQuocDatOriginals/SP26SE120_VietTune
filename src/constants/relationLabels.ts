export const RELATION_LABELS: Record<string, string> = {
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
};

/**
 * Format Neo4j relationship type name to friendly Vietnamese description.
 */
export function formatRelationType(type: string): string {
  return RELATION_LABELS[type] ?? type;
}
