using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Responses;

namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegionController : ControllerBase
    {
        private readonly IRegionService _regionService;

        public RegionController(IRegionService regionService)
        {
            _regionService = regionService;
        }

        // GET: /api/regions/search?term={term}
        [HttpGet("search")]
        public async Task<ActionResult<PagedResponse<RegionDto>>> SearchRegions(
            [FromQuery] string term,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _regionService.SearchAsync(term, page, pageSize);
            return Ok(result);
        }

        // GET: /api/regions/by-name?name={name}
        [HttpGet("by-name")]
        public async Task<ActionResult<ServiceResponse<RegionDto>>> GetByName([FromQuery] string name)
        {
            var result = await _regionService.GetByNameAsync(name);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // GET: /api/regions
        [HttpGet]
        public async Task<ActionResult<PagedResponse<RegionDto>>> GetRegions(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _regionService.GetPaginatedAsync(page, pageSize);
            return Ok(result);
        }

        // GET: /api/regions/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceResponse<RegionDto>>> GetRegion(Guid id)
        {
            var result = await _regionService.GetByIdAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // GET: /api/regions/{id}/with-provinces
        [HttpGet("{id}/with-provinces")]
        public async Task<ActionResult<ServiceResponse<RegionDto>>> GetRegionWithProvinces(Guid id)
        {
            var result = await _regionService.GetWithProvincesAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // DELETE: /api/regions/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult<ServiceResponse<bool>>> DeleteRegion(Guid id)
        {
            var result = await _regionService.DeleteAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
