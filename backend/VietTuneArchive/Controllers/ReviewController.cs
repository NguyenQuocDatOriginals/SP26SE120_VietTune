using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Mapper.DTOs.Response;
using static VietTuneArchive.Application.Mapper.DTOs.Request.ReviewRequest;
using static VietTuneArchive.Application.Mapper.DTOs.ReviewDto;

namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "Expert")]
    public class ReviewController : ControllerBase
    {
        private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

        // GET: /api/reviews/dashboard/stats
        [HttpGet("dashboard/stats")]
        public ActionResult<ReviewStatsDto> GetDashboardStats()
        {
            var stats = new ReviewStatsDto
            {
                PendingCount = 15,
                InProgressCount = 3,
                CompletedToday = 5,
                AvgTime = "2.5 days"
            };
            return Ok(stats);
        }

        // GET: /api/reviews/queue
        [HttpGet("queue")]
        public ActionResult<PagedList<ReviewQueueItemDto>> GetReviewQueue(
            [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var queue = new PagedList<ReviewQueueItemDto>
            {
                Items = new List<ReviewQueueItemDto>(),
                Page = page,
                PageSize = pageSize,
                Total = 45
            };
            return Ok(queue);
        }

        // GET: /api/reviews/{reviewId}
        [HttpGet("{reviewId}")]
        public ActionResult<ReviewDetailDto> GetReview(string reviewId)
        {
            var review = new ReviewDetailDto
            {
                Id = reviewId,
                SubmissionId = "sub-001",
                Status = "InProgress",
                AssignedAt = DateTime.UtcNow.AddDays(-1),
                Submission = new SubmissionSummaryDto { /* ... */ }
            };
            return Ok(review);
        }

        // POST: /api/reviews/{reviewId}/start
        [HttpPost("{reviewId}/start")]
        public ActionResult<BaseResponse> StartReview(string reviewId)
        {
            return Ok(new BaseResponse { Success = true, Message = "Review started" });
        }

        // PUT: /api/reviews/{reviewId}/checklist
        [HttpPut("{reviewId}/checklist")]
        public ActionResult<BaseResponse> UpdateChecklist(string reviewId, [FromBody] UpdateChecklistRequest request)
        {
            return Ok(new BaseResponse { Success = true });
        }

        // PUT: /api/reviews/{reviewId}/submission
        [HttpPut("{reviewId}/submission")]
        public ActionResult<BaseResponse> UpdateSubmissionMetadata(string reviewId, [FromBody] SubmissionMetadataRequest request)
        {
            return Ok(new BaseResponse { Success = true });
        }

        // PUT: /api/reviews/{reviewId}/transcription
        [HttpPut("{reviewId}/transcription")]
        public ActionResult<BaseResponse> UpdateTranscription(string reviewId, [FromBody] TranscriptionUpdateRequest request)
        {
            return Ok(new BaseResponse { Success = true });
        }

        // POST: /api/reviews/{reviewId}/approve
        [HttpPost("{reviewId}/approve")]
        public ActionResult<ReviewDecisionDto> Approve(string reviewId, [FromBody] ApproveRequest request)
        {
            var decision = new ReviewDecisionDto
            {
                Action = "Approved",
                ReviewId = reviewId,
                CompletedAt = DateTime.UtcNow
            };
            return Ok(decision);
        }

        // POST: /api/reviews/{reviewId}/reject
        [HttpPost("{reviewId}/reject")]
        public ActionResult<ReviewDecisionDto> Reject(string reviewId, [FromBody] RejectRequest request)
        {
            var decision = new ReviewDecisionDto
            {
                Action = "Rejected",
                ReviewId = reviewId,
                Reason = request.Reason
            };
            return Ok(decision);
        }

        // POST: /api/reviews/{reviewId}/request-changes
        [HttpPost("{reviewId}/request-changes")]
        public ActionResult<ReviewDecisionDto> RequestChanges(string reviewId, [FromBody] RequestChangesRequest request)
        {
            var decision = new ReviewDecisionDto
            {
                Action = "ChangesRequested",
                ReviewId = reviewId,
                Feedback = request.Feedback
            };
            return Ok(decision);
        }

        // POST: /api/reviews/{reviewId}/save-draft
        [HttpPost("{reviewId}/save-draft")]
        public ActionResult<BaseResponse> SaveDraft(string reviewId)
        {
            return Ok(new BaseResponse { Success = true, Message = "Draft saved" });
        }

        // GET: /api/reviews/{reviewId}/history
        [HttpGet("{reviewId}/history")]
        public ActionResult<List<ReviewHistoryDto>> GetReviewHistory(string reviewId)
        {
            var history = new List<ReviewHistoryDto>();
            return Ok(history);
        }

        // GET: /api/reviews/my-completed
        [HttpGet("my-completed")]
        public ActionResult<PagedList<ReviewSummaryDto>> GetMyCompleted(
            [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var completed = new PagedList<ReviewSummaryDto>();
            return Ok(completed);
        }

        // GET: /api/reviews/statistics
        [HttpGet("statistics")]
        public ActionResult<ReviewStatisticsDto> GetStatistics()
        {
            var stats = new ReviewStatisticsDto
            {
                TotalReviewed = 150,
                Approved = 120,
                Rejected = 20,
                AvgRating = 4.2
            };
            return Ok(stats);
        }
    }
}
