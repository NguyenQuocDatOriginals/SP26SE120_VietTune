using System;

namespace VietTuneArchive.Application.Mapper.DTOs
{
    public class SubmissionDto
    {
        public string AudioFileUrl { get; set; }
        public Guid UploadedById { get; set; }
    }
}
