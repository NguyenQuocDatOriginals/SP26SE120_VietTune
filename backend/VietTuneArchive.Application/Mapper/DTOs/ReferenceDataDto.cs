using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VietTuneArchive.Application.Mapper.DTOs
{
    public class ReferenceDataDto
    {
        public class ReferenceItemDto
        {
            public string Id { get; set; } = default!;
            public string Name { get; set; } = default!;
            public string Code { get; set; } = default!;
        }

        public class EthnicGroupDto : ReferenceItemDto { }

        public class EthnicGroupDetailDto : EthnicGroupDto
        {
            public string Population { get; set; } = default!;
            public string Distribution { get; set; } = default!;
            public string Description { get; set; } = default!;
        }

        public class RegionDto : ReferenceItemDto { }

        public class ProvinceDto
        {
            public string Id { get; set; } = default!;
            public string Code { get; set; } = default!;
            public string Name { get; set; } = default!;
            public string RegionId { get; set; } = default!;
        }

        public class MusicGenreDto
        {
            public string Id { get; set; } = default!;
            public string Name { get; set; } = default!;
            public string? ParentId { get; set; }
            public List<MusicGenreDto> Children { get; set; } = new();
        }

        public class LanguageDto : ReferenceItemDto { }

        public class ReferenceBundleDto
        {
            public List<EthnicGroupDto> EthnicGroups { get; set; } = new();
            public List<RegionDto> Regions { get; set; } = new();
            public List<ProvinceDto> Provinces { get; set; } = new();
            public List<MusicGenreDto> MusicGenres { get; set; } = new();
            public List<ReferenceItemDto> EventTypes { get; set; } = new();
            public List<ReferenceItemDto> PerformanceTypes { get; set; } = new();
            public List<LanguageDto> Languages { get; set; } = new();
            public List<ReferenceItemDto> LicenseTypes { get; set; } = new();
        }
    }
}
