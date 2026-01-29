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
    /// Repository implementation for Region entity
    /// </summary>
    public class RegionRepository : GenericRepository<Region>, IRegionRepository
    {
        private readonly DBContext _context;

        public RegionRepository(DBContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Region> GetByNameAsync(string name)
        {
            return await GetFirstOrDefaultAsync(r => r.Name == name);
        }

        public async Task<bool> NameExistsAsync(string name)
        {
            var result = await GetFirstOrDefaultAsync(r => r.Name == name);
            return result != null;
        }

        public async Task<Region> GetWithProvincesAsync(Guid id)
        {
            var region = await GetByIdAsync(id);
            if (region != null)
            {
                _context.Entry(region).Collection(r => r.Provinces).Load();
            }
            return region;
        }
    }
}
