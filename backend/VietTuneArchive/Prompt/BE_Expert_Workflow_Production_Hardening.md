# Backend Action Plan — Expert Workflow Production Hardening

**Dự án:** VietTune Archive  
**Ngày:** 05/05/2026  
**Người nhận:** Backend Team  
**Mức ưu tiên:** P0 trước production  
**Phạm vi:** Expert Workflow / Submission Moderation / Assign Reviewer / Audit Log / Submission Versioning

---

## 1. Bối cảnh

Frontend Expert Workflow hiện đã có cơ chế adapter 2 phase:

- **Phase 1:** mock/local state bằng `localStorage`.
- **Phase 2:** gọi API thật nhưng vẫn dùng local overlay để giữ UX mượt và hỗ trợ optimistic UI.

Frontend đã có snapshot/rollback và xử lý UX khá tốt. Tuy nhiên để lên production an toàn, backend cần chốt lại contract cho các điểm liên quan đến:

1. Lock submission khi expert nhận bài.
2. Tránh 2 reviewer cùng xử lý một submission.
3. Trả status code chính xác cho FE rollback.
4. Cung cấp timestamp/version để FE không merge patch cũ đè dữ liệu mới.
5. Chuẩn hóa status enum.
6. Đảm bảo audit trail không bị mất.

---

## 2. Endpoint liên quan hiện tại

Theo swagger hiện tại, có ít nhất 2 nhóm endpoint có thể liên quan đến assign reviewer:

### 2.1. Submission API

```http
PUT /api/Submission/assign-reviewer-submission?submissionId={submissionId}&reviewerId={reviewerId}
PUT /api/Submission/unassign-reviewer-submission?submissionId={submissionId}
GET /api/Submission/get-by-reviewer?reviewerId={reviewerId}
GET /api/Submission/get-all?page={page}&pageSize={pageSize}
GET /api/Submission/{id}
```

### 2.2. Admin API

```http
GET  /api/Admin/submissions?page={page}&pageSize={pageSize}&status={status}&reviewer={reviewer}
POST /api/Admin/submissions/{id}/assign
```

### 2.3. Audit API

```http
GET  /api/AuditLog?page={page}&pageSize={pageSize}
POST /api/AuditLog
GET  /api/Admin/audit-logs?page={page}&pageSize={pageSize}&from={from}&to={to}
```

---

## 3. P0 — Fix Race Condition khi Assign Submission

### 3.1. Vấn đề

Nếu 2 expert cùng lúc nhận cùng một submission:

```text
Expert A click "Nhận bài"
Expert B click "Nhận bài" gần như đồng thời
```

Nếu backend chỉ check `ReviewerId == null` rồi update bình thường mà không lock transaction, cả 2 request có thể cùng pass validation.

### 3.2. Hậu quả

- Một submission có thể bị claim bởi 2 reviewer.
- FE optimistic UI của cả 2 user đều nghĩ claim thành công.
- Audit log có thể ghi sai hoặc ghi trùng.
- Approve/Reject sau đó có thể conflict dữ liệu.

### 3.3. Yêu cầu backend

Backend cần đảm bảo assign reviewer là **atomic operation**.

#### Required behavior

```text
Nếu submission chưa có reviewer:
  - assign reviewer thành công
  - trả 200 OK

Nếu submission đã có reviewer khác:
  - không update
  - trả 409 Conflict
  - response body có message rõ ràng

Nếu submission không tồn tại:
  - trả 404 Not Found

Nếu user không có quyền:
  - trả 403 Forbidden
```

### 3.4. Contract đề xuất

#### Request

```http
PUT /api/Submission/assign-reviewer-submission?submissionId={submissionId}&reviewerId={reviewerId}
```

hoặc nếu thống nhất dùng Admin route:

```http
POST /api/Admin/submissions/{id}/assign
Content-Type: application/json
```

```json
{
  "reviewerId": "uuid"
}
```

#### Success response

```http
200 OK
```

