namespace VietTuneArchive.Application.Mapper.DTOs
{
    public class ReviewDto
    {

        public class ReviewStatsDto
        {
            public int PendingCount { get; set; }
            public int InProgressCount { get; set; }
            public int CompletedToday { get; set; }
            public string AvgTime { get; set; } = default!;
        }

        public class ReviewQueueItemDto
        {
            public string ReviewId { get; set; } = default!;
            public string SubmissionTitle { get; set; } = default!;
            public string SubmittedBy { get; set; } = default!;
            public DateTime AssignedAt { get; set; }
        }

        public class ReviewDetailDto
        {
            public string Id { get; set; } = default!;
            public string SubmissionId { get; set; } = default!;
            public string Status { get; set; } = default!;
            public DateTime AssignedAt { get; set; }
            public SubmissionSummaryDto Submission { get; set; } = default!;
        }

        public class ReviewDecisionDto
        {
            public string ReviewId { get; set; } = default!;
            public string Action { get; set; } = default!;
            public DateTime? CompletedAt { get; set; }
            public string? Reason { get; set; }
            public string? Feedback { get; set; }
        }

        public class ReviewSummaryDto
        {
            public string Id { get; set; } = default!;
            public string SubmissionTitle { get; set; } = default!;
            public string Status { get; set; } = default!;
            public DateTime CompletedAt { get; set; }
        }

        public class ReviewHistoryDto
        {
            public string Action { get; set; } = default!;
            public DateTime Timestamp { get; set; }
            public string PerformedBy { get; set; } = default!;
        }

        public class ReviewStatisticsDto
        {
            public int TotalReviewed { get; set; }
            public int Approved { get; set; }
            public int Rejected { get; set; }
            public double AvgRating { get; set; }
        }

        public class SubmissionSummaryDto
        {
            public string Id { get; set; } = default!;
            public string Title { get; set; } = default!;
        }
    }
}
