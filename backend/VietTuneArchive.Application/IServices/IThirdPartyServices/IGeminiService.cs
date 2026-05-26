using System.Threading;
using System.Threading.Tasks;

namespace VietTuneArchive.Application.IServices.IThirdPartyServices
{
    /// <summary>
    /// Service dùng chung cho mọi tính năng AI của VietTune. Đọc Gemini:ApiKey và Gemini:Model từ cấu hình.
    /// Toàn bộ hệ thống (Chat, Researcher, ChatbotPage, và mọi tính năng AI sau này) đều dùng key qua service này.
    /// </summary>
    public interface IGeminiService
    {
        /// <summary>Kiểm tra đã cấu hình ApiKey chưa.</summary>
        bool IsConfigured { get; }

        /// <summary>Gọi Gemini generateContent với systemInstruction (plain text, không markdown). Trả về (thành công, nội dung hoặc thông báo lỗi, statusCode).</summary>
        Task<GeminiResult> GenerateContentAsync(string userMessage, string? systemInstruction = null, CancellationToken cancellationToken = default);
    }

    public sealed class GeminiResult
    {
        public bool Success { get; init; }
        public string Message { get; init; } = "";
        public int StatusCode { get; init; }
    }
}
