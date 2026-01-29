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
    /// Repository implementation for Song entity
    /// </summary>
    public class SongRepository : GenericRepository<Song>, ISongRepository
    {
        public SongRepository(DBContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Song>> GetByPerformerAsync(string performer)
        {
            return await GetAsync(s => s.Performer == performer);
        }

        public async Task<IEnumerable<Song>> GetByAuthorAsync(string author)
        {
            return await GetAsync(s => s.Author == author);
        }

        public async Task<IEnumerable<Song>> GetByGenreAsync(string genre)
        {
            return await GetAsync(s => s.Genre == genre);
        }

        public async Task<IEnumerable<Song>> GetByDialectAsync(string dialect)
        {
            return await GetAsync(s => s.Dialect == dialect);
        }

        public async Task<IEnumerable<Song>> GetByProvinceAsync(string province)
        {
            return await GetAsync(s => s.Province == province);
        }
    }
}