```json
{
  "success": true,
  "message": "Submission assigned successfully",
  "data": {
    "submissionId": "uuid",
    "reviewerId": "uuid",
    "status": "InReview",
    "updatedAt": "2026-05-05T03:00:00Z",
    "version": 12
  }
}
```

#### Conflict response

```http
409 Conflict
```

```json
{
  "success": false,
  "code": "SUBMISSION_ALREADY_ASSIGNED",
  "message": "Submission has already been assigned to another reviewer.",
  "data": {
    "submissionId": "uuid",
    "currentReviewerId": "uuid",
    "status": "InReview",
    "updatedAt": "2026-05-05T03:00:00Z",
    "version": 12
  }
}
```

---

## 4. Backend Implementation Recommendation

### 4.1. SQL Server pattern

Nếu dùng SQL Server, nên dùng transaction + update lock:

```sql
BEGIN TRANSACTION;

SELECT *
FROM Submissions WITH (UPDLOCK, ROWLOCK)
WHERE Id = @SubmissionId;

IF @ReviewerId IS NOT NULL
BEGIN
    ROLLBACK TRANSACTION;
    -- return 409
END

UPDATE Submissions
SET ReviewerId = @ReviewerId,
    Status = @InReviewStatus,
    UpdatedAt = SYSUTCDATETIME(),
    Version = Version + 1
WHERE Id = @SubmissionId;

COMMIT TRANSACTION;
```

### 4.2. EF Core pattern

```csharp
await using var tx = await _db.Database.BeginTransactionAsync();

var submission = await _db.Submissions
    .FromSqlInterpolated($@"
        SELECT *
        FROM Submissions WITH (UPDLOCK, ROWLOCK)
        WHERE Id = {submissionId}
    ")
    .FirstOrDefaultAsync();

if (submission == null)
{
    return NotFound();
}

if (submission.ReviewerId != null && submission.ReviewerId != reviewerId)
{
    return Conflict(new
    {
        success = false,
        code = "SUBMISSION_ALREADY_ASSIGNED",
        message = "Submission has already been assigned to another reviewer.",
        data = new
        {
            submissionId = submission.Id,
            currentReviewerId = submission.ReviewerId,
            status = submission.Status,
            updatedAt = submission.UpdatedAt,
            version = submission.Version
        }
    });
}

submission.ReviewerId = reviewerId;
submission.Status = SubmissionStatus.InReview;
submission.UpdatedAt = DateTime.UtcNow;
submission.Version += 1;

await _db.SaveChangesAsync();
await tx.CommitAsync();

return Ok(new
{
    success = true,
    message = "Submission assigned successfully",
    data = new
    {
        submissionId = submission.Id,
        reviewerId = submission.ReviewerId,
        status = submission.Status,
        updatedAt = submission.UpdatedAt,
        version = submission.Version
    }
});
```

---

## 5. P0 — Add Version / UpdatedAt cho Submission DTO

### 5.1. Vấn đề

Frontend có local overlay để lưu nháp review, ghi chú, verification data. Nếu overlay cũ hơn server nhưng vẫn được merge lên UI, dữ liệu server mới có thể bị che bởi dữ liệu cũ ở client.

### 5.2. Yêu cầu backend

Tất cả DTO trả về cho submission/moderation queue cần có ít nhất một trong hai field:

```json
{
  "updatedAt": "2026-05-05T03:00:00Z",
  "version": 12
}
```

Khuyến nghị có cả hai:

- `updatedAt`: dễ debug, dễ hiển thị.
- `version`: dễ so sánh concurrency, ít lỗi timezone.

### 5.3. Rule phía FE sẽ dùng

```ts
if (localPatch.version < serverSubmission.version) {
  ignoreLocalPatch();
}
```

hoặc:

```ts
if (localPatch.updatedAt < serverSubmission.updatedAt) {
  ignoreLocalPatch();
}
```

Vì vậy backend cần đảm bảo:

- `version` tăng mỗi lần moderation/submission state thay đổi.
- `updatedAt` dùng UTC.
- API trả field này nhất quán ở list và detail endpoint.

---

## 6. P0 — Chuẩn hóa Submission Status

