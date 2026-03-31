using System;
using System.Collections.Generic;

namespace VietTuneArchive.Application.Mapper.DTOs
{
    public class InstrumentDetectionResponse
    {
        public string PredictedInstrument { get; set; } = string.Empty;
        public float Confidence { get; set; }
        public List<ClassScoreDto> AllScores { get; set; } = new();
        public int ChunksAnalyzed { get; set; }
        public float AudioDurationSeconds { get; set; }
    }

    public class ClassScoreDto
    {
        public string ClassName { get; set; } = string.Empty;
        public float Score { get; set; }
    }

    public class RecordingAnalysisResponse
    {
        public Guid AnalysisResultId { get; set; }
        public Guid RecordingId { get; set; }
        public InstrumentDetectionResponse Detection { get; set; } = new();
        public DateTime AnalyzedAt { get; set; }
    }
}
