# PLAN: Fix Main Flow Issues — Demo-Ready

> **Tham chiếu:** `docs/AUDIT-main-flows.md`
> **Scope:** Backend + Frontend — sửa 21 findings trên 5 flow chính
> **Mục tiêu:** Pass demo presentation
> **Nguyên tắc:** Mỗi phase deploy độc lập. Phase 1 là minimum viable. Không refactor ngoài scope.

---

## 1. Tổng quan

| Phase | Mục tiêu | Findings | Effort | Ai làm |
|-------|----------|----------|--------|--------|
| **Phase 1** | Demo không bị hack / crash | 7 P0 + 1 P1 | ~9h | BE dev |
| **Phase 2** | Chặn privilege escalation | 6 P1 | ~8.5h | BE dev |
| **Phase 3** | UX smooth, error handling đúng | 5 P2 | ~4.5h | FE + BE |
| **Phase 4** | Verify + regression test | — | ~4h | QA / dev |

**Tổng: ~26 giờ (~3.5 ngày, 1 BE + 1 FE dev song song)**

---

## 2. Phase 1 — MUST FIX (Chặn exploit trên flow chính)

> **Deadline:** Trước demo 2 ngày
> **Risk nếu skip:** Bất kỳ ai có Postman đều exploit được

### Task 1.1 — Login check IsActive `[F1-01]`

| | |
|---|---|
| **File** | `backend/VietTuneArchive.Application/Services/AuthService.cs` |
| **Line** | 45 (trước `return user;`) |
| **Việc** | Thêm `if (!user.IsActive) return null;` hoặc throw message rõ ràng |
| **Test** | Deactivate user → login → expect 401 |
| **Effort** | 30 phút |

```csharp
// BEFORE (line 45):
return user;

// AFTER:
if (!user.IsActive)
    throw new Exception("Tài khoản đã bị vô hiệu hóa.");
return user;
```

### Task 1.2 — Restrict get-by-status cho Admin/Expert `[F3-01]`

| | |
|---|---|
| **File** | `backend/VietTuneArchive/Controllers/SubmissionController.cs` |
| **Line** | 23 |
| **Việc** | Thêm `[Authorize(Roles = "Admin,Expert")]` trên action `GetSubmissionsByStatus` |
| **Test** | Login Contributor → `GET /api/Submission/get-by-status?status=1` → expect 403 |
| **Effort** | 30 phút |

```csharp
// BEFORE:
[HttpGet("get-by-status")]
public async Task<IActionResult> GetSubmissionsByStatus(...)

// AFTER:
[HttpGet("get-by-status")]
[Authorize(Roles = "Admin,Expert")]
public async Task<IActionResult> GetSubmissionsByStatus(...)
```

### Task 1.3 — Bỏ Contributor khỏi reject-submission `[F3-02]`

| | |
|---|---|
| **File** | `backend/VietTuneArchive/Controllers/SubmissionController.cs` |
| **Line** | 105 |
| **Việc** | Đổi `"Admin,Expert,Contributor"` → `"Admin,Expert"` |
| **Test** | Login Contributor → `PUT reject-submission` → expect 403 |
| **Effort** | 30 phút |

```csharp
// BEFORE:
[Authorize(Roles = "Admin,Expert,Contributor")]

// AFTER:
[Authorize(Roles = "Admin,Expert")]
```

### Task 1.4 — Thêm auth cho AuditLogController `[F3-03]`

| | |
|---|---|
| **File** | `backend/VietTuneArchive/Controllers/AuditLogController.cs` |
| **Line** | 8-10 (class declaration) |
| **Việc** | Thêm `[Authorize]` class-level. POST/PUT/DELETE thêm `[Authorize(Roles = "Admin,Expert")]` |
| **Test** | Không có token → `GET /api/AuditLog` → expect 401 |
| **Effort** | 30 phút |
| **FE impact** | `expertModerationApi.postExpertModerationAuditLog` đã gửi Bearer qua `apiFetch` → không ảnh hưởng |

