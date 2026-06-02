# API cần cho vai trò ADMIN (theo OpenAPI / `swagger.json`)

Tài liệu này liệt kê các **HTTP API** liên quan tới khu vực quản trị, dựa trên **`src/api/swagger.json`** (OpenAPI 3.0.1, `VietTuneArchive` v1).  
**Lưu ý:** file Swagger áp dụng **`security: Bearer` (JWT) toàn cục**; quyền **role ADMIN** (hoặc tổ hợp role) do **backend ASP.NET** quyết định — OpenAPI export này **không** mô tả chi tiết policy từng endpoint.

---

## 1. Nhóm Swagger tag **`Admin`** (đường `/api/Admin/*`)

Đây là bề mặt API được gắn tag rõ ràng cho quản trị trong contract.

| Method | Path | Query / body (tóm tắt) | Ghi chú |
|--------|------|-------------------------|---------|
| `GET` | `/api/Admin/users` | Query: `page`, `pageSize`, `role`, `status` | Paged `UserAdminDto` |
| `GET` | `/api/Admin/users/{id}` | Path: `id` (uuid) | `UserDetailAdminDto` |
| `PUT` | `/api/Admin/users/{id}/role` | Body: `UpdateRoleRequest` (`role`) | FE: `adminApi.updateUserRole` |
| `PUT` | `/api/Admin/users/{id}/status` | Body: `UpdateStatusRequest` (`status`) | FE: `adminApi.updateUserStatus` |
| `GET` | `/api/Admin/submissions` | Query: `page`, `pageSize`, `status`, `reviewer` | Paged `SubmissionAdminDto` |
| `POST` | `/api/Admin/submissions/{id}/assign` | Body: `AssignReviewerRequest` (`reviewerId`) | Gán reviewer |
| `GET` | `/api/Admin/audit-logs` | Query: `page`, `pageSize`, `from`, `to` (date-time) | Paged `AuditLogDto` |
| `GET` | `/api/Admin/system-health` | — | `SystemHealthDto` (`status`, `uptime`, `dbConnections`, `queueLength`, `services`) |

**Frontend hiện dùng trực tiếp:** `src/services/adminApi.ts` → `GET/PUT` user endpoints; danh sách user ưu tiên `GET /api/User/GetAll` rồi mới fallback `GET /api/Admin/users`.  
**Frontend khác:** `src/services/expertModerationApi.ts` → `GET /api/Admin/submissions` (luồng moderation / admin submissions).

---

## 2. Người dùng — `User` (dashboard admin vẫn gọi)

| Method | Path | Ghi chú |
|--------|------|---------|
| `GET` | `/api/User/GetAll` | **Ưu tiên** cho bảng quản lý user (`adminApi.getUsers`). Response schema trong Swagger tối giản; thực tế BE trả envelope/payload theo convention app. |

Các endpoint `User` khác (`GetById`, `update-password`, `update-profile`, `PUT /api/User`, …) phục vụ hồ sơ/self-service hơn là “admin console”, nhưng vẫn nằm trong cùng contract nếu admin cần mở rộng.

---

## 3. Analytics — tag **`Analytics`** (dashboard `/admin`)

`useAdminDashboardData` + `analyticsApi` gọi các path sau:

| Method | Path | Ghi chú |
|--------|------|---------|
| `GET` | `/api/Analytics/overview` | Tổng quan (số bản ghi, v.v.) |
| `GET` | `/api/Analytics/submissions` | Xu hướng theo tháng / submission analytics |
| `GET` | `/api/Analytics/contributors` | Bảng / leaderboard contributor |
| `GET` | `/api/Analytics/experts` | Query: `period` (mặc định FE: `30d`) — hiệu suất expert |
| `GET` | `/api/Analytics/coverage` | *(Có trong service; dashboard có thể gọi gián tiếp qua tương lai)* |
| `GET` | `/api/Analytics/content` | Query: `type` — *(service hỗ trợ; panel có thể chưa bind hết)* |

Backend cần cho phép **ADMIN** (hoặc role được ủy quyền) đọc các endpoint read-only này nếu muốn dashboard hiển thị dữ liệu thật.

---

## 4. Knowledge Base — tag **`KBEntries`** (`/admin/knowledge-base`)

