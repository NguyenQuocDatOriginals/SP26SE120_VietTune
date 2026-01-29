using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Domain.Entities;

namespace VietTuneArchive.Domain.IRepositories
{
    /// <summary>
    /// Repository interface for Region entity
    /// </summary>
    public interface IRegionRepository : IGenericRepository<Region>
    {
        /// <summary>
        /// Get region by name
        /// </summary>
        Task<Region> GetByNameAsync(string name);

        /// <summary>
        /// Check if region name exists
        /// </summary>
        Task<bool> NameExistsAsync(string name);

        /// <summary>
        /// Get region with provinces
        /// </summary>
        Task<Region> GetWithProvincesAsync(Guid id);
    }
}
