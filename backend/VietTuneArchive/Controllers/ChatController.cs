using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace VietTuneArchive.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _model;
        private readonly string _systemInstruction;

        private const string GeminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/{0}:generateContent?key={1}";

        public ChatController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClient = httpClientFactory.CreateClient();
            _apiKey = configuration["Gemini:ApiKey"] ?? throw new ArgumentNullException("Gemini:ApiKey");
            _model = configuration["Gemini:Model"] ?? "gemini-flash-lite-latest";

            // System Instruction của bạn (đã tối ưu)
            var rootPath = Directory.GetCurrentDirectory();
            var promptPath = Path.Combine(rootPath, "SystemInstructions", "MusicBotPrompt.txt");
            _systemInstruction = System.IO.File.ReadAllText(promptPath);
        }

        public class ChatRequest
        {
            public string Message { get; set; } = string.Empty;
        }

        public class GeminiTextPart
        {
            public string text { get; set; } = string.Empty;
        }

        public class GeminiContent
        {
            public List<GeminiTextPart> parts { get; set; } = new();
        }

        public class GeminiRequestBody
        {
            public List<GeminiContent> contents { get; set; } = new();
            public GenerationConfig generationConfig { get; set; } = new();
        }

        public class GenerationConfig
        {
            public double temperature { get; set; } = 0.2;
            public int maxOutputTokens { get; set; } = 200;
            public double topP { get; set; } = 0.8;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatRequest request)
        {
            var body = new GeminiRequestBody
            {
                contents = new List<GeminiContent>
                {
                    new GeminiContent // System instruction
                    {
                        parts = new List<GeminiTextPart>
                        {
                            new GeminiTextPart { text = _systemInstruction }
                        }
                    },
                    new GeminiContent // User message
                    {
                        parts = new List<GeminiTextPart>
                        {
                            new GeminiTextPart { text = request.Message }
                        }
                    }
                },
                generationConfig = new GenerationConfig
                {
                    temperature = 0.2,
                    maxOutputTokens = 200,
                    topP = 0.8
                }
            };

            var json = JsonSerializer.Serialize(body);
            var endpoint = string.Format(GeminiEndpoint, _model, _apiKey);

            var httpRequest = new HttpRequestMessage(HttpMethod.Post, endpoint)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, $"Gemini API Error: {responseContent}");
            }

            return Ok(responseContent);
        }
    }
}