| Method | Path | Ghi chú |
|--------|------|---------|
| `GET` | `/api/kb-entries` | Query: `Category`, `Status`, `Search`, `SortBy`, `SortOrder`, `Page`, `PageSize` |
| `POST` | `/api/kb-entries` | Body: `CreateKBEntryRequest` |
| `GET` | `/api/kb-entries/by-slug/{slug}` | Đọc theo slug (public + admin) |
| `GET` | `/api/kb-entries/{id}` | |
| `PUT` | `/api/kb-entries/{id}` | Body: `UpdateKBEntryRequest` |
| `DELETE` | `/api/kb-entries/{id}` | |
| `PATCH` | `/api/kb-entries/{id}/status` | Body: `UpdateKBEntryStatusRequest` |
| `GET` | `/api/kb-entries/{entryId}/citations` | |
| `POST` | `/api/kb-entries/{entryId}/citations` | Body: `CreateKBCitationRequest` |
| `PUT` | `/api/kb-entries/citations/{citationId}` | Body: `UpdateKBCitationRequest` |
| `DELETE` | `/api/kb-entries/citations/{citationId}` | |
| `GET` | `/api/kb-entries/{entryId}/revisions` | |
| `GET` | `/api/kb-entries/revisions/{revisionId}` | |

**Dashboard:** `knowledgeBaseApi.countKnowledgeBaseItems()` dùng `GET /api/kb-entries` với `Page`/`PageSize` nhỏ để lấy `total`.

---

## 5. QA / cờ AI — tag **`QAMessage`**

| Method | Path | Ghi chú |
|--------|------|---------|
| `GET` | `/api/QAMessage` | Query paged — FE `fetchAllMessages` (đếm / rà flagged trong admin) |
| `POST` | `/api/QAMessage` | |
| `GET` | `/api/QAMessage/get-by-conversation` | |
| `GET` | `/api/QAMessage/{id}` | |
| `PUT` | `/api/QAMessage/{id}` | |
| `PUT` | `/api/QAMessage/flagged` | |
| `PUT` | `/api/QAMessage/unflagged` | |

Admin cần quyền **đọc** tối thiểu danh sách tin nhắn (hoặc endpoint tổng hợp riêng) nếu panel “AI monitoring” dựa vào BE.

---

## 6. RAG / embedding — tag **`RagChat`**

Các nút bảo trì trong `AdminDashboardAiMonitoringPanel` / `ragChatService`:

| Method | Path | Ghi chú |
|--------|------|---------|
| `POST` | `/api/rag-chat/embeddings/backfill` | Backfill embedding (pipeline mặc định) |
| `POST` | `/api/rag-chat/embeddings/backfill-768` | Backfill 768-dim |
| `POST` | `/api/rag-chat/embeddings/regenerate/{recordingId}` | |
| `POST` | `/api/rag-chat/embeddings/generate/{recordingId}` | |

Toàn bộ nhóm **`/api/rag-chat/conversations*`** (POST/GET/DELETE conversation & messages) có trong Swagger; admin có thể dùng chung nếu mở chat thử nghiệm từ UI quản trị.

---

## 7. Master data — `EthnicGroup` & `Instrument`

Trang **`/admin/master-data`** (và `useAdminDashboardData`) cần đọc/ghi dữ liệu tham chiếu. Trong Swagger có (tối thiểu):

**`EthnicGroup`**

| Method | Path |
|--------|------|
| `GET` | `/api/EthnicGroup` |
| `POST` | `/api/EthnicGroup` |
| `GET` | `/api/EthnicGroup/{id}` |
| `PUT` | `/api/EthnicGroup/{id}` |
| `DELETE` | `/api/EthnicGroup/{id}` |

**`Instrument`** (và các path con như `/api/Instrument/search`, `/api/Instrument/categories/list`, `/api/Instrument/category/{category}`, `/api/Instrument/ethnic-group/{ethnicGroupId}`, … — xem đầy đủ trong `swagger.json`).

**Khuyến nghị policy:** chỉ **ADMIN** (hoặc service account) được `POST`/`PUT`/`DELETE`; contributor chỉ `GET` nếu cần.

---

## 8. Bản ghi — tag **`Recording`**

