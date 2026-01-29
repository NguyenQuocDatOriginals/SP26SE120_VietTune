using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Responses;

namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GenreController : ControllerBase
    {
        private readonly IGenreService _genreService;

        public GenreController(IGenreService genreService)
        {
            _genreService = genreService;
        }

        // ? SPECIFIC ROUTES FIRST
        // GET: /api/genres/search?term={term}
        [HttpGet("search")]
        public async Task<ActionResult<PagedResponse<GenreDto>>> SearchGenres(
            [FromQuery] string term,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _genreService.SearchAsync(term, page, pageSize);
            return Ok(result);
        }

        // GET: /api/genres/by-name?name={name}
        [HttpGet("by-name")]
        public async Task<ActionResult<ServiceResponse<GenreDto>>> GetByName([FromQuery] string name)
        {
            var result = await _genreService.GetByNameAsync(name);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // ? GENERIC ROUTES AFTER
        // GET: /api/genres
        [HttpGet]
        public async Task<ActionResult<PagedResponse<GenreDto>>> GetGenres(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _genreService.GetPaginatedAsync(page, pageSize);
            return Ok(result);
        }

        // GET: /api/genres/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceResponse<GenreDto>>> GetGenre(Guid id)
        {
            var result = await _genreService.GetByIdAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // DELETE: /api/genres/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult<ServiceResponse<bool>>> DeleteGenre(Guid id)
        {
            var result = await _genreService.DeleteAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
