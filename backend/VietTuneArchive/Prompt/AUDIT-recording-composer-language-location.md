# AUDIT BE — Persist `composer`, `language`, `recordingLocation` trên Recording

**Ngày:** 2026-06-06  
**Phạm vi:** Backend (.NET / PostgreSQL) — bổ sung schema + API cho 3 metadata field mà FE upload form đã thu thập  
**Liên quan FE:** `UPLOAD_METADATA_FIELDS_PENDING_BACKEND = true` (form đang ẩn 3 field cho đến khi BE xong)

---

## 1. Mục tiêu

Cho phép **lưu, đọc lại và hiển thị** 3 trường metadata bản thu:

| Field | Ý nghĩa nghiệp vụ | Ví dụ giá trị FE gửi |
|---|---|---|
| `composer` | Nhạc sĩ / tác giả | `"Nguyễn Văn A"` hoặc sentinel `"Dân gian/Không rõ"` |
| `language` | Ngôn ngữ biểu diễn / lời | `"Tiếng Việt"`, custom text, hoặc `"Không có ngôn ngữ"` |
| `recordingLocation` | Địa điểm thu âm (mô tả tự do) | `"Làng Văn hoá Đồng Văn"` — **khác** `communeId` (FK địa giới hành chính) |

**Không nằm trong phạm vi audit này:** thay đổi luồng AI Analyze (`/api/AIAnalysis/*`) — AI vẫn trả suggestion transient; BE chỉ cần **nhận giá trị do user xác nhận** qua upload.

---

## 2. Hiện trạng (gap analysis)

### 2.1 Database — **không có cột**

Entity `Recording` (`Recordings`) hiện có `PerformerName`, `PerformanceContext`, `CommuneId`, `GpsLatitude/Longitude`… nhưng **không có** `Composer`, `Language`, `RecordingLocation`.

**File:** `VietTuneArchive.Domain/Entities/Recording.cs`

### 2.2 DTO / OpenAPI — **không có property**

| DTO | File | 3 field |
|---|---|---|
| `RecordingDto` (write) | `Application/Mapper/DTOs/RecordingDto.cs` | ❌ |
| `GetRecordingDto` (read) | cùng file | ❌ |
| Nested trong `SubmissionDto` / `GetSubmissionDto` | `Application/Mapper/DTOs/SubmissionDto.cs` | ❌ (kế thừa từ Recording DTO) |

Swagger `RecordingDto`: `additionalProperties: false` — FE **không thể** gửi field lạ qua contract chính thức.

### 2.3 Service persist — **không map**

`RecordingService.UploadRecordInfo()` gán từng field thủ công (~dòng 102–122). **Không có** dòng cho 3 field mới.

**File:** `Application/Services/RecordingService.cs`  
**Endpoint:** `PUT /api/Recording/{id}/upload` → `RecordingController.UploadRecordInfo`

`GenericService.UpdateAsync()` dùng AutoMapper `Recording ↔ RecordingDto` — sau khi thêm property entity + DTO, **cập nhật qua PUT generic** cũng sẽ map được (trừ khi có override đặc biệt).

### 2.4 Nơi field “ảo” tồn tại hôm nay

| Lớp | Mô tả | Persist? |
|---|---|---|
| `AIAnalysisResultDto` | Response Gemini (`composer`, `language`, `recordingLocation`) | ❌ Chỉ HTTP response |
| `AudioAnalysisResults.SuggestedMetadataJson` | Python instrument detection | ❌ Không chứa 3 field Gemini |
| `SubmissionVersions.ChangesJson` | Audit contributor edit; FE có thể ghi `recordingLocation` | ⚠️ JSON lỏng, không đọc lại qua recording API |
| FE `RecordingUploadDto` extension | `src/api/adapters.ts` | ❌ Bị strip / không gửi khi flag pending |

### 2.5 FE đang chờ BE

```ts
// src/features/upload/uploadFormValidation.ts
export const UPLOAD_METADATA_FIELDS_PENDING_BACKEND = true;
```

Payload upload (khi bật lại) qua `PUT /api/Recording/{id}/upload`:

```json
{
  "composer": "Dân gian/Không rõ",
  "language": "Không có ngôn ngữ",
  "recordingLocation": "..."
}
```

Mapper đọc lại: `submissionService.ts` đã có `pickField(rec, 'composer'|'language'|'recordingLocation')` — sẽ hoạt động ngay khi BE trả field trong nested `recording`.

---

## 3. Thiết kế đề xuất

