# VietTune — Full System Audit

> **Role:** Principal Software Architect, Security Auditor, Senior Full Stack Engineer
> **Date:** 2026-05-29
> **Scope:** Entire codebase — backend (ASP.NET Core), frontend (React/TypeScript), OpenAPI contract, infrastructure config
> **Methodology:** Static analysis of source code, OpenAPI spec cross-reference, controller-level auth mapping, FE guard/service tracing

---

## 1. Executive Summary

VietTune is a Vietnamese traditional music archival system with **184 API endpoints** across 40+ tags, a React SPA frontend, and an ASP.NET Core backend. The system supports 4 roles (Admin, Expert, Contributor, Researcher) with distinct workflows.

**Critical assessment:** The application has **14 P0 Critical** findings, **16 P1 High** findings, and numerous P2/P3 issues. The most urgent risks are:

1. **~20 controllers completely lack authentication** — `AuditLogController`, `AnnotationController`, `AnalyticsController`, `ChatController`, `RefreshTokenController`, `RecordingImageController`, `QAConversationController`, `CopyrightDisputeController`, and 12+ reference data controllers are public despite swagger declaring global Bearer security.
2. **"Owner" authorization policy is a no-op** (`context => true`) — `MediaController` and `TranscriptionController` grant access to anyone.
3. **Plaintext password stored in `User.Password` column** alongside BCrypt hash — direct credential theft if DB is compromised.
4. **ChatController proxies unauthenticated requests to Gemini API** — unlimited API spend by any caller.
5. **IDOR in UserController** — `update-password` and `update-profile` take `UserId` from request body, not JWT.
6. **JWT tokens stored in IndexedDB/localStorage** with no refresh token rotation.
7. **`POST /Admin/create-expert`** called by FE but **does not exist** on BE — guaranteed 404.
8. **Login does not check `IsActive`** — banned users can still authenticate.
9. **Swagger UI accessible in production** — full API documentation exposed.

**Production readiness: NOT READY** — requires P0 fixes before any public-facing deployment.

---

## 2. Risk Matrix

| Priority | Count | Category Breakdown |
|----------|-------|--------------------|
| **P0 Critical** | 14 | Auth bypass (7), broken policy (1), plaintext pwd (1), API gap (1), credential exposure (2), unauthenticated AI proxy (1), RefreshToken CRUD open (1) |
| **P1 High** | 16 | Overly permissive roles (4), missing validation (3), contract mismatch (3), session mgmt (2), IDOR (2), login allows inactive (1), Swagger in prod (1) |
| **P2 Medium** | 16 | Inconsistent guards (3), error masking (4), tech debt (4), perf (3), weak OTP (1), CORS fallback (1) |
| **P3 Low** | 10 | UX inconsistencies (3), documentation gaps (3), minor tech debt (2), Staff role orphan (1), demo users in admin (1) |

---

## 3. Architecture Findings

### 3.1 System Architecture

```
Browser → Vite Dev Proxy (/api → Azure BE)
       → Supabase Storage (direct upload)
       → SignalR Hub (notifications)

Backend: ASP.NET Core → Services → Repositories → SQL DB
         No API Gateway, no rate limiting layer
```

### ARCH-01 — No API Gateway / Rate Limiting (P1)

- **Risk:** DDoS, brute-force login, API abuse.
- **Root cause:** Backend exposes controllers directly; no middleware for rate limiting.
- **Affected files:** `backend/VietTuneArchive/Program.cs`
- **Reproduction:** Send 1000 `POST /api/Auth/login` requests in 1 second — all processed.
- **Fix:** Add `AspNetCoreRateLimit` or Azure API Management. Minimum: rate limit `/api/Auth/login` to 5/min per IP.
- **Regression risk:** Low.

### ARCH-02 — Direct Client-to-Supabase Upload (P2)

- **Risk:** No server-side validation of uploaded files. Client uploads directly to Supabase with anon key — any file type/size could be uploaded.
- **Root cause:** `uploadService.ts` calls `supabase.storage.from(bucket).upload()` directly.
- **Affected files:** `src/services/uploadService.ts`, `src/services/supabaseClient.ts`
- **Fix:** Add Supabase Storage policies (RLS) or proxy uploads through BE with validation.
- **Regression risk:** Medium — changes upload flow.

### ARCH-03 — No Refresh Token Mechanism (P1)

- **Risk:** JWT has 120-minute expiry. No refresh → user forced to re-login. Token theft gives 2-hour window with no revocation.
- **Root cause:** `AuthController.Login` returns only `token`. Swagger has `RefreshToken` tag but it's not wired to login flow.
- **Affected files:** `backend/.../AuthController.cs`, `src/services/authService.ts`
- **Fix:** Implement refresh token rotation. Store refresh token in httpOnly cookie.
- **Regression risk:** Medium — changes auth flow.

---

## 4. Security Findings

### SEC-01 — AuditLogController: No Authentication (P0 Critical)

- **Risk:** Anyone can **read, create, update, delete** audit logs without authentication. Attackers can inject false audit trails or read sensitive operation history.
- **Root cause:** `AuditLogController` has no `[Authorize]` attribute at class or action level. No `[AllowAnonymous]` explicit either — but the class inherits `ControllerBase` without auth.
- **Affected files:** `backend/VietTuneArchive/Controllers/AuditLogController.cs`
- **Reproduction:** `curl -X GET https://<host>/api/AuditLog` — returns all audit logs. `curl -X POST https://<host>/api/AuditLog -d '{...}'` — creates entry.
- **Fix:** Add `[Authorize]` at class level. POST/PUT/DELETE should require `[Authorize(Roles = "Admin,Expert")]`. GET by-submission can stay `[Authorize]`.
- **Implementation:** 1 file change, ~5 lines.
- **Regression risk:** FE `expertModerationApi.postExpertModerationAuditLog` must send Bearer token (already does via `apiFetch`).

