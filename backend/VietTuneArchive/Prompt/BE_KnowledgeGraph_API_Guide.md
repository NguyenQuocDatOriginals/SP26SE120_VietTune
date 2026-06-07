# 📘 Hướng Dẫn Backend: Bổ Sung API Knowledge Graph

> **Dành cho**: AI Agent / Backend Developer thực hiện bổ sung API  
> **Project**: VietTuneArchive (.NET / ASP.NET Core)  
> **Ngày**: 2026-06-07  
> **Mức độ ưu tiên**: Cao — FE đang chờ các endpoints này để hoàn thiện Knowledge Graph interactive UI

---

## 🗺️ Tổng quan kiến trúc hiện tại

### Controllers đã có
```
/api/KnowledgeGraph/overview    → GET  — Load toàn bộ graph overview (PG backend)
/api/KnowledgeGraph/explore     → POST — Expand 1 node (PG backend)
/api/KnowledgeGraph/search      → GET  — Tìm kiếm node theo text (PG backend)
/api/KnowledgeGraph/stats       → GET  — Thống kê số lượng entities

/api/graph-explorer/search      → GET  — Tìm kiếm node (Neo4j backend)
/api/graph-explorer/expand      → GET  — Expand node (Neo4j backend)
```

### DTOs hiện tại FE đang dùng
```csharp
// KnowledgeGraphApiNode
{ id, type, label, properties? }

// KnowledgeGraphApiEdge  
{ sourceId, targetId, relation, properties? }

// KnowledgeGraphApiGraphResponse
{ nodes[], edges[], totalNodes? }

// KnowledgeGraphExploreRequestBody (POST body)
{ nodeId, nodeType, depth?, maxNodes?, filterTypes? }

// GraphExplorerNodeDto (Neo4j)
{ id, label, group }

// GraphExplorerLinkDto (Neo4j)
{ source, target, type }

// GraphExplorerResponseDto (Neo4j)
{ nodes[], links[] }
```

### Node types đang dùng trong hệ thống
```
PG (ApiEntityType):   EthnicGroup | Instrument | Ceremony | Recording | Province | VocalStyle | MusicalScale | Tag
Neo4j (group/label):  Tương tự trên, tên Pascal
```

---

## 🆕 CÁC APIs CẦN BỔ SUNG

---

## 1. `GET /api/KnowledgeGraph/node/{id}`  
### **Mục đích**: Lấy thông tin chi tiết của 1 node — dùng cho Info Panel khi user click vào node

### Request
```
GET /api/KnowledgeGraph/node/{id}?nodeType={nodeType}
```

| Param | Loại | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | `string (uuid)` | ✅ | GUID của entity trong database |
| `nodeType` | `string` | ✅ | Pascal entity type: `EthnicGroup`, `Instrument`, `Ceremony`, `Recording`, `Province`, `VocalStyle`, `MusicalScale`, `Tag` |

### Response DTO (mới — cần tạo)
```csharp
public class NodeDetailDto
{
    public string Id { get; set; }
    public string Type { get; set; }
    public string Label { get; set; }
    public string? Description { get; set; }

    // Thống kê trong hệ thống
    public NodeStatsDto Stats { get; set; }

    // Các quan hệ trực tiếp (1 hop), gom theo loại
    public List<NodeRelationGroupDto> RelationGroups { get; set; }

    // Metadata bổ sung tùy entity type
    public Dictionary<string, object>? Properties { get; set; }
}

public class NodeStatsDto
{
    public int TotalConnections { get; set; }     // Tổng số edges
    public int TotalRecordings { get; set; }      // Số bài ghi liên quan
    public int TotalArtists { get; set; }         // Nếu applicable
    public int DirectNeighbors { get; set; }      // Số node kề trực tiếp
}

public class NodeRelationGroupDto
{
    public string RelationType { get; set; }      // Ví dụ: "HAS_INSTRUMENT", "BELONGS_TO"
    public string RelationLabel { get; set; }     // Ví dụ: "Nhạc cụ liên quan", "Thuộc về"
    public int Count { get; set; }                // Tổng số trong nhóm
    public List<NodeSummaryDto> Samples { get; set; }  // Tối đa 5 mẫu để preview
}

public class NodeSummaryDto
{
    public string Id { get; set; }
    public string Type { get; set; }
    public string Label { get; set; }
}
```

