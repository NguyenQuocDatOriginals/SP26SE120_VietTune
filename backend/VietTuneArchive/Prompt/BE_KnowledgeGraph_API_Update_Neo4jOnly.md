# 📝 Update: Knowledge Graph — Chuyển Hoàn Toàn Sang Neo4j

> **Loại file**: Bổ sung / Đính chính cho `BE_KnowledgeGraph_API_Guide.md`  
> **Ngày update**: 2026-06-07  
> **Lý do**: Quyết định kiến trúc — **không dùng PostgreSQL cho graph nữa**, toàn bộ graph operations phải đi qua Neo4j.

---

## ⚠️ Quyết Định Kiến Trúc Quan Trọng

> **PostgreSQL chỉ còn phục vụ**: data lưu trữ, search text, vector embedding (Semantic Search).  
> **Neo4j phục vụ**: toàn bộ graph traversal, explore, shortest-path, node detail, overview graph.

---

## 🔴 Những Gì Cần Thay Đổi

### 1. `KnowledgeGraphService.cs` — **Không dùng cho graph nữa**

File hiện tại (`KnowledgeGraphService.cs` — 1,304 dòng) đang implement graph traversal bằng cách query PostgreSQL trực tiếp (EF Core + BFS thủ công). **Toàn bộ phần graph traversal này phải được thay thế bằng Neo4j.**

**Các method cần thay thế** (hiện đang dùng `_db` / EF Core để traverse graph):

| Method cũ (PG BFS) | Thay thế bằng |
|---|---|
| `ExploreNodeAsync()` — BFS bằng Queue + EF Core | Delegate sang `IGraphExplorerService.ExpandNodeAsync()` |
| `GetOverviewGraphAsync()` — Query nhiều bảng PG | Cypher query Neo4j |
| `GetRelationshipGraphAsync()` — Switch-case từng pair | Cypher query Neo4j với label filter |
| `GetNodeDetailAsync()` — Query từng entity table PG | **ĐÃ có** ở `GraphExplorerService.GetNodeDetailAsync()` |
| `GetShortestPathAsync()` — Chưa implement | **ĐÃ có** ở `GraphExplorerService.GetShortestPathAsync()` |

> **Lưu ý**: `SearchNodesAsync()` và `GetStatsAsync()` **GIỮ NGUYÊN** — chúng truy vấn PostgreSQL để search text và đếm số liệu, không phải graph traversal.

---

### 2. `IKnowledgeGraphService.cs` — Interface cần update

**Hiện tại**:
```csharp
Task<GraphResponseDto> ExploreNodeAsync(GraphExploreRequest request);
Task<List<GraphNodeDto>> SearchNodesAsync(GraphSearchRequest request);
Task<GraphResponseDto> GetOverviewGraphAsync(int maxNodes = 100);
Task<GraphStatsDto> GetStatsAsync();
Task<GraphResponseDto> GetRelationshipGraphAsync(string sourceType, string targetType, int limit = 100);
Task<NodeDetailDto?> GetNodeDetailAsync(Guid id, string nodeType);
Task<ShortestPathResponseDto> GetShortestPathAsync(Guid fromId, string fromType, Guid toId, string toType, int maxDepth);
```

**Sau khi update** — `GetNodeDetailAsync` và `GetShortestPathAsync` không cần ở đây nữa vì đã có trực tiếp ở `IGraphExplorerService`:
```csharp
// GIỮ NGUYÊN — vẫn query PG
Task<List<GraphNodeDto>> SearchNodesAsync(GraphSearchRequest request);
Task<GraphStatsDto> GetStatsAsync();

// THAY BẰNG NEO4J — delegate sang IGraphExplorerService
Task<GraphResponseDto> ExploreNodeAsync(GraphExploreRequest request);
Task<GraphResponseDto> GetOverviewGraphAsync(int maxNodes = 100);
Task<GraphResponseDto> GetRelationshipGraphAsync(string sourceType, string targetType, int limit = 100);
```

---

### 3. `KnowledgeGraphController.cs` — Redirect sang Graph Explorer

**Các endpoints phải delegate sang `IGraphExplorerService` thay vì `IKnowledgeGraphService`:**

#### `POST /api/KnowledgeGraph/explore` → delegate Neo4j
```csharp
// TRƯỚC (PG BFS)
var result = await _graphService.ExploreNodeAsync(request);

// SAU (Neo4j)
// Controller inject thêm IGraphExplorerService
var result = await _graphExplorerService.ExpandNodeAsync(request.NodeId, request.NodeType, null);
```

#### `GET /api/KnowledgeGraph/overview` → Cypher Neo4j
```csharp
// SAU — Gọi Neo4j overview query
var result = await _graphExplorerService.GetOverviewGraphAsync(maxNodes);
```

#### `GET /api/KnowledgeGraph/node/{id}` → đã delegate GraphExplorerService ✅
```csharp
// Endpoint này trong controller đang gọi _graphService.GetNodeDetailAsync()
// Cần redirect sang _graphExplorerService.GetNodeDetailAsync(id.ToString())
// VÀ bỏ param nodeType vì Neo4j không cần — tự detect từ node label
```