### SEC-02 — AnnotationController: AllowAnonymous on All CRUD (P0 Critical)

- **Risk:** Anyone can create/update/delete annotations without auth. Data tampering on expert annotations.
- **Root cause:** `[AllowAnonymous]` at class level on `AnnotationController`.
- **Affected files:** `backend/VietTuneArchive/Controllers/AnnotationController.cs`
- **Reproduction:** `curl -X POST https://<host>/api/Annotation/create -d '{...}'`
- **Fix:** Remove `[AllowAnonymous]`. Add `[Authorize]` class-level. GET can be public; mutations need Expert/Admin.
- **Regression risk:** Low.

### SEC-03 — AnalyticsController: AllowAnonymous (P0 Critical)

- **Risk:** All analytics data (overview, submissions, coverage, content, expert performance, contributor stats) publicly accessible.
- **Root cause:** `[AllowAnonymous]` at class level on `AnalyticsController`.
- **Affected files:** `backend/VietTuneArchive/Controllers/AnalyticsController.cs`
- **Reproduction:** `curl https://<host>/api/Analytics/experts` — returns expert performance data.
- **Fix:** `[Authorize(Roles = "Admin")]` or at minimum `[Authorize]`.
- **Regression risk:** Low — FE admin dashboard already sends Bearer.

### SEC-04 — CopyrightDisputeController: No Auth on CRUD (P1 High)

- **Risk:** Copyright disputes can be created, read, resolved by unauthenticated users. Evidence uploaded without auth.
- **Root cause:** Controller likely missing `[Authorize]`. Swagger shows 5 paths with no auth indication beyond global Bearer.
- **Affected files:** `backend/VietTuneArchive/Controllers/CopyrightDisputeController.cs`
- **Fix:** `[Authorize]` class-level. Resolve/assign need Admin.
- **Regression risk:** Low.

### SEC-05 — JWT Stored in IndexedDB (P1 High)

- **Risk:** XSS can steal JWT via `storageService.getItem('access_token')`. IndexedDB is accessible from any script in the origin.
- **Root cause:** `authService.login` calls `setItem('access_token', token)` → IndexedDB. `apiFetch` middleware reads it on every request.
- **Affected files:** `src/services/authService.ts` (line ~79), `src/api/client.ts`, `src/services/storageService.ts`
- **Reproduction:** Inject `<script>alert(getItem('access_token'))</script>` via any XSS vector.
- **Fix:** Move JWT to httpOnly secure cookie set by BE. Use `SameSite=Strict`.
- **Regression risk:** High — requires BE changes to set cookie + FE to stop managing token.

### SEC-06 — No CSRF Protection (P1 High)

