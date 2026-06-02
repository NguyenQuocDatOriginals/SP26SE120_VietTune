# PLAN: FE Auth Flow Stabilization

> Tham chiếu: `docs/AUDIT-auth-register-login.md`
> Scope: **Frontend only** — không sửa backend, không sửa swagger, không tự tạo endpoint.
> Nguyên tắc: Bám sát 7 path Auth trong `swagger.json`; dọn legacy; không phá visual style hiện tại.

---

## 1. Executive Summary

Frontend auth flow của VietTune có **7 vấn đề cần sửa** (A5–A8, A14–A16, A17 ghi nhận) và **4 endpoint legacy** cần dọn. Plan chia 6 phase:

0. Contract guard & type cleanup
1. Login correctness (email-only, preserve BE error, OTP modal)
2. Confirm account + resend OTP wiring
3. Forgot → Reset password completion
4. Legacy endpoint cleanup (profile/password chuyển User API)
5. Tests

Mỗi phase có acceptance criteria rõ ràng, file targets, risk, và có thể deploy độc lập.

---

## 2. Current Contract Map

### 2.1 Endpoints FE đang gọi vs Swagger đúng

| # | FE hiện tại | Swagger đúng | Trạng thái |
|---|-------------|-------------|------------|
| 1 | `POST /api/Auth/login` (JSON) | `POST /api/Auth/login` (JSON `LoginModel`) | **OK** |
| 2 | `POST /api/Auth/register-contributor` (JSON) | `POST /api/Auth/register-contributor` (JSON `RegisterModel`) | **OK** |
| 3 | `POST /api/Auth/register-researcher` (JSON) | `POST /api/Auth/register-researcher` (JSON `RegisterModel`) | **OK** |
| 4 | `PUT /api/Auth/confirm-email` (query `token`) | `PUT /api/Auth/confirm-email` (query `token`) | **OK** |
| 5 | `PUT /api/Auth/forgot-password` (FormData `Email`) | `PUT /api/Auth/forgot-password` (form `Email`) | **OK** |
| 6 | **Không có** | `PUT /api/Auth/resend-confirmation-email` (form `email`) | **THIẾU** (A7) |
| 7 | **Không có** | `PUT /api/Auth/reset-password` (form `Email`/`OTP`/`NewPassword`) | **THIẾU** (A14) |
| 8 | `GET /auth/me` | **Không tồn tại** | **LEGACY** (A8) |
| 9 | `PUT /auth/profile` | `PUT /api/User/update-profile` (`UpdateInfoDTO`) | **LEGACY** (A8) |
| 10 | `POST /auth/verify-otp` | **Không tồn tại** | **LEGACY** (A12) |
| 11 | `POST /auth/change-password` | `PUT /api/User/update-password` (`UpdatePasswordDTO`) | **LEGACY** (A8) |

### 2.2 FE type adapters (`src/api/adapters.ts`)

| Type | Có | Ghi chú |
|------|:--:|---------|
| `ApiAuthLoginModel` | ✅ | |
| `ApiAuthRegisterModel` | ✅ | |
| `ApiAuthConfirmEmailQuery` | ✅ | |
| `ApiAuthForgotPasswordModel` | ✅ | |
| `ApiAuthResetPasswordModel` | ✅ | Đã export nhưng chưa dùng |
| Resend confirmation adapter | ❌ | Cần thêm hoặc dùng inline FormData |

---

## 3. Findings

### A5 — Login hard-code `isEmailConfirmed: true`

- **File:** `src/services/authService.ts:57`
- **Hiện trạng:** `isEmailConfirmed: true` hard-code vì BE login response không trả `isEmailConfirmed`.
- **Hướng xử lý:** Giữ `true` vì nếu user login được = BE đã xác nhận email (BE throw nếu chưa confirm). Thêm comment giải thích limitation. Nếu BE bổ sung field trong response, sửa map.
- **Risk:** Thấp — hành vi đúng với BE hiện tại; chỉ lệch nếu BE đổi rule.

### A6 — UI login bằng SĐT nhưng BE chỉ email

