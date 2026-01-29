using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using VietTuneArchive.Application.Mapper.DTOs;
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