using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Supabase;
using Supabase.Storage;
using static VietTuneArchive.Application.Mapper.DTOs.AIAnalysisDto;
using VietTuneArchive.Application.IServices;

namespace VietTuneArchive.Application.Services
{
    public class AudioUploadService : IAudioUploadService
    {
        private readonly Supabase.Client _supabase;
        private readonly string _bucket;
        private readonly ILogger<AudioUploadService> _logger;

        public AudioUploadService(IConfiguration config, ILogger<AudioUploadService> logger)
        {
            _logger = logger;

            var url = config["Supabase:Url"] ?? throw new InvalidOperationException("Supabase:Url not configured");
            var key = config["Supabase:ServiceRoleKey"] ?? throw new InvalidOperationException("Supabase:Key not configured");
            var bucketName = config["Supabase:BucketName"] ?? "VietTuneArchive";
            _supabase = new Supabase.Client(url, key);
            _bucket = bucketName;
        }

        public async Task<UploadResultDto> UploadAsync(IFormFile file, string userId)
        {
            try
            {
                ValidateFile(file);
                _logger.LogInformation("Uploading audio file for user {UserId}", userId);

                var mediaId = Guid.NewGuid().ToString();
                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                var path = $"users/{userId}/{mediaId}{ext}";

                // ✅ Convert Stream to byte[]
                byte[] fileBytes;
                using (var ms = new MemoryStream())
                {
                    await file.CopyToAsync(ms);
                    fileBytes = ms.ToArray();
                }

                // ✅ Upload as byte array
                var bucket = _supabase.Storage.From(_bucket);
                await bucket.Upload(
                    fileBytes,
                    path,
                    new Supabase.Storage.FileOptions
                    {
                        Upsert = true,
                        ContentType = file.ContentType
                    });

                // Get public URL
                var publicUrl = bucket.GetPublicUrl(path);

                _logger.LogInformation("File uploaded successfully: {Path}", path);

                return new UploadResultDto(
                    mediaId,
                    publicUrl,
                    file.Length,
                    DateTime.UtcNow);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Upload failed for user {UserId}", userId);
                throw;
            }
        }

        public async Task<byte[]> DownloadAsync(string filePath)
        {
            try
            {
                _logger.LogInformation("Downloading file: {FilePath}", filePath);

                var bucket = _supabase.Storage.From(_bucket);

                // ✅ Specify the overload clearly: Download(string, IProgress<float>?)
                // Pass null for IProgress<float>? to avoid ambiguity
                var data = await bucket.Download(filePath, null);

                _logger.LogInformation("File downloaded successfully: {FilePath}", filePath);
                return data;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Download failed for file: {FilePath}", filePath);
                throw;
            }
        }

        private static void ValidateFile(IFormFile file)
        {
            var validMimes = new[] { "audio/wav", "audio/mpeg", "audio/mp4", "audio/flac", "audio/ogg" };
            if (!validMimes.Contains(file.ContentType?.ToLowerInvariant()))
                throw new ArgumentException($"Invalid audio format: {file.ContentType}");

            const long maxFileSize = 50 * 1024 * 1024; // 50MB
            if (file.Length > maxFileSize)
                throw new ArgumentException($"File too large (max {maxFileSize / (1024 * 1024)}MB)");

            if (file.Length == 0)
                throw new ArgumentException("File is empty");
        }
    }
}
