using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Domain.Entities;

namespace VietTuneArchive.Domain.IRepositories
{
    /// <summary>
    /// Repository interface for Instrument entity
    /// </summary>
    public interface IInstrumentRepository : IGenericRepository<Instrument>
    {
        /// <summary>
        /// Get instrument by name
        /// </summary>
        Task<Instrument> GetByNameAsync(string name);

        /// <summary>
        /// Check if instrument name exists
        /// </summary>
        Task<bool> NameExistsAsync(string name);
    }
}