### 3.1 Quyết định kiến trúc

**Thêm 3 cột nullable vào bảng `Recordings`** — cùng pattern với `PerformerName`, `PerformanceContext` (free-text, không FK).

**Không** tạo bảng phụ trừ khi sau này cần chuẩn hóa `Language` master-data.

**Phân biệt địa điểm:**

- `communeId` → địa giới hành chính (FK `Communes`)
- `recordingLocation` → mô tả địa điểm thu thực tế (text)
- `gpsLatitude` / `gpsLongitude` → tọa độ

Ba field này **bổ sung**, không thay thế `communeId` hay GPS.

### 3.2 Schema DB đề xuất

```sql
ALTER TABLE "Recordings"
  ADD COLUMN "Composer"           varchar(200) NULL,
  ADD COLUMN "Language"           varchar(100) NULL,
  ADD COLUMN "RecordingLocation"  varchar(500) NULL;
```

| Cột | Kiểu | MaxLength | Ghi chú |
|---|---|---|---|
| `Composer` | `string?` | 200 | Cùng cap với `PerformerName` |
| `Language` | `string?` | 100 | Dropdown + custom ngắn |
| `RecordingLocation` | `string?` | 500 | Mô tả địa điểm; cap giống `Title` |

Tất cả **nullable** — bản thu cũ không cần backfill.

### 3.3 Entity (`Recording.cs`)

```csharp
[MaxLength(200)]
public string? Composer { get; set; }

[MaxLength(100)]
public string? Language { get; set; }

[MaxLength(500)]
public string? RecordingLocation { get; set; }
```

### 3.4 DTO (`RecordingDto.cs` + `GetRecordingDto`)

Thêm cùng 3 property vào **cả hai** class:

```csharp
public string? Composer { get; set; }
public string? Language { get; set; }
public string? RecordingLocation { get; set; }
```

AutoMapper profile hiện tại (`MappingProfile.cs`) map convention — **không cần ForMember** nếu tên trùng.

### 3.5 Validation đề xuất (BE)

| Field | Rule |
|---|---|
| Tất cả | Optional nullable; trim whitespace; empty string → `null` |
| `Composer` | Max 200; cho phép sentinel `"Dân gian/Không rõ"` |
| `Language` | Max 100; cho phép sentinel `"Không có ngôn ngữ"` |
| `RecordingLocation` | Max 500 |

**Không** validate FK — đây là free text.  
**Không** bắt buộc khi upload draft — giữ hành vi giống `PerformerName`.

*(Tùy chọn P2: normalize sentinel values thành enum nội bộ — không cần cho MVP.)*

---

## 4. Danh sách file BE cần sửa

### P0 — Bắt buộc (MVP persist + API)

| # | File | Thay đổi |
|---|---|---|
| 1 | `Domain/Entities/Recording.cs` | +3 property |
| 2 | `Domain/Context/DBContext.cs` | `HasMaxLength` cho 3 cột trong `Recording` config (~dòng 363) |
| 3 | `Domain/Migrations/<timestamp>_AddRecordingComposerLanguageLocation.cs` | EF migration |
| 4 | `Application/Mapper/DTOs/RecordingDto.cs` | +3 property cả `RecordingDto` và `GetRecordingDto` |
| 5 | `Application/Services/RecordingService.cs` | Trong `UploadRecordInfo`: gán 3 field từ DTO → entity |
| 6 | Swagger / OpenAPI | Regenerate sau build (hoặc cập nhật `swagger.json` nếu repo commit swagger) |

**Done when:**

- [ ] Migration apply thành công trên PostgreSQL dev
- [ ] `PUT /api/Recording/{id}/upload` nhận & lưu 3 field
- [ ] `GET /api/Submission/{id}` và `GET /api/Submission/my` trả nested `recording` có 3 field
- [ ] `GET /api/Recording/{id}` / guest approved endpoints trả 3 field qua `GetRecordingDto`

### P1 — Đồng bộ read path & test

| # | File | Thay đổi |
|---|---|---|
| 7 | `Tests/Integration/Controllers/RecordingControllerTests.cs` | Test upload + assert DB columns |
| 8 | `Tests/Unit/Services/RecordingServiceTests.cs` | Test `UploadRecordInfo` persist 3 field |
| 9 | `Tests/TestHelpers/Builders/` (nếu có Recording builder) | Default values |

### P2 — Tích hợp downstream (khuyến nghị, không chặn MVP)

