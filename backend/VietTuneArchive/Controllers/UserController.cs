using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Mapper.DTOs.Response;
using static VietTuneArchive.Application.Mapper.DTOs.Request.UserRequest;
using static VietTuneArchive.Application.Mapper.DTOs.UserDto;


namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]  // Toàn bộ controller yêu cầu auth, trừ nếu override
    public class UserController : ControllerBase
    {
        private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

        // GET: /api/v1/users/me
        [HttpGet("me")]
        public ActionResult<UserProfileDto> GetMe()
        {
            // TODO: Lấy info user từ DB bằng CurrentUserId
            var user = new UserProfileDto
            {
                Id = CurrentUserId,
                Email = "user@example.com",
                FullName = "Nguyễn Văn A",
                AvatarUrl = "https://example.com/avatar.jpg",
                Bio = "Giới thiệu ngắn",
                Role = "User"
            };

            return Ok(user);
        }

        // PUT: /api/v1/users/me
        [HttpPut("me")]
        public ActionResult<BaseResponse> UpdateMe([FromBody] UpdateUserRequest request)
        {
            // TODO: Cập nhật profile user hiện tại
            return Ok(new BaseResponse { Success = true, Message = "Update profile success" });
        }

        // PUT: /api/v1/users/me/password
        [HttpPut("me/password")]
        public ActionResult<BaseResponse> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            // TODO: Validate old password, hash + update new password
            return Ok(new BaseResponse { Success = true, Message = "Password changed success" });
        }

        // POST: /api/v1/users/me/avatar
        [HttpPost("me/avatar")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<BaseResponse>> UploadAvatar(IFormFile file)
        {
            // TODO: Validate file (jpg/png, size <5MB), upload cloud (Azure/S3), lưu URL vào DB
            if (file == null || file.Length == 0)
                return BadRequest(new BaseResponse { Success = false, Message = "No file" });

            // Giả lập upload
            var avatarUrl = $"https://example.com/avatars/{CurrentUserId}.jpg";

            return Ok(new BaseResponse { Success = true, Message = "Avatar uploaded", Data = avatarUrl });
        }

        // GET: /api/v1/users/me/stats
        [HttpGet("me/stats")]
        public ActionResult<UserStatsDto> GetMyStats()
        {
            // TODO: Tính stats từ DB (posts, likes, contributions...)
            var stats = new UserStatsDto
            {
                TotalPosts = 25,
                TotalLikes = 150,
                TotalContributions = 10,
                Rank = "Silver"
            };

            return Ok(stats);
        }

        // GET: /api/v1/users/{userId}
        [HttpGet("{userId}")]
        public ActionResult<UserProfileDto> GetUserProfile(string userId)
        {
            // TODO: Lấy public profile user khác (không private info)
            var user = new UserProfileDto
            {
                Id = userId,
                Email = "",  // Ẩn email
                FullName = "Trần Thị B",
                AvatarUrl = "https://example.com/avatar2.jpg",
                Bio = "Expert Developer",
                Role = "Expert"
            };

            return Ok(user);
        }

        // GET: /api/v1/users/{userId}/contributions
        [HttpGet("{userId}/contributions")]
        public ActionResult<UserContributionsDto> GetUserContributions(string userId)
        {
            // TODO: Lấy list đóng góp của user
            var contributions = new UserContributionsDto
            {
                UserId = userId,
                TotalContributions = 50,
                Contributions = new List<ContributionItemDto>
                {
                    new() { Id = "1", Title = "Post về C#", Points = 20, Date = "2026-01-01" }
                }
            };

            return Ok(contributions);
        }

        // GET: /api/v1/users/experts
        [HttpGet("experts")]
        public ActionResult<List<UserProfileDto>> GetExperts()
        {
            // TODO: Lấy list top experts (role=Expert, sort by points)
            var experts = new List<UserProfileDto>
            {
                new() { Id = "exp1", FullName = "Expert 1", Role = "Expert", AvatarUrl = "..." },
                new() { Id = "exp2", FullName = "Expert 2", Role = "Expert", AvatarUrl = "..." }
            };

            return Ok(experts);
        }
    }
}
