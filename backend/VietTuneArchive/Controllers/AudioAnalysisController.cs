using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.Services;
using VietTuneArchive.Domain.Models;

namespace VietTuneArchive.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AudioAnalysisController : ControllerBase
    {
        private readonly AudioAnalysisService _audioAnalysisService;
        private readonly ILogger<AudioAnalysisController> _logger;

        public AudioAnalysisController(
            AudioAnalysisService audioAnalysisService,
            ILogger<AudioAnalysisController> logger)
        {
            _audioAnalysisService = audioAnalysisService;
            _logger = logger;
        }

        /// <summary>
        /// Analyze uploaded audio file to extract metadata
        /// </summary>
        /// <remarks>
        /// Analyzes audio file and returns:
        /// - Tempo (BPM)
        /// - Key & Scale
        /// - Detected Instruments
        /// - Ethnic Group Recommendation
        /// - Voice Presence
        /// - Audio Quality Assessment
        /// </remarks>
        [HttpPost("analyze")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(AudioAnalysisResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<AudioAnalysisResponse>> AnalyzeAudio(
          AudioAnalysisRequest request)
        {
            try
            {
                _logger.LogInformation($"Received audio analysis request: {request.AudioFile?.FileName}");

                var result = await _audioAnalysisService.AnalyzeAudioAsync(request.AudioFile, request.Title, request.Artist);

                if (!result.Success)
                {
                    return BadRequest(new ErrorResponse
                    {
                        Error = result.Error,
                        Code = result.Code
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in AnalyzeAudio: {ex.Message}");
                return StatusCode(500, new ErrorResponse
                {
                    Error = "Internal server error",
                    Code = "INTERNAL_ERROR"
                });
            }
        }

        /// <summary>
        /// Health check endpoint
        /// </summary>
        [HttpGet("health")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public ActionResult<object> Health()
        {
            return Ok(new
            {
                status = "ok",
                service = "music-heritage-api",
                timestamp = DateTime.UtcNow
            });
        }
    }
}