| # | File | Lý do |
|---|---|---|
| 10 | `Application/Services/EmbeddingTextBuilder.cs` | Semantic search: thêm composer, language, recordingLocation vào embedding text |
| 11 | `Application/Services/EmbeddingService.cs` | (nếu duplicate logic) đồng bộ |
| 12 | `Application/Services/ThirdPartyServices/Neo4jSyncService.cs` | Sync node `Recording` — thêm property graph |
| 13 | `Application/Services/ThirdPartyServices/Neo4jMigrationService.cs` | Batch re-sync nếu cần |
| 14 | `Application/Services/KnowledgeGraphService.cs` | Node detail `Properties` dictionary |
| 15 | `Application/Mapper/DTOs/SubmissionDetailDto.cs` | `AdditionalInfoDto` / `CulturalContextDto` — chỉ nếu endpoint detail riêng còn dùng |

**Lưu ý embedding:** Sau khi thêm field, bản ghi **Approved** đã có embedding cũ — cần **re-generate** khi metadata đổi (logic hiện có trong `UpdateAsync` / `UploadRecordInfo` cho status Approved; upload thường set Pending nên ít ảnh hưởng ngay).

---

## 5. API contract (sau khi sửa)

### 5.1 Write — không đổi route

```http
PUT /api/Recording/{id}/upload
Authorization: Bearer (Contributor)
Content-Type: application/json
```

**Body (`RecordingDto`) — thêm:**

```json
{
  "title": "...",
  "composer": "Dân gian/Không rõ",
  "language": "Tiếng Mường",
  "recordingLocation": "Nhà văn hóa xã",
  "...": "..."
}
```

**Response:** `ServiceResponse<RecordingDto>` — echo 3 field đã lưu.

### 5.2 Read — tự động qua nested recording

| Endpoint | DTO | Ghi chú |
|---|---|---|
| `GET /api/Submission/{id}` | `GetSubmissionDto.recording` | AutoMapper từ entity |
| `GET /api/Submission/my` | List submissions + recording | Contributor list |
| `GET /api/Recording/{id}` | `GetRecordingDto` | Expert / admin detail |
| `GET /api/Recording/guest/...` | `GetRecordingDto` | Chỉ Approved — cân nhắc ẩn field nhạy cảm (nếu có policy) |

### 5.3 Không đụng

| Endpoint | Lý do |
|---|---|
| `POST /api/AIAnalysis/analyze-only` | Vẫn suggestion-only |
| `POST /api/Submission/create-submission` | Chỉ tạo shell recording + file URL |
| `POST /api/MetadataSuggest` | Không liên quan 3 field |

---

## 6. Chi tiết implement — `UploadRecordInfo`

**Vị trí chèn** (sau `PerformerName`, trước `RecordingDate`):

```csharp
existingRecording.Composer = string.IsNullOrWhiteSpace(recordingDto.Composer)
    ? null
    : recordingDto.Composer.Trim();
existingRecording.Language = string.IsNullOrWhiteSpace(recordingDto.Language)
    ? null
    : recordingDto.Language.Trim();
existingRecording.RecordingLocation = string.IsNullOrWhiteSpace(recordingDto.RecordingLocation)
    ? null
    : recordingDto.RecordingLocation.Trim();
```

**Hành vi clear field:** Nếu FE gửi `null` hoặc `""` → ghi `null` vào DB (overwrite giá trị cũ). Document cho FE: partial update **không** supported — upload gửi full metadata snapshot như hiện tại.

---

## 7. Migration & dữ liệu cũ

| Scenario | Xử lý |
|---|---|
| Bản thu đã upload trước migration | 3 cột = `NULL` — chấp nhận được |
| `SubmissionVersions.ChangesJson` có `recordingLocation` | **Không** auto-migrate — dữ liệu audit, không tin cậy làm source of truth |
| AI đã suggest composer/language | User chưa confirm → không recover — cần upload lại hoặc edit |

**Backfill script (optional, P3):** Parse `ChangesJson` WHERE `field = 'recordingLocation'` → UPDATE `Recordings` — chỉ chạy thủ công nếu product yêu cầu.

---

## 8. Test plan

### 8.1 Integration

```csharp
[Fact]
public async Task UploadRecordInfo_PersistsComposerLanguageRecordingLocation()
{
    // Arrange: Contributor, seeded Draft recording
    var payload = new RecordingDto
    {
        Title = "Test",
        Composer = "Dân gian/Không rõ",
        Language = "Tiếng Việt",
        RecordingLocation = "Làng ABC"
    };

    // Act: PUT /api/Recording/{id}/upload

    // Assert: DB columns + response JSON
}
```