### 6.1. Vấn đề hiện tại

Frontend đang phải fallback vì status `Pending` có môi trường dùng `0`, môi trường dùng `1`.

Điều này khiến FE phải gọi nhiều cách:

```text
status = 1
fallback status = 0
fallback get all rồi tự filter
```

### 6.2. Yêu cầu backend

Backend cần chốt enum chính thức và dùng thống nhất trong mọi endpoint.

Đề xuất:

```csharp
public enum SubmissionStatus
{
    Pending = 0,
    InReview = 1,
    Approved = 2,
    Rejected = 3,
    NeedsRevision = 4
}
```

Hoặc nếu BE đang dùng mapping khác thì cần gửi chính thức cho FE:

```json
{
  "Pending": 0,
  "InReview": 1,
  "Approved": 2,
  "Rejected": 3,
  "NeedsRevision": 4
}
```

### 6.3. Acceptance criteria

- `GET /api/Submission/get-all?status=Pending` hoặc status numeric phải trả đúng dữ liệu.
- Không còn trường hợp Pending lúc là `0`, lúc là `1`.
- FE không cần scan all submissions để tự filter pending.

---

## 7. P1 — Audit Log không được mất silently

### 7.1. Vấn đề

Frontend hiện có fail-safe audit logging để không chặn flow chính. Tuy nhiên backend vẫn cần đảm bảo audit endpoint ổn định vì đây là dữ liệu quan trọng cho moderation.

### 7.2. Yêu cầu backend

Khi có các action sau, backend nên chủ động ghi audit log ở server-side, không chỉ phụ thuộc FE:

- Assign reviewer.
- Unassign reviewer.
- Approve submission.
- Reject submission.
- Update moderation metadata.
- Resolve copyright dispute nếu có liên quan.

### 7.3. Contract audit log đề xuất

```json
{
  "actorUserId": "uuid",
  "action": "ASSIGN_REVIEWER",
  "entityType": "Submission",
  "entityId": "uuid",
  "metadata": {
    "reviewerId": "uuid",
    "previousReviewerId": null,
    "previousStatus": "Pending",
    "newStatus": "InReview"
  },
  "createdAt": "2026-05-05T03:00:00Z"
}
```

### 7.4. Acceptance criteria

- Nếu assign thành công, phải có audit log.
- Nếu assign fail vì conflict, có thể ghi security/audit event mức warning.
- Audit log không được phụ thuộc hoàn toàn vào request từ FE.

---

## 8. P1 — Unassign Reviewer cần kiểm tra quyền và trạng thái

### 8.1. Vấn đề

Endpoint hiện có:

```http
PUT /api/Submission/unassign-reviewer-submission?submissionId={submissionId}
```

Cần rõ rule unassign.

### 8.2. Rule đề xuất

Chỉ cho unassign nếu:

- Current user là reviewer đang giữ bài; hoặc
- Current user là Admin/Moderator có quyền override.

Không cho unassign nếu:

- Submission đã Approved/Rejected.
- Submission đã chuyển qua trạng thái terminal.
- Reviewer khác đang giữ bài và user hiện tại không có quyền admin.

### 8.3. Response đề xuất

```http
409 Conflict
```

```json
{
  "success": false,
  "code": "SUBMISSION_ALREADY_FINALIZED",
  "message": "Cannot unassign a finalized submission."
}
```

---

## 9. P1 — Idempotency cho Assign cùng reviewer

### 9.1. Case cần xử lý

Nếu cùng một reviewer gọi assign lại cùng submission đã được assign cho chính họ:

```text
submission.ReviewerId == currentReviewerId
```

Có 2 hướng hợp lệ:

### Option A — Idempotent success

```http
200 OK
```

```json
{
  "success": true,
  "code": "ALREADY_ASSIGNED_TO_YOU",
  "message": "Submission is already assigned to this reviewer."
}
```

### Option B — Conflict

```http
409 Conflict
```

```json
{
  "success": false,
  "code": "SUBMISSION_ALREADY_ASSIGNED_TO_YOU",
  "message": "Submission is already assigned to this reviewer."
}
```

