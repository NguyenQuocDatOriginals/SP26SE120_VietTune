using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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