### Cypher query tham khảo (Neo4j)
```cypher
MATCH (n {id: $id})
OPTIONAL MATCH (n)-[r]-(neighbor)
RETURN n,
       type(r) AS relType,
       labels(neighbor)[0] AS neighborType,
       neighbor.id AS neighborId,
       neighbor.name AS neighborLabel
LIMIT 50
```

### PostgreSQL query tham khảo
```sql
-- Lấy thông tin node (ví dụ EthnicGroup)
SELECT id, name, description FROM EthnicGroups WHERE id = @id

-- Đếm connections từ KnowledgeGraphEdges
SELECT relation_type, COUNT(*) as count 
FROM KnowledgeGraphEdges 
WHERE source_id = @id OR target_id = @id
GROUP BY relation_type
```

### Response mẫu
```json
{
  "id": "a1b2c3d4-...",
  "type": "EthnicGroup",
  "label": "Dân Tộc Kinh",
  "description": "Dân tộc chiếm đa số tại Việt Nam, phân bố rộng khắp cả nước.",
  "stats": {
    "totalConnections": 145,
    "totalRecordings": 1240,
    "totalArtists": 87,
    "directNeighbors": 23
  },
  "relationGroups": [
    {
      "relationType": "HAS_MUSICAL_STYLE",
      "relationLabel": "Thể loại âm nhạc",
      "count": 12,
      "samples": [
        { "id": "...", "type": "Tag", "label": "Quan Họ" },
        { "id": "...", "type": "Tag", "label": "Ca Trù" }
      ]
    },
    {
      "relationType": "HAS_INSTRUMENT",
      "relationLabel": "Nhạc cụ đặc trưng",
      "count": 8,
      "samples": [
        { "id": "...", "type": "Instrument", "label": "Đàn Bầu" }
      ]
    }
  ],
  "properties": {
    "population": "~85% dân số Việt Nam",
    "regions": ["Đồng bằng sông Hồng", "Nam Bộ", "Toàn quốc"]
  }
}
```

### Lỗi cần handle
```
404 → Node not found với id + type đã cho
400 → nodeType không hợp lệ (không nằm trong enum cho phép)
```

---

## 2. `GET /api/KnowledgeGraph/shortest-path`
### **Mục đích**: Tìm đường đi ngắn nhất giữa 2 node — dùng khi user chọn 2 node và muốn xem chúng liên quan thế nào

### Request
```
GET /api/KnowledgeGraph/shortest-path?fromId={id}&fromType={type}&toId={id}&toType={type}&maxDepth={n}
```

| Param | Loại | Bắt buộc | Default | Mô tả |
|---|---|---|---|---|
| `fromId` | `string (uuid)` | ✅ | — | GUID node xuất phát |
| `fromType` | `string` | ✅ | — | Entity type của node xuất phát |
| `toId` | `string (uuid)` | ✅ | — | GUID node đích |
| `toType` | `string` | ✅ | — | Entity type của node đích |
| `maxDepth` | `int` | ❌ | `6` | Giới hạn độ sâu tìm kiếm (tránh timeout) |

### Response DTO (mới — cần tạo)
```csharp
public class ShortestPathResponseDto
{
    // true nếu tìm thấy đường nối, false nếu không liên quan
    public bool PathFound { get; set; }

    // Độ dài đường đi (số edges). Null nếu không tìm thấy
    public int? PathLength { get; set; }

    // Danh sách nodes theo thứ tự trên đường đi (bao gồm cả from và to)
    public List<PathNodeDto> Nodes { get; set; }

    // Danh sách edges theo thứ tự trên đường đi
    public List<PathEdgeDto> Edges { get; set; }

    // Nếu không tìm thấy, gợi ý các node trung gian có thể là bridge
    public List<NodeSummaryDto>? SuggestedBridges { get; set; }
}

public class PathNodeDto
{
    public string Id { get; set; }
    public string Type { get; set; }
    public string Label { get; set; }
    public int StepIndex { get; set; }   // 0 = fromNode, n = toNode
}

public class PathEdgeDto
{
    public string FromId { get; set; }
    public string ToId { get; set; }
    public string RelationType { get; set; }
    public string RelationLabel { get; set; }   // Human-readable label
}
```