Khuyến nghị dùng **Option A** để FE xử lý mượt hơn.

---

## 10. P1 — SubmissionVersion nên dùng cho moderation history

Swagger hiện có nhóm `SubmissionVersion`. Backend nên dùng version history để lưu các thay đổi quan trọng:

- metadata trước/sau khi expert chỉnh
- reviewer thay đổi
- status thay đổi
- reason reject
- verification checklist nếu cần

### Acceptance criteria

- `GET /api/SubmissionVersion/submission/{submissionId}` trả được lịch sử thay đổi của submission.
- Mỗi lần approve/reject/update metadata tạo version mới hoặc audit event tương ứng.
- FE/Admin có thể truy vết ai đã thay đổi gì, lúc nào.

---

## 11. P2 — Response Shape thống nhất

Hiện API có nhiều kiểu response:

- `ServiceResponse<T>`
- `PagedResponse<T>`
- `PagedList<T>`
- endpoint chỉ trả `200 OK` không schema rõ

Đề xuất với workflow moderation nên thống nhất:

### Single item

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "data": null
}
```

### Paged list

```json
{
  "success": true,
  "data": {
    "items": [],
    "page": 1,
    "pageSize": 50,
    "totalItems": 100,
    "totalPages": 2
  }
}
```

---

## 12. Required Backend Test Cases

### 12.1. Concurrent assign

```text
Given submission is Pending and ReviewerId is null
When Reviewer A and Reviewer B assign at the same time
Then only one request returns 200
And the other request returns 409
And final ReviewerId equals the successful reviewer
And only one ASSIGN_REVIEWER audit log is success
```

### 12.2. Assign already assigned submission

```text
Given submission is assigned to Reviewer A
When Reviewer B assigns the same submission
Then response is 409
And ReviewerId remains Reviewer A
```

### 12.3. Same reviewer assign again

```text
Given submission is assigned to Reviewer A
When Reviewer A assigns again
Then response is 200 with idempotent message
And no duplicate destructive update happens
```

### 12.4. Version increment

```text
Given submission version is 10
When assign reviewer succeeds
Then version becomes 11
And updatedAt changes
```

### 12.5. Status consistency

```text
Given a Pending submission
When querying pending queue
Then the submission appears consistently using official Pending status
And FE does not need fallback status mapping
```

### 12.6. Audit log creation

```text
Given assign reviewer succeeds
Then an audit log is created with:
- actorUserId
- action = ASSIGN_REVIEWER
- entityType = Submission
- entityId = submissionId
- previousStatus
- newStatus
- reviewerId
```

---

## 13. Definition of Done

Backend được xem là xong khi đạt các điều kiện sau:

- [ ] Assign reviewer là atomic, chống double-claim.
- [ ] Conflict trả đúng `409 Conflict`.
- [ ] Response conflict có `code` rõ ràng: `SUBMISSION_ALREADY_ASSIGNED`.
- [ ] Submission DTO có `updatedAt` và/hoặc `version`.
- [ ] `version` tăng khi assign/approve/reject/update moderation.
- [ ] Status enum được chốt và dùng thống nhất.
- [ ] Audit log được ghi server-side cho các action chính.
- [ ] Có test concurrency cho assign reviewer.
- [ ] FE không cần fallback status `0/1` để tìm Pending queue.
- [ ] Admin/Expert có thể truy vết lịch sử qua AuditLog hoặc SubmissionVersion.

---

## 14. Ưu tiên triển khai

### Sprint 1 — Must fix

1. Atomic assign reviewer.
2. `409 Conflict` contract.
3. `updatedAt/version` trong Submission DTO.
4. Status enum chính thức.

### Sprint 2 — Should fix

1. Server-side audit log.
2. SubmissionVersion history.
3. Unassign permission rule.
4. Idempotency cho same reviewer assign.

### Sprint 3 — Nice to have

1. Chuẩn hóa response shape.
2. Thêm error code catalog.
3. Bổ sung Admin endpoint đọc moderation history.
