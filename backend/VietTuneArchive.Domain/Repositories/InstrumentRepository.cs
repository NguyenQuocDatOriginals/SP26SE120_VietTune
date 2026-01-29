using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Domain.Context;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Domain.IRepositories;

namespace VietTuneArchive.Domain.Repositories
{
    /// <summary>
    /// Repository implementation for Instrument entity
    /// </summary>
    public class InstrumentRepository : GenericRepository<Instrument>, IInstrumentRepository
    {
        public InstrumentRepository(DBContext context) : base(context)
        {
        }

        public async Task<Instrument> GetByNameAsync(string name)
        {
            return await GetFirstOrDefaultAsync(i => i.Name == name);
        }

        public async Task<bool> NameExistsAsync(string name)
        {
            var result = await GetFirstOrDefaultAsync(i => i.Name == name);
            return result != null;
        }
    }
}
