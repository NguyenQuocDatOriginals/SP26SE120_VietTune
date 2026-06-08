using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.DTOs;
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

        [HttpGet("node/{id}")]
        public async Task<ActionResult<GraphExplorerNodeDetailDto>> GetNodeDetail(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { message = "Id is required." });
            }

            var result = await _explorerService.GetNodeDetailAsync(id);
            if (result == null)
            {
                return NotFound(new { message = $"Node not found with ID {id}" });
            }

            return Ok(result);
        }

        [HttpGet("shortest-path")]
        public async Task<ActionResult<GraphExplorerPathResponseDto>> GetShortestPath(
            [FromQuery] string fromId,
            [FromQuery] string toId,
            [FromQuery] int maxDepth = 6)
        {
            if (string.IsNullOrWhiteSpace(fromId) || string.IsNullOrWhiteSpace(toId))
            {
                return BadRequest(new { message = "fromId and toId are required." });
            }

            if (fromId == toId)
            {
                return BadRequest(new { message = "fromId and toId must be different." });
            }

            var result = await _explorerService.GetShortestPathAsync(fromId, toId, maxDepth);
            return Ok(result);
        }

        private static readonly HashSet<string> ValidGroups = new(System.StringComparer.OrdinalIgnoreCase)
        {
            "EthnicGroup", "Instrument", "Recording", "Ceremony", "Province", "VocalStyle", "MusicalScale", "Tag", "Location"
        };

        [HttpGet("top-connected")]
        public async Task<ActionResult<TopConnectedNodesResponseDto>> GetTopConnected(
            [FromQuery] string? group = null,
            [FromQuery] int limit = 10)
        {
            if (limit < 1 || limit > 100)
            {
                return BadRequest(new { message = "Limit must be between 1 and 100." });
            }

            if (!string.IsNullOrEmpty(group) && !ValidGroups.Contains(group))
            {
                return BadRequest(new { message = $"Invalid group label. Valid labels are: {string.Join(", ", ValidGroups)}" });
            }

            var result = await _explorerService.GetTopConnectedNodesAsync(group, limit);
            return Ok(result);
        }

        [HttpPost("shortest-paths-multi")]
        public async Task<ActionResult<MultiShortestPathResponseDto>> GetMultiShortestPath(
            [FromBody] MultiShortestPathRequestDto request,
            System.Threading.CancellationToken ct = default)
        {
            if (request == null || request.NodeIds == null)
            {
                return BadRequest(new { message = "Request body is required." });
            }

            if (request.NodeIds.Count < 2 || request.NodeIds.Count > 10)
            {
                return BadRequest(new { message = "NodeIds must contain between 2 and 10 elements." });
            }

            if (request.NodeIds.Distinct().Count() != request.NodeIds.Count)
            {
                return BadRequest(new { message = "NodeIds must be unique." });
            }

            if (request.MaxDepth < 1 || request.MaxDepth > 10)
            {
                return BadRequest(new { message = "MaxDepth must be between 1 and 10." });
            }

            try
            {
                var result = await _explorerService.GetMultiShortestPathAsync(request.NodeIds, request.MaxDepth);
                return Ok(result);
            }
            catch (System.OperationCanceledException)
            {
                return StatusCode(408, new { message = "Shortest path search timed out. Try lowering maxDepth." });
            }
        }

        [HttpGet("common-points")]
        public async Task<ActionResult<CommonPointsResponseDto>> GetCommonPoints(
            [FromQuery] string nodeId1,
            [FromQuery] string nodeId2,
            [FromQuery] int maxDepth = 2)
        {
            if (string.IsNullOrWhiteSpace(nodeId1) || string.IsNullOrWhiteSpace(nodeId2))
            {
                return BadRequest(new { message = "nodeId1 and nodeId2 are required." });
            }

            if (nodeId1 == nodeId2)
            {
                return BadRequest(new { message = "nodeId1 and nodeId2 must be different." });
            }

            if (maxDepth < 1 || maxDepth > 3)
            {
                return BadRequest(new { message = "MaxDepth must be between 1 and 3." });
            }

            var result = await _explorerService.GetCommonPointsAsync(nodeId1, nodeId2, maxDepth);
            return Ok(result);
        }
    }
}
