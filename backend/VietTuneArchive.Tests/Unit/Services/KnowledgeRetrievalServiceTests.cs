using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Services;
using VietTuneArchive.Domain.Context;
using VietTuneArchive.Tests.TestHelpers.Builders;
using Xunit;

namespace VietTuneArchive.Tests.Unit.Services;

public class KnowledgeRetrievalServiceTests : IDisposable
{
    private readonly DBContext _dbContext;
    private readonly Mock<IEmbeddingService> _embeddingMock;
    private readonly KnowledgeRetrievalService _sut;

    public KnowledgeRetrievalServiceTests()
    {
        var options = new DbContextOptionsBuilder<DBContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _dbContext = new DBContext(options);
        _embeddingMock = new Mock<IEmbeddingService>();

        _sut = new KnowledgeRetrievalService(_dbContext, _embeddingMock.Object);
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }

    public class VectorBranch : KnowledgeRetrievalServiceTests
    {
        [Fact]
        public async Task RetrieveAsync_WhenEmbeddingThrows_FallsBackToKeyword()
        {
            var kb = SearchBuilder.BuildKBEntry(Guid.NewGuid(), "Match Title", "Content");
            _dbContext.KBEntries.Add(kb);
            await _dbContext.SaveChangesAsync();

            _embeddingMock.Setup(x => x.GetEmbeddingAsync(It.IsAny<string>()))
                          .ThrowsAsync(new Exception("Vector DB down"));

            var results = await _sut.RetrieveAsync("Match Title");

            results.Should().NotBeEmpty();
            results.First().SourceType.Should().Be("KBEntry");
            results.First().RelevanceScore.Should().Be(1.0); // Boosted to 1.0 due to title match in fallback
        }
    }

    public class RetrievalSources : KnowledgeRetrievalServiceTests
    {
        [Fact]
        public async Task RetrieveAsync_CombinesRecordingsKBEntriesAndInstruments()
        {
            var queryVector = new float[384];

            var rec = SearchBuilder.BuildRecording(Guid.NewGuid(), "Rec Match");
            var kb = SearchBuilder.BuildKBEntry(Guid.NewGuid(), "KB Match", "Content");
            var inst = SearchBuilder.BuildInstrument(Guid.NewGuid(), "Inst Match");
            
            _dbContext.Recordings.Add(rec);
            _dbContext.KBEntries.Add(kb);
            _dbContext.Instruments.Add(inst);
            await _dbContext.SaveChangesAsync();

            _embeddingMock.Setup(x => x.GetEmbeddingAsync("Match")).ReturnsAsync(queryVector);
            _embeddingMock.Setup(x => x.SearchSimilarRecordingsAsync(queryVector, 5))
                          .ReturnsAsync(new List<(Guid, double)> { (rec.Id, 0.8) });
            _embeddingMock.Setup(x => x.SearchSimilarKBEntriesAsync(queryVector, 5))
                          .ReturnsAsync(new List<(Guid, double)> { (kb.Id, 0.7) });

            var results = await _sut.RetrieveAsync("Match");

            results.Select(r => r.SourceType).Should().Contain(new[] { "Recording", "KBEntry", "Instrument" });
        }
    }

    public class ScoringAndRanking : KnowledgeRetrievalServiceTests
    {
        [Fact]
        public async Task RetrieveAsync_ResultsAreOrderedByRelevanceScoreDescending()
        {
            var queryVector = new float[384];

            var rec1 = SearchBuilder.BuildRecording(Guid.NewGuid(), "Some Title");
            var rec2 = SearchBuilder.BuildRecording(Guid.NewGuid(), "Another Title");
            
            _dbContext.Recordings.AddRange(rec1, rec2);
            await _dbContext.SaveChangesAsync();

            _embeddingMock.Setup(x => x.GetEmbeddingAsync("Test")).ReturnsAsync(queryVector);
            
            // rec2 has higher score than rec1
            _embeddingMock.Setup(x => x.SearchSimilarRecordingsAsync(queryVector, 5))
                          .ReturnsAsync(new List<(Guid, double)> { (rec1.Id, 0.5), (rec2.Id, 0.9) });
            _embeddingMock.Setup(x => x.SearchSimilarKBEntriesAsync(queryVector, 5))
                          .ReturnsAsync(new List<(Guid, double)>());

            var results = await _sut.RetrieveAsync("Test");

            results.Count.Should().Be(2);
            results[0].SourceId.Should().Be(rec2.Id); // 0.9 comes first
            results[1].SourceId.Should().Be(rec1.Id); // 0.5 comes second
        }