### 8.2 Unit (`RecordingServiceTests`)

- Happy path: 3 field persisted
- Trim whitespace
- Empty string → null
- MaxLength overflow → 400 hoặc truncate (theo policy ASP.NET model validation nếu thêm `[MaxLength]` trên DTO)

### 8.3 Regression

- Upload không gửi 3 field → không crash, cột null
- `InstrumentIds`, FK validation — không ảnh hưởng
- Swagger client gen (FE `npm run generate-api` nếu có) — `RecordingDto` có 3 key mới

---

## 9. Phối hợp FE (sau BE merge)

| Bước | File FE | Hành động |
|---|---|---|
| 1 | Regenerate `src/api/generated.d.ts` | Từ swagger mới |
| 2 | `uploadFormValidation.ts` | `UPLOAD_METADATA_FIELDS_PENDING_BACKEND = false` |
| 3 | `MetadataStepSection.tsx` | Hiện lại 3 field (đã có UI, đang conditional) |
| 4 | `useUploadSubmission.ts` | Payload đã có sẵn nhánh gửi 3 field |
| 5 | `adapters.ts` | Có thể gộp `RecordingUploadDto` = `ApiRecordingDto` (bỏ extension) |
| 6 | `ContributionsDetailModal` / detail views | Hiển thị 3 field từ API (mapper đã sẵn) |

---

## 10. Ước lượng effort

| Phase | Việc | Effort |
|---|---|---|
| **P0** | Entity + migration + DTO + UploadRecordInfo + smoke test | ~2–4h |
| **P1** | Integration/unit tests + swagger regen | ~2h |
| **P2** | Embedding + Neo4j + graph properties | ~2–4h |
| **FE** | Bật flag + regen types + QA upload/edit/read | ~1–2h |

**Tổng MVP (P0+P1):** ~1 ngày dev.

---

## 11. Rủi ro & lưu ý

1. **`recordingLocation` vs `communeId`:** Document rõ cho contributor — tránh nhập trùng ý nghĩa.
2. **Sentinel strings:** FE lưu `"Dân gian/Không rõ"` / `"Không có ngôn ngữ"` dạng text — search/filter sau này cần normalize nếu muốn aggregate.
3. **OpenAPI strict:** FE từng strip field vì `additionalProperties: false` — sau khi thêm vào schema chính thức, không cần `sanitizeRecordingDtoForUpload` loại 3 key.
4. **Guest/public API:** Nếu `recordingLocation` nhạy cảm địa lý, review policy embargo trước khi expose trên guest endpoints.
5. **Không duplicate vào AI DTO:** `AIAnalysisResultDto` giữ nguyên — trách nhiệm persist thuộc `Recording`, không merge AI response tự động vào DB (trừ khi product yêu cầu auto-fill server-side).

---

## 12. Checklist tổng hợp (copy cho ticket)

```
[ ] Recording entity + DBContext config
[ ] EF migration AddRecordingComposerLanguageLocation
[ ] RecordingDto + GetRecordingDto +3 props
[ ] RecordingService.UploadRecordInfo mapping
[ ] Verify GET Submission/Recording trả field
[ ] Swagger regen
[ ] Integration test UploadRecordInfo 3 fields
[ ] Unit test RecordingService
[ ] (P2) EmbeddingTextBuilder
[ ] (P2) Neo4jSyncService
[ ] FE: UPLOAD_METADATA_FIELDS_PENDING_BACKEND = false
[ ] E2E: upload → my submissions → detail hiển thị composer/language/location
```

---

## 13. Tham chiếu mã nguồn

| Thành phần | Path |
|---|---|
| Entity | `backend/VietTuneArchive.Domain/Entities/Recording.cs` |
| DTO | `backend/VietTuneArchive.Application/Mapper/DTOs/RecordingDto.cs` |
| Upload service | `backend/VietTuneArchive.Application/Services/RecordingService.cs` |
| Upload API | `backend/VietTuneArchive/Controllers/RecordingController.cs` |
| AI (transient only) | `backend/VietTuneArchive.Application/Mapper/DTOs/AudioAnalysisResultDto.cs` |
| FE flag | `src/features/upload/uploadFormValidation.ts` |
| FE payload | `src/features/upload/hooks/useUploadSubmission.ts` |
| FE mapper read | `src/services/submissionService.ts` |
