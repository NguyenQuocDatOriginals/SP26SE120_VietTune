using System;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using VietTuneArchive.Application.Mapper.DTOs;

namespace VietTuneArchive.Application.IServices
{
    public interface IInstrumentDetectionService : IDisposable
    {
        Task<InstrumentDetectionResponse> DetectInstrumentAsync(Stream audioStream, string fileName);
        string[] SupportedInstruments { get; }
    }
}
