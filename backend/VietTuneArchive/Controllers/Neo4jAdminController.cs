using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Services;

namespace VietTuneArchive.API.Controllers
{
    [ApiController]
    [Route("api/admin/neo4j")]
    //[Authorize(Roles = "Admin")] 
    public class Neo4jAdminController : ControllerBase
    {
        private readonly INeo4jMigrationService _migrationService;

        public Neo4jAdminController(INeo4jMigrationService migrationService)
        {
            _migrationService = migrationService;
        }

        [HttpPost("migrate-data")]
        public async Task<IActionResult> TriggerMigration()
        {
            var result = await _migrationService.RunFullMigrationAsync();
            
            if (!result.Success)
            {
                return StatusCode(500, new { 
                    error = "Migration failed internally", 
                    details = result.Message 
                });
            }

            return Ok(new {
                message = result.Message,
                nodesCount = result.NodesProcessed,
                relationshipsCount = result.RelationshipsProcessed
            });
        }
    }
}
