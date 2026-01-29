using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Domain.Entities;
using ContextEntity = VietTuneArchive.Domain.Entities.Context;

namespace VietTuneArchive.Application.Mapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // ✅ WORKING MAPPINGS ONLY

            // Genre Mappings
            CreateMap<Genre, GenreDto>().ReverseMap();
            CreateMap<GenreCreateDto, Genre>();
            CreateMap<GenreCreateDto, GenreDto>();
            CreateMap<GenreUpdateDto, Genre>();
            CreateMap<GenreUpdateDto, GenreDto>();

            // Instrument Mappings
            CreateMap<Instrument, InstrumentDto>().ReverseMap();

            // Region Mappings
            CreateMap<Region, RegionDto>().ReverseMap();
            CreateMap<RegionCreateDto, Region>();
            CreateMap<RegionCreateDto, RegionDto>();
            CreateMap<RegionUpdateDto, Region>();
            CreateMap<RegionUpdateDto, RegionDto>();

            // Province Mappings
            CreateMap<Province, ProvinceDto>().ReverseMap();
            CreateMap<ProvinceCreateDto, Province>();
            CreateMap<ProvinceCreateDto, ProvinceDto>();
            CreateMap<ProvinceUpdateDto, Province>();
            CreateMap<ProvinceUpdateDto, ProvinceDto>();

            // Context Mappings
            CreateMap<ContextEntity, ContextDto>();
            CreateMap<ContextDto, ContextEntity>();
            CreateMap<ContextCreateDto, ContextEntity>();
            CreateMap<ContextCreateDto, ContextDto>();
            CreateMap<ContextUpdateDto, ContextEntity>();
            CreateMap<ContextUpdateDto, ContextDto>();

            // OPTIONAL: User, Song, Submission (disable for now if causing issues)
            // CreateMap<User, UserDto.UserProfileDto>()
            //     .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()));
            // CreateMap<Song, SongDto.SongDetailDto>();
            // CreateMap<Submission, SubmissionDto>();
        }
    }
}
