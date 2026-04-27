using System.Text.Json;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Application.IServices;

namespace VietTuneArchive.Tests.TestHelpers.Builders;

public static class SearchBuilder
{
    public static Recording BuildRecording(Guid id, string title, int status = 1)
    {
        return new Recording
        {
            Id = id,
            Title = title,
            AudioFileUrl = "http://test.com/audio.mp3",
            Status = (VietTuneArchive.Domain.Entities.Enum.SubmissionStatus)status,
            Description = "Test recording",
            RecordingInstruments = new List<RecordingInstrument>()
        };
    }

    public static KBEntry BuildKBEntry(Guid id, string title, string content, int status = 1)
    {
        return new KBEntry
        {
            Id = id,
            Title = title,
            Content = content,
            Status = status,
            Category = "Test",
            Slug = "test-slug"
        };
    }

    public static Instrument BuildInstrument(Guid id, string name)
    {
        return new Instrument
        {
            Id = id,
            Name = name,
            Description = "Test instrument",
            Category = "Test"
        };
    }

    public static VectorEmbedding BuildVectorEmbedding(Guid id, Guid recordingId, string modelVersion, float[] vector)
    {
        return new VectorEmbedding
        {
            Id = id,
            RecordingId = recordingId,
            ModelVersion = modelVersion,
            EmbeddingJson = JsonSerializer.Serialize(vector)
        };
    }
}
