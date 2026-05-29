namespace VietTuneArchive.Application.Mapper.DTOs
{
    public class RecordingFilterDto
    {
        public Guid? EthnicGroupId { get; set; }
        public Guid? InstrumentId { get; set; }
        public Guid? CeremonyId { get; set; }
        public string? RegionCode { get; set; }
        public Guid? CommuneId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortOrder { get; set; } = "desc"; // asc or desc
    }

    public class RecordingFilterMultiDto
    {
        public List<Guid> EthnicGroupIds { get; set; } = new List<Guid>();
        public List<Guid> InstrumentIds { get; set; } = new List<Guid>();
        public List<Guid> CeremonyIds { get; set; } = new List<Guid>();
        public List<string> RegionCodes { get; set; } = new List<string>();
        public List<Guid> CommuneIds { get; set; } = new List<Guid>();
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortOrder { get; set; } = "desc"; // asc or desc
    }
}
