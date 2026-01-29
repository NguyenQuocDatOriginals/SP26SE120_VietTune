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
    /// Repository implementation for Genre entity
    /// </summary>
    public class GenreRepository : GenericRepository<Genre>, IGenreRepository
    {
        public GenreRepository(DBContext context) : base(context)
        {
        }

        public async Task<Genre> GetByNameAsync(string name)
        {
            return await GetFirstOrDefaultAsync(g => g.Name == name);
        }

        public async Task<bool> NameExistsAsync(string name)
        {
            var result = await GetFirstOrDefaultAsync(g => g.Name == name);
            return result != null;
        }
    }
}