- **File:** `src/components/auth/LoginFormContent.tsx:168-184`
- **Hiện trạng:** Placeholder "Email hoặc số điện thoại"; validation cho phép 10-11 số; BE chỉ `GetByEmailAsync`.
- **Quyết định:** **Hướng A — FE chỉ cho login email.**
  - Sửa placeholder, label, validation.
  - Không cần đổi BE.
  - Nếu BE hỗ trợ phone login sau → mở lại.
- **Risk:** Thấp — đổi copy/validation, không đổi logic.

### A7 — Resend confirmation chưa wire API

- **File:** `src/pages/auth/ConfirmAccountPage.tsx:171-179`
- **Hiện trạng:** Sau countdown, hiển thị "Đăng ký lại" → `navigate('/register')`. Không gọi `PUT /api/Auth/resend-confirmation-email`.
- **Hướng xử lý:**
  1. Thêm `authService.resendConfirmationEmail(email)` — `PUT`, `FormData` field `email` (chữ thường).
  2. `ConfirmAccountPage`: lấy email từ `location.state.email`; nếu thiếu → hiển thị input email fallback.
  3. Nút "Gửi lại OTP" thay vì "Đăng ký lại".
  4. Cooldown 60s (server-side không rate-limit nhưng FE nên throttle UX).
  5. Loading + toast success/error.
- **Risk:** Trung bình — phụ thuộc `email` có sẵn; cần fallback.

### A8 — Legacy endpoints

| FE method | Legacy path | Thay thế swagger | Thuộc scope phase |
|-----------|-------------|------------------|-------------------|
| `getCurrentUser` | `GET /auth/me` | Hydrate từ storage hoặc `GET /api/User/GetById?id=` | Phase 4 |
| `updateProfile` | `PUT /auth/profile` | `PUT /api/User/update-profile` (`UpdateInfoDTO`) | Phase 4 |
| `processPendingProfileUpdates` | `PUT /auth/profile` | `PUT /api/User/update-profile` | Phase 4 |
| `verifyOtp` | `POST /auth/verify-otp` | **Xóa** — FE đã có `confirmEmail` | Phase 4 |
| `changePassword` | `POST /auth/change-password` | `PUT /api/User/update-password` (`UpdatePasswordDTO`) | Phase 4 |

- **Risk:** Trung bình — `ProfilePage`, `authStore.fetchCurrentUser`, `processPendingProfileUpdates` phụ thuộc legacy. Cần cập nhật caller.

### A14 — Thiếu reset password FE

- **File:** Không tồn tại — cần tạo hoặc mở rộng `ForgotPasswordPage`.
- **Hiện trạng:** `ForgotPasswordPage` gửi email → toast → redirect `/login`. Không có bước nhập OTP + NewPassword.
- **Quyết định:** **Mở rộng `ForgotPasswordPage` thành 2-step wizard** (không tạo route mới).
  - Step 1: Nhập email → gọi `forgot-password` → chuyển step 2.
  - Step 2: Nhập OTP + NewPassword + ConfirmPassword → gọi `reset-password` → toast success → navigate `/login`.
  - Lý do chọn multi-step thay route mới: giữ email context trong state, không cần truyền qua URL/location.state. Đơn giản hơn cho user (1 page flow).
- **Cần thêm:** `authService.resetPassword(email, otp, newPassword)` — `PUT /api/Auth/reset-password`, `FormData` fields `Email`/`OTP`/`NewPassword`.
- **Risk:** Trung bình — cần test FormData PascalCase; BE yêu cầu `IsActive` nên user chưa confirm sẽ không nhận OTP (xem A16).

### A15 — Login ghi đè message BE → OTP modal không hoạt động

- **File:** `src/services/authService.ts:72-80`
- **Hiện trạng:**
  ```typescript
  if (status === 400 || status === 401) {
    const err = new Error('Invalid credentials');
    err.response = { status, data: { message: 'Sai tài khoản hoặc mật khẩu' } };
    throw err;
  }
  ```
  Ghi đè **mọi** 400/401 → `LoginFormContent` nhận message cố định → `.includes('xác nhận email')` luôn false → OTP modal **không bao giờ mở**.