```csharp
// BEFORE:
[Route("api/[controller]")]
[ApiController]
public class AuditLogController : ControllerBase

// AFTER:
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AuditLogController : ControllerBase
```

### Task 1.5 — Tạo create-expert endpoint `[F4-01]`

| | |
|---|---|
| **File** | `backend/VietTuneArchive/Controllers/AdminController.cs` |
| **Việc** | Thêm action `[HttpPost("create-expert")]` gọi `UserService.AddAsync` |
| **Test** | Login Admin → POST `/api/Admin/create-expert` → expect 200 + user created |
| **Effort** | 2 giờ (bao gồm DTO mapping + error handling) |
| **Dependency** | Task 1.6 phải làm cùng lúc |

```csharp
[HttpPost("create-expert")]
public async Task<IActionResult> CreateExpert([FromBody] CreateExpertUserDTO dto)
{
    var result = await _userService.AddAsync(dto);
    if (result.IsSuccess)
        return Ok(result);
    return BadRequest(result);
}
```

**Cần inject `IUserService` vào `AdminController`** nếu chưa có.

### Task 1.6 — Fix Role = "Staff" → "Expert" `[F4-02]`

| | |
|---|---|
| **File** | `backend/VietTuneArchive.Application/Services/UserService.cs` |
| **Line** | 58 |
| **Việc** | Đổi `Role = "Staff"` → `Role = "Expert"` |
| **Test** | Tạo expert → query DB → verify `Role = "Expert"` |
| **Effort** | 30 phút |

```csharp
// BEFORE:
Role = "Staff",

// AFTER:
Role = "Expert",
```

**Cũng xóa `Password = dto.Password,` ở line 55** (liên quan F1-02, nhưng tạm giữ nếu Phase 2 chưa đến).

### Task 1.7 — Fix Owner policy `[F1-04]`

| | |
|---|---|
| **File** | `backend/VietTuneArchive/Program.cs` |
| **Line** | 58 |
| **Việc** | Tạm thời đổi `RequireAssertion(c => true)` → `RequireAuthenticatedUser()`. Sau demo mới implement `IAuthorizationHandler` đầy đủ |
| **Test** | Không có token → `POST /api/Media/submissions/{id}/files` → expect 401 |
| **Effort** | 30 phút (tạm) hoặc 4h (đầy đủ) |
| **Impact** | `MediaController` và `TranscriptionController` đều là stub — FE không gọi. Risk thấp |

```csharp
// BEFORE:
options.AddPolicy("Owner", p => p.RequireAssertion(c => true));

// AFTER (tạm):
options.AddPolicy("Owner", p => p.RequireAuthenticatedUser());

// AFTER (đầy đủ — Phase 2+):
// Implement SubmissionOwnerAuthorizationHandler : AuthorizationHandler<OwnerRequirement>
```

### Task 1.8 — Ẩn Swagger ở Production `[F1-03]`

| | |
|---|---|
| **File** | `backend/VietTuneArchive/Program.cs` |
| **Line** | 315 |
| **Việc** | Bỏ `|| app.Environment.IsProduction()` |
| **Test** | Set `ASPNETCORE_ENVIRONMENT=Production` → `/swagger` → expect 404 |
| **Effort** | 30 phút |

```csharp
// BEFORE:
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())

// AFTER:
if (app.Environment.IsDevelopment())
```

### Phase 1 Acceptance Criteria

- [ ] User bị deactivate → login trả 401
- [ ] Contributor → `get-by-status` trả 403
- [ ] Contributor → `reject-submission` trả 403
- [ ] Anonymous → `GET /api/AuditLog` trả 401
- [ ] Admin → `POST /api/Admin/create-expert` trả 200 + user role = "Expert"
- [ ] Anonymous → `/swagger` trả 404 (production mode)
- [ ] Anonymous → `POST /api/Media/submissions/{id}/files` trả 401

---

## 3. Phase 2 — SHOULD FIX (Chặn privilege escalation)

