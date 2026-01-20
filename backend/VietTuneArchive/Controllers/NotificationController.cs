using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Mapper.DTOs.Response;
using static VietTuneArchive.Application.Mapper.DTOs.NotificationDto;

namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class NotificationController : ControllerBase
    {
        private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

        // GET: /api/notifications?limit=20&read=false
        [HttpGet]
        public ActionResult<PagedList<NotificationDto>> GetNotifications(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] bool? unreadOnly = null)
        {
            var notifications = new PagedList<NotificationDto>
            {
                Items = new List<NotificationDto>(),
                Page = page,
                PageSize = pageSize,
                Total = 45
            };
            return Ok(notifications);
        }

        // GET: /api/notifications/unread-count
        [HttpGet("unread-count")]
        public ActionResult<UnreadCountDto> GetUnreadCount()
        {
            var count = new UnreadCountDto
            {
                Unread = 8,
                Total = 45
            };
            return Ok(count);
        }

        // PUT: /api/notifications/{id}/read
        [HttpPut("{id}/read")]
        public ActionResult<BaseResponse> MarkAsRead(string id)
        {
            return Ok(new BaseResponse { Success = true, Message = "Marked as read" });
        }

        // PUT: /api/notifications/read-all
        [HttpPut("read-all")]
        public ActionResult<BaseResponse> MarkAllAsRead()
        {
            return Ok(new BaseResponse { Success = true, Message = "All marked as read" });
        }

        // DELETE: /api/notifications/{id}
        [HttpDelete("{id}")]
        public ActionResult<BaseResponse> DeleteNotification(string id)
        {
            return Ok(new BaseResponse { Success = true, Message = "Notification deleted" });
        }
    }
}
