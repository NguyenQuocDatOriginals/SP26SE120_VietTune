using VietTuneArchive.Domain.Entities;

namespace VietTuneArchive.Domain.IRepositories
{
    public interface IMusicalScaleRepository : IGenericRepository<MusicalScale>
    {
        Task<IEnumerable<MusicalScale>> SearchByNameAsync(string? name);
    }
}