### Cypher query tham khảo (Neo4j — **ưu tiên dùng Neo4j cho tính năng này**)
```cypher
MATCH (from {id: $fromId}), (to {id: $toId})
MATCH path = shortestPath((from)-[*..6]-(to))
RETURN nodes(path) AS pathNodes, relationships(path) AS pathRels
```

### PostgreSQL fallback (BFS trên bảng edges)
```sql
-- Dùng recursive CTE để BFS
WITH RECURSIVE path AS (
  SELECT source_id, target_id, relation_type, 
         ARRAY[source_id] AS visited,
         ARRAY[ROW(source_id, target_id, relation_type)] AS edges,
         1 AS depth
  FROM KnowledgeGraphEdges
  WHERE source_id = @fromId

  UNION ALL

  SELECT e.source_id, e.target_id, e.relation_type,
         p.visited || e.target_id,
         p.edges || ROW(e.source_id, e.target_id, e.relation_type),
         p.depth + 1
  FROM KnowledgeGraphEdges e
  JOIN path p ON (e.source_id = p.target_id OR e.target_id = p.source_id)
  WHERE NOT (e.source_id = ANY(p.visited) OR e.target_id = ANY(p.visited))
    AND p.depth < @maxDepth
)
SELECT * FROM path WHERE target_id = @toId
ORDER BY depth ASC
LIMIT 1
```

> ⚠️ **Lưu ý**: BFS trên PostgreSQL sẽ chậm với graph lớn. **Khuyến nghị mạnh**: dùng Neo4j cho endpoint này, PostgreSQL chỉ là fallback khi Neo4j offline.

### Response mẫu — Tìm thấy đường nối
```json
{
  "pathFound": true,
  "pathLength": 3,
  "nodes": [
    { "id": "aaa", "type": "EthnicGroup", "label": "Dân Tộc Kinh", "stepIndex": 0 },
    { "id": "bbb", "type": "Tag", "label": "Nhạc Dân Gian", "stepIndex": 1 },
    { "id": "ccc", "type": "Tag", "label": "V-Pop", "stepIndex": 2 },
    { "id": "ddd", "type": "Recording", "label": "Chạy Ngay Đi", "stepIndex": 3 }
  ],
  "edges": [
    { "fromId": "aaa", "toId": "bbb", "relationType": "HAS_MUSICAL_STYLE", "relationLabel": "có thể loại nhạc" },
    { "fromId": "bbb", "toId": "ccc", "relationType": "EVOLVED_INTO", "relationLabel": "phát triển thành" },
    { "fromId": "ccc", "toId": "ddd", "relationType": "BELONGS_TO", "relationLabel": "thuộc thể loại" }
  ],
  "suggestedBridges": null
}
```

### Response mẫu — Không tìm thấy đường nối
```json
{
  "pathFound": false,
  "pathLength": null,
  "nodes": [],
  "edges": [],
  "suggestedBridges": [
    { "id": "xyz", "type": "Tag", "label": "Nhạc Điện Tử" },
    { "id": "uvw", "type": "Province", "label": "Hà Nội" }
  ]
}
```

### Lỗi cần handle
```
404 → fromId hoặc toId không tồn tại trong database
400 → fromId == toId (không hợp lệ)
408 → Timeout (tăng maxDepth quá cao, trả về 408 với message gợi ý giảm maxDepth)
```

---

## 3. `GET /api/graph-explorer/node/{id}`
### **Mục đích**: Tương tự endpoint #1 nhưng cho Neo4j backend — lấy chi tiết node từ Neo4j

### Request
```
GET /api/graph-explorer/node/{id}
```

| Param | Loại | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | `string` | ✅ | Neo4j internal node ID hoặc entity GUID |

### Response DTO (mới — cần tạo, dùng chung kiểu với endpoint #1 hoặc tạo riêng)
```csharp
// Có thể reuse NodeDetailDto từ endpoint #1
// Hoặc tạo GraphExplorerNodeDetailDto riêng nếu Neo4j có schema khác
public class GraphExplorerNodeDetailDto
{
    public string Id { get; set; }
    public string Label { get; set; }
    public string Group { get; set; }    // = node label trong Neo4j
    public Dictionary<string, object>? Properties { get; set; }
    public int DegreeCount { get; set; }   // Số edges kề
    public List<GraphExplorerNeighborSummaryDto> Neighbors { get; set; }
}

public class GraphExplorerNeighborSummaryDto
{
    public string Id { get; set; }
    public string Label { get; set; }
    public string Group { get; set; }
    public string RelationType { get; set; }
    public string Direction { get; set; }   // "IN" | "OUT" | "BOTH"
}
```

