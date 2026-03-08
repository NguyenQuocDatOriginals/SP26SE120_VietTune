using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Responses;

namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SubmissionController : ControllerBase
    {
        private readonly ISubmissionService2 _submissionService;
        private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

        public SubmissionController(ISubmissionService2 submissionService)
        {
            _submissionService = submissionService;
        }

        [HttpPost("create-submission")]
        [Authorize(Roles = "Admin,Contributor,Expert")]
        public async Task<IActionResult> CreateSubmission([FromBody] SubmissionDto dto)
        {
            var result = await _submissionService.CreateAsync(dto);
            if (result.IsSuccess)
            {
                return Ok(result);
            }
            return BadRequest(result);
        }

        // GET: /api/submissions/my
        [HttpGet("my")]
        public async Task<ActionResult<PagedResponse<SubmissionDto>>> GetMySubmissions(
            [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var userId = Guid.Parse(CurrentUserId);
            var result = await _submissionService.GetByContributorAsync(userId);
            if (!result.Success)
                return NotFound(result);
            
            var pagedResult = new PagedResponse<SubmissionDto>
            {
                Success = true,
                Data = result.Data ?? new List<SubmissionDto>(),
                Page = page,
                PageSize = pageSize,
                Total = result.Data?.Count ?? 0,
                Message = "Retrieved successfully"
            };
            return Ok(pagedResult);
        }

        // GET: /api/submissions/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceResponse<SubmissionDto>>> GetById(Guid id)
        {
            var result = await _submissionService.GetByIdAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // PUT: /api/submissions/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<ServiceResponse<SubmissionDto>>> Update(Guid id, [FromBody] SubmissionDto dto)
        {
            var result = await _submissionService.UpdateAsync(id, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // DELETE: /api/submissions/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult<ServiceResponse<bool>>> Delete(Guid id)
        {
            var result = await _submissionService.DeleteAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }


        // GET: /api/submissions/stage/{stage}
        [HttpGet("stage/{stage}")]
        public async Task<ActionResult<ServiceResponse<List<SubmissionDto>>>> GetByStage(int stage)
        {
            var result = await _submissionService.GetByStageAsync(stage);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // GET: /api/submissions/recent
        [HttpGet("recent")]
        public async Task<ActionResult<ServiceResponse<List<SubmissionDto>>>> GetRecent([FromQuery] int count = 10)
        {
            var result = await _submissionService.GetRecentAsync(count);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // POST: /api/submissions/{id}/paginated
        [HttpGet("paginated")]
        public async Task<ActionResult<PagedResponse<SubmissionDto>>> GetPaginated([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _submissionService.GetPaginatedAsync(page, pageSize);
            return Ok(result);
        }
    }
}
