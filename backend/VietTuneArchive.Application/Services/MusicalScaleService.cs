using AutoMapper;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Responses;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Domain.IRepositories;

namespace VietTuneArchive.Application.Services
{
    public class MusicalScaleService : GenericService<MusicalScale, MusicalScaleDto>, IMusicalScaleService
    {
        private readonly IMusicalScaleRepository _musicalScaleRepository;

        public MusicalScaleService(IMusicalScaleRepository repository, IMapper mapper)
            : base(repository, mapper)
        {
            _musicalScaleRepository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        /// <summary>
        /// Search musical scales by name with Vietnamese diacritics support
        /// </summary>
        public async Task<ServiceResponse<List<MusicalScaleDto>>> SearchByNameAsync(string name)
        {
            try
            {
                var scales = await _musicalScaleRepository.SearchByNameAsync(name);
                var dtos = _mapper.Map<List<MusicalScaleDto>>(scales);
                return new ServiceResponse<List<MusicalScaleDto>>
                {
                    Success = true,
                    Data = dtos,
                    Message = $"Found {dtos.Count} musical scales matching: {name}"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<MusicalScaleDto>>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Search musical scales by name with Vietnamese diacritics support and pagination
        /// </summary>
        public async Task<PagedResponse<MusicalScaleDto>> SearchByNameAsync(string? name, int pageNumber, int pageSize)
        {
            try
            {
                if (pageNumber < 1)
                    throw new ArgumentException("Page number must be greater than 0", nameof(pageNumber));
                if (pageSize < 1)
                    throw new ArgumentException("Page size must be greater than 0", nameof(pageSize));

                var scales = await _musicalScaleRepository.SearchByNameAsync(name);
                var scalesList = scales.ToList();
                var total = scalesList.Count;

                var paginatedScales = scalesList
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var dtos = _mapper.Map<List<MusicalScaleDto>>(paginatedScales);
                return new PagedResponse<MusicalScaleDto>
                {
                    Success = true,
                    Data = dtos,
                    Total = total,
                    Page = pageNumber,
                    PageSize = pageSize,
                    Message = $"Found {total} musical scales matching: {name}"
                };
            }
            catch (Exception ex)
            {
                return new PagedResponse<MusicalScaleDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Get musical scales with note patterns
        /// </summary>
        public async Task<ServiceResponse<List<MusicalScaleDto>>> GetWithNotePatternAsync()
        {
            try
            {
                var scales = await _musicalScaleRepository.GetAsync(ms => ms.NotePattern != null);
                var dtos = _mapper.Map<List<MusicalScaleDto>>(scales);
                return new ServiceResponse<List<MusicalScaleDto>>
                {
                    Success = true,
                    Data = dtos,
                    Message = "Retrieved musical scales with note patterns successfully"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<MusicalScaleDto>>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Get all musical scales by pattern
        /// </summary>
        public async Task<ServiceResponse<List<MusicalScaleDto>>> GetByPatternAsync(string pattern)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(pattern))
                    throw new ArgumentException("Pattern cannot be empty", nameof(pattern));

                var scales = await _musicalScaleRepository.GetAsync(ms => ms.NotePattern == pattern);
                var dtos = _mapper.Map<List<MusicalScaleDto>>(scales);
                return new ServiceResponse<List<MusicalScaleDto>>
                {
                    Success = true,
                    Data = dtos,
                    Message = $"Found {dtos.Count} scales with pattern {pattern}"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<MusicalScaleDto>>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Get all distinct note patterns
        /// </summary>
        public async Task<ServiceResponse<List<string>>> GetAllPatternsAsync()
        {
            try
            {
                var scales = await _musicalScaleRepository.GetAllAsync();
                var patterns = scales
                    .Where(s => !string.IsNullOrEmpty(s.NotePattern))
                    .Select(s => s.NotePattern!)
                    .Distinct()
                    .OrderBy(p => p)
                    .ToList();

                return new ServiceResponse<List<string>>
                {
                    Success = true,
                    Data = patterns,
                    Message = "Retrieved all note patterns successfully"
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
