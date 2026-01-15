using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VietTuneArchive.Domain.Models
{
    public class AudioAnalysisResponse
    {
        public bool Success { get; set; }
        public TempoAnalysis? Tempo { get; set; }
        public TonalAnalysis? Tonal { get; set; }
        public List<string> Instruments { get; set; } = new();
        public EthnicGroupAnalysis? EthnicGroup { get; set; }
        public VoiceAnalysis? VoicePresence { get; set; }
        public AudioQuality? AudioQuality { get; set; }
        public string? Filename { get; set; }
        public string? Error { get; set; }
        public string? Code { get; set; }
    }

    public class TempoAnalysis
    {
        public double BPM { get; set; }
        public List<double> Ticks { get; set; } = new();
        public List<double> Estimates { get; set; } = new();
        public List<double> BPMIntervals { get; set; } = new();
    }

    public class TonalAnalysis
    {
        public string? Key { get; set; }
        public string? Scale { get; set; }
        public double KeyStrength { get; set; }
        public List<double> HPCPFeatures { get; set; } = new();
    }

    public class EthnicGroupAnalysis
    {
        public string? Primary { get; set; }
        public double Confidence { get; set; }
        public Dictionary<string, double> AllScores { get; set; } = new();
    }

    public class VoiceAnalysis
    {
        public bool HasVoice { get; set; }
        public double Confidence { get; set; }
    }

    public class AudioQuality
    {
        public double Score { get; set; }
        public List<string> Issues { get; set; } = new();
    }
}
