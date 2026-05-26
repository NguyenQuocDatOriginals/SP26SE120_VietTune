using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.IServices.IThirdPartyServices;

namespace VietTuneArchive.API.Controllers
{
    [ApiController]
    [Route("api/graph-explorer")]
    // [Authorize] // Standard authentication protect
    public class GraphExplorerController : ControllerBase
    {
        private readonly IGraphExplorerService _explorerService;

        public GraphExplorerController(IGraphExplorerService explorerService)
        {
            _explorerService = explorerService;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string keyword, [FromQuery] string? label = null)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return BadRequest(new { message = "Keyword is required." });
            }

            try
            {
                var result = await _explorerService.SearchNodesAsync(keyword, label);
                return Ok(result);
            }
            catch (System.ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("expand")]
        public async Task<IActionResult> Expand(
            [FromQuery] string sourceId, 
            [FromQuery] string? targetLabel = null, 
            [FromQuery] string? relType = null)
        {
            if (string.IsNullOrWhiteSpace(sourceId))
            {
                return BadRequest(new { message = "SourceId is required." });
            }

            try
            {
                var result = await _explorerService.ExpandNodeAsync(sourceId, targetLabel, relType);
                return Ok(result);
            }
            catch (System.ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
