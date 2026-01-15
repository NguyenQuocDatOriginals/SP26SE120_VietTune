using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VietTuneArchive.Domain.Models
{
    public class EssentiaAnalysisResult
    {
        public bool Success { get; set; }
        public TempoData? Tempo { get; set; }
        public TonalData? Tonal { get; set; }
        public List<string> Instruments { get; set; } = new();
        public EthnicData? EthnicGroup { get; set; }
        public VoiceData? VoicePresence { get; set; }
        public QualityData? AudioQuality { get; set; }
        public string? Filename { get; set; }
        public string? Error { get; set; }
        public string? Code { get; set; }
    }

    public class TempoData
    {
        public double Bpm { get; set; }
        public List<double> Ticks { get; set; } = new();
        public List<double> Estimates { get; set; } = new();
        public List<double> BpmIntervals { get; set; } = new();
    }

    public class TonalData
    {
        public string? Key { get; set; }
        public string? Scale { get; set; }
        public double KeyStrength { get; set; }
        public List<double> HppcFeatures { get; set; } = new();
    }

    public class EthnicData
    {
        public string? Primary { get; set; }
        public double Confidence { get; set; }
        public Dictionary<string, double> AllScores { get; set; } = new();
    }

    public class VoiceData
    {
        public bool HasVoice { get; set; }
        public double Confidence { get; set; }
    }

    public class QualityData
    {
        public double Score { get; set; }
        public List<string> Issues { get; set; } = new();
    }
}
