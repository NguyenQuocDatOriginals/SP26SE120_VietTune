// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type GraphNodeType = 'region' | 'ethnic_group' | 'ceremony' | 'instrument' | 'recording';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface GraphNode {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  name: string;
// [VI] Thực thi một bước trong luồng xử lý.
  type: GraphNodeType;
// [VI] Thực thi một bước trong luồng xử lý.
  val?: number; // Represents the size of the node (based on degree often)
// [VI] Thực thi một bước trong luồng xử lý.
  color?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  imgUrl?: string; // Thumbnail for tooltip
// [VI] Thực thi một bước trong luồng xử lý.
  desc?: string; // Short summary
// [VI] Thực thi một bước trong luồng xử lý.
  degree?: number;

// [VI] Thực thi một bước trong luồng xử lý.
  // Internal react-force-graph properties injected at runtime
// [VI] Thực thi một bước trong luồng xử lý.
  x?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  y?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  vx?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  vy?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  fx?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  fy?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  index?: number;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface GraphLink {
// [VI] Thực thi một bước trong luồng xử lý.
  source: string | GraphNode;
// [VI] Thực thi một bước trong luồng xử lý.
  target: string | GraphNode;
// [VI] Thực thi một bước trong luồng xử lý.
  value?: number; // Defines line thickness/strength
// [VI] Thực thi một bước trong luồng xử lý.
  color?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  type?: string; // E.g., 'belongs_to', 'played_in', 'featured_in'
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface KnowledgeGraphData {
// [VI] Thực thi một bước trong luồng xử lý.
  nodes: GraphNode[];
// [VI] Thực thi một bước trong luồng xử lý.
  links: GraphLink[];
// [VI] Thực thi một bước trong luồng xử lý.
}