- **Hướng xử lý:**
  1. `authService.login`: giữ `401` → message generic (chống user enumeration).
  2. `400`: **preserve message từ BE** nếu có `response.data.message`. Đây là case email chưa confirm (BE throw → 400 + "Vui lòng xác nhận email trước khi đăng nhập.").
  3. `LoginFormContent`: logic `.includes('xác nhận email')` đã đúng — chỉ cần sửa service không ghi đè.
  4. Fallback: nếu 400 không có message → message generic.
- **Risk:** Cao — đây là bug production. Sửa cẩn thận để không lộ user enumeration qua 400 vs 401 (BE đã xử lý đúng: 401 cho sai credential, 400 cho exception).

### A16 — Forgot/reset yêu cầu `IsActive`

- **Không sửa logic BE** — FE chỉ xử lý copy/UX.
- **Hướng xử lý:**
  1. `ForgotPasswordPage` thêm note: "Nếu bạn chưa xác nhận email, vui lòng [xác nhận tài khoản](/confirm-account) trước."
  2. Link → `/confirm-account` (cần email → ForgotPasswordPage có thể pass qua state).
- **Risk:** Thấp — chỉ đổi copy.

### A17 — Swagger response thiếu schema

- **Không fix bằng FE.**
- **Ghi nhận risk:**
  - `authService.login` dùng `apiFetchLoose` + local `LoginResponse` interface → loose typing.
  - `register` trả `Result<AuthDTO>` nhưng không có type → `unknown`.
  - **Đề xuất BE:** Bổ sung response schema cho tất cả Auth endpoints.
- **FE workaround hiện tại:** Chấp nhận. Thêm local response types tạm có comment `// TODO: replace with generated type when BE adds response schema`.

---

## 4. Proposed Target UX Flow

### 4.1 Register → Confirm Account

```
RegisterPage
  ├─ Chọn Contributor / Researcher
  ├─ Nhập fullName, phoneNumber, email, password, confirmPassword
  ├─ Submit → POST /api/Auth/register-{role}
  ├─ Success → toast + navigate('/confirm-account', { state: { email } })
  └─ Error → toast lỗi

ConfirmAccountPage
  ├─ Hiển thị email (từ location.state)
  ├─ Nhập OTP 6 số → PUT /api/Auth/confirm-email?token=
  ├─ Success → toast + navigate('/login')
  ├─ Resend OTP (sau cooldown 60s):
  │   ├─ Nếu có email → PUT /api/Auth/resend-confirmation-email (form: email)
  │   └─ Nếu không có email → hiển thị input email, sau đó gọi resend
  └─ Error → toast + inline error
```

### 4.2 Login success

```
LoginPage / LoginModal
  ├─ Nhập email + password (email-only, không SĐT)
  ├─ Submit → POST /api/Auth/login
  ├─ 200 → setUser + resolvePostLoginPath → navigate
  └─ Error:
      ├─ 401 → toast "Sai tài khoản hoặc mật khẩu"
      ├─ 400 + "xác nhận email" → mở OTP modal (xem 4.3)
      └─ 400 khác → toast message từ BE
```

### 4.3 Login khi chưa confirm → OTP modal

```
LoginFormContent (OTP overlay)
  ├─ Hiển thị form OTP 6 số
  ├─ Submit → PUT /api/Auth/confirm-email?token=
  ├─ Success → đóng modal → tự runLogin lại
  └─ Error → toast lỗi

(Hiện tại logic này ĐÃ CÓ trong LoginFormContent, chỉ bị chặn bởi A15)
```

### 4.4 Resend OTP (trên ConfirmAccountPage)

```
ConfirmAccountPage
  ├─ Sau cooldown 60s → nút "Gửi lại mã OTP"
  ├─ Click → PUT /api/Auth/resend-confirmation-email (FormData: email)
  ├─ Success → toast + reset cooldown
  └─ Error → toast
```

### 4.5 Forgot → Reset Password

