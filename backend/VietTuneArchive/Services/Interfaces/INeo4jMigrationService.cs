using System.Threading.Tasks;

namespace VietTuneArchive.Services
{
    public interface INeo4jMigrationService
    {
        Task<MigrationResultDto> RunFullMigrationAsync();
    }

    public class MigrationResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public int NodesProcessed { get; set; }
        public int RelationshipsProcessed { get; set; }
    }
}
