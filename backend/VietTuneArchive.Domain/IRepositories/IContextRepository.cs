using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ContextEntity = VietTuneArchive.Domain.Entities.Context;

namespace VietTuneArchive.Domain.IRepositories
{
    /// <summary>
    /// Repository interface for Context entity
    /// </summary>
    public interface IContextRepository : IGenericRepository<ContextEntity>
    {
        /// <summary>
        /// Get context by name
        /// </summary>
        Task<ContextEntity> GetByNameAsync(string name);

        /// <summary>
        /// Check if context name exists
        /// </summary>
        Task<bool> NameExistsAsync(string name);
    }
}
