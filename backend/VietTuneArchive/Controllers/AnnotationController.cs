using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Mapper.DTOs.Response;
using static VietTuneArchive.Application.Mapper.DTOs.AnnotationDto;
using static VietTuneArchive.Application.Mapper.DTOs.Request.AnnotationRequest;

namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AnnotationController : ControllerBase
    {
        private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

        // GET: /api/annotations/submissions/{submissionId}
        [HttpGet("submissions/{submissionId}")]
        public ActionResult<PagedList<AnnotationDto>> GetAnnotations(string submissionId,
            [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var annotations = new PagedList<AnnotationDto>
            {
                Items = new List<AnnotationDto>(),
                Page = page,
                PageSize = pageSize,
                Total = 12
            };
            return Ok(annotations);
        }

        // POST: /api/annotations/submissions/{submissionId}
        [HttpPost("submissions/{submissionId}")]
        [Authorize(Policy = "Expert")]
        public ActionResult<AnnotationDto> CreateAnnotation(string submissionId, [FromBody] CreateAnnotationRequest request)
        {
            var annotation = new AnnotationDto
            {
                Id = "anno-001",
                SubmissionId = submissionId,
                TimeStart = request.TimeStart,
                TimeEnd = request.TimeEnd,
                Content = request.Content,
                Type = request.Type,
                AuthorId = CurrentUserId,
                CreatedAt = DateTime.UtcNow
            };
            return Created(annotation.Id, annotation);
        }

        // GET: /api/annotations/{annotationId}
        [HttpGet("{annotationId}")]
        public ActionResult<AnnotationDetailDto> GetAnnotation(string annotationId)
        {
            var annotation = new AnnotationDetailDto
            {
                Id = annotationId,
                SubmissionId = "sub-001",
                TimeStart = 30.5,  // 30.5s
                TimeEnd = 45.2,
                Content = "Đoạn này sử dụng kỹ thuật hát then đặc trưng của dân tộc Tày",
                Type = "CulturalNote",
                AuthorId = "expert-123",
                Likes = 15,
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            };
            return Ok(annotation);
        }

        // PUT: /api/annotations/{annotationId}
        [HttpPut("{annotationId}")]
        [Authorize(Policy = "Author")]
        public ActionResult<BaseResponse> UpdateAnnotation(string annotationId, [FromBody] UpdateAnnotationRequest request)
        {
            // BaseResponse: Success + Message chỉ
            return Ok(new BaseResponse { Success = true, Message = "Annotation updated" });
        }

        // DELETE: /api/annotations/{annotationId}
        [HttpDelete("{annotationId}")]
        [Authorize(Policy = "Author")]
        public ActionResult<BaseResponse> DeleteAnnotation(string annotationId)
        {
            return Ok(new BaseResponse { Success = true, Message = "Annotation deleted" });
        }
    }
}
