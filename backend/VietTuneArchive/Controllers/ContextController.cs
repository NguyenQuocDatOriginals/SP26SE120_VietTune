using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Responses;

namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContextController : ControllerBase
    {
        private readonly IContextService _contextService;

        public ContextController(IContextService contextService)
        {
            _contextService = contextService;
        }

        // ? SPECIFIC ROUTES FIRST
        // GET: /api/contexts/search?term={term}
        [HttpGet("search")]
        public async Task<ActionResult<PagedResponse<ContextDto>>> SearchContexts(
            [FromQuery] string term,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _contextService.SearchAsync(term, page, pageSize);
            return Ok(result);
        }

        // GET: /api/contexts/by-name?name={name}
        [HttpGet("by-name")]
        public async Task<ActionResult<ServiceResponse<ContextDto>>> GetByName([FromQuery] string name)
        {
            var result = await _contextService.GetByNameAsync(name);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // ? GENERIC ROUTES AFTER
        // GET: /api/contexts
        [HttpGet]
        public async Task<ActionResult<PagedResponse<ContextDto>>> GetContexts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _contextService.GetPaginatedAsync(page, pageSize);
            return Ok(result);
        }

        // GET: /api/contexts/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceResponse<ContextDto>>> GetContext(Guid id)
        {
            var result = await _contextService.GetByIdAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // DELETE: /api/contexts/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult<ServiceResponse<bool>>> DeleteContext(Guid id)
        {
            var result = await _contextService.DeleteAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
