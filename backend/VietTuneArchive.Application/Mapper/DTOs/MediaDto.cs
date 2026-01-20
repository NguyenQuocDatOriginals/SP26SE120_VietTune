using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VietTuneArchive.Application.Mapper.DTOs
{
    public class MediaDto
    {
        public class MediaFileDto
        {
            public string Id { get; set; } = default!;
            public string SubmissionId { get; set; } = default!;
            public string FileName { get; set; } = default!;
            public long FileSize { get; set; }
            public string MimeType { get; set; } = default!;
            public string UploadUrl { get; set; } = default!;
            public bool IsPrimary { get; set; }
            public DateTime UploadedAt { get; set; }
        }

        public class MediaFileDetailDto : MediaFileDto
        {
            public string? Duration { get; set; }  // cho audio/video
            public string? ThumbnailUrl { get; set; }
            public object Metadata { get; set; } = default!;
        }
    }
}
