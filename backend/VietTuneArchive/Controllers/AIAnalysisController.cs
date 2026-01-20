using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static VietTuneArchive.Application.Mapper.DTOs.AIAnalysisDto;
using static VietTuneArchive.Application.Mapper.DTOs.Request.AIAnalysisRequest;

namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AIAnalysisController : ControllerBase
    {
        private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

        // POST: /api/v1/ai-analysis/media/{mediaFileId}/analyze
        [HttpPost("media/{mediaFileId}/analyze")]
        [Authorize(Policy = "Owner")]
        public async Task<ActionResult<AIAnalysisJobDto>> AnalyzeMedia(string mediaFileId,
            [FromBody] AnalyzeRequest request)
        {
            // TODO: Queue job async (Hangfire/BgTask) gọi AI service:
            // - Speech-to-text, BPM detection, key/chord recognition, genre classification
            var job = new AIAnalysisJobDto
            {
                Id = "ai-job-001",
                MediaFileId = mediaFileId,
                Status = "Processing",
                RequestedAt = DateTime.UtcNow,
                Progress = 0
            };
            // Start background job...

            return Accepted(job);  // 202 Accepted cho async job
        }

        // GET: /api/v1/ai-analysis/media/{mediaFileId}/result
        [HttpGet("media/{mediaFileId}/result")]
        [Authorize(Policy = "Owner")]
        public ActionResult<AIAnalysisResultDto> GetAnalysisResult(string mediaFileId)
        {
            // TODO: Lấy kết quả từ DB/cache khi Status=Completed
            var result = new AIAnalysisResultDto
            {
                MediaFileId = mediaFileId,
                Bpm = 120,
                Key = "C Major",
                Genre = "Dân gian",
                Tempo = "Medium",
                InstrumentsDetected = new[] { "Đàn bầu", "Sáo" },
                Transcription = "Phiên âm lời bài hát tự động...",
                Confidence = 0.92f,
                AnalyzedAt = DateTime.UtcNow
            };
            return Ok(result);
        }

        // GET: /api/v1/ai-analysis/media/{mediaFileId}/status
        [HttpGet("media/{mediaFileId}/status")]
        [Authorize(Policy = "Owner")]
        public ActionResult<AIAnalysisJobDto> GetAnalysisStatus(string mediaFileId)
        {
            // TODO: Poll status từ job queue/DB
            var status = new AIAnalysisJobDto
            {
                MediaFileId = mediaFileId,
                Status = "Completed",  // Pending, Processing, Completed, Failed
                Progress = 100,
                Error = null
            };
            return Ok(status);
        }

        // POST: /api/v1/ai-analysis/media/{mediaFileId}/transcribe
        [HttpPost("media/{mediaFileId}/transcribe")]
        [Authorize(Policy = "Owner")]
        public async Task<ActionResult<TranscriptionJobDto>> Transcribe(string mediaFileId)
        {
            // TODO: Gọi Speech-to-Text AI (Azure Cognitive / Google Cloud Speech / Whisper)
            var job = new TranscriptionJobDto
            {
                Id = "transcribe-001",
                MediaFileId = mediaFileId,
                Status = "Processing",
                Language = "vi-VN"  // Detect hoặc specify
            };
            return Accepted(job);
        }

        // POST: /api/v1/ai-analysis/suggest-metadata
        [HttpPost("suggest-metadata")]
        [Authorize(Policy = "Owner")]
        public ActionResult<MetadataSuggestionDto> SuggestMetadata([FromBody] SuggestMetadataRequest request)
        {
            // TODO: AI gợi ý metadata dựa audio features + context
            var suggestion = new MetadataSuggestionDto
            {
                EthnicGroupId = "2",  // Tày
                RegionId = "1",       // Bắc Bộ
                MusicGenreId = "1",   // Dân gian
                Instruments = new[] { "Đàn tính", "Sli" },
                EventTypeId = "1",    // Lễ hội
                Confidence = 0.87f
            };
            return Ok(suggestion);
        }
    }

}