Dashboard aggregate dùng danh sách bản ghi (qua `legacyGet('/Recording')` → thường là **`GET /api/Recording`** với base `/api`).

| Method | Path | Ghi chú |
|--------|------|---------|
| `GET` | `/api/Recording` | Query: `page`, `pageSize` (và các filter khác nếu có trên contract) |

Các path con `/api/Recording/*` trong Swagger phục vụ tìm kiếm, chi tiết, v.v. — admin có thể cần subset tùy tính năng (xóa local vs xóa server là hai việc khác nhau trong FE hiện tại).

---

## 9. Knowledge graph — tag **`KnowledgeGraph`**

| Method | Path | Ghi chú |
|--------|------|---------|
| `POST` | `/api/KnowledgeGraph/explore` | Body: `GraphExploreRequest` |
| `GET` | `/api/KnowledgeGraph/search` | Query: `query`, `types`, `limit` |
| `GET` | `/api/KnowledgeGraph/overview` | |
| `GET` | `/api/KnowledgeGraph/stats` | |
| `GET` | `/api/KnowledgeGraph/relationship` | Query: `source`, `target`, `limit` |

Liên quan tới luồng **Researcher** / khám phá đồ thị; admin có thể được cấp quyền đọc nếu product yêu cầu.

---

## 10. Submission pipeline — tag **`Submission`**

Luồng duyệt bài gửi (expert / contributor) dùng nhiều endpoint dưới `/api/Submission/...` (create, approve, reject, edit-request, …). Admin có thể cần subset này nếu mở rộng UI ngoài `Admin` submissions list.

---

## 11. Không có trong `swagger.json` (FE vẫn có thể gọi)

| Khu vực | Ghi chú |
|---------|---------|
| **`vector-sync/*`** | `vectorSyncService` dùng `legacyPost`/`legacyGet` tới path kiểu `/vector-sync/...` — **không** thấy trong `swagger.json` của repo; thường là service/proxy riêng hoặc contract cũ. |

---

## 12. Tóm tắt “tối thiểu” cho ADMIN (theo contract + FE hiện tại)

1. **Bearer JWT** hợp lệ trên mọi request (theo `components.securitySchemes` + `security` global).  
2. **User management:** `GET /api/User/GetAll` hoặc `GET /api/Admin/users` + `PUT` role/status trên `/api/Admin/users/...`.  
3. **Dashboard số liệu:** `GET /api/Analytics/*` (overview, submissions, contributors, experts).  
4. **KB:** `GET /api/kb-entries` (đếm + list) + CRUD/citations/revisions nếu dùng hết trang KB admin.  
5. **QA / flagged:** `GET /api/QAMessage` (và các `PUT flagged` nếu cho phép admin xử lý cờ).  
6. **RAG ops (tuỳ chọn):** `POST /api/rag-chat/embeddings/backfill*`.  
7. **Master data:** `EthnicGroup` + `Instrument` (đọc/ghi theo UI).  
8. **Recording list:** `GET /api/Recording` (đồng bộ với cách FE load).  
9. **Hàng chờ / audit (tuỳ chọn BE):** `GET /api/Admin/submissions`, `POST .../assign`, `GET /api/Admin/audit-logs`, `GET /api/Admin/system-health`.

Khi cập nhật backend, hãy đồng bộ lại file **`src/api/swagger.json`** (và generator types trong `src/api` nếu có) rồi chỉnh lại bảng trên cho khớp version mới.

---

## 13. Checklist BE — chi tiết từng method (`Notification` / `CopyrightDispute` / `Embargo`)

Nguồn: **`src/api/swagger.json`** (OpenAPI 3.0.1). Cột **Response `200`** ghi `$ref`/kiểu chính trong contract (BE nên map đúng envelope thực tế nếu khác).

### 13.1 Tag **`Notification`**

| Method | Path | Tham số / body | Response `200` (theo Swagger) |
|--------|------|----------------|-------------------------------|
| `GET` | `/api/Notification` | Query: `page` (int32, default `1`), `pageSize` (int32, default `20`), `unreadOnly` (boolean, optional) | `PagedList<NotificationDto>` |
| `GET` | `/api/Notification/unread-count` | — | `NotificationDto.UnreadCountDto` |
| `PUT` | `/api/Notification/{id}/read` | Path: `id` (uuid, required) | `BaseResponse` |
| `PUT` | `/api/Notification/read-all` | — | `BaseResponse` |
| `DELETE` | `/api/Notification/{id}` | Path: `id` (uuid, required) | `BaseResponse` |

