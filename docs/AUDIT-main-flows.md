# VietTune — Audit Các Flow Chính (Demo-Ready)

> **Date:** 2026-05-29
> **Scope:** 5 flow chính — Auth, Upload, Expert Moderation, Admin, Recording Search
> **Methodology:** Static analysis với exact code evidence (line numbers, verbatim snippets)

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [F1 — Đăng ký / Đăng nhập](#2-f1--đăng-ký--đăng-nhập)
3. [F2 — Upload Submission](#3-f2--upload-submission)
4. [F3 — Expert Moderation](#4-f3--expert-moderation)
5. [F4 — Admin User Management](#5-f4--admin-user-management)
6. [F5 — Recording Search / View](#6-f5--recording-search--view)
7. [Tổng hợp Findings](#7-tổng-hợp-findings)
8. [Fix Roadmap cho Demo](#8-fix-roadmap-cho-demo)

---

## 1. Tổng quan

### Flow Map

```
F1: Browser → POST /api/Auth/login → JWT (120 min) → IndexedDB
F2: Browser → Supabase Storage (anon key) + POST /api/Submission/create-submission → Draft → Confirm
F3: Expert → GET /api/Submission/get-by-status → Claim → Review/create → Approve/Reject → AuditLog POST
F4: Admin → GET /api/Admin/users → PUT role/status → POST /Admin/create-expert (404!)
F5: Guest → GET /api/RecordingGuest/* (public) | Auth → GET /api/Recording/* (JWT)
```

### Risk Matrix (chỉ flow chính)

| Priority | Count | Mô tả |
|----------|-------|-------|
| **P0 Critical** | 7 | Plaintext password, missing endpoint, no-op Owner policy, AuditLog open, role leak, contributor reject, no IsActive check |
| **P1 High** | 6 | IDOR password/profile, ReviewerId spoofable, Swagger in prod, RecordingImage open, ChatController open, orphan files |
| **P2 Medium** | 5 | FE swallow 400, guard inconsistency, client-only validation, register returns 200 on error, FE detail no guest fallback |

---

## 2. F1 — Đăng ký / Đăng nhập

### 2.1 Luồng hoạt động

```
FE login form → POST /api/Auth/login → AuthService.Authenticate()
  → BCrypt verify → GenerateJwtToken (120 min) → return { Token, UserId, Role, isActive }
FE → setItem('access_token', token) → IndexedDB
FE → setItem('user', JSON.stringify(user)) → IndexedDB
```

### 2.2 Finding F1-01: Login không check IsActive (P0)

`AuthService.Authenticate` chỉ check email + password + `IsEmailConfirmed`, **không check `IsActive`**:

```38:50:backend/VietTuneArchive.Application/Services/AuthService.cs
 public async Task<User> Authenticate(string email, string password)
 {
 var user = await _userRepository.GetByEmailAsync(email);

 if (user == null || !VerifyPassword(password, user.PasswordHash))
 return null;

 if (!user.IsEmailConfirmed)
 throw new Exception("Vui lòng xác nhận email trước khi đăng nhập.");

 return user;

 }
```

- **Impact:** User bị ban/deactivate vẫn login được, nhận JWT 120 phút.
- **Fix:** Thêm `if (!user.IsActive) return null;` trước return.

### 2.3 Finding F1-02: Plaintext password song song với BCrypt (P0)

`User` entity có **2 cột password**:

```18:23:backend/VietTuneArchive.Domain/Entities/User.cs
 [Required]
 [MaxLength(500)]
 public string PasswordHash { get; set; }
 [Required]
 [MaxLength(500)]
 public string Password { get; set; }
```

Login dùng BCrypt (đúng), nhưng `UpdatePasswordAsync` so sánh **plaintext**:

```100:120:backend/VietTuneArchive.Application/Services/UserService.cs
 public async Task<Result<UpdatePasswordDTO>> UpdatePasswordAsync(UpdatePasswordDTO updateUserDTO)
 {
 var getUser = await _userRepository.GetByIdAsync(updateUserDTO.UserId);
 if (getUser == null)
 {
 return Result<UpdatePasswordDTO>.Failure("Người dùng không tồn tại! Kiểm tra lại Id.");
 }
 if (!getUser.Password.Equals(updateUserDTO.OldPassword))
 {
 return Result<UpdatePasswordDTO>.Failure("Mật khẩu cũ không đúng. Vui lòng thử lại.");
 }
 // ...
 getUser.Password = updateUserDTO.NewPassword;
 getUser.PasswordHash = passwordHash;
 await _userRepository.UpdateAsync(getUser);
```

`ResetPasswordAsync` cũng lưu plaintext:

```203:211:backend/VietTuneArchive.Application/Services/AuthService.cs
 user.PasswordHash = HashPassword(newPassword);
 user.Password = newPassword;
```

Register lưu plaintext trước khi gọi `Register()`:

```49:62:backend/VietTuneArchive/Controllers/AuthController.cs
 [HttpPost("register-contributor")]
 public async Task<IActionResult> RegisterForContributor([FromBody] RegisterModel model)
 {
 var user = new User
 {
 Email = model.Email,
 Password = model.Password,
 // ...
 };
 var result = await _authService.Register(user, model.Password);
```

- **Impact:** DB leak → toàn bộ password bị lộ.
- **Fix:** Xóa cột `Password`. Dùng BCrypt cho mọi comparison.

### 2.4 Finding F1-03: Swagger UI bật ở Production (P1)

```315:325:backend/VietTuneArchive/Program.cs
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
 app.UseSwagger();
 app.UseSwaggerUI(c =>
 {
 // ...
 });
}
```

- **Fix:** Bỏ `|| app.Environment.IsProduction()`.

### 2.5 Finding F1-04: Owner policy = no-op (P0)

```53:59:backend/VietTuneArchive/Program.cs
builder.Services.AddAuthorization(options =>
{
 options.AddPolicy("Admin", p => p.RequireRole("Admin"));
 options.AddPolicy("Expert", p => p.RequireRole("Expert"));
 options.AddPolicy("Owner", p => p.RequireAssertion(c => true));
});
```

`MediaController` và `TranscriptionController` dùng `[Authorize(Policy = "Owner")]` → mọi authenticated user đều pass.

- **Fix:** Implement `IAuthorizationHandler` check ownership thực tế.

### 2.6 Finding F1-05: Không có global auth fallback policy (P0)

Không có `FallbackPolicy` trong `Program.cs`. Controller nào quên `[Authorize]` → public.

- **Fix:** Thêm `options.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build()` rồi gắn `[AllowAnonymous]` cho Auth, RecordingGuest.

### 2.7 Finding F1-06: Register trả Success khi validation fail (P2)

```102:114:backend/VietTuneArchive.Application/Services/AuthService.cs
 public async Task<Result<AuthDTO>> Register(User user, string password)
 {
 if (user == null)
 {
 var msg = new AuthDTO { Message = "Người dùng không được để trống." };
 return Result<AuthDTO>.Success(msg);
 }
```

Controller check `result.IsSuccess` → trả HTTP 200 cho validation error.

### 2.8 Finding F1-07: FE guard chỉ client-side, không validate server (P2)

`fetchCurrentUser` đọc từ IndexedDB, **không gọi API server**:

```94:115:src/stores/authStore.ts
 fetchCurrentUser: async () => {
 if (!authService.isAuthenticated()) return;
 set({ isLoading: true });
 try {
 const storedUser = authService.getStoredUser();
 if (storedUser) {
 set({ user: storedUser, isAuthenticated: true });
 // ...
```

---

## 3. F2 — Upload Submission

### 3.1 Luồng hoạt động

```
FE → uploadFileToSupabase(file) [anon key, NO server validation]
FE → POST /api/Submission/create-submission [JWT, Roles: Admin,Contributor,Expert]
FE → PUT /api/Recording/{id}/upload [JWT, Roles: Admin,Contributor,Expert]
FE → PUT /api/Submission/confirm-submit-submission [JWT]
```

**`MediaController` KHÔNG nằm trên flow chính** — FE upload thẳng Supabase, không qua BE media endpoint.

### 3.2 Finding F2-01: Upload Supabase không validate server-side (P1)

```12:38:src/services/uploadService.ts
export const uploadFileToSupabase = async (
 file: File,
 bucketName: string = import.meta.env.VITE_SUPABASE_BUCKET || 'audio',
): Promise<string> => {
 try {
 assertSupabaseConfigured();
 if (!supabase) throw new Error('Supabase client is not configured.');
 const fileExt = file.name.split('.').pop();
 const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
 const filePath = `${fileName}`;
 const { error } = await supabase.storage.from(bucketName).upload(filePath, file, {
 cacheControl: '3600',
 upsert: false,
 });
```

- FE validate MIME + size (200MB audio, 2GB video) — nhưng **bypassable** vì upload trực tiếp Supabase.
- Backend `create-submission` chỉ nhận URL string, không validate file.
- **Fix:** Thêm Supabase RLS policies restrict file type/size, hoặc proxy qua BE.

### 3.3 Finding F2-02: UploadedById client-supplied, không check JWT (P2)

```36:46:backend/VietTuneArchive/Controllers/SubmissionController.cs
 [HttpPost("create-submission")]
 [Authorize(Roles = "Admin,Contributor,Expert")]
 public async Task<IActionResult> CreateSubmission([FromBody] SubmissionDto dto)
 {
 var result = await _submissionService.CreateAsync(dto);
```

`SubmissionDto.UploadedById` do client gửi — service chỉ check user tồn tại, không check = JWT subject.

### 3.4 Finding F2-03: Orphan file khi API fail (P2)

Upload Supabase **trước** create-submission. Nếu API fail → file tồn tại trên Supabase nhưng không có record DB.

### 3.5 Finding F2-04: RecordingImageController không có auth (P1)

```6:10:backend/VietTuneArchive/Controllers/RecordingImageController.cs
namespace VietTuneArchive.API.Controllers
{
 [Route("api/[controller]")]
 [ApiController]
 public class RecordingImageController : ControllerBase
```

10 endpoints (CRUD + upload + delete) — **tất cả public**. Ai cũng upload/xóa image.

---

## 4. F3 — Expert Moderation

### 4.1 Luồng hoạt động

```
Expert → GET /api/Submission/get-by-status?status=1 (pending queue)
Expert → PUT /api/Submission/assign-reviewer-submission (claim)
Expert → 3-stage wizard review
Expert → POST /api/Review/create (reject/request revision) hoặc PUT approve-submission
Expert → PUT done-stage-one / done-stage-two
Expert → POST /api/AuditLog (ghi log)
```

### 4.2 Finding F3-01: get-by-status không restrict role (P0)

```23:34:backend/VietTuneArchive/Controllers/SubmissionController.cs
 [HttpGet("get-by-status")]
 public async Task<IActionResult> GetSubmissionsByStatus(SubmissionStatus status,
 [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
```

Class-level `[Authorize]` nhưng **KHÔNG có `[Authorize(Roles)]`** ở action → any logged-in user (Contributor, Researcher) đều xem được pending queue.

- **Fix:** Thêm `[Authorize(Roles = "Admin,Expert")]`.

### 4.3 Finding F3-02: reject-submission cho phép Contributor (P0)

```104:118:backend/VietTuneArchive/Controllers/SubmissionController.cs
 [HttpPut("reject-submission")]
 [Authorize(Roles = "Admin,Expert,Contributor")]
 public async Task<IActionResult> RejectSubmission(Guid submissionId)
```

- **Impact:** Contributor có thể reject submission của người khác.
- **Fix:** Đổi thành `[Authorize(Roles = "Admin,Expert")]`.
- **Note:** FE không gọi endpoint này (reject qua `Review/create`), nhưng API vẫn mở.

### 4.4 Finding F3-03: AuditLogController hoàn toàn không auth (P0)

```6:10:backend/VietTuneArchive/Controllers/AuditLogController.cs
namespace VietTuneArchive.API.Controllers
{
 [Route("api/[controller]")]
 [ApiController]
 public class AuditLogController : ControllerBase
```

6 endpoints (GET, POST, PUT, DELETE) — **tất cả public**. Ai cũng tạo/sửa/xóa audit log.

- **Fix:** Thêm `[Authorize]` class-level. POST/PUT/DELETE cần `[Authorize(Roles = "Admin,Expert")]`.

### 4.5 Finding F3-04: Review/create không restrict role, ReviewerId client-supplied (P1)

```45:54:backend/VietTuneArchive/Controllers/ReviewController.cs
 [HttpPost("create")]
 public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
 {
 var result = await _reviewService.SubmitReviewAsync(dto.SubmissionId, dto.ReviewerId, dto.Decision, dto.Comments);
```

- Controller chỉ có class `[Authorize]`, không `[Authorize(Roles)]`.
- `ReviewerId` do client gửi — nhưng `ReviewService.SubmitReviewAsync` **có validate**: reviewer phải có role "Expert" + phải là assigned reviewer của submission.

```121:148:backend/VietTuneArchive.Application/Services/ReviewService.cs
 var reviewer = await _userRepository.GetByIdAsync(reviewerId);
 if (reviewer == null || reviewer.Role != "Expert")
 {
 return Result<bool>.Failure("Unauthorized: Only Expert can review");
 }

 if (submission.ReviewerId != reviewerId)
 {
 return Result<bool>.Failure("Forbidden: You are not assigned to review this submission");
 }
```

- **Residual risk:** Contributor/Researcher vẫn có thể gọi endpoint, chỉ bị chặn ở service layer (không phải 403 mà là 400).
- **Fix:** Thêm `[Authorize(Roles = "Admin,Expert")]` + validate `ReviewerId == JWT NameIdentifier`.

### 4.6 Finding F3-05: FE swallow 400/409 trên stage completion (P2)

```424:432:src/services/expertModerationApi.ts
 } catch (err: unknown) {
 const httpStatus = getHttpStatus(err);
 if (httpStatus === 400 || httpStatus === 409) {
 return mutationOk();
 }
 return mutationFail(err, httpStatus);
 }
```

400 (lỗi thật) bị coi như success. Tương tự cho `get-by-status` 400 → trả `[]`:

```128:133:src/services/expertModerationApi.ts
 } catch (err: unknown) {
 const status = getHttpStatus(err);
 if (status === 400 || status === 404) return [];
 throw err;
 }
```

### 4.7 Finding F3-06: ApprovedRecordingsPage guard yếu hơn ModerationPage (P2)

| Guard | ModerationPage | ApprovedRecordingsPage |
|-------|----------------|------------------------|
| `UserRole.EXPERT` | Yes | Yes |
| `isEmailConfirmed` | Yes | **No** |
| `isActive` | Yes | **No** |

```116:118:src/pages/ApprovedRecordingsPage.tsx
 if (!user || user.role !== UserRole.EXPERT) {
 return <ForbiddenPage message="Bạn cần tài khoản Chuyên gia để truy cập trang này." />;
 }
```

---

## 5. F4 — Admin User Management

### 5.1 Luồng hoạt động

```
Admin → GET /api/Admin/users (list)
Admin → PUT /api/Admin/users/{id}/role (đổi role)
Admin → PUT /api/Admin/users/{id}/status (đổi status)
Admin → POST /api/Admin/create-expert (TẠO EXPERT) → 404!
Admin → GET /api/Admin/audit-logs
Admin → GET /api/Admin/system-health (stub)
```

### 5.2 Finding F4-01: create-expert không tồn tại trên BE (P0)

FE gọi:

```164:174:src/services/adminApi.ts
 async createExpert(payload: CreateExpertPayload): Promise<CreateExpertResult> {
 try {
 const res = await legacyPost<ApiBaseResponse | Record<string, unknown>>(
 '/Admin/create-expert',
 {
 email: payload.email.trim(),
 password: payload.password,
 fullName: payload.fullName.trim(),
 },
 );
```

`AdminController.cs` có 8 actions — **không có `create-expert`**:

```11:14:backend/VietTuneArchive/Controllers/AdminController.cs
 [Route("api/[controller]")]
 [ApiController]
 [Authorize(Roles = "Admin")]
 public class AdminController : ControllerBase
```

Actions: `users`, `users/{id}`, `users/{id}/role`, `users/{id}/status`, `submissions`, `submissions/{id}/assign`, `audit-logs`, `system-health`.

`UserService.AddAsync(CreateExpertUserDTO)` tồn tại nhưng **không có controller nào expose**.

- **Impact:** Trang Create Expert → submit → **404**.
- **Fix:** Thêm `[HttpPost("create-expert")]` vào `AdminController`.

### 5.3 Finding F4-02: AddAsync set Role = "Staff" thay vì "Expert" (P0)

```43:68:backend/VietTuneArchive.Application/Services/UserService.cs
 public async Task<Result<CreateExpertUserDTO>> AddAsync(CreateExpertUserDTO expertUserDTO)
 {
 // ...
 var user = new User
 {
 Email = dto.Email,
 Password = dto.Password,
 PasswordHash = passwordHash,
 FullName = dto.FullName,
 Role = "Staff",
 // ...
 };
 await _userRepository.AddAsync(user);
 return Result<CreateExpertUserDTO>.Success(expertUserDTO, "Tạo tài khoản Expert thành công.");
 }
```

- Success message nói "Expert" nhưng gán `"Staff"` — role không tồn tại trong hệ thống.
- **Fix:** Đổi `Role = "Expert"`.

### 5.4 Finding F4-03: IDOR trên update-password / update-profile (P1)

```37:43:backend/VietTuneArchive/Controllers/UserController.cs
 [HttpPut("update-password")]
 [Authorize(Roles = "Admin,Contributor,Researcher,Expert")]
 public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordDTO updatePasswordDTO)
 {
 if (updatePasswordDTO == null)
 return BadRequest("Invalid data.");
 var result = await _userService.UpdatePasswordAsync(updatePasswordDTO);
```

`UpdatePasswordDTO.UserId` lấy từ body — không verify `== JWT ClaimTypes.NameIdentifier`.

```38:44:backend/VietTuneArchive.Application/Mapper/DTOs/UserDto.cs
 public class UpdatePasswordDTO
 {
 public Guid UserId { get; set; }
 public string OldPassword { get; set; }
 public string NewPassword { get; set; }
 public string ConfirmPassword { get; set; }
 }
```

Tương tự cho `update-profile` với `UpdateInfoDTO.UserId`.

- **Impact:** User A đổi password/profile của User B nếu biết userId.
- **Fix:** Lấy userId từ `User.FindFirstValue(ClaimTypes.NameIdentifier)`, bỏ qua body.

---

## 6. F5 — Recording Search / View

### 6.1 Luồng hoạt động

```
Guest → /explore → GET /api/RecordingGuest/* [AllowAnonymous, chỉ approved recordings]
Auth user → /search → GET /api/Recording/* [Authorize + Roles]
Detail → GET /api/Recording/{id} [Authorize] hoặc preloaded từ explore
```

### 6.2 Finding F5-01: RecordingGuest đúng chuẩn (OK)

```9:12:backend/VietTuneArchive/Controllers/RecordingGuestController.cs
 [Route("api/[controller]")]
 [ApiController]
 [AllowAnonymous]
 public class RecordingGuestController : ControllerBase
```

4 endpoints public, chỉ trả approved recordings — **thiết kế đúng**.

### 6.3 Finding F5-02: RecordingController yêu cầu auth (OK)

```9:12:backend/VietTuneArchive/Controllers/RecordingController.cs
 [Route("api/[controller]")]
 [ApiController]
 [Authorize]
 public class RecordingController : ControllerBase
```

Mỗi action có `[Authorize(Roles = "Admin,Contributor,Expert,Researcher")]` — **đúng**.

### 6.4 Finding F5-03: ChatController không có auth (P1)

```8:10:backend/VietTuneArchive/Controllers/ChatController.cs
 [Route("api/[controller]")]
 [ApiController]
 public class ChatController : ControllerBase
```

`POST /api/Chat` proxy trực tiếp tới Gemini API — ai cũng gọi được, burn API quota.

- **Fix:** Thêm `[Authorize]` + rate limiting.

### 6.5 Finding F5-04: MetadataSuggestController không có auth (P1)

```12:14:backend/VietTuneArchive/Controllers/MetadataSuggestController.cs
[ApiController]
[Route("api/[controller]")]
public class MetadataSuggestController : ControllerBase
```

- **Fix:** Thêm `[Authorize]`.

### 6.6 Finding F5-05: FE RecordingDetailPage không fallback guest API (P2)

`useRecordingDetail` gọi `GET /api/Recording/{id}` (auth required). Không có fallback `GET /api/RecordingGuest/{id}`:

```80:89:src/hooks/useRecordingDetail.ts
 try {
 const response = await recordingService.getRecordingById(id);
 // ...
 } catch (err) {
 console.warn('GET /Recording/{id} failed, trying submission / list fallbacks', err);
 }
```

Guest chỉ xem được detail nếu navigate từ `/explore` (preloaded data). Direct URL → fail.

---

## 7. Tổng hợp Findings

### P0 Critical — Phải sửa trước demo

| ID | Flow | Finding | File | Line |
|----|------|---------|------|------|
| F1-01 | Auth | Login không check `IsActive` | `AuthService.cs` | 38-50 |
| F1-02 | Auth | Plaintext password lưu song song BCrypt | `UserService.cs`, `AuthService.cs`, `AuthController.cs` | Multiple |
| F1-04 | Auth | Owner policy `context => true` | `Program.cs` | 58 |
| F3-01 | Moderation | `get-by-status` không restrict role | `SubmissionController.cs` | 23 |
| F3-02 | Moderation | `reject-submission` cho Contributor | `SubmissionController.cs` | 105 |
| F3-03 | Moderation | AuditLogController không auth | `AuditLogController.cs` | 8-10 |
| F4-01 | Admin | `create-expert` endpoint missing → 404 | `AdminController.cs` | N/A |

### P1 High — Nên sửa trước demo

| ID | Flow | Finding | File | Line |
|----|------|---------|------|------|
| F1-03 | Auth | Swagger bật ở production | `Program.cs` | 315 |
| F2-01 | Upload | Supabase upload không server-side validation | `uploadService.ts` | 12-38 |
| F2-04 | Upload | RecordingImageController không auth | `RecordingImageController.cs` | 8-10 |
| F3-04 | Moderation | Review/create không role restriction | `ReviewController.cs` | 45-46 |
| F4-03 | Admin | IDOR update-password/profile | `UserController.cs` | 37-43 |
| F5-03 | Recording | ChatController không auth (burn Gemini $) | `ChatController.cs` | 8-10 |

### P2 Medium — Có thể chấp nhận cho demo

| ID | Flow | Finding |
|----|------|---------|
| F1-06 | Auth | Register trả 200 khi validation fail |
| F1-07 | Auth | FE guard client-only, không validate server |
| F2-02 | Upload | UploadedById client-supplied |
| F2-03 | Upload | Orphan Supabase file khi API fail |
| F3-05 | Moderation | FE swallow 400/409 |
| F3-06 | Moderation | ApprovedRecordingsPage thiếu isActive/isEmailConfirmed check |
| F4-02 | Admin | AddAsync set Role="Staff" (tied to F4-01) |
| F5-05 | Recording | Detail page không fallback guest API |

---

## 8. Fix Roadmap cho Demo

### Phase 1 — MUST FIX (3-4 ngày, 1 BE dev)

| # | ID | Effort | Việc cần làm | File |
|---|-----|--------|-------------|------|
| 1 | F1-01 | 0.5h | Thêm `if (!user.IsActive) return null;` trong `Authenticate` | `AuthService.cs` L45 |
| 2 | F3-01 | 0.5h | Thêm `[Authorize(Roles = "Admin,Expert")]` cho `get-by-status` | `SubmissionController.cs` L23 |
| 3 | F3-02 | 0.5h | Đổi `"Admin,Expert,Contributor"` → `"Admin,Expert"` ở `reject-submission` | `SubmissionController.cs` L105 |
| 4 | F3-03 | 0.5h | Thêm `[Authorize]` class-level cho `AuditLogController` | `AuditLogController.cs` L8 |
| 5 | F4-01 | 2h | Thêm `[HttpPost("create-expert")]` action trong `AdminController`, wire tới `UserService.AddAsync` | `AdminController.cs` |
| 6 | F4-02 | 0.5h | Đổi `Role = "Staff"` → `Role = "Expert"` trong `AddAsync` | `UserService.cs` L58 |
| 7 | F1-04 | 4h | Implement `IAuthorizationHandler` cho Owner policy (hoặc tạm đổi thành `RequireAuthenticatedUser()` nếu gấp) | `Program.cs` L58 |
| 8 | F1-03 | 0.5h | Bỏ `\|\| app.Environment.IsProduction()` khỏi Swagger condition | `Program.cs` L315 |

**Tổng Phase 1: ~9 giờ**

### Phase 2 — SHOULD FIX (2 ngày)

| # | ID | Effort | Việc cần làm |
|---|-----|--------|-------------|
| 1 | F4-03 | 2h | IDOR fix: lấy userId từ JWT trong `update-password`/`update-profile` |
| 2 | F3-04 | 1h | Thêm `[Authorize(Roles)]` cho `Review/create` + validate ReviewerId = JWT |
| 3 | F5-03 | 0.5h | Thêm `[Authorize]` cho `ChatController` |
| 4 | F5-04 | 0.5h | Thêm `[Authorize]` cho `MetadataSuggestController` |
| 5 | F2-04 | 0.5h | Thêm `[Authorize]` cho `RecordingImageController` |
| 6 | F1-02 | 4h | Xóa cột `Password`, migration, dùng BCrypt cho mọi comparison |

**Tổng Phase 2: ~8.5 giờ**

### Phase 3 — NICE TO HAVE (cho demo smooth hơn)

| # | ID | Effort | Việc cần làm |
|---|-----|--------|-------------|
| 1 | F3-05 | 1h | Chỉ swallow 409 (idempotent), propagate 400 |
| 2 | F3-06 | 0.5h | Thêm isActive/isEmailConfirmed check cho ApprovedRecordingsPage |
| 3 | F5-05 | 1h | Thêm fallback `getGuestRecordingById` trong `useRecordingDetail` |
| 4 | F1-06 | 1h | `Register()` trả `Failure` thay vì `Success` khi validation fail |
| 5 | F2-02 | 1h | Validate UploadedById = JWT subject trong `CreateAsync` |

---

## Phụ lục: SubmissionStatus Enum

```3:11:backend/VietTuneArchive.Domain/Entities/Enum/SubmissionStatus.cs
 public enum SubmissionStatus
 {
 Draft,       // 0
 Pending,     // 1
 Approved,    // 2
 Rejected,    // 3
 UpdateRequested, // 4
 Embargoed    // 5
 }
```

## Phụ lục: Review Decision Enum (implicit, không có file enum riêng)

| Value | Meaning | Status sau review |
|-------|---------|-------------------|
| 0 | Reject | `SubmissionStatus.Rejected` |
| 1 | Request Revision | `SubmissionStatus.UpdateRequested` |
| — | Approve | Via `PUT approve-submission` (separate endpoint) |

## Phụ lục: Controller Auth Summary (5 flow chính)

| Controller | Class Auth | Issue |
|------------|-----------|-------|
| `AuthController` | None (public — đúng) | Exception message leak |
| `SubmissionController` | `[Authorize]` | `get-by-status` thiếu role; `reject` cho Contributor |
| `ReviewController` | `[Authorize]` | `Create` không role restriction |
| `AuditLogController` | **None** | Full CRUD public |
| `AdminController` | `[Authorize(Roles="Admin")]` | Missing `create-expert` |
| `UserController` | `[Authorize]` | IDOR trên update-password/profile |
| `RecordingController` | `[Authorize]` + roles | OK |
| `RecordingGuestController` | `[AllowAnonymous]` | OK — chỉ approved |
| `RecordingImageController` | **None** | Full CRUD public |
| `ChatController` | **None** | Gemini proxy public |
| `MetadataSuggestController` | **None** | AI proxy public |
| `MediaController` | `//[Authorize]` (commented) | Stub, không trên flow chính |
| `TranscriptionController` | `//[Authorize]` (commented) | Stub, không trên flow chính |

---

*Audit dựa trên static source code analysis. Tất cả line numbers tham chiếu tới commit hiện tại.*