> **Deadline:** Trước demo 1 ngày
> **Risk nếu skip:** IDOR cho phép đổi password user khác; AI API bị abuse

### Task 2.1 — IDOR fix: update-password `[F4-03]`

| | |
|---|---|
| **File** | `backend/VietTuneArchive/Controllers/UserController.cs` |
| **Line** | 37-43 |
| **Việc** | Lấy `userId` từ JWT `ClaimTypes.NameIdentifier`, ignore body `UserId` |
| **Effort** | 2 giờ (cả update-password + update-profile) |

```csharp
[HttpPut("update-password")]
[Authorize(Roles = "Admin,Contributor,Researcher,Expert")]
public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordDTO dto)
{
    var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (!Guid.TryParse(userIdStr, out var userId))
        return Unauthorized();
    dto.UserId = userId; // Override body value
    var result = await _userService.UpdatePasswordAsync(dto);
    // ...
}
```

Tương tự cho `update-profile`:
```csharp
[HttpPut("update-profile")]
public async Task<IActionResult> UpdateProfile([FromBody] UpdateInfoDTO dto)
{
    var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (!Guid.TryParse(userIdStr, out var userId))
        return Unauthorized();
    dto.UserId = userId;
    var result = await _userService.UpdateInfoAsync(dto);
    // ...
}
```

**Test:** Login User A → gửi body `UserId = UserB.Id` → verify chỉ update User A.

### Task 2.2 — Review/create role + ReviewerId validation `[F3-04]`

| | |
|---|---|
| **File** | `backend/VietTuneArchive/Controllers/ReviewController.cs` |
| **Line** | 45-46 |
| **Việc** | (1) Thêm `[Authorize(Roles = "Admin,Expert")]`. (2) Override `dto.ReviewerId` = JWT user |
| **Effort** | 1 giờ |

```csharp
[HttpPost("create")]
[Authorize(Roles = "Admin,Expert")]
public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
{
    var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (!Guid.TryParse(userIdStr, out var reviewerId))
        return Unauthorized();
    dto.ReviewerId = reviewerId; // Prevent spoofing
    var result = await _reviewService.SubmitReviewAsync(
        dto.SubmissionId, dto.ReviewerId, dto.Decision, dto.Comments);
    // ...
}
```

**FE impact:** `expertModerationApi.createReviewDecisionOnServer` gửi `reviewerId` nhưng BE sẽ override → không break.

### Task 2.3 — Auth cho ChatController `[F5-03]`

| | |
|---|---|
| **File** | `backend/VietTuneArchive/Controllers/ChatController.cs` |
| **Line** | 8-10 |
| **Việc** | Thêm `[Authorize]` class-level |
| **Effort** | 30 phút |
| **FE impact** | `researcherChatService.ts` dùng `apiFetch` (gửi Bearer) → OK |

### Task 2.4 — Auth cho MetadataSuggestController `[F5-04]`

| | |
|---|---|
| **File** | `backend/VietTuneArchive/Controllers/MetadataSuggestController.cs` |
| **Line** | 12-14 |
| **Việc** | Thêm `[Authorize]` class-level |
| **Effort** | 30 phút |
| **FE impact** | `metadataSuggestService.ts` — verify gửi Bearer. Nếu dùng `legacyPost` không gửi token → **cần check FE** |

### Task 2.5 — Auth cho RecordingImageController `[F2-04]`

| | |
|---|---|
| **File** | `backend/VietTuneArchive/Controllers/RecordingImageController.cs` |
| **Line** | 8-10 |
| **Việc** | Thêm `[Authorize]` class-level. `GET` endpoints có thể `[AllowAnonymous]` nếu cần public gallery |
| **Effort** | 30 phút |

### Task 2.6 — Xóa plaintext Password `[F1-02]`

