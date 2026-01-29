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
    /// Repository implementation for Province entity
    /// </summary>
    public class ProvinceRepository : GenericRepository<Province>, IProvinceRepository
    {
        private readonly DBContext _context;

        public ProvinceRepository(DBContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Province> GetByNameAsync(string name)
        {
            return await GetFirstOrDefaultAsync(p => p.Name == name);
        }

        public async Task<bool> NameExistsAsync(string name)
        {
            var result = await GetFirstOrDefaultAsync(p => p.Name == name);
            return result != null;
        }

        public async Task<IEnumerable<Province>> GetByRegionAsync(Guid regionId)
        {
            return await GetAsync(p => p.RegionId == regionId);
        }

        public async Task<Province> GetWithRegionAsync(Guid id)
        {
            var province = await GetByIdAsync(id);
            if (province != null)
            {
                _context.Entry(province).Reference(p => p.Region).Load();
            }
            return province;
        }
    }
}
