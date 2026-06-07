# 🗺️ Knowledge Graph — Luồng Tương Tác & Hướng Dẫn FE

> **Dành cho**: FE team / AI Agent làm việc với Knowledge Graph  
> **Cập nhật**: 2026-06-07  
> **Nguồn**: Tổng hợp từ thiết kế UX + code thực tế trong project

---

## 1. Kiến Trúc Tổng Quan

### Quyết định kiến trúc (đã chốt)

```
Neo4j   → TẤT CẢ graph operations: explore, expand, shortest-path, node detail, overview
PostgreSQL → data lưu trữ, text search, vector/semantic search (KHÔNG dùng cho graph)
```

### Hai backend mode trong FE

```typescript
// src/types/graph.ts
type KnowledgeGraphBackendMode = 'pg' | 'neo4j';

// Default hiện tại (line 134 useKnowledgeGraphController.ts)
const [backendMode, setBackendMode] = useState<KnowledgeGraphBackendMode>('neo4j');
```

> **Quan trọng**: `backendMode = 'pg'` là legacy — sẽ bị deprecated. Toàn bộ graph phải dùng `'neo4j'`.

---

## 2. State Machine — Cách Graph Hoạt Động

### Các state chính trong `useKnowledgeGraphController`

```typescript
// ── Tab/View ──────────────────────────────────────
graphView: ResearcherGraphTabView  // 'overview' | 'ethnic_group' | 'instrument' | ...
typeFilter: string                 // Filter theo node type

// ── Selection & Exploration ───────────────────────
selection: ResearcherGraphSelection | null   // Node đang được chọn/highlight
exploreTarget: { id: string; type: string } | null  // Node đang được expand (PG mode)
history: ExploreHistoryStep[]               // Breadcrumb trail của các node đã khám phá

// ── Graph Data ────────────────────────────────────
displayGraph: KnowledgeGraphData   // Graph hiển thị hiện tại (merged subgraph hoặc overview)
dataSourceKind: 'api' | 'local' | 'explore' | 'neo4j'

// ── Neo4j Specific ────────────────────────────────
neo4j.graphData: KnowledgeGraphData    // Graph data từ Neo4j (tích lũy qua expand)
neo4j.searchResults: GraphExplorerNodeDto[]  // Kết quả search Neo4j
neo4j.isSearching: boolean
neo4j.isExpanding: boolean
```

### Luồng dữ liệu graph (Neo4j mode)

```
User search keyword
      ↓
neo4j.search(keyword)           → GET /api/graph-explorer/search?keyword=...
      ↓
searchResults: GraphExplorerNodeDto[]
      ↓
User click 1 kết quả
      ↓
handleNeo4jSearchResultClick()
  → neo4j.seedFromSearchHit(hit)     // Đặt 1 node vào canvas
  → neo4j.expand(hit.id)             // Expand ngay lập tức
      ↓
GET /api/graph-explorer/expand?sourceId=...
      ↓
mergeSubgraph(prev, chunk)          // Merge vào canvas, KHÔNG reset
      ↓
displayGraph cập nhật → react-force-graph re-render
```

---

## 3. Ba Mode Tương Tác (UX Design)

### Mode 1 — Passive (Graph chạy ngầm)
> Graph query chạy tự động, user không thấy graph — chỉ thấy kết quả

- **Hiện tại**: Chưa implement ở FE (explore tab chỉ show list)
- **Tương lai**: Tích hợp vào Explore page — gợi ý tự động dựa trên node đang xem

### Mode 2 — Semi-visible (Graph lộ qua FilterSidebar)
> FilterSidebar options thay đổi động theo graph context

- **Hiện tại**: `FilterSidebar.tsx` dùng option tĩnh từ `exploreFilterOptions.ts`
- **Cần làm**: Dynamic options từ graph neighbors của selection hiện tại

### Mode 3 — Fully Visible (Graph View trực tiếp)
> User thấy và tương tác trực tiếp với graph nodes

- **Hiện tại**: Đã có `KnowledgeGraphViewer.tsx` với react-force-graph ✅
- **Cần bổ sung**: NodeDetail panel, ShortestPath UI, 2-node disconnect handling

---

## 4. Các Cử Chỉ Tương Tác — Mapping UX → Code

