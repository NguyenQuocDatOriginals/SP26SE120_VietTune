using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace VietTuneArchive.Domain.Models
{
    public class AudioAnalysisRequest
    {
        public IFormFile? AudioFile { get; set; }
        public string? Title { get; set; }
        public string? Artist { get; set; }
    }
}