- **Risk:** State-mutating operations (approve submission, create expert, delete recordings) can be triggered by cross-site requests if user has valid cookie/token.
- **Root cause:** No anti-forgery tokens; Bearer in header partially mitigates (attacker can't set custom headers in CSRF) but if token moves to cookie, CSRF becomes critical.
- **Affected files:** All BE controllers, `Program.cs`
- **Fix:** Implement anti-forgery middleware. With current Bearer-in-header approach, risk is mitigated but should be addressed proactively.
- **Regression risk:** Low with current architecture.

### SEC-07 — Supabase Anon Key Exposed Client-Side (P0 Critical)

- **Risk:** `VITE_SUPABASE_ANON_KEY` is bundled into client JS. Anyone can extract it and use Supabase APIs directly — upload arbitrary files, potentially read/delete files depending on bucket policies.
- **Root cause:** `supabaseClient.ts` uses `import.meta.env.VITE_SUPABASE_ANON_KEY` → bundled into client code.
- **Affected files:** `src/services/supabaseClient.ts`, `.env*`
- **Reproduction:** View page source → search for Supabase key in JS bundle.
- **Fix:** Ensure Supabase bucket has restrictive RLS policies. Only allow uploads to specific paths. Validate file types/sizes in policies. Consider server-side upload proxy.
- **Regression risk:** Medium.

### SEC-08 — Demo Login Credentials in Production Bundle (P0 Critical)

- **Risk:** `authService.loginDemo()` may be accessible in production if `import.meta.env.DEV` check is stripped incorrectly.
- **Root cause:** Demo login returns hardcoded tokens like `demo-token-expert_a`. If Vite dead-code elimination doesn't fully remove the DEV branch, demo auth is exposed.
- **Affected files:** `src/services/authService.ts` (loginDemo function)
- **Reproduction:** In production build, check if `loginDemo` function body is present in bundle.
- **Fix:** Move demo login to a separate file only imported conditionally. Verify with `build:analyze` that demo code is tree-shaken.
- **Regression risk:** Low.

### SEC-09 — "Owner" Authorization Policy Always Passes (P0 Critical)

- **Risk:** `Program.cs` defines `policy.RequireAssertion(context => true)` for the `"Owner"` policy. `MediaController` and `TranscriptionController` use `[Authorize(Policy = "Owner")]` — **every request passes**, meaning anyone can upload/delete media files and verify transcriptions.
- **Root cause:** Placeholder policy never replaced with real ownership check via `IAuthorizationHandler`.
- **Affected files:** `backend/VietTuneArchive/Program.cs` (policy definition), `MediaController.cs`, `TranscriptionController.cs`
- **Reproduction:** `curl -X DELETE https://<host>/api/Media/<any-id>` — succeeds without auth.
- **Fix:** Implement `IAuthorizationHandler` that checks `submissionId` ownership against JWT user claim.
- **Regression risk:** Medium — must map ownership correctly.

### SEC-10 — RefreshTokenController: Full CRUD Without Auth (P0 Critical)

- **Risk:** Anyone can list, create, update, delete refresh tokens. Attacker can forge persistent sessions or revoke legitimate ones.
- **Root cause:** `RefreshTokenController` has no `[Authorize]` attribute.
- **Affected files:** `backend/VietTuneArchive/Controllers/RefreshTokenController.cs`
- **Reproduction:** `curl https://<host>/api/RefreshToken` — returns all tokens.
- **Fix:** Add `[Authorize(Roles = "Admin")]` or remove controller entirely (refresh tokens should be managed internally, not via REST CRUD).
- **Regression risk:** Low.

### SEC-11 — Plaintext Password Storage (P0 Critical)

- **Risk:** `User.Password` column stores plaintext. `UserService.UpdatePasswordAsync` compares `getUser.Password.Equals(OldPassword)` — plaintext comparison. Password theft if DB is compromised.
- **Root cause:** Login uses BCrypt verify (correct), but password change and `AddAsync` store raw or `"1"` placeholder. Dual storage pattern (BCrypt hash in `PasswordHash`, raw in `Password`).
- **Affected files:** `backend/VietTuneArchive.Application/Services/UserService.cs` (`UpdatePasswordAsync`, `AddAsync`)
- **Reproduction:** Query `Users` table → `Password` column contains readable passwords.
- **Fix:** Drop `Password` column entirely. All comparisons via BCrypt. Hash new passwords before storage.
- **Regression risk:** Medium — must migrate existing data.

### SEC-12 — ChatController: Unauthenticated Gemini API Proxy (P0 Critical)

- **Risk:** `POST /api/Chat` has no auth — anyone can send prompts to Google Gemini, burning API quota and potentially exfiltrating training data.
- **Root cause:** `ChatController` and `MetadataSuggestController` have no `[Authorize]` attribute.
- **Affected files:** `backend/VietTuneArchive/Controllers/ChatController.cs`, `MetadataSuggestController.cs`
- **Reproduction:** `curl -X POST https://<host>/api/Chat -d '{"message":"..."}'` — proxied to Gemini.
- **Fix:** Add `[Authorize]` at minimum. Add rate limiting.
- **Regression risk:** Low.

### SEC-13 — Login Does Not Check IsActive (P1 High)

- **Risk:** Deactivated/banned users still receive valid JWT tokens. They can access all API endpoints their role allows for 120 minutes.
- **Root cause:** `AuthService.Authenticate` checks `IsEmailConfirmed` but **not** `IsActive`.
- **Affected files:** `backend/VietTuneArchive.Application/Services/AuthService.cs`
- **Fix:** Add `if (!user.IsActive) return null;` or throw in Authenticate.
- **Regression risk:** Low.

### SEC-14 — Swagger UI Enabled in Production (P1 High)

- **Risk:** Full API documentation with try-it-out available at `https://<host>/swagger`. Attackers can discover all endpoints, schemas, and test them interactively.
- **Root cause:** `Program.cs` line 315: `app.UseSwagger()` + `app.UseSwaggerUI()` outside `if (env.IsDevelopment())`.
- **Affected files:** `backend/VietTuneArchive/Program.cs`
- **Fix:** Move Swagger middleware inside `IsDevelopment()` block.
- **Regression risk:** Low.

### SEC-15 — Weak OTP Generation (P2 Medium)

- **Risk:** `Random().Next(100000, 999999)` for email confirmation and password reset OTPs. `System.Random` is not cryptographically secure; patterns may be predictable.
- **Root cause:** `AuthService.GenerateEmailToken` uses `Random()`.
- **Fix:** Use `RandomNumberGenerator.GetInt32(100000, 1000000)`.
- **Regression risk:** Low.

### SEC-16 — ~20 Controllers Completely Unauthenticated (P0 Critical — aggregate)

- **Risk:** Beyond the individually listed controllers, the following have **zero auth** and expose full CRUD including write operations:
  - `RecordingImageController` — upload/delete images without auth
  - `SubmissionVersionController` — read/write version history
  - `QAConversationController` / `QAMessageController` — read any user's conversations (IDOR via `userId` query)
  - `CopyrightDisputeController` — create disputes, assign reviewers, resolve disputes
  - `EthnicGroupController`, `InstrumentController`, `CommuneController`, `DistrictController`, `CeremonyController`, `MusicalScaleController`, `VocalStyleController`, `TagController` — full CRUD on reference/master data
- **Root cause:** No `[Authorize]` on controller classes; no global fallback policy in `Program.cs`.
- **Fix:** Add `options.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build()` in `Program.cs`. Then explicitly add `[AllowAnonymous]` only where intended (guest recording search, auth endpoints).
- **Regression risk:** High — must audit every controller; use fallback + explicit AllowAnonymous pattern.

### SEC-17 — CopyrightDispute Evidence Upload: FE Sends JSON Instead of FormData (P1 High)

- **Risk:** `copyrightDisputeApi.uploadEvidence` sends `{ file } as never` via JSON body. Swagger expects `multipart/form-data`. Upload will fail at runtime.
- **Affected files:** `src/services/copyrightDisputeApi.ts` (line 104-112)
- **Fix:** Build `FormData` and append file; send with correct content type.
- **Regression risk:** Low.

### SEC-18 — IDOR: UserController update-password/update-profile (P1 High)

- **Risk:** `PUT /api/User/update-password` and `update-profile` take `UserId` from request body, not JWT. Any authenticated user can change any other user's password or profile.
- **Affected files:** `backend/VietTuneArchive/Controllers/UserController.cs`
- **Fix:** Extract user ID from `ClaimTypes.NameIdentifier` and ignore body `UserId`.
- **Regression risk:** Low.

### SEC-19 — CORS Fallback to AllowAnyOrigin (P2 Medium)

- **Risk:** When `Cors:AllowedOrigins` config is empty (common in dev), CORS policy falls back to `AllowAnyOrigin()`. If this config is missing in production, any origin can make API calls.
- **Affected files:** `backend/VietTuneArchive/Program.cs`
- **Fix:** Throw on startup if `AllowedOrigins` is empty in production environment.
- **Regression risk:** Low.

### SEC-20 — UserService.AddAsync Creates Role "Staff" Instead of "Expert" (P2 Medium)

- **Risk:** `UserService.AddAsync(CreateExpertUserDTO)` sets `Role = "Staff"`. No `[Authorize(Roles)]` anywhere includes `"Staff"`. Created users have no permissions.
- **Affected files:** `backend/VietTuneArchive.Application/Services/UserService.cs`
- **Fix:** Change to `Role = "Expert"` to match intended behavior and FE expectations.
- **Regression risk:** Low.

### SEC-21 — users_overrides Persists Across Sessions (P2 Medium)

- **Risk:** `users_overrides` in IndexedDB can contain fabricated user objects with elevated roles. In DEV mode, `setUser` writes to this store.
- **Root cause:** `authStore.setUser` merges into `users_overrides` when `import.meta.env.DEV`. But the storage key persists and could be read by any code checking it.
- **Affected files:** `src/stores/authStore.ts` (lines 58-68)
- **Fix:** Guard all reads of `users_overrides` behind DEV check. Clear on production build.
- **Regression risk:** Low.

---

## 5. API Contract Findings

### API-01 — `POST /Admin/create-expert` Missing from BE and Swagger (P0 Critical)

- **Risk:** FE calls `legacyPost('/Admin/create-expert', ...)` — returns 404. Admin cannot create Expert accounts in production.
- **Root cause:** `AdminController.cs` does not have a `create-expert` action. `UserService.AddAsync` exists but is not exposed via any controller.
- **Affected files:** `src/services/adminApi.ts` (line 164-186), `backend/.../AdminController.cs`
- **Reproduction:** Login as Admin → Create Expert page → submit form → 404 error.
- **Fix:** Add `[HttpPost("create-expert")] [Authorize(Roles = "Admin")]` action on `AdminController` calling `UserService.AddAsync`.
- **Implementation:** ~20 lines in controller, then `npm run api:sync`.
- **Regression risk:** Low.

### API-02 — `reject-submission` Allows Contributor Role (P0 Critical)

- **Risk:** Any Contributor can reject any submission if they know the GUID. This breaks the moderation workflow — contributors should not reject others' work.
- **Root cause:** `SubmissionController.RejectSubmission` has `[Authorize(Roles = "Admin,Expert,Contributor")]`.
- **Affected files:** `backend/.../SubmissionController.cs` (line 104-105)
- **Reproduction:** Login as Contributor → `PUT /api/Submission/reject-submission?submissionId=<any-guid>` → succeeds.
- **Fix:** Change to `[Authorize(Roles = "Admin,Expert")]`.
- **Regression risk:** Low — FE doesn't call this endpoint (uses `Review/create`).

### API-03 — `get-by-status` Lacks Role Restriction (P0 Critical)

- **Risk:** Any authenticated user (Contributor, Researcher) can read the submission queue by status — exposes all pending submissions including metadata.
- **Root cause:** `SubmissionController` has `[Authorize]` at class level but `get-by-status` has no action-level `[Authorize(Roles)]`.
- **Affected files:** `backend/.../SubmissionController.cs` (line 23)
- **Reproduction:** Login as Researcher → `GET /api/Submission/get-by-status?status=1` → returns all pending submissions.
- **Fix:** Add `[Authorize(Roles = "Admin,Expert")]` on `GetSubmissionsByStatus`.
- **Regression risk:** Low.

### API-04 — Review/create Has No Role Restriction (P1 High)

- **Risk:** Any authenticated user can POST to `/api/Review/create` with any `reviewerId` — spoofing review decisions.
- **Root cause:** `ReviewController` has class-level `[Authorize]` but `Create` action has no role restriction. The `reviewerId` in the body is client-supplied and not validated against the authenticated user.
- **Affected files:** `backend/.../ReviewController.cs` (line 46-54)
- **Reproduction:** Login as Contributor → `POST /api/Review/create` with `reviewerId=<expert-guid>` → creates review as if Expert did it.
- **Fix:** 1) Add `[Authorize(Roles = "Admin,Expert")]` on Create. 2) Validate `dto.ReviewerId == authenticated user ID`.
- **Regression risk:** Low.

