using System.Collections.Generic;

namespace VietTuneArchive.Application.DTOs
{
    public class GraphNodeDto
    {
        public string Id { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
    }

    public class GraphLinkDto
    {
        public string Source { get; set; } = string.Empty;
        public string Target { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
    }

    public class GraphResponseDto
    {
        public List<GraphNodeDto> Nodes { get; set; } = new List<GraphNodeDto>();
        public List<GraphLinkDto> Links { get; set; } = new List<GraphLinkDto>();
    }

    public class GraphExplorerNodeDetailDto
    {
        public string Id { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
        public Dictionary<string, object>? Properties { get; set; }
        public int DegreeCount { get; set; }
        public List<GraphExplorerNeighborSummaryDto> Neighbors { get; set; } = new();
    }

    public class GraphExplorerNeighborSummaryDto
    {
        public string Id { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
        public string RelationType { get; set; } = string.Empty;
        public string Direction { get; set; } = string.Empty; // "IN" | "OUT" | "BOTH"
    }

    public class GraphExplorerPathResponseDto : GraphResponseDto
    {
        public bool PathFound { get; set; }
        public int? PathLength { get; set; }
    }

    public class TopConnectedNodesResponseDto
    {
        public string? Group { get; set; }
        public int Limit { get; set; }
        public List<ConnectedNodeRankDto> RankList { get; set; } = new();
    }

    public class ConnectedNodeRankDto
    {
        public string Id { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
        public int DegreeCount { get; set; }
    }

    public class MultiShortestPathRequestDto
    {
        public List<string> NodeIds { get; set; } = new();
        public int MaxDepth { get; set; } = 6;
    }

    public class MultiShortestPathResponseDto
    {
        public List<PairPathResultDto> Pairs { get; set; } = new();
    }

    public class PairPathResultDto
    {
        public string FromId { get; set; } = string.Empty;
        public string ToId { get; set; } = string.Empty;
        public bool PathFound { get; set; }
        public int? PathLength { get; set; }
        public List<GraphNodeDto> Nodes { get; set; } = new();
        public List<GraphLinkDto> Links { get; set; } = new();
    }

    public class CommonPointsResponseDto
    {
        public string NodeId1 { get; set; } = string.Empty;
        public string NodeId2 { get; set; } = string.Empty;
        public int MaxDepth { get; set; }
        public int CommonNodesCount { get; set; }
        public List<GraphNodeDto> Nodes { get; set; } = new();
        public List<GraphLinkDto> Links { get; set; } = new();
    }
}