| | |
|---|---|
| **Files** | `UserService.cs`, `AuthService.cs`, `AuthController.cs`, `User.cs` |
| **Việc** | (1) Xóa `Password = dto.Password` mọi chỗ. (2) `UpdatePasswordAsync` dùng BCrypt verify thay vì `Password.Equals`. (3) DB migration xóa cột `Password` hoặc set nullable. (4) `ResetPasswordAsync` bỏ `user.Password = newPassword` |
| **Effort** | 4 giờ |
| **Risk** | HIGH — phải test kỹ login + change password + reset password sau migration |

Chi tiết sửa:

**UserService.cs L108** — đổi comparison:
```csharp
// BEFORE:
if (!getUser.Password.Equals(updateUserDTO.OldPassword))

// AFTER:
if (!BCrypt.Net.BCrypt.Verify(updateUserDTO.OldPassword, getUser.PasswordHash))
```

**UserService.cs L118** — bỏ plaintext save:
```csharp
// BEFORE:
getUser.Password = updateUserDTO.NewPassword;
getUser.PasswordHash = passwordHash;

// AFTER:
getUser.PasswordHash = passwordHash;
```

**AuthService.cs L206** — bỏ plaintext save:
```csharp
// BEFORE:
user.PasswordHash = HashPassword(newPassword);
user.Password = newPassword;

// AFTER:
user.PasswordHash = HashPassword(newPassword);
```

**AuthController.cs L55** — bỏ plaintext trên register:
```csharp
// BEFORE:
var user = new User
{
    Email = model.Email,
    Password = model.Password,
    // ...
};

// AFTER:
var user = new User
{
    Email = model.Email,
    // Password field removed
    // ...
};
```

**UserService.cs L55** — bỏ plaintext trên AddAsync:
```csharp
// BEFORE:
Password = dto.Password,
PasswordHash = passwordHash,

// AFTER:
PasswordHash = passwordHash,
```

**User.cs** — làm nullable hoặc xóa cột:
```csharp
// BEFORE:
[Required]
[MaxLength(500)]
public string Password { get; set; }

// AFTER:
[MaxLength(500)]
public string? Password { get; set; } // Deprecated — will be removed
```

**DB Migration:**
```
dotnet ef migrations add RemovePlaintextPassword
dotnet ef database update
```

### Phase 2 Acceptance Criteria

- [ ] User A không thể đổi password của User B (IDOR blocked)
- [ ] Contributor → `POST /api/Review/create` → 403
- [ ] Anonymous → `POST /api/Chat` → 401
- [ ] Anonymous → `POST /api/MetadataSuggest` → 401
- [ ] Anonymous → `POST /api/RecordingImage` → 401
- [ ] Login vẫn hoạt động sau xóa plaintext Password
- [ ] Change password vẫn hoạt động (BCrypt comparison)
- [ ] Reset password vẫn hoạt động

---

## 4. Phase 3 — NICE TO HAVE (Demo smooth hơn)

> **Khi nào:** Sau khi Phase 1+2 passed
> **Risk nếu skip:** Demo vẫn chạy nhưng có edge case UX xấu

### Task 3.1 — FE: Chỉ swallow 409, propagate 400 `[F3-05]`

| | |
|---|---|
| **File** | `src/services/expertModerationApi.ts` |
| **Lines** | 424-432, 447-455 |
| **Effort** | 1 giờ |

```typescript
// BEFORE:
if (httpStatus === 400 || httpStatus === 409) {
    return mutationOk();
}

// AFTER:
if (httpStatus === 409) {
    return mutationOk(); // Idempotent — already applied
}
return mutationFail(err, httpStatus); // 400 = real error
```

### Task 3.2 — FE: ApprovedRecordingsPage guard alignment `[F3-06]`

| | |
|---|---|
| **File** | `src/pages/ApprovedRecordingsPage.tsx` |
| **Line** | 116-118 |
| **Effort** | 30 phút |

```typescript
// BEFORE:
if (!user || user.role !== UserRole.EXPERT) {

// AFTER:
if (!user || user.role !== UserRole.EXPERT || !user.isEmailConfirmed || !user.isActive) {
```

