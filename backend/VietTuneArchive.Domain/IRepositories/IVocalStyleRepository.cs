using VietTuneArchive.Domain.Entities;

namespace VietTuneArchive.Domain.IRepositories
{
    public interface IVocalStyleRepository : IGenericRepository<VocalStyle>
    {
        Task<IEnumerable<VocalStyle>> SearchByNameAsync(string? name);
    }
}