### Cypher query
```cypher
MATCH (n)
WHERE n.id = $id OR ID(n) = toInteger($id)
OPTIONAL MATCH (n)-[r]-(neighbor)
WITH n, 
     collect(DISTINCT {
       relType: type(r),
       direction: CASE WHEN startNode(r) = n THEN 'OUT' ELSE 'IN' END,
       neighborId: neighbor.id,
       neighborLabel: neighbor.name,
       neighborGroup: labels(neighbor)[0]
     })[0..10] AS neighbors
RETURN n, neighbors, size((n)--()) AS degree
```

---

## 4. `GET /api/graph-explorer/shortest-path`
### **Mục đích**: Shortest path qua Neo4j — nhanh hơn PG rất nhiều

### Request
```
GET /api/graph-explorer/shortest-path?fromId={id}&toId={id}&maxDepth={n}
```

| Param | Loại | Default |
|---|---|---|
| `fromId` | `string` | — |
| `toId` | `string` | — |
| `maxDepth` | `int` | `6` |

### Response
Reuse `GraphExplorerResponseDto` đã có nhưng thêm field `pathFound` và `pathLength`:
```csharp
public class GraphExplorerPathResponseDto : GraphExplorerResponseDto
{
    public bool PathFound { get; set; }
    public int? PathLength { get; set; }
    // nodes[] và links[] được kế thừa từ GraphExplorerResponseDto
    // chứa đúng các node/link trên đường đi (theo thứ tự)
}
```

### Cypher query
```cypher
MATCH (from), (to)
WHERE from.id = $fromId AND to.id = $toId
MATCH path = shortestPath((from)-[*..{maxDepth}]-(to))
WITH nodes(path) AS pathNodes, relationships(path) AS pathRels
RETURN [n IN pathNodes | {id: n.id, label: n.name, group: labels(n)[0]}] AS nodes,
       [r IN pathRels | {source: startNode(r).id, target: endNode(r).id, type: type(r)}] AS links
```

---

## ✅ Checklist Triển Khai

### Bước 1 — Tạo DTOs mới
- [ ] `NodeDetailDto` + `NodeStatsDto` + `NodeRelationGroupDto` + `NodeSummaryDto` + `PathNodeDto` + `PathEdgeDto`
- [ ] `ShortestPathResponseDto`
- [ ] `GraphExplorerNodeDetailDto` + `GraphExplorerNeighborSummaryDto`
- [ ] `GraphExplorerPathResponseDto`

> **Đặt DTOs tại**: `VietTuneArchive.Application/Mapper/DTOs/KnowledgeGraph/`  
> (theo convention của project — xem `@/types/knowledgeGraphApi.ts` để biết FE expect gì)

### Bước 2 — Tạo Services / Queries
- [ ] `IKnowledgeGraphService.GetNodeDetailAsync(id, nodeType)`
- [ ] `IKnowledgeGraphService.GetShortestPathAsync(fromId, fromType, toId, toType, maxDepth)`
- [ ] `IGraphExplorerService.GetNodeDetailAsync(id)`
- [ ] `IGraphExplorerService.GetShortestPathAsync(fromId, toId, maxDepth)`

### Bước 3 — Tạo Controller Actions

#### `KnowledgeGraphController.cs` — thêm 2 actions:
```csharp
[HttpGet("node/{id}")]
public async Task<ActionResult<NodeDetailDto>> GetNodeDetail(
    string id, 
    [FromQuery] string nodeType)

[HttpGet("shortest-path")]
public async Task<ActionResult<ShortestPathResponseDto>> GetShortestPath(
    [FromQuery] string fromId,
    [FromQuery] string fromType,
    [FromQuery] string toId,
    [FromQuery] string toType,
    [FromQuery] int maxDepth = 6)
```

#### `GraphExplorerController.cs` — thêm 2 actions:
```csharp
[HttpGet("node/{id}")]
public async Task<ActionResult<GraphExplorerNodeDetailDto>> GetNodeDetail(string id)

[HttpGet("shortest-path")]
public async Task<ActionResult<GraphExplorerPathResponseDto>> GetShortestPath(
    [FromQuery] string fromId,
    [FromQuery] string toId,
    [FromQuery] int maxDepth = 6)
```

