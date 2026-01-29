using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Domain.Entities;

namespace VietTuneArchive.Domain.IRepositories
{
    /// <summary>
    /// Repository interface for Province entity
    /// </summary>
    public interface IProvinceRepository : IGenericRepository<Province>
    {
        /// <summary>
        /// Get province by name
        /// </summary>
        Task<Province> GetByNameAsync(string name);

        /// <summary>
        /// Check if province name exists
        /// </summary>
        Task<bool> NameExistsAsync(string name);

        /// <summary>
        /// Get provinces by region
        /// </summary>
        Task<IEnumerable<Province>> GetByRegionAsync(Guid regionId);

        /// <summary>
        /// Get province with region
        /// </summary>
        Task<Province> GetWithRegionAsync(Guid id);
    }
}
