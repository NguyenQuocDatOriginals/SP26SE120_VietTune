using System;
using System.Collections.Generic;

namespace VietTuneArchive.Application.Mapper.DTOs
{
    public class RegionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public ICollection<ProvinceDto>? Provinces { get; set; }
    }

    public class RegionCreateDto
    {
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
    }

    public class RegionUpdateDto
    {
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
    }

    public class ProvinceDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
        public Guid? RegionId { get; set; }
        public RegionDto? Region { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class ProvinceCreateDto
    {
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
        public Guid? RegionId { get; set; }
    }

    public class ProvinceUpdateDto
    {
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
        public Guid? RegionId { get; set; }
    }

    public class GenreDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class GenreCreateDto
    {
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
    }

    public class GenreUpdateDto
    {
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
    }

    public class ContextDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class ContextCreateDto
    {
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
    }

    public class ContextUpdateDto
    {
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
    }
}
