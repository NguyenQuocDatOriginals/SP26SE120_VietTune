# VietTune Archive – Project Context for AI Assistants

> **Mục đích tài liệu:** Cung cấp ngữ cảnh chính xác cho các AI assistant khác về dự án **VietTune Archive (SP26SE120)** — đối chiếu **những gì đề tài Capstone đăng ký ban đầu** với **những gì đã thực sự được triển khai trong codebase tại thời điểm hiện tại (cuối Sprint, 2026-04-26)**. Đây là tài liệu **đối chiếu thực trạng**, không phải tài liệu marketing.
>
> **Source of truth:**
> - Đề tài gốc: `SP26SE120_VIETTUNE_ARCHIVE_INTELLIGENT_VIETNAMESE_TRADITIONA_HUNGLD5.docx` (Capstone Project Register, 12/12/2025)
> - Code thực tế: `backend/` (.NET 8) + `SP26SE120_VietTune-wip-user-changes-20260420/` (React/Vite)
> - Báo cáo đã review: `Report 7 - Final Project Report (Reviewed).docx` + `Report7_Review_Notes.md`

---

## 1. Tóm tắt dự án (giữ nguyên đúng đề tài)

**Tên dự án (VN):** VietTune Archive – Hệ Thống Lưu Trữ Thông Minh Âm Nhạc Cổ Truyền Việt Nam
**Tên dự án (EN):** VietTune Archive – Intelligent Vietnamese Traditional Music Documentation System
**Mã:** SP26SE120 — **Lớp:** SE / **Specialty:** ES — **Thời gian:** 01/01/2026 → 30/04/2026
**Supervisor:** Lại Đức Hùng (hungld5@fe.edu.vn)
**Team (4 SV):** Phan Võ Ngọc Phú (Leader, SE172810), Trần Thanh Tiến (SE172791), Nguyễn Quốc Đạt (SE172923), Lê Hoành Khánh Duy (SE130032).

**Bối cảnh & mục tiêu (giữ nguyên):** Xây dựng nền tảng crowdsourcing chuyên biệt để tài liệu hóa âm nhạc cổ truyền của 54 dân tộc Việt Nam, có quy trình kiểm duyệt nhiều tầng bởi chuyên gia ethnomusicology, có tìm kiếm ngữ nghĩa và Q&A AI, có phân tích audio tự động.

**4 actor chính** (đã verify trùng đề tài & code policy trong `Program.cs`):
Contributor / Expert (Reviewer) / Researcher / Administrator.

---

## 2. ĐỐI CHIẾU CÔNG NGHỆ — Đề tài vs Thực tế

