using Microsoft.AspNetCore.Http;
using static VietTuneArchive.Application.Mapper.DTOs.AIAnalysisDto;

namespace VietTuneArchive.Application.IServices
{
    public interface IAudioUploadService
    {
        Task<UploadResultDto> UploadAsync(IFormFile file, string userId);
        Task<byte[]> DownloadAsync(string filePath);
    }
}
