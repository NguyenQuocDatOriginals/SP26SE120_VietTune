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
}
