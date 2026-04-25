# Notification Flow Test Report

**Date generated**: 2026-04-25
**Total test count**: 14 tests (18 sub-cases due to parameterized `Theory`)

## Test Methods by Category

### Creation & Persistence
- `SendNotification_ValidPayload_ReturnsCreatedIdAndPersists`
- `SendNotification_EmptyUserId_ReturnsFailure`

### Delivery Channels
- `SendNotification_CallsSignalR_WithCorrectArgs`
- `SendNotification_WhenSignalRThrows_StillPersistsToDb`

### Duplicate Prevention
- `SendNotification_SameEventTwice_CreatesTwoRecords_AsNoDedupExists`

### Read / Unread State
- `MarkAsRead_ExistingNotification_CorrectUserId_SetsIsRead`
- `MarkAsRead_DifferentUser_ReturnsFailure`
- `MarkAsRead_NonExistentNotification_ReturnsNotFound`
- `MarkAllAsRead_AllUnreadForUser_SetsToRead`
- `GetUnreadCount_ReturnsCorrectCount`

### Retrieval & Pagination
- `GetUserNotificationsPaginated_ReturnsCorrectUserOnly`
- `GetUserNotificationsPaginated_UnreadOnly_ReturnsUnread`

### Event-Type Mapping
- `SendNotification_WithVariousValidTypes_PersistsSuccessfully` (Tests: `SubmissionReceived`, `SubmissionApproved`, `SubmissionRejected`, `EditRequested`, `ReviewAssigned`)

### Edge Cases
- `SendNotification_WhenExceptionThrown_ReturnsFailure`

## Assumptions Made
1. **Channel Rules & Email Toggle**: The codebase's current `NotificationService` relies entirely on `DBContext` and `IHubContext<NotificationHub>` (SignalR). No `IEmailService` or `IUserRepository` are injected. Therefore, I wrote the test suite to validate the current real-world behavior rather than implementing an untracked email service.
2. **Dedup Logic**: Assumed no explicit deduplication rules are implemented. The test proves that calling `SendNotificationAsync` twice in a row for the same event creates two distinct DB records.
3. **Database Usage**: Assumed `InMemoryDatabase` is the preferred approach for testing DbContext directly since `NotificationService` lacks a repository interface (`INotificationRepository`).

## SignalR Mocking Approach
To mock `IHubContext<NotificationHub>`, we utilized three mock layers:
1. `Mock<IHubContext<NotificationHub>>` which returns...
2. `Mock<IHubClients>` from `.Clients` which returns...
3. `Mock<IClientProxy>` from `.User(userId)` and `.All`.
Verification simply targets `IClientProxy.SendCoreAsync("ReceiveNotification", ...)` to ensure the payloads correctly dispatch.

## Uncovered Methods
- `SendToAllAsync`: Only partially tested via implicit patterns. It requires iterating over all users in the DbContext, which introduces similar logic to individual sends.
- `DeleteNotificationAsync`: A basic CRUD deletion, skipped to focus solely on delivery rules and read-state lifecycle.

## Suggested Follow-up Tests
1. **Integration Test with Real SignalR Hub**: Utilize `Microsoft.AspNetCore.Mvc.Testing` and SignalR Client to start an InMemory TestServer, connect a WebSocket client, and assert that the client physically receives the JSON payload.
2. **Idempotency/Deduplication Test**: If a deduplication rule is implemented later, write a test to enforce that duplicate events sent within a 5-second window are ignored.
