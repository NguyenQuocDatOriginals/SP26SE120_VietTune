using System.Collections.Generic;

namespace VietTuneArchive.Application.Mapper.DTOs.KnowledgeGraph
{
    public class ShortestPathResponseDto
    {
        public bool PathFound { get; set; }
        public int? PathLength { get; set; }
        public List<PathNodeDto> Nodes { get; set; } = new();
        public List<PathEdgeDto> Edges { get; set; } = new();
        public List<NodeSummaryDto>? SuggestedBridges { get; set; }
    }

    public class PathNodeDto
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public int StepIndex { get; set; }
    }

    public class PathEdgeDto
    {
        public string FromId { get; set; } = string.Empty;
        public string ToId { get; set; } = string.Empty;
        public string RelationType { get; set; } = string.Empty;
        public string RelationLabel { get; set; } = string.Empty;
    }
}
