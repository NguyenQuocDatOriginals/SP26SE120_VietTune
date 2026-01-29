using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Responses;

namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProvinceController : ControllerBase
    {
        private readonly IProvinceService _provinceService;

        public ProvinceController(IProvinceService provinceService)
        {
            _provinceService = provinceService;
        }

        // GET: /api/provinces/search?term={term}
        [HttpGet("search")]
        public async Task<ActionResult<PagedResponse<ProvinceDto>>> SearchProvinces(
            [FromQuery] string term,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _provinceService.SearchAsync(term, page, pageSize);
            return Ok(result);
        }

        // GET: /api/provinces/by-name?name={name}
        [HttpGet("by-name")]
        public async Task<ActionResult<ServiceResponse<ProvinceDto>>> GetByName([FromQuery] string name)
        {
            var result = await _provinceService.GetByNameAsync(name);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // GET: /api/provinces/by-region/{regionId}
        [HttpGet("by-region/{regionId}")]
        public async Task<ActionResult<PagedResponse<ProvinceDto>>> GetProvincesByRegion(
            Guid regionId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _provinceService.GetByRegionAsync(regionId, page, pageSize);
            return Ok(result);
        }

        // GET: /api/provinces
        [HttpGet]
        public async Task<ActionResult<PagedResponse<ProvinceDto>>> GetProvinces(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _provinceService.GetPaginatedAsync(page, pageSize);
            return Ok(result);
        }

        // GET: /api/provinces/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceResponse<ProvinceDto>>> GetProvince(Guid id)
        {
            var result = await _provinceService.GetByIdAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // GET: /api/provinces/{id}/with-region
        [HttpGet("{id}/with-region")]
        public async Task<ActionResult<ServiceResponse<ProvinceDto>>> GetProvinceWithRegion(Guid id)
        {
            var result = await _provinceService.GetWithRegionAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // DELETE: /api/provinces/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult<ServiceResponse<bool>>> DeleteProvince(Guid id)
        {
            var result = await _provinceService.DeleteAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
