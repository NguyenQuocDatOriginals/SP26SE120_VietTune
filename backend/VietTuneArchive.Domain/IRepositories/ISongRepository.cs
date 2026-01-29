using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Domain.Entities;

namespace VietTuneArchive.Domain.IRepositories
{
    /// <summary>
    /// Repository interface for Song entity
    /// </summary>
    public interface ISongRepository : IGenericRepository<Song>
    {
        /// <summary>
        /// Get songs by performer
        /// </summary>
        Task<IEnumerable<Song>> GetByPerformerAsync(string performer);

        /// <summary>
        /// Get songs by author
        /// </summary>
        Task<IEnumerable<Song>> GetByAuthorAsync(string author);

        /// <summary>
        /// Get songs by genre
        /// </summary>
        Task<IEnumerable<Song>> GetByGenreAsync(string genre);

        /// <summary>
        /// Get songs by dialect
        /// </summary>
        Task<IEnumerable<Song>> GetByDialectAsync(string dialect);

        /// <summary>
        /// Get songs by province
        /// </summary>
        Task<IEnumerable<Song>> GetByProvinceAsync(string province);
    }
}
