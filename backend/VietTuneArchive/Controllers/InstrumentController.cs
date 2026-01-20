using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.Mapper.DTOs;
using static VietTuneArchive.Application.Mapper.DTOs.CommonDto;
using static VietTuneArchive.Application.Mapper.DTOs.InstrumentDto;
using static VietTuneArchive.Application.Mapper.DTOs.Request.InstrumentRequest;

namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InstrumentController : ControllerBase
    {
        // GET: /api/instruments
        [HttpGet]
        public ActionResult<PagedList<InstrumentSummaryDto>> GetInstruments(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? category = null)
        {
            var instruments = new PagedList<InstrumentSummaryDto>
            {
                Items = new List<InstrumentSummaryDto>(),
                Page = page,
                PageSize = pageSize,
                Total = 156
            };
            return Ok(instruments);
        }

        // GET: /api/instruments/{id}
        [HttpGet("{id}")]
        public ActionResult<InstrumentDetailDto> GetInstrument(string id)
        {
            var instrument = new InstrumentDetailDto
            {
                Id = id,
                Name = "Đàn bầu",
                Category = "Dây",
                EthnicGroups = new[] { "Kinh", "Mường" },
                Description = "Nhạc cụ một dây đặc trưng văn hóa Việt Nam",
                PlayingTechnique = "Kéo dây rung",
                Range = "2.5 quãng tám",
                ImageUrl = "https://cdn.dan-bau.jpg"
            };
            return Ok(instrument);
        }

        // GET: /api/instruments/{id}/songs
        [HttpGet("{id}/songs")]
        public ActionResult<PagedList<SongSummaryDto>> GetInstrumentSongs(string id,
            [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var songs = new PagedList<SongSummaryDto>();
            return Ok(songs);
        }

        // GET: /api/instruments/categories
        [HttpGet("categories")]
        public ActionResult<List<CategoryDto>> GetCategories()
        {
            var categories = new List<CategoryDto>
            {
                new() { Id = "day", Name = "Nhạc cụ dây", Icon = "guitar" },
                new() { Id = "go", Name = "Nhạc cụ gõ", Icon = "drum" },
                new() { Id = "khi", Name = "Nhạc cụ hơi", Icon = "flute" }
            };
            return Ok(categories);
        }

        // GET: /api/instruments/by-ethnic-group/{id}
        [HttpGet("by-ethnic-group/{id}")]
        public ActionResult<PagedList<InstrumentSummaryDto>> GetByEthnicGroup(string id,
            [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var instruments = new PagedList<InstrumentSummaryDto>();
            return Ok(instruments);
        }

        // POST: /api/instruments
        [HttpPost]
        //[Authorize(Policy = "Expert")]
        public ActionResult<InstrumentDetailDto> CreateInstrument([FromBody] CreateInstrumentRequest request)
        {
            var instrument = new InstrumentDetailDto
            {
                Id = "inst-001",
                Name = request.Name,
                Category = request.Category
            };
            return Created(instrument.Id, instrument);
        }

        // PUT: /api/instruments/{id}
        [HttpPut("{id}")]
        //[Authorize(Policy = "Expert")]
        public ActionResult<BaseResponse> UpdateInstrument(string id, [FromBody] UpdateInstrumentRequest request)
        {
            return Ok(new BaseResponse { Success = true, Message = "Instrument updated" });
        }
    }
}
