You are setting up the initial infrastructure for API integration tests
in VietTuneArchive.Tests. The backend is .NET 8 / ASP.NET Core.
Unit test project already exists. Do NOT write any actual test cases yet.

## CONTEXT — read these files first
- VietTuneArchive.API/Program.cs               ← DI registration, middleware
- VietTuneArchive.API/appsettings.json         ← config keys (JWT, DB, etc.)
- VietTuneArchive.Infrastructure/ or
  VietTuneArchive.API/Data/AppDbContext.cs     ← EF DbContext class name
- VietTuneArchive.Domain/Enums/ (UserRole or equivalent)
- VietTuneArchive.API/Controllers/AuthController.cs ← confirm JWT config keys

Understand how the app is wired (JWT secret key name, DB connection string
key name, role enum values) before writing any code.

## TARGET — create these files (no test methods, infrastructure only)

### 1. NuGet packages
Add to VietTuneArchive.Tests.csproj if not already present:
- Microsoft.AspNetCore.Mvc.Testing
- Testcontainers.PostgreSql
- Microsoft.EntityFrameworkCore.Tools (if needed for migrations)

---

### 2. VietTuneArchive.Tests/Integration/Fixtures/WebAppFactory.cs

Custom WebApplicationFactory<Program> that:
- Replaces the real PostgreSQL connection string with Testcontainers DB
- Replaces any external service configs (LLM, Embedding, Email) with
  test/stub values so they don't call real APIs
- Calls EnsureCreated() or runs migrations on startup
- Is scoped as IAsyncLifetime (starts container before tests, disposes after)

```csharp