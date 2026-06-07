using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.IServices.IThirdPartyServices;
using VietTuneArchive.Application.DTOs;
using VietTuneArchive.Application.Mapper.DTOs.KnowledgeGraph;

namespace VietTuneArchive.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class KnowledgeGraphController : ControllerBase
    {
        private readonly IKnowledgeGraphService _graphService;
        private readonly IGraphExplorerService _graphExplorerService;

        public KnowledgeGraphController(
            IKnowledgeGraphService graphService,
            IGraphExplorerService graphExplorerService)
        {
            _graphService = graphService;
            _graphExplorerService = graphExplorerService;
        }

        /// <summary>
        /// Explore graph từ một node trung tâm — trả về subgraph xung quanh node đó.
        /// </summary>
        [HttpPost("explore")]
        [AllowAnonymous]
        public async Task<IActionResult> ExploreNode([FromBody] GraphExploreRequest request)
        {
            if (string.IsNullOrEmpty(request.NodeId) || string.IsNullOrEmpty(request.NodeType))
                return BadRequest("NodeId and NodeType are required.");

            // Redirect to Neo4j
            var result = await _graphExplorerService.ExpandNodeAsync(request.NodeId, request.NodeType, null);
            return Ok(result);
        }

        /// <summary>
        /// Tìm kiếm nodes theo keyword.
        /// </summary>
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchNodes(
            [FromQuery] string query,
            [FromQuery] string? types = null,
            [FromQuery] int limit = 20)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query is required.");

            var request = new GraphSearchRequest
            {
                Query = query,
                Limit = limit,
                Types = types?.Split(',').Select(t => t.Trim()).ToList()
            };

            var results = await _graphService.SearchNodesAsync(request);
            return Ok(results);
        }

        /// <summary>
        /// Overview graph.
        /// </summary>
        [HttpGet("overview")]
        [AllowAnonymous]
        public async Task<IActionResult> GetOverview([FromQuery] int maxNodes = 100)
        {
            var result = await _graphExplorerService.GetOverviewGraphAsync(maxNodes);
            return Ok(result);
        }

        /// <summary>
        /// Thống kê tổng quan graph.
        /// </summary>
        [HttpGet("stats")]
        [AllowAnonymous]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _graphService.GetStatsAsync();
            return Ok(stats);
        }

        /// <summary>
        /// Lấy graph giữa 2 entity types cụ thể.
        /// </summary>
        [HttpGet("relationship")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRelationship(
            [FromQuery] string source,
            [FromQuery] string target,
            [FromQuery] int limit = 100)
        {
            if (string.IsNullOrWhiteSpace(source) || string.IsNullOrWhiteSpace(target))
                return BadRequest("Source and target types are required.");

            try
            {
                var result = await _graphExplorerService.GetRelationshipGraphAsync(source, target, limit);
                return Ok(result);
            }
            catch (System.ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy thông tin chi tiết của 1 node — dùng cho Info Panel khi user click vào node.
        /// </summary>
        [HttpGet("node/{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<GraphExplorerNodeDetailDto>> GetNodeDetail(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest("ID is required.");
            }

            var result = await _graphExplorerService.GetNodeDetailAsync(id);
            if (result == null)
            {
                return NotFound($"Node not found with ID {id}.");
            }

            return Ok(result);
        }

        /// <summary>
        /// Tìm đường đi ngắn nhất giữa 2 node.
        /// </summary>
        [HttpGet("shortest-path")]
        [AllowAnonymous]
        public async Task<ActionResult<GraphExplorerPathResponseDto>> GetShortestPath(
            [FromQuery] string fromId,
            [FromQuery] string toId,
            [FromQuery] int maxDepth = 6)
        {
            if (string.IsNullOrWhiteSpace(fromId) || string.IsNullOrWhiteSpace(toId))
            {
                return BadRequest("fromId and toId are required.");
            }

            if (fromId == toId)
            {
                return BadRequest("fromId and toId must be different.");
            }

            if (maxDepth < 1 || maxDepth > 10)
            {
                return BadRequest("maxDepth must be between 1 and 10.");
            }

            var result = await _graphExplorerService.GetShortestPathAsync(fromId, toId, maxDepth);
            return Ok(result);
        }
    }
}
