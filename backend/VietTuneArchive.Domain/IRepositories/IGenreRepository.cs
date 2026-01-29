using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Domain.Entities;

namespace VietTuneArchive.Domain.IRepositories
{
    /// <summary>
    /// Repository interface for Genre entity
    /// </summary>
    public interface IGenreRepository : IGenericRepository<Genre>
    {
        /// <summary>
        /// Get genre by name
        /// </summary>
        Task<Genre> GetByNameAsync(string name);

        /// <summary>
        /// Check if genre name exists
        /// </summary>
        Task<bool> NameExistsAsync(string name);
    }
}
