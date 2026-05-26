# BE IMPLEMENTATION — REVIEW 3 (FINAL)

## 🎯 Objective
Hoàn thiện hệ thống theo yêu cầu Review 3:

- 3-stage moderation workflow
- Assign an toàn (no race condition)
- AuditLog đầy đủ cho kiểm duyệt
- Không yêu cầu chỉnh lại AI Analyze

---

# 🔴 P0 — CRITICAL (PHẢI HOÀN THÀNH TRƯỚC)

---

## TASK 1 — Add 3-Stage Moderation

**File:** `Submission.cs`

```csharp
public SubmissionStage Stage { get; set; }
```

```csharp
public enum SubmissionStage
{
    Screening = 0,
    Verification = 1,
    Published = 2
}
```

**DONE WHEN:**
- [ ] DB có cột `Stage`
- [ ] API trả về `Stage`

---

## TASK 2 — Prevent Invalid Stage Transition

**File:** `SubmissionService.cs`

```csharp
if (currentStage == SubmissionStage.Screening 
    && nextStage != SubmissionStage.Verification)
{
    throw new BadRequestException("Invalid stage transition");
}

if (currentStage == SubmissionStage.Verification 
    && nextStage != SubmissionStage.Published)
{
    throw new BadRequestException("Invalid stage transition");
}
```

**DONE WHEN:**
- [ ] Không thể skip stage
- [ ] Flow: Screening → Verification → Published

---

## TASK 3 — Stage Update API

```http
PATCH /api/Submission/{id}/stage
```

**Request:**
```json
{
  "stage": "Verification",
  "note": "Initial screening passed"
}
```

**DONE WHEN:**
- [ ] API hoạt động
- [ ] Trả về submission với stage mới

---

## TASK 4 — Assign Reviewer (Race Safe)

**File:** `SubmissionService.cs`

```csharp
using var tx = await _db.Database.BeginTransactionAsync();

var submission = await _db.Submissions
    .Where(x => x.Id == request.Id)
    .FirstOrDefaultAsync();

if (submission.ReviewerId != null)
{
    return Conflict("Already assigned");
}

submission.ReviewerId = currentUserId;

await _db.SaveChangesAsync();
await tx.CommitAsync();
```

**Response khi conflict:**
```json
{
  "code": "ALREADY_ASSIGNED",
  "message": "Submission already assigned"
}
```

**DONE WHEN:**
- [ ] Không thể double assign
- [ ] FE nhận được 409

---

## TASK 5 — AuditLog: Core Workflow

**File:** `AuditLogService.cs`

Ghi log cho các action:

- ASSIGNED_REVIEWER
- STAGE_CHANGED
- APPROVED
- REJECTED
- METADATA_UPDATED

```csharp
await _audit.Log(new AuditLog {
    SubmissionId = submission.Id,
    ActorId = userId,
    Action = "STAGE_CHANGED",
    Stage = submission.Stage.ToString(),
    CreatedAt = DateTime.UtcNow
});
```

**AuditLog Model:**

```csharp
public class AuditLog
{
    public Guid Id { get; set; }
    public Guid SubmissionId { get; set; }
    public Guid? RecordingId { get; set; }
    public Guid ActorId { get; set; }
    public string ActorRole { get; set; }
    public string Action { get; set; }
    public string Stage { get; set; }
    public string BeforeValue { get; set; }
    public string AfterValue { get; set; }
    public string Note { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

**DONE WHEN:**
- [ ] Có log khi assign
- [ ] Có log khi đổi stage
- [ ] Có log khi approve/reject

---

# 🟠 P1 — IMPORTANT

---

## TASK 6 — Stage-Aware Assign

```csharp
if (submission.Stage == SubmissionStage.Published)
{
    throw new BadRequestException("Cannot assign published submission");
}
```

**DONE WHEN:**
- [ ] Không assign khi đã publish

---

## TASK 7 — History API

```http
GET /api/Submission/{id}/history
```

**Response:**
```json
[
  {
    "action": "STAGE_CHANGED",
    "stage": "Verification",
    "actorId": "...",
    "createdAt": "..."
  }
]
```

**DONE WHEN:**
- [ ] FE xem được lịch sử kiểm duyệt

---

# 🟡 P2 — NICE TO HAVE

---

## TASK 8 — Metadata Versioning

```csharp
public int Version { get; set; }
public DateTime UpdatedAt { get; set; }
```

**DONE WHEN:**
- [ ] Mỗi lần update metadata tăng version

---

# ❌ OUT OF SCOPE (ĐÃ DONE)

- AI Analyze (BE đã hoàn thành)
- Không cần chỉnh lại logic AI

---

# ✅ FINAL ACCEPTANCE

System đạt yêu cầu Review 3 khi:

- [ ] Có 3-stage moderation rõ ràng
- [ ] Không skip stage
- [ ] Assign không bị race condition
- [ ] FE nhận được 409 khi conflict
- [ ] Có AuditLog cho toàn bộ workflow
- [ ] Có API xem history
- [ ] Không cần FE fallback status

---

# 📌 NOTE

- Ưu tiên P0 trước
- Không cần optimize performance ở phase này
- Mục tiêu: PASS REVIEW 3

---