### Task 3.3 — FE: Detail page guest fallback `[F5-05]`

| | |
|---|---|
| **File** | `src/hooks/useRecordingDetail.ts` |
| **Line** | 80-89 |
| **Effort** | 1 giờ |

Thêm fallback gọi `GET /api/RecordingGuest/{id}` khi auth call fail:
```typescript
try {
    const response = await recordingService.getRecordingById(id);
    // ... existing logic
} catch (err) {
    // Fallback to guest endpoint
    try {
        const guestResponse = await recordingService.getGuestRecordingById(id);
        // ... set recording
    } catch {
        console.warn('Both auth and guest detail failed');
    }
}
```

**Cần thêm** `getGuestRecordingById` vào `recordingService.ts`:
```typescript
getGuestRecordingById: async (id: string) => {
    return legacyGetAnonymous<ApiResponse<Recording>>(
        `/RecordingGuest/${id}`
    );
},
```

### Task 3.4 — BE: Register trả Failure thay vì Success `[F1-06]`

| | |
|---|---|
| **File** | `backend/VietTuneArchive.Application/Services/AuthService.cs` |
| **Line** | 102-114 |
| **Effort** | 1 giờ |

```csharp
// BEFORE:
if (user == null)
{
    var msg = new AuthDTO { Message = "Người dùng không được để trống." };
    return Result<AuthDTO>.Success(msg);
}

// AFTER:
if (user == null)
{
    return Result<AuthDTO>.Failure("Người dùng không được để trống.");
}
```

### Task 3.5 — BE: Validate UploadedById = JWT subject `[F2-02]`

| | |
|---|---|
| **File** | `backend/VietTuneArchive/Controllers/SubmissionController.cs` |
| **Line** | 36-46 |
| **Effort** | 1 giờ |

```csharp
[HttpPost("create-submission")]
[Authorize(Roles = "Admin,Contributor,Expert")]
public async Task<IActionResult> CreateSubmission([FromBody] SubmissionDto dto)
{
    var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (!Guid.TryParse(userIdStr, out var userId))
        return Unauthorized();
    dto.UploadedById = userId; // Override client value
    var result = await _submissionService.CreateAsync(dto);
    // ...
}
```

### Phase 3 Acceptance Criteria

- [ ] Stage complete với 400 thật → hiện error toast (không swallow)
- [ ] Expert inactive → ApprovedRecordingsPage → ForbiddenPage
- [ ] Guest truy cập trực tiếp `/recordings/:id` → vẫn xem được (approved recording)
- [ ] Register sai format → FE nhận được error (không 200 OK)
- [ ] Upload submission → verify UploadedById = logged-in user

---

## 5. Phase 4 — Verify & Regression

> **Khi nào:** Sau mỗi phase, chạy regression trước merge

### 5.1 Regression Checklist

| Flow | Test case | Phase |
|------|-----------|-------|
| F1 Login | Email + password đúng → token | After P1 |
| F1 Login | Wrong password → 401 | After P1 |
| F1 Login | Inactive user → 401 (mới) | After P1 |
| F1 Login | Unconfirmed email → error | After P1 |
| F2 Upload | Contributor upload + submit → Draft → Pending | After P1 |
| F2 Upload | Researcher upload → 403 trên create-submission | After P1 |
| F3 Moderate | Expert xem pending queue | After P1 |
| F3 Moderate | Expert claim → review → approve | After P1 |
| F3 Moderate | Expert claim → review → reject | After P1 |
| F3 Moderate | AuditLog POST với Bearer | After P1 |
| F4 Admin | Create expert → role = Expert | After P1 |
| F4 Admin | List users / change role / change status | After P1 |
| F4 Password | User đổi password chính mình | After P2 |
| F4 Password | User KHÔNG đổi được password user khác | After P2 |
| F5 Search | Guest search `/explore` | After P2 |
| F5 Search | Auth search `/search` | After P2 |
| F5 Detail | Guest truy cập recording detail | After P3 |

