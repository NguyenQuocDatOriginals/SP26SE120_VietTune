using System.Collections.Generic;
using System.Threading.Tasks;
using VietTuneArchive.Application.DTOs;

namespace VietTuneArchive.Application.IServices.IThirdPartyServices
{
    public interface IGraphExplorerService
    {
        Task<List<GraphNodeDto>> SearchNodesAsync(string keyword, string? label = null);
        Task<GraphResponseDto> ExpandNodeAsync(string sourceId, string? targetLabel = null, string? relationshipType = null);
        Task<GraphExplorerNodeDetailDto?> GetNodeDetailAsync(string id);
        Task<GraphExplorerPathResponseDto> GetShortestPathAsync(string fromId, string toId, int maxDepth);
        Task<GraphResponseDto> GetOverviewGraphAsync(int maxNodes = 100);
        Task<GraphResponseDto> GetRelationshipGraphAsync(string sourceType, string targetType, int limit = 100);
    }
}
