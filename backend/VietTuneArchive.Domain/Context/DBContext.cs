using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VietTuneArchive.Domain.Context
{
    public class DBContext : DbContext
    {
        public DBContext() { }
        public DBContext(DbContextOptions<DBContext> options) : base(options) { }
    }
}
