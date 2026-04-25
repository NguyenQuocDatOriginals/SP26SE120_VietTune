You are implementing API integration tests for the Auth flow in VietTuneArchive.Tests.
Infrastructure (WebAppFactory, JwtTokenHelper, ApiTestBase, DatabaseFixture) is
already set up. Do NOT modify any fixture files unless absolutely required.

## CONTEXT — read these files first before writing any test
- VietTuneArchive.API/Controllers/AuthController.cs       ← routes, DTOs used
- VietTuneArchive.Application/Services/AuthService.cs     ← business rules
- VietTuneArchive.Application/DTOs/Auth/ (all files)      ← request/response shape
- VietTuneArchive.Domain/Entities/User.cs                 ← fields, constraints
- VietTuneArchive.Domain/Enums/ (UserRole, UserStatus)
- VietTuneArchive.Tests/Integration/Fixtures/             ← all fixture files
- VietTuneArchive.Tests/Integration/Fixtures/DatabaseFixture.cs ← seeded users

Confirm exact route paths, request DTO field names, and response DTO shape
before writing any assertions.

## TARGET FILE
VietTuneArchive.Tests/Integration/Controllers/AuthControllerTests.cs

## BASE CLASS
Inherit ApiTestBase — use its GetAsync/PostAsync/PutAsync helpers.
Use JwtTokenHelper for tokens where needed.
Use DatabaseFixture seeded users (contrib@test.com, expert@test.com, etc.)

---

## TEST CASES

### POST /api/Auth/register-contributor
- Valid payload → 201, response contains userId + email
- Duplicate email → 409 or 400 with error message
- Missing required field (email null) → 400 validation error
- Missing required field (password null) → 400 validation error
- Password too short (if min length rule exists) → 400
- Invalid email format → 400
- After successful register → user exists in DB with role = Contributor
- After successful register → password stored as hash not plaintext

### POST /api/Auth/register-researcher
- Valid payload → 201, role = Researcher
- Same duplicate/validation rules as contributor (spot check 2 cases)

### POST /api/Auth/login
- Valid credentials (contrib@test.com) → 200, returns accessToken + refreshToken
- Valid credentials (expert@test.com) → 200, token contains role = Expert
- Wrong password → 401
- Email not found → 401 (same response as wrong password, no user enumeration)
- Inactive/banned user → 401 or 403 per impl
- Missing email field → 400
- Missing password field → 400
- JWT token returned is valid and decodable (decode and assert claims):
    - contains userId
    - contains email
    - contains correct role
    - expiry is in the future

### GET /api/Auth/confirm-email
- Valid token + valid email → 200, user.IsEmailConfirmed = true in DB
- Expired token → 400 with error
- Tampered/invalid token → 400
- Already confirmed email → 200 idempotent or 400 per impl
- Missing token param → 400
- Missing email param → 400

### POST /api/Auth/forgot-password
- Registered email → 200 (always, no user enumeration)
- Unregistered email → 200 (same response, security)
- Missing email → 400
- Invalid email format → 400
- Email service stub called (verify no real email sent — stub records call)

### POST /api/Auth/reset-password
- Valid reset token + new password → 200, can login with new password after
- Expired reset token → 400
- Invalid/tampered token → 400
- New password too short → 400
- Missing token → 400
- Missing new password → 400
- Reuse same reset token after success → 400 (token invalidated)

### Token & Session
- Login twice with same credentials → each returns unique accessToken
- AccessToken from login can authenticate protected endpoint (GET /api/User/GetById)
- Malformed Authorization header → 401
- Expired token (manually set exp=past in JwtTokenHelper) → 401
- Token with unknown role → 403 on role-restricted endpoint

---

## IMPLEMENTATION RULES

1. Inherit ApiTestBase — use PostAsync<T>, GetAsync helpers
2. Each test is fully independent:
   - Register a fresh unique user per test (use Guid in email)
     e.g., $"test-{Guid.NewGuid()}@mail.com"
   - Do NOT rely on test execution order
3. For DB state assertions (password hashed, role set, isConfirmed):
   - Resolve AppDbContext from WebAppFactory.Services scope
   - Query DB directly to assert pers