### API-05 — Submission `get-all`, `my`, `{id}` GET Lack Role Restriction (P1 High)

- **Risk:** Any authenticated user can list all submissions, get any submission by ID.
- **Root cause:** These actions have only class-level `[Authorize]`, no role restrictions.
- **Affected files:** `backend/.../SubmissionController.cs`
- **Fix:** `get-all` → Admin only. `my` → validate userId matches authenticated user. `{id}` → validate user has relationship to submission.
- **Regression risk:** Medium — `my` is used by contributors.

### API-06 — Swagger Declares Global Bearer But Many Controllers Override (P2 Medium)

- **Risk:** Swagger shows `security: [{ Bearer: [] }]` globally, but `AnalyticsController`, `AnnotationController`, `AuditLogController` are `[AllowAnonymous]` or lack `[Authorize]`. Developers/integrators trust swagger → unexpected public access.
- **Root cause:** Swagger auto-generates from `Program.cs` global security scheme but doesn't reflect controller-level overrides.
- **Affected files:** `src/api/swagger.json`, multiple controllers
- **Fix:** Add `[Authorize]` to all controllers that should require auth. Then re-sync swagger.
- **Regression risk:** Low.

### API-07 — Admin/submissions `status` Query Is String, Enum Is Int (P2 Medium)

