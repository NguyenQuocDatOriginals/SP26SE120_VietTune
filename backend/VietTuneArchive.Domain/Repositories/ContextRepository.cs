using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Domain.Context;
using VietTuneArchive.Domain.IRepositories;
using ContextEntity = VietTuneArchive.Domain.Entities.Context;

namespace VietTuneArchive.Domain.Repositories
{
    /// <summary>
    /// Repository implementation for Context entity
    /// </summary>
    public class ContextRepository : GenericRepository<ContextEntity>, IContextRepository
    {
        public ContextRepository(DBContext context) : base(context)
        {
        }

        public async Task<ContextEntity> GetByNameAsync(string name)
        {
            return await GetFirstOrDefaultAsync(c => c.Name == name);
        }

        public async Task<bool> NameExistsAsync(string name)
        {
            var result = await GetFirstOrDefaultAsync(c => c.Name == name);
            return result != null;
        }
    }
}