#### `GET /api/KnowledgeGraph/shortest-path` → đã delegate GraphExplorerService ✅
```csharp
// Endpoint này đang gọi _graphService.GetShortestPathAsync(fromGuid, fromType, ...)
// Cần redirect sang _graphExplorerService.GetShortestPathAsync(fromId, toId, maxDepth)
// VÀ bỏ fromType/toType vì Neo4j không cần
```

---

## ✅ Những Gì GIỮ NGUYÊN (Không Thay Đổi)

### PostgreSQL vẫn phục vụ bình thường cho:
- `GET /api/KnowledgeGraph/search` → Text search trên PG ✅
- `GET /api/KnowledgeGraph/stats` → Count entities trên PG ✅
- Toàn bộ các API khác (Recording, EthnicGroup, Annotation, v.v.) ✅
- Vector search / Semantic search (Supabase pgvector) ✅

### Neo4j Graph Explorer (đã implement và hoạt động):
- `GET /api/graph-explorer/search` ✅
- `GET /api/graph-explorer/expand` ✅
- `GET /api/graph-explorer/node/{id}` ✅ — **ĐÃ IMPLEMENT bởi BE Agent**
- `GET /api/graph-explorer/shortest-path` ✅ — **ĐÃ IMPLEMENT bởi BE Agent**

---

## 🏗️ Kiến Trúc Mới — Phân Tách Rõ Ràng

```
┌─────────────────────────────────────────────────────────┐
│                  KnowledgeGraphController               │
│  /api/KnowledgeGraph/*                                  │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
               ▼                      ▼
   ┌───────────────────┐   ┌──────────────────────────┐
   │ IKnowledgeGraph   │   │   IGraphExplorerService   │
   │ Service (PG)      │   │   (Neo4j)                 │
   │                   │   │                           │
   │ ✅ SearchNodes    │   │ ✅ SearchEntities          │
   │ ✅ GetStats       │   │ ✅ ExpandNode              │
   │ ❌ ExploreNode    │→→→│ ✅ GetNodeDetail           │
   │ ❌ GetOverview    │→→→│ ✅ GetShortestPath         │
   │ ❌ GetNodeDetail  │→→→│ 🆕 GetOverviewGraph        │
   │ ❌ ShortestPath   │→→→│ 🆕 GetRelationshipGraph    │
   └───────────────────┘   └──────────────────────────┘
               │                      │
               ▼                      ▼
   ┌───────────────────┐   ┌──────────────────────────┐
   │   PostgreSQL      │   │        Neo4j              │
   │   (data store)    │   │   (graph database)        │
   └───────────────────┘   └──────────────────────────┘
```

---

## 📋 Checklist Thay Đổi Cần Làm

### Bước 1 — Thêm methods vào `IGraphExplorerService`
```csharp
// Thêm 2 methods mới vào interface
Task<GraphResponseDto> GetOverviewGraphAsync(int maxNodes = 100);
Task<GraphResponseDto> GetRelationshipGraphAsync(string sourceType, string targetType, int limit = 100);
```

### Bước 2 — Implement trong `GraphExplorerService.cs`

#### `GetOverviewGraphAsync` — Cypher tham khảo
```cypher
// Lấy sample nodes từ mỗi label, kết hợp với relationships giữa chúng
MATCH (n)
WHERE n.Id IS NOT NULL
WITH labels(n)[0] AS nodeLabel, n
LIMIT $maxNodes
OPTIONAL MATCH (n)-[r]-(m)
WHERE m.Id IS NOT NULL
RETURN n, r, m
```

#### `GetRelationshipGraphAsync` — Cypher tham khảo
```cypher
// Filter theo sourceType và targetType
MATCH (s:{sourceLabel})-[r]-(t:{targetLabel})
WHERE s.Id IS NOT NULL AND t.Id IS NOT NULL
RETURN s, r, t
LIMIT $limit
```
> ⚠️ Nhớ validate `sourceLabel` và `targetLabel` chống injection (như đã làm với `targetLabel` trong `ExpandNodeAsync`)

### Bước 3 — Update `KnowledgeGraphController.cs`

Inject thêm `IGraphExplorerService` vào controller:
```csharp
public KnowledgeGraphController(
    IKnowledgeGraphService graphService,
    IGraphExplorerService graphExplorerService)   // ← thêm
```

Redirect các actions sau sang Neo4j:
- `ExploreNode` → `_graphExplorerService.ExpandNodeAsync()`
- `GetOverview` → `_graphExplorerService.GetOverviewGraphAsync()`
- `GetRelationship` → `_graphExplorerService.GetRelationshipGraphAsync()`
- `GetNodeDetail` → `_graphExplorerService.GetNodeDetailAsync(id)` + **bỏ `nodeType` param**
- `GetShortestPath` → `_graphExplorerService.GetShortestPathAsync()` + **bỏ `fromType`, `toType`**