```
ForgotPasswordPage (2-step)
  ├─ Step 1: Nhập email
  │   ├─ Submit → PUT /api/Auth/forgot-password (FormData: Email)
  │   ├─ Success → chuyển Step 2
  │   └─ Note: "Chưa xác nhận email? Xác nhận tài khoản trước."
  │
  └─ Step 2: Nhập OTP + NewPassword + ConfirmPassword
      ├─ Submit → PUT /api/Auth/reset-password (FormData: Email, OTP, NewPassword)
      ├─ Success → toast + navigate('/login')
      └─ Error → toast (OTP sai/hết hạn)
```

### 4.6 Logout / expired token

```
Logout → authService.logout() → clear storage → navigate /login
Token expired → clearExpiredCredentialsIfNeeded() on mount (AuthContext)
                → set user null → guards redirect to /login
```

---

## 5. Target File Changes

| # | File | Vai trò hiện tại | Thay đổi đề xuất | Risk | Phase |
|---|------|------------------|-------------------|------|-------|
| 1 | `src/services/authService.ts` | Auth API calls + storage | Sửa login error handling (A15); thêm `resendConfirmationEmail` (A7); thêm `resetPassword` (A14); dọn legacy methods (A8) | **Cao** | 0–4 |
| 2 | `src/components/auth/LoginFormContent.tsx` | Login form + OTP overlay | Sửa email-only validation (A6); giữ OTP modal logic (A15 fix ở service) | **Trung bình** | 1 |
| 3 | `src/pages/auth/ConfirmAccountPage.tsx` | OTP confirm | Wire resend API (A7); email fallback input; sửa nút từ "Đăng ký lại" → "Gửi lại OTP" | **Trung bình** | 2 |
| 4 | `src/pages/auth/ForgotPasswordPage.tsx` | Forgot email only | Mở rộng 2-step: forgot + reset (A14); copy A16 | **Trung bình** | 3 |
| 5 | `src/api/adapters.ts` | Type exports | Thêm adapter resend nếu cần (hoặc inline FormData) | **Thấp** | 0 |
| 6 | `src/stores/authStore.ts` | Zustand auth state | Sửa `fetchCurrentUser` → không gọi `/auth/me` (A8) | **Trung bình** | 4 |
| 7 | `src/contexts/AuthContext.tsx` | Auth provider | Không đổi logic, chỉ verify hoạt động sau sửa store | **Thấp** | 4 |
| 8 | `src/pages/ProfilePage.tsx` | Profile update | Chuyển `authService.updateProfile` → `PUT /api/User/update-profile` (A8) | **Trung bình** | 4 |
| 9 | `src/pages/auth/LoginPage.tsx` | Login page wrapper | Không đổi (dùng LoginFormContent) | **N/A** | — |
| 10 | `src/components/auth/LoginModal.tsx` | Modal login | Không đổi (dùng LoginFormContent) | **N/A** | — |
| 11 | `src/utils/routeAccess.ts` | Guards + redirect | Không đổi | **N/A** | — |
| 12 | `src/utils/jwtExpiry.ts` | JWT decode + expiry | Không đổi | **N/A** | — |
| 13 | `src/App.tsx` | Routes | Không thêm route mới (2-step wizard trong ForgotPasswordPage) | **N/A** | — |
| 14 | `src/stores/authStore.test.ts` | Unit tests | Cập nhật mock cho sửa đổi Phase 4 | **Thấp** | 5 |
| 15 | `src/utils/routeAccess.test.ts` | Unit tests | Không đổi (guard logic giữ nguyên) | **N/A** | — |

### Các file KHÔNG tồn tại

| File | Ghi chú |
|------|---------|
| `src/services/userService.ts` | Không tồn tại. Profile API đang nằm trong `authService`. Phase 4 có thể tạo hoặc inline. |
| `src/routes/*` | Không có thư mục riêng — routing nằm trong `App.tsx`. |

---

## 6. Implementation Phases

### Phase 0 — Contract guard & type cleanup

**Mục tiêu:** Chuẩn bị types, helper mới; không đổi UI.