| Hạng mục | Đề tài đăng ký | **Code thực tế** | Trạng thái |
|---|---|---|---|
| **Backend framework** | Python FastAPI (recommended) hoặc Node.js Express | **.NET 8 / ASP.NET Core Web API (C#) — Clean Architecture (API / Application / Domain)** | **KHÁC** đề tài |
| **Frontend web** | React.js + **Next.js (SSR)** + TypeScript | **React 18 + Vite + TypeScript** (KHÔNG có Next.js, KHÔNG có SSR) | **KHÁC** đề tài |
| **Mobile app** | Flutter cross-platform (Contributor + Researcher) | **CHƯA TRIỂN KHAI** — không có thư mục Flutter trong repo | **CHƯA LÀM** |
| **Relational DB** | PostgreSQL | PostgreSQL (qua EF Core 9.0.9) — README cũ ghi MS SQL Server nhưng config thực tế là PostgreSQL | ĐÃ LÀM |
| **Vector DB** | **Pinecone hoặc Weaviate** | **PostgreSQL — `VectorEmbedding.EmbeddingJson` (JSON-encoded vector trong cột text)**. KHÔNG có Pinecone/Weaviate/pgvector extension. | **KHÁC** đề tài (đơn giản hóa) |
| **Graph DB** | Neo4j cho knowledge graph | **Neo4j** — `KnowledgeGraphService.cs` | ĐÃ LÀM |
| **LLM cho Q&A** | **OpenAI GPT-4 API** + LangChain | **Ollama local (`gemma3:4b`)** qua `LocalLlmService.cs` + `RagChatService.cs`. **KHÔNG có OpenAI, KHÔNG có LangChain.** | **KHÁC** đề tài (chuyển sang local LLM) |
| **Embeddings** | **OpenAI `text-embedding-3`** | **Google Gemini Embedding API** (`GeminiEmbeddingService.cs`) làm primary; **Sentence-Transformers `all-MiniLM-L6-v2`** local (`EmbeddingService.cs`) làm secondary. **KHÔNG dùng OpenAI.** | **KHÁC** đề tài |
| **Lyric transcription** | **OpenAI Whisper API** | **Google Gemini API** (`GeminiTranscriptionService.cs`) primary; **Local Whisper service (Python, port 8002)** chỉ là **offline fallback**. | **KHÁC** đề tài |
| **Audio feature extraction** | Librosa (Python) — tempo, key, prominent freq | **Google Gemini API** làm phân tích chính (instruments, vocal style, tempo, mode) qua `AudioProcessingService.cs`. Local Python service dùng **YAMNet + ONNX classifier** nhưng **chỉ phân loại được 2 nhạc cụ solo: `dan_bau`, `dan_tranh`** (+ `background`). Có hỗ trợ Librosa nhưng vai trò phụ. | **THU HẸP** so với đề tài |
| **File storage** | AWS S3 hoặc Google Cloud Storage + CloudFront CDN | **Supabase Storage** (config trong `Program.cs` + `RecordingService.cs`) | **KHÁC** đề tài (rẻ hơn, đủ dùng) |
| **Auth** | (không nói rõ) | **JWT (Microsoft.AspNetCore.Authentication.JwtBearer)** + RBAC qua policy `Admin`/`Expert`/`Owner` + Refresh Token + BCrypt | ĐÃ LÀM |
| **Realtime** | (không nói rõ) | **SignalR `NotificationHub`** cho push notification | ĐÃ LÀM (bonus) |
| **API style** | RESTful + GraphQL endpoint | **RESTful only** (Swagger/Swashbuckle). **KHÔNG có GraphQL.** | **THU HẸP** |
| **Knowledge Graph viz FE** | D3.js | (cần verify trong frontend) | Cần kiểm tra |
| **Audio player FE** | Howler.js + wavesurfer.js | (frontend dùng player riêng) | Cần kiểm tra |

---

## 3. ĐỐI CHIẾU FUNCTIONAL — Theo từng portal

### 3.1 Contributor Portal
| Yêu cầu đề tài | Trạng thái |
|---|---|
| Multi-step submission wizard (upload audio/video, transcribe, photograph) | **ĐÃ LÀM** — `SubmissionService2`, `SubmissionVersionService`, `RecordingImageService` |
| Form metadata có cấu trúc (ethnic / province / district / commune / context / instrument / tuning / vocal style) | **ĐÃ LÀM** — đủ entity: `EthnicGroup`, `Province`, `District`, `Commune`, `Ceremony`, `Instrument`, `MusicalScale`, `VocalStyle` |
| GPS tagging | Có entity field nhưng UI/UX chưa hoàn thiện đầy đủ (xem `PLAN-gps-tagging.md`) — **MỘT PHẦN** |
| Interview/oral history recording tool | **CHƯA THẤY** triển khai riêng — gộp chung vào upload audio |
| AI-assisted metadata: auto-detect instrument, recommend ethnic group, extract tempo/key | **ĐÃ LÀM** qua Gemini (`AudioProcessingService.AnalyzeAudioAsync`) — giới hạn: local YAMNet chỉ 2 nhạc cụ |
| Submission status tracking + version history | **ĐÃ LÀM** — `SubmissionVersion` entity + `SubmissionVersionService` |
| Mobile contributor app (Flutter) | **CHƯA LÀM** — chỉ có web responsive |

### 3.2 Expert Verification Portal
| Yêu cầu | Trạng thái |
|---|---|
| Review interface (nghe + xem metadata + so sánh tài liệu) | **ĐÃ LÀM** — `ReviewService`, `Review` entity |
| Annotation tools (notes, fix transcription, link research, mark variant) | **ĐÃ LÀM** — `AnnotationService`, `Annotation` entity |
| Three-stage workflow (screening → detailed → publication approval) | **ĐÃ LÀM** — có status pipeline trong `Submission` |
| AI response supervision (review chatbot answers, flag, retrain) | **MỘT PHẦN** — có `PLAN-ai-supervision-dashboard.md` & `PLAN-qa-flag-retrain.md`. Cơ chế retrain model thật sự **CHƯA TRIỂN KHAI** (Ollama local model không retrain được on-the-fly) |
| Collaborative KB editing (rich-text + citations) | **ĐÃ LÀM** — `KBEntry` / `KBRevision` / `KBCitation` services |

### 3.3 Researcher / Discovery
| Yêu cầu | Trạng thái |
|---|---|
| Advanced search filter (54 ethnic, 200+ instrument, ceremonial, geo→commune) | **ĐÃ LÀM** — `RecordingFilterDto`, faceted search (`PLAN-explore-faceted-search.md`) |
| Semantic search bằng natural language | **ĐÃ LÀM** — `SemanticSearchService` (vector từ Gemini, cosine similarity trên JSON embeddings) |
| AI Q&A có citation | **ĐÃ LÀM** — `RagChatService` với gemma3:4b, `KnowledgeRetrievalService` cho RAG |
| Knowledge graph tương tác | **ĐÃ LÀM** — `KnowledgeGraphService` + Neo4j |
| Comparative analysis (play multi recording, view transcription diff) | **MỘT PHẦN** — chưa thấy "side-by-side player" trong UI plans |
| Export academic dataset | **ĐÃ LÀM** — có `PLAN-export-academic-dataset.md` |

### 3.4 Admin Dashboard
| Yêu cầu | Trạng thái |
|---|---|
| User management + assign expert role + quality score | **ĐÃ LÀM** — `UserService`, `AdminDto`, role policies |
| Collection analytics (gap, trends, top contributor) | **ĐÃ LÀM** — `AnalyticsService`, `IAnalyticsService` (xem `PLAN-collection-analytics.md`) |
| AI system monitoring (chatbot accuracy, flagged response, KB updates) | **MỘT PHẦN** — có dashboard plan, retrain loop chưa có |
| Content moderation (copyright dispute, embargo, remove inappropriate) | **ĐÃ LÀM** — `CopyrightDisputeService`, `EmbargoService` |
| Audit logging | **ĐÃ LÀM** — `AuditLogService`, `AuditLog` entity |

---

## 4. ĐỐI CHIẾU NON-FUNCTIONAL

| Yêu cầu | Đề tài | Thực tế |
|---|---|---|
| Search response time | < 2s | Chưa có benchmark chính thức (xem `Report5_Test Report.xlsx`) |
| Q&A response time | < 4s | Phụ thuộc Ollama local (gemma3:4b) — thường > 4s ở máy thường, **chưa đạt** |
| Concurrent users | 2,000 | **Chưa load test** đến mức đó |
| Storage scale | 50,000+ FLAC | Supabase Storage chưa stress test |
| Compatibility iOS 13+/Android 8+ | Cần app native | **Không có app native** → fallback web responsive |
| RBAC + audit log + encrypted storage | Có | RBAC ✓, Audit log ✓, Encrypted storage ✓ (Supabase managed) |

---

## 5. NHỮNG GÌ ĐÃ LÀM ĐƯỢC (highlight)

1. **Backend C#/.NET 8 hoàn chỉnh** — Clean Architecture 3 tầng, ~50+ services, ~33 entity, EF Core, Swagger, Serilog, AutoMapper, JWT + Refresh Token, SignalR.
2. **Frontend React/Vite/TS** với Zustand state, React Router, Tailwind, toast, portal modal/dropdown.
3. **AI pipeline đa tầng:**
   - Transcription: Gemini (primary) + Local Whisper (fallback).
   - Embedding: Gemini (primary) + Sentence-Transformers MiniLM (local).
   - LLM: Ollama gemma3:4b (RAG) — **hoàn toàn local cho chat**.
   - Audio analysis: Gemini đa thuộc tính + YAMNet/ONNX (2 nhạc cụ).
4. **Knowledge Graph trên Neo4j** (instrument ↔ ethnic ↔ ceremony ↔ region ↔ recording).
5. **Knowledge Base** có entry / revision / citation đầy đủ.
6. **Submission pipeline có versioning** + 3-stage review.
7. **Notification realtime** qua SignalR.
8. **Embargo + Copyright Dispute + Audit Log** — moderation đầy đủ.
9. **E2E test (Playwright)** cho contributor workflow — xem `docs/E2E-contributor-runbook.md`.
10. **~70 plan/design docs** trong `SP26SE120_VietTune.../docs/PLAN-*.md` — phản ánh quá trình thiết kế chi tiết.

---

## 6. NHỮNG GÌ CHƯA LÀM / KHÁC ĐỀ TÀI (limitation thật sự)

### Đã ghi nhận chính thức trong Report 7 (LI-1 → LI-4)
- **LI-4 (mới thêm trong bản review):** Local on-premise audio analysis (YAMNet + ONNX) **chỉ phân loại được 2 nhạc cụ solo**: `đàn bầu`, `đàn tranh`. Polyphonic / ensemble không tin cậy → phải dùng Gemini API bù.

### Khác đề tài — nên ghi rõ trong context AI
1. **Mobile app Flutter: KHÔNG triển khai.** Chỉ có web responsive.
2. **OpenAI GPT-4 / LangChain: KHÔNG dùng.** Thay bằng **Ollama gemma3:4b local + custom RAG service viết tay**.
3. **OpenAI Whisper API / OpenAI Embeddings: KHÔNG dùng.** Thay bằng **Gemini API**.
4. **Pinecone / Weaviate: KHÔNG dùng.** Thay bằng **PostgreSQL với cột text JSON-encoded vector** (`VectorEmbedding.EmbeddingJson`). Đây là **tradeoff hiệu năng** — không tận dụng được index ANN; tìm kiếm ngữ nghĩa scan toàn bộ + cosine.
5. **Next.js / SSR: KHÔNG dùng.** Chỉ Vite SPA.
6. **GraphQL endpoint: KHÔNG có.** Chỉ REST.
7. **AWS S3 / GCS / CloudFront: KHÔNG dùng.** Thay bằng **Supabase Storage**.
8. **Performance NFR (< 2s search, < 4s Q&A, 2000 concurrent): chưa kiểm chứng đầy đủ**, đặc biệt Q&A do Ollama local.
9. **Retrain loop từ expert correction: cơ chế chưa hoàn chỉnh** — gemma3:4b không fine-tune online; mới có flag/log feedback.
10. **Comparative analysis (play multi-recording side-by-side, transcription diff highlight): chưa hoàn thiện UI.**
11. **Backend ban đầu định Python FastAPI** → đổi sang **C#/.NET 8** (quyết định technical migration sớm trong sprint).

### Lý do thay đổi (theo team & code evidence)
- **Cost & API key:** OpenAI tốn tiền và bị rate-limit; Gemini có free tier rộng hơn cho ethnomusicology workload.
- **Privacy / sovereignty:** LLM local (Ollama) cho phép xử lý dữ liệu di sản nhạy cảm (nhạc nghi lễ) không gửi ra ngoài.
- **Năng lực team:** team mạnh về .NET → chọn C# thay vì FastAPI.
- **Đơn giản hạ tầng:** PostgreSQL JSON vector store đủ với khối lượng pilot (≪ 500k embedding). Supabase storage thay S3 để giảm chi phí + có sẵn auth/CDN.

---

## 7. Cấu trúc thư mục thực tế

```
CapstoneSP26/
├── backend/                                           # .NET 8 Clean Architecture
│   ├── VietTuneArchive/                               # API layer (Program.cs, Controllers, Hubs)
│   │   └── Prompt/                                    # 14 prompt files dùng cho AI services
│   ├── VietTuneArchive.Application/                   # Services, DTOs, Mappers
│   │   ├── Services/                                  # ~50 service implementations
│   │   ├── IServices/                                 # ~50 interfaces
│   │   ├── Mapper/DTOs/                               # ~60+ DTO classes
│   │   ├── Hubs/NotificationHub.cs                    # SignalR
│   │   └── Common/Email, Helpers, Pagination...
│   └── VietTuneArchive.Domain/Entities/               # ~33 entities
├── SP26SE120_VietTune-wip-user-changes-20260420/      # Frontend (React + Vite + TS)
│   ├── docs/PLAN-*.md                                 # ~70 plan documents
│   ├── src/                                           # React app
│   └── package.json
├── Report 1..7 *.docx                                 # Báo cáo Capstone
├── Report5_Test Report.xlsx + Test Documentation.docx # QA artefact
├── Report7_Review_Notes.md                            # ⭐ chi tiết các sửa đổi đã làm trên Report 7
└── PROJECT_CONTEXT_FOR_AI.md                          # ⭐ FILE NÀY
```

---

## 8. Tip cho AI khác khi assist dự án này

- **Khi user nói "OpenAI / Whisper API / LangChain"** → hỏi lại hoặc tự động ánh xạ sang **Gemini / GeminiTranscriptionService / RagChatService (custom)**.
- **Khi cần thêm nhạc cụ vào auto-detect** → phải retrain ONNX classifier (xem `prompt_refactor_csharp_standalone_python.md`); KHÔNG đụng vào Gemini path.
- **Khi cần tối ưu vector search** → đề xuất chuyển sang `pgvector` extension (chưa có) hoặc Pinecone, vì hiện tại scan + cosine trên JSON là bottleneck.
- **Khi cần làm mobile** → đây là phạm vi *out of scope* của Capstone hiện tại; nên đề xuất responsive PWA trước khi đi Flutter.
- **Khi sửa report/SRS/SDD** → đối chiếu với `Report7_Review_Notes.md` (đã có 11 điểm sửa được verify với code).
- **Stack thật:** .NET 8 + EF Core 9 + PostgreSQL + Neo4j + Supabase Storage + Ollama gemma3:4b + Gemini API + Sentence-Transformers + YAMNet/ONNX (2 nhạc cụ) + React 18/Vite/TS + Tailwind + Zustand + SignalR + Playwright E2E.

---

*Cập nhật lần cuối: 2026-04-26 — phản ánh codebase tại commit hiện tại của thư mục `SP26SE120_VietTune-wip-user-changes-20260420` và `backend/VietTuneArchive`.*