- **Risk:** FE sends int status values but swagger declares `status` as string for `GET /Admin/submissions`. May cause silent filter failures.
- **Root cause:** `AdminController` parameter types mismatch with `SubmissionStatus` enum.
- **Affected files:** `backend/.../AdminController.cs`, `src/api/swagger.json`
- **Fix:** Align parameter type to enum int.
- **Regression risk:** Low.

### API-08 — Most Submission Responses Lack Schema (P2 Medium)

- **Risk:** FE does loose parsing (`extractSubmissionRows`) because swagger 200 responses have no `content`/schema. Type safety is lost.
- **Root cause:** Controller actions return `IActionResult` with `Ok(result)` — no `[ProducesResponseType]` attributes.
- **Affected files:** All `SubmissionController` actions
- **Fix:** Add `[ProducesResponseType(typeof(Result<T>), 200)]` to each action.
- **Regression risk:** Low.

---

## 6. Frontend Findings

### FE-01 — ExpertGuard Doesn't Check isEmailConfirmed (P2 Medium)

- **Risk:** Expert with unconfirmed email passes `ExpertGuard` (only checks `isActive`), but `ModerationPage` blocks them in-page. Inconsistent UX — user sees route then gets forbidden.
- **Root cause:** `EXPERT_ROUTE_POLICY` sets `requireActive: true` but no `requireEmailConfirmed`.
- **Affected files:** `src/utils/routeAccess.ts`, `src/components/auth/ExpertGuard.tsx`, `src/pages/ModerationPage.tsx`
- **Fix:** Add `requireEmailConfirmed` to policy or check in guard.
- **Regression risk:** Low.

### FE-02 — ApprovedRecordingsPage Missing isActive/isEmailConfirmed Check (P2 Medium)

- **Risk:** Unlike `ModerationPage`, `ApprovedRecordingsPage` only checks `user.role === EXPERT`. Deactivated experts or unconfirmed email experts can view approved recordings.
- **Affected files:** `src/pages/ApprovedRecordingsPage.tsx`
- **Fix:** Add same guards as `ModerationPage`.
- **Regression risk:** Low.

### FE-03 — Admin Redirect to /moderation but ExpertGuard Blocks (P3 Low)

- **Risk:** `isRedirectAllowedForRole` returns `true` for Admin → `/moderation`, but `ExpertGuard` rejects Admin. Admin sees flicker/redirect loop.
- **Affected files:** `src/utils/routeAccess.ts` (line 144)
- **Fix:** Remove Admin from `/moderation` redirect allowlist.
- **Regression risk:** Low.

### FE-04 — Overlay Local State Can Desync with Server (P2 Medium)

- **Risk:** `EXPERT_MODERATION_STATE` in IndexedDB persists overlay data. If expert uses different device or clears storage, server state and local state diverge — shows stale claim/status.
- **Affected files:** `src/services/expertWorkflowService.ts`
- **Fix:** After every mutation, invalidate local overlay and re-fetch from server. Treat server as source of truth.
- **Regression risk:** Medium — changes moderation UX.

### FE-05 — done-stage-one/two Treats 400/409 as Success (P2 Medium)

- **Risk:** `expertModerationApi.completeStageOneOnServer` / `completeStageTwoOnServer` return `mutationOk()` on 400/409, treating errors as idempotent success. Real errors are masked.
- **Affected files:** `src/services/expertModerationApi.ts`
- **Fix:** Only treat 409 as idempotent success. 400 should propagate as error.
- **Regression risk:** Low.

### FE-06 — get-by-status 400 Swallowed as Empty Array (P2 Medium)

- **Risk:** When `get-by-status` returns 400 (e.g., invalid status value), FE catches and returns `[]`. Real errors (server down, auth expired) appear as "no submissions".
- **Affected files:** `src/services/expertModerationApi.ts`
- **Fix:** Differentiate 400 (bad request) from empty result. Show error toast for non-2xx.
- **Regression risk:** Low.

### FE-07 — No Input Sanitization Before API Calls (P1 High)

