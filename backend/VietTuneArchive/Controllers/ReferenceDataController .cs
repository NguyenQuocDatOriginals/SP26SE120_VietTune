using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.Mapper.DTOs;
using static VietTuneArchive.Application.Mapper.DTOs.ReferenceDataDto;
using RegionDtoRef = VietTuneArchive.Application.Mapper.DTOs.RegionDto;
using ProvinceDtoRef = VietTuneArchive.Application.Mapper.DTOs.ProvinceDto;

namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class ReferenceDataController : ControllerBase
    {
        // GET: /api/reference/ethnic-groups
        [HttpGet("ethnic-groups")]
        public ActionResult<List<EthnicGroupDto>> GetEthnicGroups()
        {
            var ethnicGroups = new List<EthnicGroupDto>
            {
                new() { Id = "1", Name = "Kinh", Code = "kinh" },
                new() { Id = "2", Name = "Tày", Code = "tay" },
                // ... 52 dân tộc khác
            };
            return Ok(ethnicGroups);
        }

        // GET: /api/reference/ethnic-groups/{id}
        [HttpGet("ethnic-groups/{id}")]
        public ActionResult<EthnicGroupDetailDto> GetEthnicGroup(string id)
        {
            var ethnicGroup = new EthnicGroupDetailDto
            {
                Id = id,
                Name = "Kinh",
                Code = "kinh",
                Population = "86 triệu",
                Distribution = "Toàn quốc",
                Description = "Dân tộc đa số Việt Nam"
            };
            return Ok(ethnicGroup);
        }

        // GET: /api/reference/regions
        [HttpGet("regions")]
        public ActionResult<List<RegionDtoRef>> GetRegions()
        {
            var regions = new List<RegionDtoRef>
            {
                new() { Id = Guid.NewGuid(), Name = "Bắc Bộ", Description = "Vùng Bắc Bộ", CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Name = "Trung Bộ", Description = "Vùng Trung Bộ", CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Name = "Nam Bộ", Description = "Vùng Nam Bộ", CreatedAt = DateTime.UtcNow }
            };
            return Ok(regions);
        }

        // GET: /api/reference/provinces
        [HttpGet("provinces")]
        public ActionResult<List<ProvinceDtoRef>> GetProvinces()
        {
            var provinces = new List<ProvinceDtoRef>
            {
                new() { Id = Guid.NewGuid(), Name = "Hà Nội", Description = "Thủ đô Hà Nội", RegionId = Guid.NewGuid(), CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Name = "Hà Giang", Description = "Hà Giang", RegionId = Guid.NewGuid(), CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Name = "TP. Hồ Chí Minh", Description = "TP. Hồ Chí Minh", RegionId = Guid.NewGuid(), CreatedAt = DateTime.UtcNow }
            };
            return Ok(provinces);
        }

        // GET: /api/reference/music-genres
        [HttpGet("music-genres")]
        public ActionResult<List<MusicGenreDto>> GetMusicGenres()
        {
            var genres = new List<MusicGenreDto>
            {
                new() { Id = "1", Name = "Dân gian", ParentId = null, Children = new List<MusicGenreDto>() },
                new() { Id = "2", Name = "Cải lương", ParentId = null },
                new() { Id = "3", Name = "Rap Việt", ParentId = "1" }
            };
            return Ok(genres);
        }

        // GET: /api/reference/event-types
        [HttpGet("event-types")]
        public ActionResult<List<ReferenceItemDto>> GetEventTypes()
        {
            var types = new List<ReferenceItemDto>
            {
                new() { Id = "1", Name = "Lễ hội", Code = "le-hoi" },
                new() { Id = "2", Name = "Hội diễn", Code = "hoi-dien" },
                new() { Id = "3", Name = "Biểu diễn", Code = "bieu-dien" }
            };
            return Ok(types);
        }

        // GET: /api/reference/performance-types
        [HttpGet("performance-types")]
        public ActionResult<List<ReferenceItemDto>> GetPerformanceTypes()
        {
            var types = new List<ReferenceItemDto>
            {
                new() { Id = "1", Name = "Múa", Code = "mua" },
                new() { Id = "2", Name = "Hát", Code = "hat" },
                new() { Id = "3", Name = "Kịch", Code = "kich" }
            };
            return Ok(types);
        }

        // GET: /api/reference/languages
        [HttpGet("languages")]
        public ActionResult<List<LanguageDto>> GetLanguages()
        {
            var languages = new List<LanguageDto>
            {
                new() { Id = "1", Name = "Tiếng Việt", Code = "vi" },
                new() { Id = "2", Name = "Tiếng Anh", Code = "en" },
                new() { Id = "3", Name = "Tiếng Tày", Code = "tyz" }
            };
            return Ok(languages);
        }

        // GET: /api/reference/license-types
        [HttpGet("license-types")]
        public ActionResult<List<ReferenceItemDto>> GetLicenseTypes()
        {
            var types = new List<ReferenceItemDto>
            {
                new() { Id = "1", Name = "Giấy phép biểu diễn", Code = "gp-bd" },
                new() { Id = "2", Name = "Giấy phép lưu hành", Code = "gp-lh" }
            };
            return Ok(types);
        }

        // GET: /api/reference/all
        [HttpGet("all")]
        public ActionResult<ReferenceBundleDto> GetAll()
        {
            var bundle = new ReferenceBundleDto
            {
                EthnicGroups = new List<EthnicGroupDto>(),
                // Regions and Provinces removed from ReferenceBundleDto to avoid Swagger conflicts
                MusicGenres = new List<MusicGenreDto>(),
                EventTypes = new List<ReferenceItemDto>(),
                PerformanceTypes = new List<ReferenceItemDto>(),
                Languages = new List<LanguageDto>(),
                LicenseTypes = new List<ReferenceItemDto>()
            };
            return Ok(bundle);
        }
    }
}