### Bước 4 — Cập nhật endpoint signatures

**`GET /api/KnowledgeGraph/node/{id}`** — bỏ `nodeType`:
```
TRƯỚC: GET /api/KnowledgeGraph/node/{id}?nodeType=EthnicGroup
SAU:   GET /api/KnowledgeGraph/node/{id}
```
> Neo4j tự detect node label — không cần client truyền type.

**`GET /api/KnowledgeGraph/shortest-path`** — bỏ `fromType`, `toType`:
```
TRƯỚC: GET /api/KnowledgeGraph/shortest-path?fromId=...&fromType=...&toId=...&toType=...
SAU:   GET /api/KnowledgeGraph/shortest-path?fromId=...&toId=...&maxDepth=6
```

> **⚠️ FE cần update theo** — xem phần FE Impact bên dưới.

### Bước 5 — Cleanup `KnowledgeGraphService.cs`

Xóa (hoặc comment) các phần không còn dùng:
- `ExploreNodeAsync()` và helper `GetNeighborsAsync()`
- `GetOverviewGraphAsync()`
- `GetRelationshipGraphAsync()`
- `GetNodeDetailAsync()` (toàn bộ switch-case 600+ dòng)
- `GetShortestPathAsync()` (nếu đã implement ở đây)
- Helper methods: `GetNodeByIdAsync()`, `ToNodeXxx()`, `DeduplicateEdges()`

**GIỮ LẠI**:
- `SearchNodesAsync()` — vẫn query PG
- `GetStatsAsync()` — vẫn query PG
- `RelationLabels` dictionary — có thể move sang `GraphExplorerService`

---

## 📡 FE Impact — Những Gì FE Cần Biết

Sau khi BE thay đổi, **FE cần update** các chỗ sau:

### 1. `knowledgeGraphService.ts` — `exploreNode()`
Hiện đang gọi `POST /api/KnowledgeGraph/explore` với body có `nodeType`.  
→ Giữ nguyên endpoint nhưng BE sẽ delegate sang Neo4j tự động.

### 2. `knowledgeGraphService.ts` — **xóa `nodeType` param** khỏi `getNodeDetail`
```typescript
// TRƯỚC
GET /api/KnowledgeGraph/node/{id}?nodeType=EthnicGroup

// SAU  
GET /api/KnowledgeGraph/node/{id}
```

### 3. `knowledgeGraphService.ts` — **xóa `fromType`, `toType`** khỏi `getShortestPath`
```typescript
// TRƯỚC
GET /api/KnowledgeGraph/shortest-path?fromId=...&fromType=...&toId=...&toType=...

// SAU
GET /api/KnowledgeGraph/shortest-path?fromId=...&toId=...&maxDepth=6
```

### 4. Response format thay đổi nhẹ

`/api/KnowledgeGraph/node/{id}` sẽ trả về `GraphExplorerNodeDetailDto` (Neo4j format) thay vì `NodeDetailDto` (PG format):

| Field | PG format (cũ) | Neo4j format (mới) |
|---|---|---|
| Node type | `type` | `group` |
| Relation groups | `relationGroups[]` | `neighbors[]` |
| Stats object | `stats { totalConnections... }` | `degreeCount` |

> FE cần update type mapping trong `useKnowledgeGraphController.ts` và adapter layer.

---

## 🧹 Tóm Tắt Công Việc

| Task | File | Action |
|---|---|---|
| Thêm `GetOverviewGraphAsync` vào interface | `IGraphExplorerService.cs` | Thêm method |
| Thêm `GetRelationshipGraphAsync` vào interface | `IGraphExplorerService.cs` | Thêm method |
| Implement 2 methods Neo4j | `GraphExplorerService.cs` | Implement với Cypher |
| Redirect explore/overview/relationship | `KnowledgeGraphController.cs` | Inject + redirect |
| Bỏ `nodeType` param | `KnowledgeGraphController.cs` | Sửa `GetNodeDetail` |
| Bỏ `fromType/toType` params | `KnowledgeGraphController.cs` | Sửa `GetShortestPath` |
| Cleanup PG graph code | `KnowledgeGraphService.cs` | Xóa/comment |
| Giữ SearchNodes + GetStats | `KnowledgeGraphService.cs` | **Không đổi** |

---

## 📎 Files Tham Khảo

- `GraphExplorerService.cs` — Implementation Neo4j hiện tại (324 dòng, đã có GetNodeDetail + GetShortestPath)
- `IGraphExplorerService.cs` — Interface Neo4j (4 methods)
- `GraphExplorerDtos.cs` — DTOs Neo4j (GraphNodeDto, GraphLinkDto, GraphResponseDto, GraphExplorerNodeDetailDto, GraphExplorerPathResponseDto)
- `KnowledgeGraphController.cs` — Controller cần update
- `KnowledgeGraphService.cs` — Service PG cần cleanup (1,304 dòng)
