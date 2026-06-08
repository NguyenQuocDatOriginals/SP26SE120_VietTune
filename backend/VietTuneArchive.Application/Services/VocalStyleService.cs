using AutoMapper;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Responses;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Domain.IRepositories;

namespace VietTuneArchive.Application.Services
{
    public class VocalStyleService : GenericService<VocalStyle, VocalStyleDto>, IVocalStyleService
    {
        private readonly IVocalStyleRepository _vocalStyleRepository;

        public VocalStyleService(IVocalStyleRepository repository, IMapper mapper)
            : base(repository, mapper)
        {
            _vocalStyleRepository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        /// <summary>
        /// Get vocal styles by ethnic group
        /// </summary>
        public async Task<ServiceResponse<List<VocalStyleDto>>> GetByEthnicGroupAsync(Guid ethnicGroupId)
        {
            try
            {
                if (ethnicGroupId == Guid.Empty)
                    throw new ArgumentException("Ethnic group id cannot be empty", nameof(ethnicGroupId));

                var vocalStyles = await _vocalStyleRepository.GetAsync(vs => vs.EthnicGroupId == ethnicGroupId);
                var dtos = _mapper.Map<List<VocalStyleDto>>(vocalStyles);
                return new ServiceResponse<List<VocalStyleDto>>
                {
                    Success = true,
                    Data = dtos,
                    Message = $"Found {dtos.Count} vocal styles"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<VocalStyleDto>>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Search vocal styles by name with Vietnamese diacritics support
        /// </summary>
        public async Task<ServiceResponse<List<VocalStyleDto>>> SearchByNameAsync(string? name)
        {
            try
            {
                var vocalStyles = await _vocalStyleRepository.SearchByNameAsync(name);
                var dtos = _mapper.Map<List<VocalStyleDto>>(vocalStyles);
                return new ServiceResponse<List<VocalStyleDto>>
                {
                    Success = true,
                    Data = dtos,
                    Message = $"Found {dtos.Count} vocal styles matching: {name}"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<VocalStyleDto>>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Search vocal styles by name with Vietnamese diacritics support and pagination
        /// </summary>
        public async Task<PagedResponse<VocalStyleDto>> SearchByNameAsync(string? name, int pageNumber, int pageSize)
        {
            try
            {
                if (pageNumber < 1)
                    throw new ArgumentException("Page number must be greater than 0", nameof(pageNumber));
                if (pageSize < 1)
                    throw new ArgumentException("Page size must be greater than 0", nameof(pageSize));

                var vocalStyles = await _vocalStyleRepository.SearchByNameAsync(name);
                var vocalStylesList = vocalStyles.ToList();
                var total = vocalStylesList.Count;

                var paginatedVocalStyles = vocalStylesList
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var dtos = _mapper.Map<List<VocalStyleDto>>(paginatedVocalStyles);
                return new PagedResponse<VocalStyleDto>
                {
                    Success = true,
                    Data = dtos,
                    Total = total,
                    Page = pageNumber,
                    PageSize = pageSize,
                    Message = $"Found {total} vocal styles matching: {name}"
                };
            }
            catch (Exception ex)
            {
                return new PagedResponse<VocalStyleDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Get vocal styles with descriptions
        /// </summary>
        public async Task<ServiceResponse<List<VocalStyleDto>>> GetWithDescriptionsAsync()
        {
            try
            {
                var vocalStyles = await _vocalStyleRepository.GetAsync(vs => vs.Description != null);
                var dtos = _mapper.Map<List<VocalStyleDto>>(vocalStyles);
                return new ServiceResponse<List<VocalStyleDto>>
                {
                    Success = true,
                    Data = dtos,
                    Message = "Retrieved vocal styles with descriptions successfully"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<VocalStyleDto>>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }
    }
}
