using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static VietTuneArchive.Application.Mapper.DTOs.AnalyticsDto;

namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class AnalyticsController : ControllerBase
    {
        // GET: /api/analytics/overview?from=2026-01-01&to=2026-01-31
        [HttpGet("overview")]
        

        public ActionResult<OverviewMetricsDto> GetOverview(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
        {
            var metrics = new OverviewMetricsDto
            {
                TotalSongs = 1250,
                TotalViews = 1_250_000,
                ActiveUsers = 4500,
                NewSubmissions = 125,
                GrowthRate = 12.5  // % monthly
            };
            return Ok(metrics);
        }

        // GET: /api/analytics/submissions?status=approved&from=2026-01-01
        [HttpGet("submissions")]
        //[Authorize(Policy = "Admin")]
        public ActionResult<SubmissionAnalyticsDto> GetSubmissionAnalytics(
            [FromQuery] string? status = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
        {
            var analytics = new SubmissionAnalyticsDto
            {
                Total = 850,
                ByStatus = new Dictionary<string, int>
                {
                    ["Approved"] = 650,
                    ["Pending"] = 120,
                    ["Rejected"] = 80
                },
                AvgReviewTime = "3.2 days",
                TopEthnicGroups = new[] { "Kinh: 45%", "Tày: 18%" }
            };
            return Ok(analytics);
        }

        // GET: /api/analytics/coverage?ethnic=all
        [HttpGet("coverage")]
        //[Authorize(Policy = "Expert")]
        public ActionResult<CoverageAnalyticsDto> GetCoverage([FromQuery] string? ethnic = null)
        {
            var coverage = new CoverageAnalyticsDto
            {
                EthnicGroups = new List<EthnicCoverageDto>
                {
                    new() { Name = "Kinh", Coverage = 92.5, Songs = 650 },
                    new() { Name = "Tày", Coverage = 45.2, Songs = 98 },
                    new() { Name = "H'Mông", Coverage = 12.1, Songs = 15 }
                },
                Gaps = new[] { "Ê Đê", "Chăm", "Ba Na" }
            };
            return Ok(coverage);
        }

        // GET: /api/analytics/contributors?limit=10
        [HttpGet("contributors")]
        //[Authorize(Policy = "Admin")]
        public ActionResult<List<ContributorDto>> GetTopContributors([FromQuery] int limit = 10)
        {
            var contributors = new List<ContributorDto>
            {
                new() { UserId = "user-001", Name = "Nguyễn Văn A", Songs = 45, Reviews = 120 },
                new() { UserId = "user-002", Name = "Trần Thị B", Songs = 32, Reviews = 85 }
            };
            return Ok(contributors);
        }

        // GET: /api/analytics/experts?period=30d
        [HttpGet("experts")]
        //[Authorize(Policy = "Admin")]
        public ActionResult<List<ExpertPerformanceDto>> GetExpertPerformance(
            [FromQuery] string? period = "30d")
        {
            var experts = new List<ExpertPerformanceDto>
            {
                new() { ExpertId = "exp-001", Name = "TS. Lê Văn C", Reviews = 50, Accuracy = 94.2, AvgTime = "2.1d" },
                new() { ExpertId = "exp-002", Name = "TS. Phạm Thị D", Reviews = 38, Accuracy = 89.5, AvgTime = "3.8d" }
            };
            return Ok(experts);
        }

        // GET: /api/analytics/content?type=songs
        [HttpGet("content")]
        //[Authorize(Policy = "Expert")]
        public ActionResult<ContentAnalyticsDto> GetContentAnalytics([FromQuery] string? type = "songs")
        {
            var analytics = new ContentAnalyticsDto
            {
                TotalSongs = 1250,
                ByEthnicity = new Dictionary<string, int>(),
                ByRegion = new Dictionary<string, int>(),
                MostViewedSongs = new List<string>()
            };
            return Ok(analytics);
        }
    }
}