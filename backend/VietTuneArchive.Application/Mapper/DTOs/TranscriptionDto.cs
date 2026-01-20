using System;

namespace VietTuneArchive.Application.Mapper.DTOs
{
    public class TranscriptionDto
    {
        public string SubmissionId { get; set; } = default!;
        public string Content { get; set; } = default!;
        public string Language { get; set; } = "vi-VN";
        public string Status { get; set; } = default!;  // Draft, Auto, Verified, Rejected
        public string Version { get; set; } = default!;
        public DateTime UpdatedAt { get; set; }

        public class TranscriptionJobDto
        {
            public string Id { get; set; } = default!;
            public string SubmissionId { get; set; } = default!;
            public string Status { get; set; } = default!;  // Processing, Completed, Failed
            public int Progress { get; set; }
            public string Language { get; set; } = default!;
            public DateTime RequestedAt { get; set; }
        }

        public class TranscriptionVersionDto
        {
            public string Version { get; set; } = default!;
            public string Content { get; set; } = default!;
            public DateTime UpdatedAt { get; set; }
            public string UpdatedBy { get; set; } = default!;
        }
    }
}