| Cử chỉ | UX mong muốn | Code hiện tại | Status |
|---|---|---|---|
| **Click node** | Chọn node, hiện info panel | `handleGraphNodeClick()` → setSelection | ✅ Có selection, ❌ Chưa có Info Panel |
| **Double-click node** | Node trở thành tâm mới, expand | `handleGraphNodeDoubleClick()` → neo4j.expand() | ✅ Đã implement |
| **Hover node** | Tooltip: số kết nối, type | Chưa có | ❌ Cần làm |
| **Click search result** | Seed node + expand ngay | `handleNeo4jSearchResultClick()` → seedFromSearchHit + expand | ✅ Đã implement |
| **Click breadcrumb step** | Quay về node đó trong history | `navigateToHistoryStep(index)` | ✅ Đã implement |
| **Click "Back"** | Quay về step trước | `navigateBack()` | ✅ Đã implement |
| **Click "Reset"** | Xóa hết, về overview | `resetToOverview()` | ✅ Đã implement |
| **Click "Expand selected"** | Expand node đang select | `expandSelected()` | ✅ Đã implement |
| **Chọn 2 node** | Tìm đường nối | Chưa có multi-select | ❌ Cần làm |
| **Zoom in/out** | Load ít/nhiều node | Chưa có | ❌ Cần làm |

---

## 5. Luồng User Journey Chi Tiết

### Journey A — Khám phá từ search (luồng chính)

```
1. User gõ vào search box (debounce 350ms)
         ↓
2. neo4jSearch(debouncedListQuery) được gọi
         ↓ GET /api/graph-explorer/search?keyword=...&label=...
3. neo4j.searchResults hiện danh sách gợi ý
         ↓
4. User click 1 kết quả
         ↓ handleNeo4jSearchResultClick(hit)
5. seedFromSearchHit: canvas = [1 node duy nhất]
   history: [{ entityId, label, viewerNodeId }]
   selection: node đó
         ↓ neo4j.expand(hit.id) — tự động
6. GET /api/graph-explorer/expand?sourceId=...
         ↓
7. mergeSubgraph: canvas mở rộng, thêm neighbors
   (node cũ giữ nguyên vị trí x/y, không flicker)
         ↓
8. User thấy graph với node trung tâm + neighbors
```

### Journey B — Explore sâu hơn (double-click)

```
1. User thấy graph, muốn explore thêm 1 node
         ↓
2. User double-click node đó
         ↓ handleGraphNodeDoubleClick(node)
3. neo4j.expand(node.entityId)
         ↓ GET /api/graph-explorer/expand?sourceId=...
4. mergeSubgraph: canvas tiếp tục mở rộng
   (không reset — giữ toàn bộ graph đã có)
         ↓
5. Canvas tích lũy: càng explore nhiều, graph càng lớn
```

### Journey C — Navigate breadcrumb

```
1. User đã khám phá: A → B → C → D
   history = [A, B, C, D]
         ↓
2. User click breadcrumb "B"
         ↓ navigateToHistoryStep(1)
3. history truncate: [A, B]
   exploreTarget = B
   selection = B
         ↓
4. displayGraph quay lại merged subgraph tính đến B
```

### Journey D — Tìm đường nối 2 node (cần implement)

```
1. User muốn so sánh node A và node B
         ↓ [chưa có UI để chọn 2 node]
2. Gọi: GET /api/graph-explorer/shortest-path?fromId=A&toId=B&maxDepth=6
         ↓
3. Nếu pathFound = true:
   → Animate đường đi: highlight các node và edge trên path
   → Hiện label trên mỗi edge: "phát triển thành", "thuộc về"
   
4. Nếu pathFound = false:
   → Hiện thông báo + suggestedBridges (node gợi ý có thể là cầu nối)
```

---

## 6. Merge Strategy — Tại Sao Graph Không Flicker

Đây là cơ chế quan trọng nhất của FE graph:

```typescript
// src/features/knowledge-graph/hooks/useKnowledgeGraphController.ts
export function mergeSubgraph(acc: KnowledgeGraphData, next: KnowledgeGraphData): KnowledgeGraphData {
  // Node cũ GIỮ NGUYÊN vị trí x/y/vx/vy (force-graph runtime fields)
  // Node mới được thêm vào
  // Edge trùng (same source-target-type) bị dedup
}
```

**Kết quả**: User mở rộng graph nhiều lần → canvas tích lũy mà không reset layout.

---

## 7. NodeDetail Panel — Cần Implement

### API mới (BE đã implement)

```
GET /api/graph-explorer/node/{id}
```

