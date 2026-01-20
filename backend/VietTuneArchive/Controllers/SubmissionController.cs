using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Mapper.DTOs.Response;
using static VietTuneArchive.Application.Mapper.DTOs.Request.SubmissionRequest;
using static VietTuneArchive.Application.Mapper.DTOs.SubmissionDto;

namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class SubmissionController : ControllerBase
    {
        private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

        // POST: /api/v1/submissions
        [HttpPost]
        public ActionResult<SubmissionDto> CreateSubmission([FromBody] CreateSubmissionRequest request)
        {
            // TODO: Tạo draft mới, status=Draft
            var submission = new SubmissionDto
            {
                Id = "sub-001",
                UserId = CurrentUserId,
                Title = request.Title,
                Status = "Draft",
                CreatedAt = DateTime.UtcNow
            };
            return Created($"submissions/{submission.Id}", submission);
        }

        // GET: /api/v1/submissions/my
        [HttpGet("my")]
        public ActionResult<PagedList<SubmissionDto>> GetMySubmissions(
            [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            // TODO: Query submissions WHERE UserId=CurrentUserId, paginate
            var submissions = new PagedList<SubmissionDto>
            {
                Items = new List<SubmissionDto>(),
                Page = page,
                PageSize = pageSize,
                Total = 5
            };
            return Ok(submissions);
        }

        // GET: /api/v1/submissions/{id}
        [HttpGet("{id}")]
        [Authorize(Policy = "Owner")]  // Custom policy: submission.UserId == CurrentUserId
        public ActionResult<SubmissionDetailDto> GetSubmission(string id)
        {
            var submission = new SubmissionDetailDto
            {
                Id = id,
                Title = "Bài hát dân ca Tày",
                Status = "Submitted",
                //BasicInfo = new BasicInfoDto { /* ... */ },
                //CulturalContext = new CulturalContextDto { /* ... */ }
                // Full detail
            };
            return Ok(submission);
        }

        // PUT: /api/v1/submissions/{id}
        [HttpPut("{id}")]
        [Authorize(Policy = "Owner")]
        public ActionResult<SubmissionDto> UpdateSubmission(string id, [FromBody] UpdateSubmissionRequest request)
        {
            // TODO: Replace toàn bộ (hoặc merge)
            return Ok(new SubmissionDto { Id = id, Status = "Draft" });
        }

        // DELETE: /api/v1/submissions/{id}
        [HttpDelete("{id}")]
        [Authorize(Policy = "Owner")]
        public ActionResult<BaseResponse> DeleteSubmission(string id)
        {
            // TODO: Chỉ xóa nếu status=Draft
            return Ok(new BaseResponse { Success = true, Message = "Deleted" });
        }

        // PUT: /api/v1/submissions/{id}/basic-info
        [HttpPut("{id}/basic-info")]
        [Authorize(Policy = "Owner")]
        public ActionResult<BaseResponse> UpdateBasicInfo(string id, [FromBody] BasicInfoDto basicInfo)
        {
            // TODO: Update step 2
            return Ok(new BaseResponse { Success = true });
        }

        // PUT: /api/v1/submissions/{id}/cultural-context
        [HttpPut("{id}/cultural-context")]
        [Authorize(Policy = "Owner")]
        public ActionResult<BaseResponse> UpdateCulturalContext(string id, [FromBody] CulturalContextDto context)
        {
            // TODO: Update step 3
            return Ok(new BaseResponse { Success = true });
        }

        // PUT: /api/v1/submissions/{id}/additional-info
        [HttpPut("{id}/additional-info")]
        [Authorize(Policy = "Owner")]
        public ActionResult<BaseResponse> UpdateAdditionalInfo(string id, [FromBody] AdditionalInfoDto info)
        {
            // TODO: Update step 4
            return Ok(new BaseResponse { Success = true });
        }

        // PUT: /api/v1/submissions/{id}/copyright-info
        [HttpPut("{id}/copyright-info")]
        [Authorize(Policy = "Owner")]
        public ActionResult<BaseResponse> UpdateCopyrightInfo(string id, [FromBody] CopyrightInfoDto copyright)
        {
            return Ok(new BaseResponse { Success = true });
        }

        // POST: /api/v1/submissions/{id}/submit
        [HttpPost("{id}/submit")]
        [Authorize(Policy = "Owner")]
        public ActionResult<SubmissionDto> Submit(string id)
        {
            // TODO: Validate full info, set status=PendingReview
            return Ok(new SubmissionDto { Id = id, Status = "PendingReview" });
        }

        // POST: /api/v1/submissions/{id}/resubmit
        [HttpPost("{id}/resubmit")]
        [Authorize(Policy = "Owner")]
        public ActionResult<SubmissionDto> Resubmit(string id)
        {
            // TODO: Chỉ sau khi Rejected
            return Ok(new SubmissionDto { Id = id, Status = "PendingReview" });
        }

        // GET: /api/v1/submissions/{id}/status
        [HttpGet("{id}/status")]
        [Authorize(Policy = "Owner")]
        public ActionResult<SubmissionStatusDto> GetStatus(string id)
        {
            var status = new SubmissionStatusDto
            {
                Status = "InReview",
                Timeline = new List<TimelineItemDto>
                {
                    new() { Step = "Submitted", Date = DateTime.Now, Note = "Gửi xét duyệt" }
                }
            };
            return Ok(status);
        }

        // GET: /api/v1/submissions/{id}/history
        [HttpGet("{id}/history")]
        [Authorize(Policy = "Owner")]
        public ActionResult<List<SubmissionHistoryDto>> GetHistory(string id)
        {
            var history = new List<SubmissionHistoryDto>();
            return Ok(history);
        }

        // GET: /api/v1/submissions/{id}/feedback
        [HttpGet("{id}/feedback")]
        [Authorize(Policy = "Owner")]
        public ActionResult<List<FeedbackDto>> GetFeedback(string id)
        {
            var feedback = new List<FeedbackDto>();
            return Ok(feedback);
        }

        // POST: /api/v1/submissions/{id}/duplicate
        [HttpPost("{id}/duplicate")]
        [Authorize(Policy = "Owner")]
        public ActionResult<SubmissionDto> Duplicate(string id)
        {
            // TODO: Clone thành draft mới
            return Ok(new SubmissionDto { Id = "sub-002" });
        }

        // PUT: /api/v1/submissions/{id}/instruments
        [HttpPut("{id}/instruments")]
        [Authorize(Policy = "Owner")]
        public ActionResult<BaseResponse> UpdateInstruments(string id, [FromBody] List<Application.Mapper.DTOs.SubmissionDto.InstrumentDto> instruments)
        {
            return Ok(new BaseResponse { Success = true });
        }

        // GET: /api/v1/submissions/drafts
        [HttpGet("drafts")]
        public ActionResult<PagedList<SubmissionDto>> GetDrafts(
            [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var drafts = new PagedList<SubmissionDto>();
            return Ok(drafts);
        }

        // GET: /api/v1/submissions/statistics
        [HttpGet("statistics")]
        public ActionResult<SubmissionStatsDto> GetStatistics()
        {
            var stats = new SubmissionStatsDto
            {
                Total = 10,
                Drafts = 3,
                Submitted = 5,
                Approved = 2
            };
            return Ok(stats);
        }
    }
}
