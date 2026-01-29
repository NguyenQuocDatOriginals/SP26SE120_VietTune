using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.IServices;
using static VietTuneArchive.Application.Mapper.DTOs.AIAnalysisDto;

namespace VietTuneArchive.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AudioController : ControllerBase
    {
        private readonly IAudioProcessingService _processingService;
        private readonly ILogger<AudioController> _logger;

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anonymous";

        public AudioController(
            IAudioProcessingService processingService,
            ILogger<AudioController> logger)
        {
            _processingService = processingService;
            _logger = logger;
        }

        // CHỨC NĂNG 1: CHỈ UPLOAD LÊN CLOUD ĐỂ LƯU TRỮ
        [HttpPost("upload-to-cloud")]
        [AllowAnonymous]
        public async Task<ActionResult<UploadResultDto>> UploadToCloud(IFormFile audioFile)
        {
            // Gọi service xử lý upload (Ví dụ lên Cloudinary)
            // Kết quả trả về link PublicUrl để user có thể nghe ngay lập tức
            var result = await _processingService.UploadToCloudAsync(audioFile, UserId);
            return Ok(result);
        }

        // CHỨC NĂNG 2: CHỈ PHÂN TÍCH AI (TRẢ VỀ KẾT QUẢ + URL TẠM CỦA GEMINI)
        [HttpPost("analyze-only")]
        [AllowAnonymous]
        public async Task<ActionResult<AIAnalysisResultDto>> AnalyzeOnly(IFormFile audioFile)
        {
            // Service này sẽ upload lên Gemini File API và đợi ACTIVE
            // Sau đó trả về kết quả phân tích kèm theo link nội bộ của Gemini (nếu cần)
            var result = await _processingService.AnalyzeAudioAsync(audioFile);
            return Ok(result);
        }
    }
}