        [Fact]
        public async Task RetrieveAsync_TitleMatch_BoostsScoreToOne()
        {
            var queryVector = new float[384];
            var kb = SearchBuilder.BuildKBEntry(Guid.NewGuid(), "Exact Query", "Content");
            
            _dbContext.KBEntries.Add(kb);
            await _dbContext.SaveChangesAsync();

            _embeddingMock.Setup(x => x.GetEmbeddingAsync("Exact Query")).ReturnsAsync(queryVector);
            _embeddingMock.Setup(x => x.SearchSimilarKBEntriesAsync(queryVector, 5))
                          .ReturnsAsync(new List<(Guid, double)> { (kb.Id, 0.6) });

            var results = await _sut.RetrieveAsync("Exact Query");

            results.Should().HaveCount(1);
            results[0].RelevanceScore.Should().Be(1.0); // Boosted from 0.6
        }
    }

    public class ContextBuilding : KnowledgeRetrievalServiceTests
    {
        [Fact]
        public async Task RetrieveAsync_TruncatesLongKBContentTo500Chars()
        {
            var longContent = new string('A', 1000);
            var kb = SearchBuilder.BuildKBEntry(Guid.NewGuid(), "Long KB", longContent);
            _dbContext.KBEntries.Add(kb);
            await _dbContext.SaveChangesAsync();

            _embeddingMock.Setup(x => x.GetEmbeddingAsync("Long")).ReturnsAsync(new float[384]);
            _embeddingMock.Setup(x => x.SearchSimilarKBEntriesAsync(It.IsAny<float[]>(), 5))
                          .ReturnsAsync(new List<(Guid, double)> { (kb.Id, 0.9) });

            var results = await _sut.RetrieveAsync("Long");

            results[0].Content.Length.Should().Be(500);
        }
    }

    public class FilteringWithinRetrieval : KnowledgeRetrievalServiceTests
    {
        [Fact]
        public async Task RetrieveAsync_ExcludesUnpublishedKBEntries()
        {
            var draftKb = SearchBuilder.BuildKBEntry(Guid.NewGuid(), "Draft Match", "Content", status: 0);
            _dbContext.KBEntries.Add(draftKb);
            await _dbContext.SaveChangesAsync();

            _embeddingMock.Setup(x => x.GetEmbeddingAsync("Match")).ReturnsAsync(new float[384]);
            _embeddingMock.Setup(x => x.SearchSimilarKBEntriesAsync(It.IsAny<float[]>(), 5))
                          .ReturnsAsync(new List<(Guid, double)> { (draftKb.Id, 0.9) });

            var results = await _sut.RetrieveAsync("Match");

            // Assuming Semantic Search block requires Status == 1
            // Let's check: the code does `.FirstOrDefaultAsync(k => k.Id == kbMatch.EntryId && k.Status == 1)`
            results.Where(r => r.SourceType == "KBEntry").Should().BeEmpty();
        }
    }

    public class EdgeCases : KnowledgeRetrievalServiceTests
    {
        [Fact]
        public async Task RetrieveAsync_WithTopK_NeverExceedsMaxResults()
        {
            // The service defaults maxResults to 10
            for (int i = 0; i < 15; i++)
            {
                _dbContext.Instruments.Add(SearchBuilder.BuildInstrument(Guid.NewGuid(), "Inst Match " + i));
            }
            await _dbContext.SaveChangesAsync();

            // Simulate embedding returning empty
            _embeddingMock.Setup(x => x.GetEmbeddingAsync("Match")).ReturnsAsync(new float[384]);
            
            var results = await _sut.RetrieveAsync("Match", maxResults: 2);

            results.Count.Should().Be(2); // Since instruments add to docs, it takes max 3, but overall method returns Take(maxResults)
        }
    }
}
