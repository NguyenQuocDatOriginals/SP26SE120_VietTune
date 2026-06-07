using VietTuneArchive.Domain.Entities;

namespace VietTuneArchive.Domain.IRepositories
{
    public interface ICeremonyRepository : IGenericRepository<Ceremony>
    {
        Task<IEnumerable<Ceremony>> SearchByNameAsync(string? name);
    }
}
