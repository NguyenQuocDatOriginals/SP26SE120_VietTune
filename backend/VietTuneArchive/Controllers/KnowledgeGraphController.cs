using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Mapper.DTOs.KnowledgeGraph;

namespace VietTuneArchive.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class KnowledgeGraphController : ControllerBase
    {
        private readonly IKnowledgeGraphService _graphService;

        public KnowledgeGraphController(IKnowledgeGraphService graphService)
        {
            _graphService = graphService;
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

            var result = await _graphService.ExploreNodeAsync(request);
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
            var result = await _graphService.GetOverviewGraphAsync(maxNodes);
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

            var result = await _graphService.GetRelationshipGraphAsync(source, target, limit);
            return Ok(result);
        }

        /// <summary>
        /// Lấy thông tin chi tiết của 1 node — dùng cho Info Panel khi user click vào node.
        /// </summary>
        [HttpGet("node/{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<NodeDetailDto>> GetNodeDetail(
            string id, 
            [FromQuery] string nodeType)
        {
            if (!System.Guid.TryParse(id, out var guid))
            {
                return BadRequest("Invalid ID format.");
            }

            var allowedTypes = new HashSet<string>
            {
                "EthnicGroup", "Instrument", "Ceremony", "Recording", "Province", "VocalStyle", "MusicalScale", "Tag"
            };

            if (string.IsNullOrWhiteSpace(nodeType) || !allowedTypes.Contains(nodeType))
            {
                return BadRequest("Invalid node type.");
            }

            var result = await _graphService.GetNodeDetailAsync(guid, nodeType);
            if (result == null)
            {
                return NotFound($"Node not found with ID {id} and Type {nodeType}.");
            }

            return Ok(result);
        }

        /// <summary>
        /// Tìm đường đi ngắn nhất giữa 2 node.
        /// </summary>
        [HttpGet("shortest-path")]
        [AllowAnonymous]
        public async Task<ActionResult<ShortestPathResponseDto>> GetShortestPath(
            [FromQuery] string fromId,
            [FromQuery] string fromType,
            [FromQuery] string toId,
            [FromQuery] string toType,
            [FromQuery] int maxDepth = 6)
        {
            if (!System.Guid.TryParse(fromId, out var fromGuid) || !System.Guid.TryParse(toId, out var toGuid))
            {
                return BadRequest("Invalid ID format for fromId or toId.");
            }

            if (fromGuid == toGuid)
            {
                return BadRequest("fromId and toId must be different.");
            }

            var allowedTypes = new HashSet<string>
            {
                "EthnicGroup", "Instrument", "Ceremony", "Recording", "Province", "VocalStyle", "MusicalScale", "Tag"
            };

            if (string.IsNullOrWhiteSpace(fromType) || !allowedTypes.Contains(fromType) ||
                string.IsNullOrWhiteSpace(toType) || !allowedTypes.Contains(toType))
            {
                return BadRequest("Invalid node type.");
            }

            if (maxDepth < 1 || maxDepth > 10)
            {
                return BadRequest("maxDepth must be between 1 and 10.");
            }

            var result = await _graphService.GetShortestPathAsync(fromGuid, fromType, toGuid, toType, maxDepth);
            return Ok(result);
        }
    }
}