### Bước 4 — Xác nhận Swagger tự update
- [ ] Build project → Swagger UI tại `/swagger` phải hiện 4 endpoints mới
- [ ] Copy `swagger.json` mới vào FE tại `src/api/swagger.latest.json`
- [ ] Chạy lệnh generate types FE: `npm run generate-api` (hoặc lệnh tương đương)

### Bước 5 — Test
- [ ] Unit test cho shortest path: 2 node cùng entity, 2 node khác entity, 2 node không liên quan
- [ ] Test timeout khi `maxDepth` quá lớn (ví dụ maxDepth=20)
- [ ] Test `node/{id}` với node type không tồn tại → phải trả 404 rõ ràng

---

## ⚠️ Lưu Ý Quan Trọng

### 1. Convention đặt tên
- **FE expect camelCase** trong JSON response (FE có code tự xử lý cả camelCase và PascalCase nhưng ưu tiên camelCase)
- Xem `knowledgeGraphService.ts` hàm `pickRecord()` — nó handle cả 2 case

### 2. Relation type labels — cần có mapping human-readable
FE cần hiển thị label đẹp cho edge relations. Nên tạo một bảng mapping:
```csharp
private static readonly Dictionary<string, string> RelationLabels = new()
{
    { "HAS_INSTRUMENT", "Nhạc cụ liên quan" },
    { "PERFORMED_IN", "Biểu diễn trong" },
    { "BELONGS_TO", "Thuộc về" },
    { "RELATED_TO", "Liên quan đến" },
    { "EVOLVED_INTO", "Phát triển thành" },
    // Thêm các relation type còn lại
};
```

### 3. Performance cho Shortest Path
- **Neo4j**: `shortestPath()` là built-in, rất nhanh
- **PostgreSQL**: BFS đệ quy sẽ chậm với graph > 10,000 nodes
- **Giải pháp**: Trong `KnowledgeGraphController.GetShortestPath`, nếu Neo4j available → delegate sang Neo4j service; nếu không → dùng PG với limit maxDepth = 4

### 4. SuggestedBridges khi không tìm thấy path
Khi `pathFound = false`, FE sẽ hiển thị gợi ý cho user. Cách tìm bridge nodes:
```cypher
// Tìm nodes có nhiều kết nối nhất (high-degree nodes) gần cả 2 node
MATCH (from {id: $fromId})-[*1..2]-(near_from)
MATCH (to {id: $toId})-[*1..2]-(near_to)
WHERE near_from = near_to
RETURN near_from LIMIT 5
```

### 5. Authorization
- Các endpoints này **không yêu cầu authentication** (đồng nhất với các endpoints KnowledgeGraph hiện tại)
- Trừ khi policy yêu cầu khác

---

## 📋 Tóm Tắt Endpoints Cần Tạo

| Endpoint | Method | Controller | Ưu tiên |
|---|---|---|---|
| `/api/KnowledgeGraph/node/{id}` | GET | KnowledgeGraphController | 🔴 Cao |
| `/api/KnowledgeGraph/shortest-path` | GET | KnowledgeGraphController | 🔴 Cao |
| `/api/graph-explorer/node/{id}` | GET | GraphExplorerController | 🟡 Trung bình |
| `/api/graph-explorer/shortest-path` | GET | GraphExplorerController | 🟡 Trung bình |

> `graph-explorer/*` (Neo4j) là ưu tiên thấp hơn vì FE hiện có thể fallback về PG backend. Tuy nhiên shortest-path **nên làm Neo4j trước** vì PG rất chậm cho tính năng này.

---

## 🔗 Tài liệu tham khảo

- FE service gọi KG: `src/services/knowledgeGraphService.ts`
- FE service gọi Neo4j: `src/services/graphExplorerService.ts`
- FE type definitions: `src/types/knowledgeGraphApi.ts`, `src/types/graphExplorerApi.ts`, `src/types/graph.ts`
- FE controller hook: `src/features/knowledge-graph/hooks/useKnowledgeGraphController.ts`
- Swagger hiện tại: `src/api/swagger.latest.json`
