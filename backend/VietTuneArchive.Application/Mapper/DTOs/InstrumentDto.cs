using System;

namespace VietTuneArchive.Application.Mapper.DTOs
{
    public class InstrumentDto
    {
        // ✅ Root level DTO for mapping
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // ✅ Nested DTOs for specialized responses
        public class InstrumentSummaryDto
        {
            public string Id { get; set; } = default!;
            public string Name { get; set; } = default!;
            public string Category { get; set; } = default!;
            public string[] EthnicGroups { get; set; } = default!;
            public string ImageUrl { get; set; } = default!;
        }

        public class InstrumentDetailDto : InstrumentSummaryDto
        {
            public string Description { get; set; } = default!;
            public string PlayingTechnique { get; set; } = default!;
            public string Range { get; set; } = default!;
        }
    }
}
