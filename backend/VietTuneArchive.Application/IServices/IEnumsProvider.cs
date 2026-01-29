using GenerativeAI.Types;

namespace VietTuneArchive.Application.IServices
{
    public interface IEnumsProvider
    {
        Dictionary<string, string[]> GetAllEnums();
        Schema BuildAISchema();
        string GetSystemPrompt();
        string GetJsonSchema();
    }
}

