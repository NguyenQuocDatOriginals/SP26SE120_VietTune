using System;

namespace VietTuneArchive.Application.Mapper.DTOs
{
    public class SongDto
    {
        public class SongSummaryDto
        {
            public string Id { get; set; } = default!;
            public string Title { get; set; } = default!;
            public string EthnicGroup { get; set; } = default!;
            public string CoverUrl { get; set; } = default!;
            public double Rating { get; set; }
            public int Views { get; set; }
        }

        public class SongDetailDto : SongSummaryDto
        {
            public string Artist { get; set; } = default!;
            public string Region { get; set; } = default!;
            public string Duration { get; set; } = default!;
            public DateTime PublishedAt { get; set; }
            public string Description { get; set; } = default!;
        }

        public class MediaFileDto
        {
            public string Id { get; set; } = default!;
            public string Type { get; set; } = default!;  // Audio, Video
            public string Url { get; set; } = default!;
            public bool IsPrimary { get; set; }
        }

        public class TranscriptionDto
        {
            public string Content { get; set; } = default!;
            public string Language { get; set; } = "vi-VN";
        }

        public class AnnotationDto
        {
            public string Id { get; set; } = default!;
            public double TimeStart { get; set; }
            public string Content { get; set; } = default!;
        }

    }
}
