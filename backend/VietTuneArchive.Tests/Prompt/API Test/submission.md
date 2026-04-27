You are implementing API integration tests for the Submission flow in VietTuneArchive.Tests.
Infrastructure (WebAppFactory, JwtTokenHelper, ApiTestBase, DatabaseFixture) is
already set up. Do NOT modify any fixture files unless absolutely required.

## CONTEXT — read these files first before writing any test
- VietTuneArchive.API/Controllers/SubmissionController.cs     ← routes, auth roles
- VietTuneArchive.Application/Services/SubmissionService2.cs  ← business rules
- VietTuneArchive.Application/DTOs/Submission/ (all files)    ← request/response shape
- VietTuneArchive.Domain/Entities/Submission.cs
- VietTuneArchive.Domain/Enums/ (SubmissionStatus, or equivalent)
- VietTuneArchive.Tests/Integration/Fixtures/                 ← all fixture files
- VietTuneArchive.Tests/Integration/Fixtures/DatabaseFixture.cs ← seeded users/data

Confirm exact route paths, DTO field names, role restrictions, and
state transition rules before writing any test.

## TARGET FILE
VietTuneArchive.Tests/Integration/Controllers/SubmissionControllerTests.cs

## BASE CLASS
Inherit ApiTestBase. Use JwtTokenHelper for role tokens.
Use DatabaseFixture seeded reference data (EthnicGroup, Instrument, etc.)

---

## TEST CASES

### POST /api/Submission/create-submission
- Valid payload [Contributor] → 201, submissionId returned, status = Draft
- Valid payload [Expert] → 201 (role allowed)
- Valid payload [Admin] → 201 (role allowed)
- [Researcher] → 403 forbidden
- Unauthenticated → 401
- Missing required field (recordingId null) → 400
- Invalid recordingId (not found) → 404 or 400 per impl
- After create → submission exists in DB with status = Draft, correct userId

### PUT /api/Submission/confirm-submit-submission
- Valid submissionId, status = Draft [Contributor/owner] → 200, status = Pending
- Non-owner Contributor → 403
- [Expert] → 200 if allowed, else 403 per role rule
- [Researcher] → 403
- Unauthenticated → 401
- SubmissionId not found → 404
- Wrong current status (not Draft) → 400 with state error message
- Already Pending submission → 400 (duplicate transition)

### PUT /api/Submission/edit-request-submission
- Valid submissionId, status = UnderReview [Expert] → 200, status = UpdateRequested
- [Admin] → 200 if allowed per rule
- [Contributor] → 403
- [Researcher] → 403
- Unauthenticated → 401
- SubmissionId not found → 404
- Wrong current status (not UnderReview) → 400
- Response includes reason/feedback field

### PUT /api/Submission/confirm-edit-submission
- Valid submissionId, status = UpdateRequested [Contributor/owner] → 200, status = Pending
- Non-owner Contributor → 403
- [Researcher] → 403
- Unauthenticated → 401
- SubmissionId not found → 404
- Wrong current status (not UpdateRequested) → 400
- After confirm → submission re-enters Pending, ready for re-review

### PUT /api/Submission/approve-submission
- Valid submissionId, status = UnderReview [Expert] → 200, status = Approved
- [Admin] → 200
- [Contributor] → 403
- [Researcher] → 403
- Unauthenticated → 401
- SubmissionId not found → 404
- Wrong current status (not UnderReview) → 400
- After approve → recording ApprovalStatus updated in DB
- After approve → notification created for Contributor

### GET /api/Submission/get-by-status
- [Admin] → 200, returns all submissions matching status filter
- [Expert] → 200, returns submissions visible to expert
- [Contributor] → 200, returns only own submissions
- [Researcher] → 200 or 403 per impl
- Unauthenticated → 401
- Filter status = Draft → only Draft returned
- Filter status = Pending → only Pending returned
- Filter status = Approved → only Approved returned
- No submissions matching filter → empty list, not error
- Pagination: page/size params respected

### Full State Machine Flow (end-to-end happy path)
Chain these in sequence within one test:
1. POST create-submission → 201 Draft
2. PUT confirm-submit → 200 Pending
3. PUT edit-request → 200 UpdateRequested   (as Expert)
4. PUT confirm-edit → 200 Pending           (as Contributor)
5. PUT approve-submission → 200 Approved    (as Expert)
Assert DB state after each transition matches expected status.

### Invalid State Transitions (assert 400 per step)
- Approved → confirm-submit → 400
- Draft → approve-submission → 400 (skip steps)
- Rejected → confirm-edit → 400

---

## IMPLEMENTATION RULES

1. Inherit ApiTestBase — use PostAsync<T>, PutAsync<T>, GetAsync helpers
2. Each test fully independent:
   - Create a fresh submission per test via POST create-submission
   - Advance to required state via prior PUT calls before testing target action
   - Use unique recordingId per test or shared seeded recording from DatabaseFixture
3. For DB state assertions:
   - Resolve AppDbContext from WebAppFactory.Services scope
   - Assert submission.Status, recording.ApprovalStatus after transitions
4. For notification assertion:
   - Query Notifications table in DB after approve/reject
   - Assert at least one notification with correct recipientId exists
5. Naming: Endpoint_Scenario_ExpectedResult
   Example: CreateSubmission_ByResearcher_Returns403
            ConfirmSubmit_WhenStatusIsPending_Returns400
            ApproveSubmission_ByExpert_UpdatesRecordingApprovalStatus
            FullFlow_DraftToPendingToApproved_AllTransitionsSucceed
6. Group by nested classes:
   - CreateSubmissionTests
   - ConfirmSubmitTests
   - EditRequestTests
   - ConfirmEditTests
   - ApproveSubmissionTests
   - GetByStatusTests
   - StateMachineFlowTests
   - InvalidTransitionTests
7. Helper method within test class:
   - CreateDraftSubmission(string token) → posts and returns submissionId
   - AdvanceToUnderReview(Guid submissionId, ...) → chains transitions
   Use these to reduce boilerplate in state-dependent tests
8. Assert both status code AND response body:
   response.StatusCode.Should().Be(HttpStatusCode.OK);
   var body = await response.Content.ReadFromJsonAsync<SubmissionDto>();
   body.Status.Should().Be("Pending");
9. If NotificationService is stubbed in WebAppFactory, swap stub for
   a spy/recording fake so notification calls can be verified

## VERIFICATION
Run: dotnet test --filter "SubmissionControllerTests"
All tests must be green. Fix errors before proceeding.

Check coverage delta:
- SubmissionController → ≥ 80% line coverage
- SubmissionService2 state machine branches gain additional coverage

## REPORT
Create: VietTuneArchive.Tests/Report/SUBMISSION_API_TEST_REPORT.md

Include:
- Date generated
- Total tests written, pass/fail count
- All test method names grouped by endpoint/category
- Route paths confirmed (list all)
- State transitions tested (draw as table: From → To → Result)
- DB assertion approach used (direct DbContext query)
- Notification verification approach
- Helper methods created (list signatures)
- Uncovered scenarios and reason
- Estimated SubmissionController + SubmissionService2 coverage delta
- Deferred edge cases for follow-up

Keep concise — no fluff.