| Task | File | Chi tiết |
|------|------|----------|
| 0.1 | `src/api/adapters.ts` | Thêm `ApiAuthResendConfirmModel` type (hoặc quyết định dùng inline FormData vì swagger là `multipart/form-data` field `email`) |
| 0.2 | `src/services/authService.ts` | Thêm `resendConfirmationEmail(email: string)` — `PUT /api/Auth/resend-confirmation-email`, FormData field `email` |
| 0.3 | `src/services/authService.ts` | Thêm `resetPassword(email, otp, newPassword)` — `PUT /api/Auth/reset-password`, FormData fields `Email`/`OTP`/`NewPassword` (PascalCase) |
| 0.4 | `src/services/authService.ts` | Thêm comment trên `isEmailConfirmed: true` giải thích A5 limitation |
| 0.5 | `src/services/authService.ts` | Verify `ApiAuthResetPasswordModel` adapter đã export (có) — sẵn sàng nếu muốn dùng typed fetch thay FormData |

**Acceptance:**
- `npx tsc --noEmit` pass.
- Không import mới nào bị unused.
- Không UI change.

---

### Phase 1 — Login correctness

**Mục tiêu:** Login chỉ email; OTP modal hoạt động khi chưa confirm.

| Task | File | Chi tiết |
|------|------|----------|
| 1.1 | `src/services/authService.ts` | **Sửa error handling trong `login`:** 401 → generic message; 400 → preserve `response.data.message` nếu có, fallback generic (A15) |
| 1.2 | `src/components/auth/LoginFormContent.tsx` | **Email-only (A6):** placeholder → "Địa chỉ email"; validation bỏ phone regex; type → `email`; `autoComplete` → `email` |
| 1.3 | `src/components/auth/LoginFormContent.tsx` | Verify OTP modal logic: `.includes('xác nhận email')` đã đúng — test end-to-end sau fix 1.1 |

**Acceptance:**
- Login form: chỉ chấp nhận email, reject SĐT.
- Login user chưa confirm → toast/modal hiện "xác nhận email" (hoặc mở OTP overlay).
- Login sai credential → toast generic, không lộ email tồn tại.
- `npx tsc --noEmit` pass.

---

### Phase 2 — Confirm account + resend OTP

**Mục tiêu:** Wire `resend-confirmation-email`; cải thiện UX confirm.

| Task | File | Chi tiết |
|------|------|----------|
| 2.1 | `src/pages/auth/ConfirmAccountPage.tsx` | **Resend OTP (A7):** Thay "Đăng ký lại" → nút "Gửi lại mã OTP"; gọi `authService.resendConfirmationEmail(pendingEmail)` |
| 2.2 | `src/pages/auth/ConfirmAccountPage.tsx` | **Email fallback:** Nếu `pendingEmail` trống (direct URL access) → hiển thị input email + nút gửi lại |
| 2.3 | `src/pages/auth/ConfirmAccountPage.tsx` | **Cooldown:** Reset về 60s sau mỗi lần gửi thành công; disable nút trong cooldown |
| 2.4 | `src/pages/auth/ConfirmAccountPage.tsx` | **State:** `isResending` loading, toast success/error |

**Acceptance:**
- `/confirm-account` với `location.state.email` → hiển thị email, nút "Gửi lại mã OTP" sau cooldown.
- `/confirm-account` trực tiếp (không state) → hiện input email + nút gửi.
- Gọi API `PUT /api/Auth/resend-confirmation-email` FormData `email` → success toast.
- Cooldown 60s giữa các lần gửi.
- Không phá layout/style hiện tại.

---

### Phase 3 — Forgot/reset password completion

**Mục tiêu:** Hoàn thiện luồng forgot → reset password.

