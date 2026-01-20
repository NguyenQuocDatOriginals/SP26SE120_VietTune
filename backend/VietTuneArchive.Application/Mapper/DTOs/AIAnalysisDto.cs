using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VietTuneArchive.Application.Mapper.DTOs
{
    public class AIAnalysisDto
    {
        public class AIAnalysisJobDto
        {
            public string Id { get; set; } = default!;
            public string MediaFileId { get; set; } = default!;
            public string Status { get; set; } = default!;
            public int Progress { get; set; }  // 0-100
            public string? Error { get; set; }
            public DateTime RequestedAt { get; set; }
        }

        public class AIAnalysisResultDto
        {
            public string MediaFileId { get; set; } = default!;
            public int Bpm { get; set; }
            public string Key { get; set; } = default!;
            public string Genre { get; set; } = default!;
            public string Tempo { get; set; } = default!;
            public string[] InstrumentsDetected { get; set; } = default!;
            public string Transcription { get; set; } = default!;
            public float Confidence { get; set; }
            public DateTime AnalyzedAt { get; set; }
        }

        public class MetadataSuggestionDto
        {
            public string EthnicGroupId { get; set; } = default!;
            public string RegionId { get; set; } = default!;
            public string MusicGenreId { get; set; } = default!;
            public string[] Instruments { get; set; } = default!;
            public string EventTypeId { get; set; } = default!;
            public float Confidence { get; set; }
        }
    }
}
