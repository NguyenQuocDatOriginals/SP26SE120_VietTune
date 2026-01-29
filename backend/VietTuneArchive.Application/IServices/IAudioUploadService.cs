using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