| Task | File | Chi tiết |
|------|------|----------|
| 3.1 | `src/pages/auth/ForgotPasswordPage.tsx` | **2-step wizard (A14):** state `step: 'email' \| 'reset'`; step 1 giữ nguyên UI hiện tại; step 2: form OTP + NewPassword + ConfirmPassword |
| 3.2 | `src/pages/auth/ForgotPasswordPage.tsx` | Step 1 success: `setStep('reset')` + `setEmail(data.email)` thay vì `navigate('/login')` |
| 3.3 | `src/pages/auth/ForgotPasswordPage.tsx` | Step 2 submit: `authService.resetPassword(email, otp, newPassword)` → toast success → `navigate('/login')` |
| 3.4 | `src/pages/auth/ForgotPasswordPage.tsx` | **Copy A16:** Thêm note dưới form step 1: "Nếu bạn chưa xác nhận email, vui lòng xác nhận tài khoản trước." + link `/confirm-account` |
| 3.5 | `src/pages/auth/ForgotPasswordPage.tsx` | Step 2: FE validate NewPassword với `validatePassword()` (giống register) |
| 3.6 | `src/pages/auth/ForgotPasswordPage.tsx` | "Gửi lại mã" link trong step 2 → quay step 1, gọi lại forgot |

**Acceptance:**
- `/forgot-password` → nhập email → success → hiện form OTP + mật khẩu mới.
- Nhập OTP + password mới → gọi `PUT /api/Auth/reset-password` → success → navigate `/login`.
- OTP sai/hết hạn → toast error.
- Copy A16 hiển thị.
- Validation mật khẩu giống register.
- Không thêm route mới (cùng page, 2 step).

---

### Phase 4 — Legacy endpoint cleanup

**Mục tiêu:** Dọn 4 endpoint legacy; chuyển sang User API hoặc xóa.

| Task | File | Chi tiết |
|------|------|----------|
| 4.1 | `src/services/authService.ts` | **Xóa `verifyOtp`** — FE có `confirmEmail` rồi (A12) |
| 4.2 | `src/services/authService.ts` | **`getCurrentUser`:** Xóa hoặc đổi thành `GET /api/User/GetById?id=` nếu cần. Hiện `authStore.fetchCurrentUser` gọi method này nhưng thường fail → store giữ user local. Đề xuất: xóa method + sửa store để chỉ hydrate từ storage. |
| 4.3 | `src/stores/authStore.ts` | **`fetchCurrentUser`:** Bỏ gọi `authService.getCurrentUser()`. Thay bằng hydrate từ `authService.getStoredUser()`. Hoặc nếu muốn fetch fresh: gọi `GET /api/User/GetById?id=` với `userId` từ JWT. |
| 4.4 | `src/services/authService.ts` | **`updateProfile`:** Chuyển sang `PUT /api/User/update-profile` body `{ userId, avatarUrl, fullName, phone }` — hoặc tách ra `userService.ts` (tùy convention team). |
| 4.5 | `src/services/authService.ts` | **`processPendingProfileUpdates`:** Cập nhật từ `/auth/profile` → `/api/User/update-profile`. |
| 4.6 | `src/pages/ProfilePage.tsx` | Cập nhật caller nếu method signature đổi. |
| 4.7 | `src/services/authService.ts` | **`changePassword`:** Chuyển sang `PUT /api/User/update-password` body `{ userId, oldPassword, newPassword, confirmPassword }`. Nếu `changePassword` không có caller → xóa. |
| 4.8 | Verify | Tìm **mọi import/call** đến các method legacy đã xóa/đổi tên. |

**Acceptance:**
- Không còn import/call đến `/auth/me`, `/auth/profile`, `/auth/verify-otp`, `/auth/change-password`.
- `authStore.fetchCurrentUser` hoạt động mà không gọi endpoint không tồn tại.
- `ProfilePage` save profile → gọi `PUT /api/User/update-profile`.
- `npx tsc --noEmit` pass.

---

### Phase 5 — Tests

**Mục tiêu:** Cập nhật existing tests; thêm test cho code mới.

| Task | File | Chi tiết |
|------|------|----------|
| 5.1 | `src/stores/authStore.test.ts` | Cập nhật mock `authService.getCurrentUser` (Phase 4 đổi) |
| 5.2 | `src/stores/authStore.test.ts` | Test `fetchCurrentUser` hydrate từ storage |
| 5.3 | Test mới (nếu có test infrastructure) | `authService.resendConfirmationEmail` → verify FormData field `email` |
| 5.4 | Test mới | `authService.resetPassword` → verify FormData fields `Email`/`OTP`/`NewPassword` |
| 5.5 | Test mới | `authService.login` error handling: 401 → generic; 400 → preserve message |
| 5.6 | `src/utils/routeAccess.test.ts` | Verify — không đổi logic, tests nên vẫn pass |

