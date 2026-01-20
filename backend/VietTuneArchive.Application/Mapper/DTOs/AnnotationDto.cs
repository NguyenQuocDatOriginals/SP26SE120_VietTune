using System;

namespace VietTuneArchive.Application.Mapper.DTOs
{
    public class AnnotationDto
    {
        public string Id { get; set; } = default!;
        public string SubmissionId { get; set; } = default!;
        public double TimeStart { get; set; }  // seconds
        public double TimeEnd { get; set; }
        public string Content { get; set; } = default!;
        public string Type { get; set; } = default!;  // CulturalNote, Technique, Instrument, Lyrics
        public string AuthorId { get; set; } = default!;
        public DateTime CreatedAt { get; set; }

        public class AnnotationDetailDto : AnnotationDto
        {
            public int Likes { get; set; }
            public string AuthorName { get; set; } = default!;
        }
    }
}
