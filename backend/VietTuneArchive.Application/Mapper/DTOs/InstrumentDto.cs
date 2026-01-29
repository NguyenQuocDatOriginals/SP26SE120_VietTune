namespace VietTuneArchive.Application.Mapper.DTOs
{
    public class InstrumentDto
    {
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
