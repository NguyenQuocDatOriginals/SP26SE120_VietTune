using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace VietTuneArchive.Domain.Context
{
    public class DbContextFactory : IDesignTimeDbContextFactory<DBContext>
    {
        public DBContext CreateDbContext(string[] args)
        {

            var path = Path.Combine(Directory.GetParent(Directory.GetCurrentDirectory()).FullName, "EVStation-basedRentalSystem");
            var config = new ConfigurationBuilder()
                .SetBasePath(path)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<DBContext>();
            var connectionString = config.GetConnectionString("Database");

            optionsBuilder.UseSqlServer(connectionString);

            return new DBContext(optionsBuilder.Options);
        }
    }
}