Response (`GraphExplorerNodeDetailDto`):
```typescript
{
  id: string;
  label: string;
  group: string;          // = node label trong Neo4j (e.g. "EthnicGroup")
  properties?: Record<string, unknown>;
  degreeCount: number;    // Tổng số edges
  neighbors: Array<{
    id: string;
    label: string;
    group: string;
    relationType: string;   // e.g. "ETHNIC_GROUP_HAS_INSTRUMENT"
    direction: 'IN' | 'OUT';
  }>;
}
```

### UI NodeDetail Panel

Khi user **click 1 node**, panel trượt ra từ phải:

```
┌─────────────────────────────────────┐
│  🏷️ {node.label}                    │
│  Type: {node.group}                 │
│  ─────────────────────────────────  │
│  📊 Kết nối: {degreeCount}          │
│                                     │
│  🔗 Quan hệ:                        │
│  [Group by relationType]            │
│  ├── "Nhạc cụ đặc trưng" (8)       │
│  │   • Đàn Bầu  • Đàn Tranh...     │
│  └── "Nghi lễ liên quan" (12)      │
│      • Hội Lim  • Hát Xoan...      │
│                                     │
│  [Expand node] [Tìm đường nối]     │
└─────────────────────────────────────┘
```

### Hook cần tạo

```typescript
// src/features/knowledge-graph/hooks/useGraphNodeDetail.ts
export function useGraphNodeDetail(nodeId: string | null) {
  // Gọi GET /api/graph-explorer/node/{nodeId}
  // Cache kết quả (node không thay đổi thường xuyên)
  // Return: { data, isLoading, error }
}
```

---

## 8. ShortestPath UI — Cần Implement

### API (BE đã implement)

```
GET /api/graph-explorer/shortest-path?fromId={id}&toId={id}&maxDepth=6
```

Response (`GraphExplorerPathResponseDto`):
```typescript
{
  pathFound: boolean;
  pathLength?: number;    // Số edges trên đường đi
  nodes: GraphNodeDto[];  // Nodes theo thứ tự trên path
  links: GraphLinkDto[];  // Links theo thứ tự trên path
}
```

### UX khi user chọn 2 node

```typescript
// State cần thêm vào controller
const [pinnedNode, setPinnedNode] = useState<string | null>(null);

// Khi user click 1 node trong khi đang hold Ctrl/Cmd:
// → Đây là "node thứ 2" → trigger shortest path query
```

### UI khi không có path

```
┌──────────────────────────────────────────┐
│  ⚠️ Hai node này chưa có đường kết nối   │
│                                          │
│  Gợi ý node trung gian:                 │
│  • [Nhạc Dân Gian]  • [Hà Nội]          │
│                                          │
│  [Giữ cả 2, khám phá tự do]            │
│  [Bỏ node thứ 2]                        │
└──────────────────────────────────────────┘
```

---

## 9. 2 Node Không Liên Quan — Xử Lý

Ba kịch bản cần handle ở FE:

```typescript
// Kịch bản A: Không có đường nối → pathFound = false
if (!shortestPath.pathFound) {
  // Hiện thông báo + suggestedBridges
  // Canvas: 2 node nằm tách biệt, vẫn tồn tại
}

// Kịch bản B: Có đường nối xa (3+ hop)
if (shortestPath.pathFound && shortestPath.pathLength > 2) {
  // Highlight path: mờ tất cả node khác
  // Animate đường đi từ từ (A → B → C → D)
}

// Kịch bản C: Liên quan trực tiếp (1 hop)
if (shortestPath.pathFound && shortestPath.pathLength === 1) {
  // Highlight edge giữa 2 node
  // Hiện relation label trên edge
}
```

---

## 10. UX Mode Toggle — Cần Implement

### State cần thêm

```typescript
// Thêm vào useKnowledgeGraphController
type ExplorerMode = 'guided' | 'free' | 'overview';
const [explorerMode, setExplorerMode] = useState<ExplorerMode>('guided');
```

### Behavior của từng mode

| Mode | Expand khi nào | Show bao nhiêu node | Dành cho |
|---|---|---|---|
| `guided` | Tự động khi click/select | Hạn chế (top 8 per node) | User mới |
| `free` | Chỉ khi double-click | Không giới hạn (nhưng paginated) | Power user |
| `overview` | Không expand, cluster | Toàn bộ dạng cluster bubble | Researcher |

### UI Toggle

```
Chế độ: [Tự động ●] [Tự do] [Toàn cảnh]
         (pill toggle, 3 options)
```

---

## 11. API Contracts Hiện Tại (Neo4j)

