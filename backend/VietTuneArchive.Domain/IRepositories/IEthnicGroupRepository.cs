using VietTuneArchive.Domain.Entities;

namespace VietTuneArchive.Domain.IRepositories
{
    public interface IEthnicGroupRepository : IGenericRepository<EthnicGroup>
    {
        Task<IEnumerable<EthnicGroup>> SearchByNameAsync(string? name);
    }
}
