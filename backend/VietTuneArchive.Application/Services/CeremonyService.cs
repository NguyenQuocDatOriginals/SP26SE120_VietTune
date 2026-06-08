using AutoMapper;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Responses;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Domain.IRepositories;

namespace VietTuneArchive.Application.Services
{
    public class CeremonyService : GenericService<Ceremony, CeremonyDto>, ICeremonyService
    {
        private readonly ICeremonyRepository _ceremonyRepository;

        public CeremonyService(ICeremonyRepository repository, IMapper mapper)
            : base(repository, mapper)
        {
            _ceremonyRepository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        /// <summary>
        /// Get ceremonies by type
        /// </summary>
        public async Task<ServiceResponse<List<CeremonyDto>>> GetByTypeAsync(string type)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(type))
                    throw new ArgumentException("Type cannot be empty", nameof(type));

                var ceremonies = await _ceremonyRepository.GetAsync(c => c.Type == type);
                var dtos = _mapper.Map<List<CeremonyDto>>(ceremonies);
                return new ServiceResponse<List<CeremonyDto>>
                {
                    Success = true,
                    Data = dtos,
                    Message = $"Found {dtos.Count} ceremonies of type {type}"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<CeremonyDto>>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Get ceremonies by season
        /// </summary>
        public async Task<ServiceResponse<List<CeremonyDto>>> GetBySeasonAsync(string season)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(season))
                    throw new ArgumentException("Season cannot be empty", nameof(season));

                var ceremonies = await _ceremonyRepository.GetAsync(c => c.Season == season);
                var dtos = _mapper.Map<List<CeremonyDto>>(ceremonies);
                return new ServiceResponse<List<CeremonyDto>>
                {
                    Success = true,
                    Data = dtos,
                    Message = $"Found {dtos.Count} ceremonies in {season}"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<CeremonyDto>>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Search ceremonies by name with Vietnamese diacritics support
        /// </summary>
        public async Task<ServiceResponse<List<CeremonyDto>>> SearchByNameAsync(string? name)
        {
            try
            {
                var ceremonies = await _ceremonyRepository.SearchByNameAsync(name);
                var dtos = _mapper.Map<List<CeremonyDto>>(ceremonies);
                return new ServiceResponse<List<CeremonyDto>>
                {
                    Success = true,
                    Data = dtos,
                    Message = $"Found {dtos.Count} ceremonies matching: {name}"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<CeremonyDto>>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Search ceremonies by name with Vietnamese diacritics support and pagination
        /// </summary>
        public async Task<PagedResponse<CeremonyDto>> SearchByNameAsync(string? name, int pageNumber, int pageSize)
        {
            try
            {
                if (pageNumber < 1)
                    throw new ArgumentException("Page number must be greater than 0", nameof(pageNumber));
                if (pageSize < 1)
                    throw new ArgumentException("Page size must be greater than 0", nameof(pageSize));

                var ceremonies = await _ceremonyRepository.SearchByNameAsync(name);
                var ceremoniesList = ceremonies.ToList();
                var total = ceremoniesList.Count;

                var paginatedCeremonies = ceremoniesList
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var dtos = _mapper.Map<List<CeremonyDto>>(paginatedCeremonies);
                return new PagedResponse<CeremonyDto>
                {
                    Success = true,
                    Data = dtos,
                    Total = total,
                    Page = pageNumber,
                    PageSize = pageSize,
                    Message = $"Found {total} ceremonies matching: {name}"
                };
            }
            catch (Exception ex)
            {
                return new PagedResponse<CeremonyDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Get all ceremony types
        /// </summary>
        public async Task<ServiceResponse<List<string>>> GetAllTypesAsync()
        {
            try
            {
                var ceremonies = await _ceremonyRepository.GetAllAsync();
                var types = ceremonies
                    .Select(c => c.Type)
                    .Distinct()
                    .OrderBy(t => t)
                    .ToList();

                return new ServiceResponse<List<string>>
                {
                    Success = true,
                    Data = types,
                    Message = "Retrieved all ceremony types successfully"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<string>>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Get all seasons
        /// </summary>
        public async Task<ServiceResponse<List<string>>> GetAllSeasonsAsync()
        {
            try
            {
                var ceremonies = await _ceremonyRepository.GetAllAsync();
                var seasons = ceremonies
                    .Where(c => !string.IsNullOrEmpty(c.Season))
                    .Select(c => c.Season!)
                    .Distinct()
                    .OrderBy(s => s)
                    .ToList();

                return new ServiceResponse<List<string>>
                {
                    Success = true,
                    Data = seasons,
                    Message = "Retrieved all seasons successfully"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<string>>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }
    }
}