**Lệch FE ↔ Swagger:** `recordingRequestService` gọi **`POST /api/Notification`** với body tạo thông báo — **không** có operation `POST` trên `/api/Notification` trong bản `swagger.json` hiện tại. Checklist BE: hoặc **thêm** operation vào OpenAPI + implement, hoặc **đổi** FE sang route đã contract hoá.

---

### 13.2 Tag **`CopyrightDispute`**

| Method | Path | Tham số / body | Response `200` (theo Swagger) |
|--------|------|----------------|-------------------------------|
| `POST` | `/api/CopyrightDispute` | Body: `CreateCopyrightDisputeRequest` (`application/json`, `text/json`, `application/*+json`) | `OK` (không mô tả content schema trong export) |
| `GET` | `/api/CopyrightDispute` | Query: `status` → `$ref` **CopyrightDisputeStatus**; `assignedReviewerId` (uuid); `recordingId` (uuid); `page` (int32, default `1`); `pageSize` (int32, default `10`) | `OK` (không mô tả content schema trong export) |
| `GET` | `/api/CopyrightDispute/{disputeId}` | Path: `disputeId` (uuid, required) | `OK` (không mô tả content schema trong export) |
| `POST` | `/api/CopyrightDispute/{disputeId}/assign` | Path: `disputeId` (uuid, required). Body: **`AssignReviewerRequest`** (`reviewerId`: uuid — schema `VietTuneArchive.Application.Mapper.DTOs.Request.AssignReviewerRequest`) | `OK` |
| `POST` | `/api/CopyrightDispute/{disputeId}/resolve` | Path: `disputeId` (uuid, required). Body: **`ResolveDisputeRequest`** | `OK` |
| `POST` | `/api/CopyrightDispute/{disputeId}/evidence` | Path: `disputeId` (uuid, required). Body: **`multipart/form-data`** — object có property `file` (`string`, `format: binary`) | `OK` |

---

### 13.3 Tag **`Embargo`**

| Method | Path | Tham số / body | Response `200` (theo Swagger) |
|--------|------|----------------|-------------------------------|
| `GET` | `/api/Embargo/recording/{recordingId}` | Path: `recordingId` (uuid, required) | `ServiceResponse<EmbargoDto>` |
| `PUT` | `/api/Embargo/recording/{recordingId}` | Path: `recordingId` (uuid, required). Body: **`EmbargoCreateUpdateDto`** (`application/json`, …) | `ServiceResponse<EmbargoDto>` |
| `POST` | `/api/Embargo/recording/{recordingId}/lift` | Path: `recordingId` (uuid, required). Body: **`EmbargoLiftDto`** | `ServiceResponse<EmbargoDto>` |
| `GET` | `/api/Embargo` | Query: `status` → `$ref` **EmbargoStatus**; `page` (int32, default `1`); `pageSize` (int32, default `10`); `from` (date-time); `to` (date-time) | `PagedResponse<EmbargoDto>` |

---

### 13.4 Các nhóm khác (chưa tách bảng từng method tại đây)

| Nhóm | Ghi chú ngắn |
|------|----------------|
| **Review** | Swagger hiện có `/api/Review/get-by-id/{id}`, `get-by-submissionid/{submissionId}`, `create`, `update` — FE còn path **`/api/Review`** và con khác → cần đồng bộ swagger hoặc tài liệu ngoài contract. |
| **QAMessage** | Bổ sung checklist: `DELETE /api/QAMessage/{id}` (đã có trong OpenAPI; mục §5 có thể cập nhật). |
| **AIAnalysis** | `/api/AIAnalysis/*` — tùy product. |
| **Auth / tạo expert** | `/admin/create-expert` demo local; API đăng ký expert trên BE tùy roadmap. |
| **Xóa tài khoản expert** | `accountDeletionService` dùng **localStorage**, không có trong swagger — audit thật cần API riêng. |

Khi regenerate OpenAPI từ backend, cập nhật lại các bảng §13.1–§13.3 cho khớp version mới.
