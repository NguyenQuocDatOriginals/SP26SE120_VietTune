using Microsoft.AspNetCore.Authorization;
using System.Drawing.Drawing2D;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static VietTuneArchive.Application.Mapper.DTOs.ReferenceDataDto;

namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReferenceDataController : ControllerBase
    {
        // GET: /api/v1/reference/ethnic-groups
        [HttpGet("ethnic-groups")]
        public ActionResult<List<EthnicGroupDto>> GetEthnicGroups()
        {
            var ethnicGroups = new List<EthnicGroupDto>
            {
                new() { Id = "1", Name = "Kinh", Code = "kinh" },
                new() { Id = "2", Name = "Tày", Code = "tay" },
                // ... 52 dân tộc khác (TBD load từ DB/JSON)
            };
            return Ok(ethnicGroups);
        }

        // GET: /api/v1/reference/ethnic-groups/{id}
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

        // GET: /api/v1/reference/regions
        [HttpGet("regions")]
        public ActionResult<List<RegionDto>> GetRegions()
        {
            var regions = new List<RegionDto>
            {
                new() { Id = "1", Name = "Bắc Bộ", Code = "bac-bo" },
                new() { Id = "2", Name = "Trung Bộ", Code = "trung-bo" },
                new() { Id = "3", Name = "Nam Bộ", Code = "nam-bo" },
                // ... 5 vùng khác (Đông Bắc, Tây Bắc, Duyên hải Nam Trung Bộ, Tây Nguyên, Đồng Bằng Sông Cửu Long)
            };
            return Ok(regions);
        }

        // GET: /api/v1/reference/provinces
        [HttpGet("provinces")]
        public ActionResult<List<ProvinceDto>> GetProvinces()
        {
            var provinces = new List<ProvinceDto>
            {
                new() { Id = "79", Code = "01", Name = "Hà Nội", RegionId = "1" },
                new() { Id = "01", Code = "02", Name = "Hà Giang", RegionId = "1" },
                new() { Id = "48", Code = "79", Name = "TP. Hồ Chí Minh", RegionId = "3" },
                // ... 60 tỉnh/thành khác (TBD từ DB)
            };
            return Ok(provinces);
        }

        // GET: /api/v1/reference/music-genres
        [HttpGet("music-genres")]
        public ActionResult<List<MusicGenreDto>> GetMusicGenres()
        {
            var genres = new List<MusicGenreDto>
            {
                new() { Id = "1", Name = "Dân gian", ParentId = null, Children = new List<MusicGenreDto> { /* con */ } },
                new() { Id = "2", Name = "Cải lương", ParentId = null },
                new() { Id = "3", Name = "Rap Việt", ParentId = "1" }
                // Hierarchical: load recursive từ DB
            };
            return Ok(genres);
        }

        // GET: /api/v1/reference/event-types
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

        // GET: /api/v1/reference/performance-types
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

        // GET: /api/v1/reference/languages
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

        // GET: /api/v1/reference/license-types
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

        // GET: /api/v1/reference/all
        [HttpGet("all")]
        public ActionResult<ReferenceBundleDto> GetAll()
        {
            var bundle = new ReferenceBundleDto
            {
                EthnicGroups = new List<EthnicGroupDto>(),
                Regions = new List<RegionDto>(),
                Provinces = new List<ProvinceDto>(),
                MusicGenres = new List<MusicGenreDto>(),
                EventTypes = new List<ReferenceItemDto>(),
                PerformanceTypes = new List<ReferenceItemDto>(),
                Languages = new List<LanguageDto>(),
                LicenseTypes = new List<ReferenceItemDto>()
                // Gộp tất cả, TBD cache hoặc load parallel
            };
            return Ok(bundle);
        }
    }
}
