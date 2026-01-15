using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using VietTuneArchive.Domain.Models;

namespace VietTuneArchive.Application.Services
{
    public class AudioAnalysisService
    {
        private readonly EssentiaService _essentiaService;
        private readonly ILogger<AudioAnalysisService> _logger;
        private const long MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
        private static readonly string[] ALLOWED_FORMATS = { ".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aac" };

        public AudioAnalysisService(EssentiaService essentiaService, ILogger<AudioAnalysisService> logger)
        {
            _essentiaService = essentiaService;
            _logger = logger;
        }

        public async Task<AudioAnalysisResponse> AnalyzeAudioAsync(IFormFile audioFile, string? title, string? artist)
        {
            try
            {
                // Validation
                var validation = ValidateAudioFile(audioFile);
                if (!validation.IsValid)
                {
                    return new AudioAnalysisResponse
                    {
                        Success = false,
                        Error = validation.ErrorMessage,
                        Code = validation.ErrorCode
                    };
                }

                _logger.LogInformation($"Analyzing audio: {audioFile.FileName}");

                // Call Essentia service
                var essentiaResult = await _essentiaService.AnalyzeAudioAsync(audioFile);

                if (!essentiaResult.Success)
                {
                    return new AudioAnalysisResponse
                    {
                        Success = false,
                        Error = essentiaResult.Error,
                        Code = essentiaResult.Code
                    };
                }

                // Map Essentia result to API response
                var response = MapEssentiaResultToResponse(essentiaResult, title, artist);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in AudioAnalysisService: {ex.Message}");
                return new AudioAnalysisResponse
                {
                    Success = false,
                    Error = ex.Message,
                    Code = "ANALYSIS_ERROR"
                };
            }
        }

        private ValidationResult ValidateAudioFile(IFormFile audioFile)
        {
            if (audioFile == null || audioFile.Length == 0)
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "No audio file provided",
                    ErrorCode = "NO_FILE"
                };
            }

            var fileExtension = Path.GetExtension(audioFile.FileName).ToLower();
            if (!ALLOWED_FORMATS.Contains(fileExtension))
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"Unsupported format. Allowed: {string.Join(", ", ALLOWED_FORMATS)}",
                    ErrorCode = "INVALID_FORMAT"
                };
            }

            if (audioFile.Length > MAX_FILE_SIZE)
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"File too large. Maximum size: 100MB",
                    ErrorCode = "FILE_TOO_LARGE"
                };
            }

            return new ValidationResult { IsValid = true };
        }

        private AudioAnalysisResponse MapEssentiaResultToResponse(
            EssentiaAnalysisResult essentiaResult,
            string? title,
            string? artist)
        {
            return new AudioAnalysisResponse
            {
                Success = true,
                Tempo = new TempoAnalysis
                {
                    BPM = essentiaResult.Tempo?.Bpm ?? 0,
                    Ticks = essentiaResult.Tempo?.Ticks ?? new(),
                    Estimates = essentiaResult.Tempo?.Estimates ?? new(),
                    BPMIntervals = essentiaResult.Tempo?.BpmIntervals ?? new()
                },
                Tonal = new TonalAnalysis
                {
                    Key = essentiaResult.Tonal?.Key,
                    Scale = essentiaResult.Tonal?.Scale,
                    KeyStrength = essentiaResult.Tonal?.KeyStrength ?? 0,
                    HPCPFeatures = essentiaResult.Tonal?.HppcFeatures ?? new()
                },
                Instruments = essentiaResult.Instruments ?? new(),
                EthnicGroup = new EthnicGroupAnalysis
                {
                    Primary = essentiaResult.EthnicGroup?.Primary,
                    Confidence = essentiaResult.EthnicGroup?.Confidence ?? 0,
                    AllScores = essentiaResult.EthnicGroup?.AllScores ?? new()
                },
                VoicePresence = new VoiceAnalysis
                {
                    HasVoice = essentiaResult.VoicePresence?.HasVoice ?? false,
                    Confidence = essentiaResult.VoicePresence?.Confidence ?? 0
                },
                AudioQuality = new AudioQuality
                {
                    Score = essentiaResult.AudioQuality?.Score ?? 1.0,
                    Issues = essentiaResult.AudioQuality?.Issues ?? new()
                },
                Filename = essentiaResult.Filename
            };
        }

        private class ValidationResult
        {
            public bool IsValid { get; set; }
            public string? ErrorMessage { get; set; }
            public string? ErrorCode { get; set; }
        }
    }
}
