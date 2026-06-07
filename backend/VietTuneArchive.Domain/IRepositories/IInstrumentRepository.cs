using VietTuneArchive.Domain.Entities;

namespace VietTuneArchive.Domain.IRepositories
{
    public interface IInstrumentRepository : IGenericRepository<Instrument>
    {
        Task<IEnumerable<Instrument>> SearchByNameAsync(string? name);
    }
}
