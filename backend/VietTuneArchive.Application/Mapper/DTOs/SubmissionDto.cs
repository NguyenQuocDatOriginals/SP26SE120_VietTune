namespace VietTuneArchive.Application.Mapper.DTOs
{
    public class SubmissionDto
    {
        public string Id { get; set; } = default!;
        public string UserId { get; set; } = default!;
        public string Title { get; set; } = default!;
        public string Status { get; set; } = default!;  // Draft, PendingReview, InReview, Approved, Rejected
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public class BasicInfoDto { /* title, artist, duration, etc. */ }
        public class CulturalContextDto { /* ethnic, region, story, etc. */ }
        public class AdditionalInfoDto { /* notes */ }
        public class CopyrightInfoDto { /* license, owner */ }
        public class InstrumentDto { public string Id { get; set; } = default!; public string Name { get; set; } = default!; }


        public class SubmissionDetailDto : SubmissionDto
        {
        }

        public class SubmissionStatusDto
        {
            public string Status { get; set; } = default!;
            public List<TimelineItemDto> Timeline { get; set; } = new();
        }

        public class TimelineItemDto
        {
            public string Step { get; set; } = default!;
            public DateTime Date { get; set; }
            public string Note { get; set; } = default!;
        }

        public class SubmissionHistoryDto { /* version, changes */ }

        public class FeedbackDto { public string FromExpertId { get; set; } = default!; public string Comment { get; set; } = default!; }

        public class SubmissionStatsDto
        {
            public int Total { get; set; }
            public int Drafts { get; set; }
            public int Submitted { get; set; }
            public int Approved { get; set; }
        }
    }
}
