using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Responses;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Domain.IRepositories;

namespace VietTuneArchive.Application.Services
{
    /// <summary>
    /// Service implementation for Region business logic
    /// </summary>
    public class RegionService : GenericService<Region, RegionDto>, IRegionService
    {
        private readonly IRegionRepository _regionRepository;

        public RegionService(IRegionRepository regionRepository, IMapper mapper) 
            : base(regionRepository, mapper)
        {
            _regionRepository = regionRepository;
        }

        public async Task<ServiceResponse<RegionDto>> GetByNameAsync(string name)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                    throw new ArgumentException("Name cannot be empty", nameof(name));

                var region = await _regionRepository.GetByNameAsync(name);
                if (region == null)
                    return new ServiceResponse<RegionDto>
                    {
                        Success = false,
                        Message = "Region not found"
                    };

                var dto = _mapper.Map<RegionDto>(region);
                return new ServiceResponse<RegionDto>
                {
                    Success = true,
                    Data = dto,
                    Message = "Retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<RegionDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<bool>> NameExistsAsync(string name)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                    throw new ArgumentException("Name cannot be empty", nameof(name));

                var exists = await _regionRepository.NameExistsAsync(name);
                return new ServiceResponse<bool>
                {
                    Success = true,
                    Data = exists,
                    Message = "Checked successfully"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<bool>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<RegionDto>> GetWithProvincesAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty", nameof(id));

                var region = await _regionRepository.GetWithProvincesAsync(id);
                if (region == null)
                    return new ServiceResponse<RegionDto>
                    {
                        Success = false,
                        Message = "Region not found"
                    };

                var dto = _mapper.Map<RegionDto>(region);
                return new ServiceResponse<RegionDto>
                {
                    Success = true,
                    Data = dto,
                    Message = "Retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<RegionDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<PagedResponse<RegionDto>> SearchAsync(string searchTerm, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                    throw new ArgumentException("Search term cannot be empty", nameof(searchTerm));

                var regions = await GetAsync(r => r.Name.Contains(searchTerm) || r.Description.Contains(searchTerm));
                var pagedRegions = regions.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
                var dtos = _mapper.Map<List<RegionDto>>(pagedRegions);

                return new PagedResponse<RegionDto>
                {
                    Success = true,
                    Data = dtos,
                    Total = regions.Count(),
                    Page = pageNumber,
                    PageSize = pageSize,
                    Message = "Retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new PagedResponse<RegionDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<RegionDto>> CreateAsync(RegionCreateDto request)
        {
            try
            {
                if (request == null)
                    throw new ArgumentNullException(nameof(request));

                var dto = _mapper.Map<RegionDto>(request);
                return await CreateAsync(dto);
            }
            catch (Exception ex)
            {
                return new ServiceResponse<RegionDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<RegionDto>> UpdateAsync(Guid id, RegionUpdateDto request)
        {
            try
            {
                if (request == null)
                    throw new ArgumentNullException(nameof(request));

                var dto = _mapper.Map<RegionDto>(request);
                return await UpdateAsync(id, dto);
            }
            catch (Exception ex)
            {
                return new ServiceResponse<RegionDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }
    }
}