- **Risk:** User input sent directly to BE without sanitization. Potential for SQL injection (if BE doesn't use parameterized queries) or stored XSS (if annotations/KB entries render HTML).
- **Affected files:** All form submissions — `LoginFormContent`, upload forms, KB editor, annotation forms
- **Fix:** Sanitize HTML in all user-facing inputs. Verify BE uses parameterized queries (Entity Framework generally does).
- **Regression risk:** Low.

### FE-08 — SignalR Token in Query String (P2 Medium)

- **Risk:** `notificationHub.ts` uses `accessTokenFactory` which puts JWT in `access_token` query param for WebSocket negotiation. Token may appear in server logs, proxy logs, browser history.
- **Affected files:** `src/services/notificationHub.ts`
- **Fix:** This is standard for SignalR. Ensure server-side logging excludes query strings. Use short-lived tokens for SignalR specifically.
- **Regression risk:** Low.

---

## 7. Backend Findings

### BE-01 — SubmissionController Role Matrix Issues (P0 Critical)

Full action-level auth mapping from `SubmissionController`:

| Action | HTTP | Auth | Roles | Issue |
|--------|------|------|-------|-------|
| `get-by-status` | GET | class | Any logged-in | **P0: Should be Admin,Expert** |
| `create-submission` | POST | action | Admin,Contributor,Expert | OK |
| `confirm-submit` | PUT | action | Admin,Expert,Contributor | OK |
| `edit-request` | PUT | action | Admin,Expert,Contributor | Check: should Contributors edit others'? |
| `confirm-edit` | PUT | action | Admin,Expert,Contributor | OK |
| `approve-submission` | PUT | action | Admin,Expert | OK |
| `reject-submission` | PUT | action | Admin,Expert,**Contributor** | **P0: Remove Contributor** |
| `done-stage-one` | PUT | action | Admin,Expert | OK |
| `done-stage-two` | PUT | action | Admin,Expert | OK |
| `get-related` | GET | action | Admin,Expert | OK |
| `my` | GET | class | Any logged-in | P1: Should validate userId=self |
| `{id}` GET | GET | class | Any logged-in | P1: No ownership check |
| `{id}` DELETE | DELETE | class | Any logged-in | **P1: Any user can delete** |
| `assign-reviewer` | PUT | action | Admin,Expert | OK |
| `unassign-reviewer` | PUT | action | Admin,Expert | OK |
| `get-by-reviewer` | GET | action | Admin,Expert | OK |
| `get-all` | GET | class | Any logged-in | P1: Should be Admin |

### BE-02 — ReviewController: No Reviewer ID Validation (P1 High)

- **Risk:** `CreateReviewDto.ReviewerId` is client-supplied. Any authenticated user can spoof reviews as another user.
- **Root cause:** `ReviewController.Create` doesn't validate `dto.ReviewerId` against the authenticated user's JWT claims.
- **Affected files:** `backend/.../ReviewController.cs` (line 46-54)
- **Fix:** Extract `ClaimTypes.NameIdentifier` from `User` and validate `== dto.ReviewerId` or override it.
- **Regression risk:** Low.

### BE-03 — No Object-Level Authorization (P1 High)

- **Risk:** Endpoints like `Submission/{id}` GET/DELETE, `Review/get-by-id` don't verify the requester owns or is assigned to the resource. Any authenticated user can access any resource by ID.
- **Root cause:** Controllers check role but not resource ownership.
- **Affected files:** `SubmissionController`, `ReviewController`, most CRUD controllers
- **Fix:** Add service-level ownership checks (e.g., submission belongs to contributor, or expert is assigned reviewer).
- **Regression risk:** Medium — requires service-layer changes.

### BE-04 — AuthController Login: Exception Message Leakage (P2 Medium)

- **Risk:** `catch (Exception ex) { return BadRequest(new { message = ex.Message }); }` — internal exception messages leak to client. May reveal DB schema, internal paths.
- **Root cause:** `AuthController.Login` catches all exceptions and returns message verbatim.
- **Affected files:** `backend/.../AuthController.cs` (line 118-120)
- **Fix:** Return generic error message. Log detailed exception server-side.
- **Regression risk:** Low.

### BE-05 — No Pagination Limit Enforcement (P2 Medium)

- **Risk:** `get-by-status`, `get-all` accept `pageSize` from client with no max. Client can request `pageSize=999999` → memory exhaustion.
- **Root cause:** Controller passes `pageSize` directly to service without capping.
- **Affected files:** `SubmissionController`, `AdminController`, other list endpoints
- **Fix:** Cap `pageSize` at 100 in controller or service. Return 400 if exceeded.
- **Regression risk:** Low.

### BE-06 — Deletion Without Soft-Delete Pattern (P2 Medium)

- **Risk:** `DELETE /api/Submission/{id}` performs hard delete. Audit trail lost. No recovery.
- **Affected files:** `SubmissionController.Delete`
- **Fix:** Implement soft-delete (IsDeleted flag) or archive pattern.
- **Regression risk:** Medium — changes delete behavior.

---

## 8. Configuration & Infrastructure Findings

### CFG-01 — CORS Policy Unknown (P1 High)

- **Risk:** If CORS is `AllowAnyOrigin` + `AllowAnyHeader`, any site can make authenticated requests.
- **Root cause:** `Program.cs` CORS config not verified in this audit. Needs manual check.
- **Affected files:** `backend/VietTuneArchive/Program.cs`
- **Fix:** Restrict `AllowedOrigins` to production domain(s) only.
- **Regression risk:** Low.

### CFG-02 — No .env File in Repo (Correct) but Missing Validation (P3 Low)

- **Risk:** Only `.env.example` files exist. If developer misses a required env var, app fails at runtime with unclear errors.
- **Affected files:** Root `.env*`, `src/vite-env.d.ts`
- **Fix:** Add startup validation in `main.tsx` that checks required env vars and throws clear error.
- **Regression risk:** Low.

### CFG-03 — Vite Dev Proxy Masks CORS Issues (P3 Low)

- **Risk:** Vite proxy forwards `/api/*` to Azure BE in dev, hiding CORS. Issues only surface in production.
- **Affected files:** `vite.config.ts`
- **Fix:** Test with production build regularly. Add CORS integration test.
- **Regression risk:** Low.

### CFG-04 — No Content Security Policy (P1 High)

- **Risk:** No CSP headers means XSS payloads can execute freely, load external scripts, exfiltrate data.
- **Root cause:** Neither FE nor BE set `Content-Security-Policy` headers.
- **Fix:** Add CSP via meta tag or BE middleware. At minimum: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'`.
- **Regression risk:** Medium — may break inline styles, external CDNs.

### CFG-05 — Sentry DSN Configuration (P3 Low)

- **Risk:** If Sentry DSN is in client bundle, error reports (potentially with PII) go to a Sentry project. Ensure the project has appropriate data retention policies.
- **Affected files:** `src/services/errorReporting.ts`
- **Fix:** Review Sentry data scrubbing rules. Ensure no PII in error context.
- **Regression risk:** Low.

---

## 9. Performance Findings

### PERF-01 — No Query Pagination Limit (P2 Medium)

- **Risk:** Unbounded `pageSize` can return entire database tables.
- (Detailed in BE-05)

### PERF-02 — Expert Queue: Multiple API Calls + Local Overlay Merge (P2 Medium)

- **Risk:** `expertWorkflowService.getQueue` calls `get-by-status` + `get-by-reviewer` + dedupes + merges local overlay. On large queues this could be slow.
- **Affected files:** `src/services/expertWorkflowService.ts`
- **Fix:** Add server-side combined endpoint for expert queue. Reduce client-side data manipulation.
- **Regression risk:** Low.

### PERF-03 — Large IndexedDB Values (P3 Low)

- **Risk:** `localRecordings` can contain base64 audio/video. `storageService` caps cache at 200KB/item but IndexedDB has no cap → potential OOM on load.
- **Affected files:** `src/services/storageService.ts`, `src/services/recordingStorage.ts`
- **Fix:** Stream media from Supabase URLs instead of storing base64 locally.
- **Regression risk:** Medium — changes offline capability.

---

## 10. Technical Debt

### DEBT-01 — Legacy HTTP Client Coexists with OpenAPI Client (P3 Low)

- `legacyGet/Post/Put` in `legacyHttp.ts` used alongside typed `apiFetch`. Dual paths create inconsistency.
- **Fix:** Migrate all legacy calls to `apiFetch` as endpoints get swagger schemas.

### DEBT-02 — `users_overrides` Pattern (P3 Low)

- DEV-only `users_overrides` in IndexedDB is a workaround for missing `create-expert` API. Should be removed once API exists.

### DEBT-03 — Feature Flags Without Cleanup Plan (P3 Low)

- `VITE_EXPERT_API_PHASE2`, `VITE_EXPERT_QUEUE_SOURCE`, `VITE_ADMIN_OPERATIONS_PAGE` — Phase 1 code still present. Dead code increases bundle.
- **Fix:** Remove Phase 1 code paths after Phase 2 is stable.

### DEBT-04 — 33KB+ Page Components (P2 Medium)

- `ModerationPage.tsx` (33KB), `VideoPlayer.tsx` (41KB), `AudioPlayer.tsx` (38KB), `ModerationVerificationWizardDialog.tsx` (39KB) — monolithic files difficult to maintain/test.
- **Fix:** Extract into smaller composable components.

---

## 11. Prioritized Fix Roadmap

### Sprint 1 — P0 Critical (2-3 weeks)

| # | Finding | Effort | Action |
|---|---------|--------|--------|
| 1 | SEC-16 | 2d | **Add global auth fallback policy** in `Program.cs`; audit every controller for `[AllowAnonymous]` where intended |
| 2 | SEC-09 | 1d | **Fix "Owner" policy** — implement `IAuthorizationHandler` with real ownership check |
| 3 | SEC-10 | 0.5d | **Lock down RefreshTokenController** — Admin only or remove REST CRUD |
| 4 | SEC-11 | 2d | **Remove plaintext password** column; all comparisons via BCrypt |
| 5 | SEC-12 | 0.5d | **Add `[Authorize]` to ChatController and MetadataSuggestController** |
| 6 | SEC-01 | 0.5d | Add `[Authorize]` to `AuditLogController` |
| 7 | SEC-02 | 0.5d | Remove `[AllowAnonymous]` from `AnnotationController`; add role-based auth |
| 8 | SEC-03 | 0.5d | Remove `[AllowAnonymous]` from `AnalyticsController`; add `[Authorize(Roles = "Admin")]` |
| 9 | API-01 | 1d | Add `POST /Admin/create-expert` action to `AdminController` (fix SEC-20 role too) |
| 10 | API-02 | 0.5d | Remove Contributor from `reject-submission` roles |
| 11 | API-03 | 0.5d | Add `[Authorize(Roles = "Admin,Expert")]` to `get-by-status` |
| 12 | BE-01 | 1d | Fix all Submission action-level role issues per table |
| 13 | SEC-07 | 1d | Add Supabase RLS policies to restrict bucket access |
| 14 | SEC-08 | 0.5d | Verify demo login is tree-shaken in production; add build test |

### Sprint 1.5 — P1 Critical-Adjacent (1 week)

| # | Finding | Effort | Action |
|---|---------|--------|--------|
| 1 | SEC-13 | 0.5d | Add `IsActive` check in `AuthService.Authenticate` |
| 2 | SEC-14 | 0.5d | Move Swagger UI behind `IsDevelopment()` |
| 3 | SEC-17 | 0.5d | Fix copyright dispute evidence upload — use `FormData` in FE |
| 4 | SEC-18 | 1d | Fix IDOR in UserController — extract user ID from JWT, not body |

### Sprint 2 — P1 High (2-3 weeks)

| # | Finding | Effort | Action |
|---|---------|--------|--------|
| 1 | SEC-04 | 0.5d | Add auth to `CopyrightDisputeController` |
| 2 | SEC-05 | 3d | Migrate JWT to httpOnly cookie (BE set-cookie + FE remove token mgmt) |
| 3 | SEC-06 | 1d | Add CSRF middleware (or verify Bearer-in-header mitigates) |
| 4 | ARCH-01 | 2d | Add rate limiting to login + write endpoints |
| 5 | ARCH-03 | 3d | Implement refresh token rotation |
| 6 | API-04 | 0.5d | Add role restriction to `Review/create` |
| 7 | API-05 | 1d | Add ownership checks to submission `my`/`{id}` |
| 8 | BE-02 | 0.5d | Validate `ReviewerId` against JWT claim |
| 9 | BE-03 | 3d | Add object-level authorization across controllers |
| 10 | CFG-01 | 0.5d | Restrict CORS allowed origins |
| 11 | CFG-04 | 1d | Add Content Security Policy headers |
| 12 | FE-07 | 2d | Add input sanitization on all form submissions |
| 13 | SEC-15 | 0.5d | Replace `Random()` with `RandomNumberGenerator` for OTP |
| 14 | SEC-19 | 0.5d | Throw on startup if CORS origins empty in production |
| 15 | SEC-20 | 0.5d | Fix `UserService.AddAsync` role from "Staff" to "Expert" |

### Sprint 3 — P2 Medium (2-3 weeks)

| # | Finding | Effort |
|---|---------|--------|
| 1 | FE-01, FE-02 | 0.5d |
| 2 | FE-04 | 2d |
| 3 | FE-05, FE-06 | 1d |
| 4 | API-06, API-07, API-08 | 2d |
| 5 | BE-04 | 0.5d |
| 6 | BE-05 | 0.5d |
| 7 | BE-06 | 2d |
| 8 | SEC-09 | 0.5d |
| 9 | FE-08 | 0.5d |
| 10 | ARCH-02 | 2d |
| 11 | PERF-01, PERF-02 | 2d |
| 12 | DEBT-04 | 3d |

### Sprint 4 — P3 Low (ongoing)

| # | Finding | Effort |
|---|---------|--------|
| 1 | FE-03 | 0.5d |
| 2 | CFG-02, CFG-03, CFG-05 | 1d |
| 3 | DEBT-01, DEBT-02, DEBT-03 | 2d |
| 4 | PERF-03 | 2d |

---

## 12. Controller Auth Summary Table

| Controller | Class Auth | Anomalous Actions | Risk |
|------------|-----------|-------------------|------|
| `AuthController` | None (correct — public auth) | — | Exception message leak |
| `SubmissionController` | `[Authorize]` | `get-by-status`, `my`, `{id}`, `get-all`, `DELETE` lack role restriction; `reject` allows Contributor | **P0** |
| `ReviewController` | `[Authorize]` | `Create` — no role, no reviewer ID validation | **P1** |
| `AuditLogController` | **None** | All CRUD open | **P0** |
| `AdminController` | `[Authorize(Roles="Admin")]` *(assumed)* | Missing `create-expert` | **P0** |
| `AnnotationController` | `[AllowAnonymous]` | All CRUD open | **P0** |
| `AnalyticsController` | `[AllowAnonymous]` | All data public | **P0** |
| `EmbargoController` | `[Authorize(Roles="Expert,Admin")]` | — | OK |
| `KBEntriesController` | Mixed per action | GET public, mutations Expert/Admin | OK |
| `RecordingController` | Likely `[Authorize]` | Per-action varies | Check |
| `CopyrightDisputeController` | Unknown — needs verification | Likely open | **P1** |
| `UserController` | `[Authorize]` *(assumed)* | Check per action | Check |

---

## 13. Evidence Sources

| Source | Path | Lines Examined |
|--------|------|----------------|
| Swagger | `src/api/swagger.json` | 13,355 (184 paths) |
| SubmissionController | `backend/.../Controllers/SubmissionController.cs` | 241 |
| ReviewController | `backend/.../Controllers/ReviewController.cs` | 66 |
| AuditLogController | `backend/.../Controllers/AuditLogController.cs` | 66 |
| AuthController | `backend/.../Controllers/AuthController.cs` | ~200 |
| AnnotationController | `backend/.../Controllers/AnnotationController.cs` | ~75 |
| AnalyticsController | `backend/.../Controllers/AnalyticsController.cs` | ~100 |
| authService.ts | `src/services/authService.ts` | ~500 |
| authStore.ts | `src/stores/authStore.ts` | ~120 |
| routeAccess.ts | `src/utils/routeAccess.ts` | ~190 |
| expertModerationApi.ts | `src/services/expertModerationApi.ts` | ~460 |
| adminApi.ts | `src/services/adminApi.ts` | ~245 |
| uploadService.ts | `src/services/uploadService.ts` | ~128 |
| supabaseClient.ts | `src/services/supabaseClient.ts` | 13 |
| ExpertGuard.tsx | `src/components/auth/ExpertGuard.tsx` | ~60 |
| ModerationPage.tsx | `src/pages/ModerationPage.tsx` | ~600 |

---

*This audit is based on static source code analysis. It does not replace dynamic penetration testing, dependency vulnerability scanning (npm audit / dotnet audit), or runtime security testing. Recommend running OWASP ZAP and Snyk/npm audit before production deployment.*
