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
    /// Service implementation for Province business logic
    /// </summary>
    public class ProvinceService : GenericService<Province, ProvinceDto>, IProvinceService
    {
        private readonly IProvinceRepository _provinceRepository;

        public ProvinceService(IProvinceRepository provinceRepository, IMapper mapper) 
            : base(provinceRepository, mapper)
        {
            _provinceRepository = provinceRepository;
        }

        public async Task<ServiceResponse<ProvinceDto>> GetByNameAsync(string name)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                    throw new ArgumentException("Name cannot be empty", nameof(name));

                var province = await _provinceRepository.GetByNameAsync(name);
                if (province == null)
                    return new ServiceResponse<ProvinceDto>
                    {
                        Success = false,
                        Message = "Province not found"
                    };

                var dto = _mapper.Map<ProvinceDto>(province);
                return new ServiceResponse<ProvinceDto>
                {
                    Success = true,
                    Data = dto,
                    Message = "Retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<ProvinceDto>
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

                var exists = await _provinceRepository.NameExistsAsync(name);
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

        public async Task<PagedResponse<ProvinceDto>> GetByRegionAsync(Guid regionId, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                if (regionId == Guid.Empty)
                    throw new ArgumentException("Region id cannot be empty", nameof(regionId));

                var provinces = await GetAsync(p => p.RegionId == regionId);
                var pagedProvinces = provinces.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
                var dtos = _mapper.Map<List<ProvinceDto>>(pagedProvinces);

                return new PagedResponse<ProvinceDto>
                {
                    Success = true,
                    Data = dtos,
                    Total = provinces.Count(),
                    Page = pageNumber,
                    PageSize = pageSize,
                    Message = "Retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new PagedResponse<ProvinceDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<ProvinceDto>> GetWithRegionAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty", nameof(id));

                var province = await _provinceRepository.GetWithRegionAsync(id);
                if (province == null)
                    return new ServiceResponse<ProvinceDto>
                    {
                        Success = false,
                        Message = "Province not found"
                    };

                var dto = _mapper.Map<ProvinceDto>(province);
                return new ServiceResponse<ProvinceDto>
                {
                    Success = true,
                    Data = dto,
                    Message = "Retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<ProvinceDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<PagedResponse<ProvinceDto>> SearchAsync(string searchTerm, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                    throw new ArgumentException("Search term cannot be empty", nameof(searchTerm));

                var provinces = await GetAsync(p => p.Name.Contains(searchTerm) || p.Description.Contains(searchTerm));
                var pagedProvinces = provinces.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
                var dtos = _mapper.Map<List<ProvinceDto>>(pagedProvinces);

                return new PagedResponse<ProvinceDto>
                {
                    Success = true,
                    Data = dtos,
                    Total = provinces.Count(),
                    Page = pageNumber,
                    PageSize = pageSize,
                    Message = "Retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new PagedResponse<ProvinceDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<ProvinceDto>> CreateAsync(ProvinceCreateDto request)
        {
            try
            {
                if (request == null)
                    throw new ArgumentNullException(nameof(request));

                var dto = _mapper.Map<ProvinceDto>(request);
                return await CreateAsync(dto);
            }
            catch (Exception ex)
            {
                return new ServiceResponse<ProvinceDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<ProvinceDto>> UpdateAsync(Guid id, ProvinceUpdateDto request)
        {
            try
            {
                if (request == null)
                    throw new ArgumentNullException(nameof(request));

                var dto = _mapper.Map<ProvinceDto>(request);
                return await UpdateAsync(id, dto);
            }
            catch (Exception ex)
            {
                return new ServiceResponse<ProvinceDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }
    }
}