### 5.2 Quick Smoke Test Script (Postman / curl)

```bash
# Phase 1 verification
# 1. Inactive user login
curl -X POST /api/Auth/login -d '{"email":"inactive@test.com","password":"..."}' # expect 401

# 2. Contributor get-by-status
curl -H "Authorization: Bearer $CONTRIBUTOR_TOKEN" /api/Submission/get-by-status?status=1 # expect 403

# 3. AuditLog without token
curl /api/AuditLog # expect 401

# 4. Create expert
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" /api/Admin/create-expert \
  -d '{"email":"expert@test.com","password":"Abc123!","fullName":"Test Expert"}' # expect 200

# 5. Swagger in production
curl https://production-host/swagger # expect 404
```

---

## 6. Dependency Map

```
Phase 1:
  Task 1.5 ←→ Task 1.6 (create-expert cần đúng role)
  Còn lại: độc lập, làm song song

Phase 2:
  Task 2.6 (plaintext removal) nên làm cuối Phase 2 — risk cao nhất
  Task 2.1 (IDOR) + Task 2.2 (ReviewerId) làm song song
  Task 2.3 + 2.4 + 2.5 (thêm [Authorize]) làm song song — trivial

Phase 3:
  Tất cả độc lập — FE và BE làm song song
```

---

## 7. Risk Register

| Risk | Mitigation |
|------|-----------|
| Phase 2.6 (xóa Password column) break login | Test kỹ login flow trước + sau migration. Rollback plan: re-add column |
| Task 1.5 cần inject IUserService vào AdminController | Check DI container; thêm constructor param |
| Task 2.4 MetadataSuggestController + FE legacy client | Verify FE service gửi Bearer. Nếu dùng `legacyPost` → cần sửa FE |
| AuditLog auth break FE expert flow | FE đã dùng `apiFetch` (tự gắn Bearer) → low risk |
| Owner policy change break MediaController | MediaController là stub, FE không gọi → no risk |

---

## 8. File Change Map

### Phase 1 (8 files)

| File | Changes |
|------|---------|
| `backend/.../Services/AuthService.cs` | +1 line (IsActive check) |
| `backend/.../Controllers/SubmissionController.cs` | +1 attr (get-by-status), edit 1 attr (reject) |
| `backend/.../Controllers/AuditLogController.cs` | +1 attr (class [Authorize]) |
| `backend/.../Controllers/AdminController.cs` | +15 lines (create-expert action) |
| `backend/.../Services/UserService.cs` | edit 1 line (Role "Staff"→"Expert") |
| `backend/VietTuneArchive/Program.cs` | edit 2 lines (Owner policy + Swagger condition) |

### Phase 2 (7 files)

| File | Changes |
|------|---------|
| `backend/.../Controllers/UserController.cs` | +6 lines × 2 actions (JWT userId override) |
| `backend/.../Controllers/ReviewController.cs` | +1 attr + 4 lines (role + ReviewerId) |
| `backend/.../Controllers/ChatController.cs` | +1 attr |
| `backend/.../Controllers/MetadataSuggestController.cs` | +1 attr |
| `backend/.../Controllers/RecordingImageController.cs` | +1 attr |
| `backend/.../Services/UserService.cs` | edit 3 lines (BCrypt comparison) |
| `backend/.../Services/AuthService.cs` | edit 1 line (remove plaintext save) |

### Phase 3 (5 files)

| File | Changes |
|------|---------|
| `src/services/expertModerationApi.ts` | edit 2 blocks (swallow logic) |
| `src/pages/ApprovedRecordingsPage.tsx` | edit 1 condition |
| `src/hooks/useRecordingDetail.ts` | +10 lines (guest fallback) |
| `src/services/recordingService.ts` | +8 lines (getGuestRecordingById) |
| `backend/.../Services/AuthService.cs` | edit 2 lines (Failure instead of Success) |

---

*Plan dựa trên `docs/AUDIT-main-flows.md`. Không modify code ngoài scope listed files.*
