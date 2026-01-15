using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using VietTuneArchive.Domain.Models;
using System.Net.Http.Headers;
using Newtonsoft.Json;


namespace VietTuneArchive.Application.Services
{
    public class EssentiaService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<EssentiaService> _logger;

        public EssentiaService(HttpClient httpClient, ILogger<EssentiaService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<EssentiaAnalysisResult> AnalyzeAudioAsync(IFormFile audioFile)
        {
            try
            {
                _logger.LogInformation($"Sending audio to Essentia: {audioFile.FileName}");

                using (var form = new MultipartFormDataContent())
                {
                    // Add audio file
                    var fileContent = new StreamContent(audioFile.OpenReadStream());
                    fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("application/octet-stream");
                    form.Add(fileContent, "audio", audioFile.FileName);

                    // Send to Essentia API
                    var response = await _httpClient.PostAsync("/analyze", form);

                    if (!response.IsSuccessStatusCode)
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        _logger.LogError($"Essentia API error: {response.StatusCode} - {errorContent}");

                        return new EssentiaAnalysisResult
                        {
                            Success = false,
                            Error = $"Essentia service error: {response.StatusCode}",
                            Code = "ESSENTIA_ERROR"
                        };
                    }

                    var content = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<EssentiaAnalysisResult>(content);

                    _logger.LogInformation("Audio analysis completed successfully");
                    return result ?? new EssentiaAnalysisResult { Success = false };
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError($"HTTP error communicating with Essentia: {ex.Message}");
                return new EssentiaAnalysisResult
                {
                    Success = false,
                    Error = $"Cannot connect to Essentia service: {ex.Message}",
                    Code = "CONNECTION_ERROR"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in EssentiaService: {ex.Message}");
                return new EssentiaAnalysisResult
                {
                    Success = false,
                    Error = ex.Message,
                    Code = "SERVICE_ERROR"
                };
            }
        }
    }
}