**Acceptance:**
- `npx vitest run` (hoặc test runner hiện tại) pass.
- Không regression trên existing tests.

---

## 7. Acceptance Criteria (tổng hợp)

| # | Criteria | Phase |
|---|----------|-------|
| AC-1 | Login form chỉ chấp nhận email, không SĐT | 1 |
| AC-2 | Login user chưa confirm email → OTP modal mở (hoặc redirect confirm) | 1 |
| AC-3 | Login sai credential → toast generic, không lộ email tồn tại | 1 |
| AC-4 | ConfirmAccountPage: nút "Gửi lại mã OTP" gọi `PUT resend-confirmation-email` | 2 |
| AC-5 | ConfirmAccountPage: email fallback input khi không có `location.state` | 2 |
| AC-6 | ForgotPasswordPage step 1: gửi email forgot + note A16 | 3 |
| AC-7 | ForgotPasswordPage step 2: nhập OTP + mật khẩu mới → reset thành công | 3 |
| AC-8 | Không còn gọi `/auth/me`, `/auth/profile`, `/auth/verify-otp`, `/auth/change-password` | 4 |
| AC-9 | ProfilePage gọi `PUT /api/User/update-profile` | 4 |
| AC-10 | `authStore.fetchCurrentUser` không gọi endpoint không tồn tại | 4 |
| AC-11 | `npx tsc --noEmit` pass sau mỗi phase | 0–5 |
| AC-12 | Tests pass | 5 |
| AC-13 | Visual style login/register/confirm/forgot giữ nguyên | All |

---

## 8. Risks / Dependencies

| Risk | Mức | Mitigation |
|------|-----|------------|
| BE `reset-password` FormData PascalCase (`Email`/`OTP`/`NewPassword`) | Trung bình | Verify bằng manual API test trước code FE step 2 |
| Swagger response không có schema → FE dùng loose types | Thấp | Chấp nhận; thêm local types + TODO comment |
| `IsActive` policy: forgot-password không gửi OTP cho user chưa active | Trung bình | FE chỉ thêm copy hướng dẫn (A16); không sửa BE |
| `GET /api/User/GetById` có thể cần auth → kiểm tra header Bearer | Thấp | Nếu cần auth: user đã login → có token |
| `processPendingProfileUpdates` ghi `users_overrides` — chỉ DEV | Thấp | Giữ logic DEV-only; chuyển endpoint sang `/api/User/update-profile` |
| OTP modal trong `LoginFormContent` cũng cần resend button | Trung bình — nhưng ngoài MVP | Để Phase 2.5 nếu cần; hiện chỉ nhập OTP |
| Team workflow: sửa `authService.ts` nhiều phase → merge conflict | Trung bình | Mỗi phase commit riêng; review trước merge |

---

## 9. Agent Execution Prompt

Prompt cho agent implement lần lượt từng phase:

```
Bạn là senior FE engineer. Implement theo plan `docs/PLAN-fe-auth-flow.md`.

Quy tắc:
- Đọc plan trước khi code.
- Implement TỪNG PHASE theo thứ tự 0 → 5.
- Sau mỗi phase: chạy `npx tsc --noEmit`.
- Không sửa backend. Không tạo endpoint mới.
- Bám sát 7 path Auth trong swagger.json.
- Giữ nguyên visual style hiện tại.
- Commit message format: "fix(auth): Phase X — <mô tả>"

Phase hiện tại: [PHASE_NUMBER]

Tham chiếu:
- Plan: docs/PLAN-fe-auth-flow.md
- Audit: docs/AUDIT-auth-register-login.md
- Swagger: src/api/swagger.json
```

---

*Plan này chỉ cover FE. Các issue BE (A1–A4, A9–A11) thuộc scope backend và được ghi nhận trong audit.*