### Đã có — đang hoạt động

| Endpoint | FE Service | Hook |
|---|---|---|
| `GET /api/graph-explorer/search?keyword=&label=` | `graphExplorerService.searchEntities()` | `useNeo4jExplore.search()` |
| `GET /api/graph-explorer/expand?sourceId=&targetLabel=` | `graphExplorerService.expandNode()` | `useNeo4jExplore.expand()` |

### Mới — BE đã implement, FE chưa gọi

| Endpoint | Response Type | Dùng cho |
|---|---|---|
| `GET /api/graph-explorer/node/{id}` | `GraphExplorerNodeDetailDto` | NodeDetail Panel |
| `GET /api/graph-explorer/shortest-path?fromId=&toId=&maxDepth=` | `GraphExplorerPathResponseDto` | ShortestPath UI |

### FE cần thêm vào `graphExplorerService.ts`

```typescript
// Thêm 2 methods mới
async getNodeDetail(id: string): Promise<GraphExplorerNodeDetailDto> {
  return apiOk(apiFetch.GET('/api/graph-explorer/node/{id}', {
    params: { path: { id } }
  }));
}

async getShortestPath(fromId: string, toId: string, maxDepth = 6): Promise<GraphExplorerPathResponseDto> {
  return apiOk(apiFetch.GET('/api/graph-explorer/shortest-path', {
    params: { query: openApiQueryRecord({ fromId, toId, maxDepth }) }
  }));
}
```

---

## 12. Relation Type Labels — Mapping Tiếng Việt

Dùng để hiển thị edge labels trong UI:

```typescript
// Tạo tại: src/constants/relationLabels.ts
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
```

---

## 13. Checklist FE — Theo Thứ Tự Ưu Tiên

### 🔴 Ưu tiên cao (unblock user flow)

- [ ] **NodeDetail Panel** — Khi click node → slide panel hiện chi tiết
  - Hook: `useGraphNodeDetail(nodeId)` gọi `/api/graph-explorer/node/{id}`
  - Component: `GraphNodeDetailPanel.tsx`
  - Tích hợp: khi `selection` thay đổi trong `KnowledgeGraphViewer.tsx`

- [ ] **Relation labels trên edge** — Hiện tooltip hoặc label trên link
  - Data có sẵn trong `graphData.links[].type`
  - Map sang tiếng Việt qua constant `RELATION_LABELS`

- [ ] **Node hover tooltip** — Hover vào node → hiện nhanh: name, type, degreeCount
  - `KnowledgeGraphViewer` custom hover handler

### 🟡 Ưu tiên trung bình

- [ ] **ShortestPath feature** — Chọn 2 node → tìm đường nối
  - State: thêm `pinnedNode` vào controller
  - UI: Ctrl+click để pin node thứ 2
  - Hook: `useGraphShortestPath(fromId, toId)`
  - Hiện path highlight + thông báo khi không có path

- [ ] **UX Mode toggle** — Guided / Free / Overview
  - State: `explorerMode` trong controller
  - UI: pill toggle 3 options

- [ ] **Add 2 methods vào `graphExplorerService.ts`**
  - `getNodeDetail(id)` → `/api/graph-explorer/node/{id}`
  - `getShortestPath(fromId, toId, maxDepth)` → `/api/graph-explorer/shortest-path`

### 🟢 Nice to have

- [ ] **Pinned nodes** — User ghim node để không bị ẩn khi re-render
- [ ] **Cluster view** — Khi zoom out, gom node thành cluster bubble với count
- [ ] **Canvas chia đôi** — Khi 2 node không liên quan (dual-canvas view)
- [ ] **"Save session"** — Lưu trạng thái graph để xem lại sau

---

## 14. Files Liên Quan

| File | Mục đích |
|---|---|
| `src/features/knowledge-graph/hooks/useKnowledgeGraphController.ts` | Master state controller |
| `src/features/knowledge-graph/hooks/useNeo4jExplore.ts` | Neo4j search + expand logic |
| `src/services/graphExplorerService.ts` | HTTP calls tới Neo4j backend |
| `src/features/knowledge-graph/components/KnowledgeGraphViewer.tsx` | Component graph chính |
| `src/types/graph.ts` | Type: GraphNode, GraphLink, KnowledgeGraphData |
| `src/types/graphExplorerApi.ts` | DTO types từ Neo4j API |
| `backend/.../GraphExplorerService.cs` | BE Neo4j implementation (đã có GetNodeDetail + GetShortestPath) |