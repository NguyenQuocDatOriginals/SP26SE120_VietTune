using Microsoft.EntityFrameworkCore;

namespace VietTuneArchive.Domain.Context
{
    public class DBContext : DbContext
    {
        public DBContext() { }
        public DBContext(DbContextOptions<DBContext> options) : base(options) { }
    }
}
