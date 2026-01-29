using Microsoft.AspNetCore.Http;
using static VietTuneArchive.Application.Mapper.DTOs.AIAnalysisDto;

namespace VietTuneArchive.Application.IServices
{
    public interface IAudioProcessingService
    {
        Task<AudioProcessResultDto> ProcessAudioAsync(IFormFile audioFile, string userId);

        Task<UploadResultDto> UploadToCloudAsync(IFormFile audioFile, string userId);

        Task<AIAnalysisResultDto> AnalyzeAudioAsync(IFormFile audioFile);
    }
}