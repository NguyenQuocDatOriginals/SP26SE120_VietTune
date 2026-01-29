using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Responses;

namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InstrumentController : ControllerBase
    {
        private readonly IInstrumentService _instrumentService;

        public InstrumentController(IInstrumentService instrumentService)
        {
            _instrumentService = instrumentService;
        }

        // GET: /api/instruments
        [HttpGet]
        public async Task<ActionResult<PagedResponse<InstrumentDto>>> GetInstruments(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _instrumentService.GetPaginatedAsync(page, pageSize);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }

        // GET: /api/instruments/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceResponse<InstrumentDto>>> GetInstrument(Guid id)
        {
            var result = await _instrumentService.GetByIdAsync(id);
            if (!result.Success)
                return NotFound(result);
            return Ok(result);
        }

        // DELETE: /api/instruments/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult<ServiceResponse<bool>>> DeleteInstrument(Guid id)
        {
            var result = await _instrumentService.DeleteAsync(id);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }

        // GET: /api/instruments/search?term={term}
        [HttpGet("search/term")]
        public async Task<ActionResult<PagedResponse<InstrumentDto>>> SearchInstruments(
            [FromQuery] string term,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _instrumentService.SearchAsync(term, page, pageSize);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }
    }
}
