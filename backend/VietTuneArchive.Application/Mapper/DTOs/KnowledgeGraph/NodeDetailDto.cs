using System.Collections.Generic;

namespace VietTuneArchive.Application.Mapper.DTOs.KnowledgeGraph
{
    public class NodeDetailDto
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string? Description { get; set; }

        public NodeStatsDto Stats { get; set; } = new();

        public List<NodeRelationGroupDto> RelationGroups { get; set; } = new();

        public Dictionary<string, object?>? Properties { get; set; }
    }

    public class NodeStatsDto
    {
        public int TotalConnections { get; set; }
        public int TotalRecordings { get; set; }
        public int TotalArtists { get; set; } // If applicable
        public int DirectNeighbors { get; set; }
    }

    public class NodeRelationGroupDto
    {
        public string RelationType { get; set; } = string.Empty;
        public string RelationLabel { get; set; } = string.Empty;
        public int Count { get; set; }
        public List<NodeSummaryDto> Samples { get; set; } = new();
    }

    public class NodeSummaryDto
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
    }
}
