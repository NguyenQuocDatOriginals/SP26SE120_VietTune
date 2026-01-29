using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Responses;
using VietTuneArchive.Domain.IRepositories;
using ContextEntity = VietTuneArchive.Domain.Entities.Context;

namespace VietTuneArchive.Application.Services
{
    /// <summary>
    /// Service implementation for Context business logic
    /// </summary>
    public class ContextService : GenericService<ContextEntity, ContextDto>, IContextService
    {
        private readonly IContextRepository _contextRepository;

        public ContextService(IContextRepository contextRepository, IMapper mapper) 
            : base(contextRepository, mapper)
        {
            _contextRepository = contextRepository;
        }

        public async Task<ServiceResponse<ContextDto>> GetByNameAsync(string name)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                    throw new ArgumentException("Name cannot be empty", nameof(name));

                var context = await _contextRepository.GetByNameAsync(name);
                if (context == null)
                    return new ServiceResponse<ContextDto>
                    {
                        Success = false,
                        Message = "Context not found"
                    };

                var dto = _mapper.Map<ContextDto>(context);
                return new ServiceResponse<ContextDto>
                {
                    Success = true,
                    Data = dto,
                    Message = "Retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<ContextDto>
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

                var exists = await _contextRepository.NameExistsAsync(name);
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

        public async Task<PagedResponse<ContextDto>> SearchAsync(string searchTerm, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                    throw new ArgumentException("Search term cannot be empty", nameof(searchTerm));

                var contexts = await GetAsync(c => c.Name.Contains(searchTerm) || c.Description.Contains(searchTerm));
                var pagedContexts = contexts.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
                var dtos = _mapper.Map<List<ContextDto>>(pagedContexts);

                return new PagedResponse<ContextDto>
                {
                    Success = true,
                    Data = dtos,
                    Total = contexts.Count(),
                    Page = pageNumber,
                    PageSize = pageSize,
                    Message = "Retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new PagedResponse<ContextDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<ContextDto>> CreateAsync(ContextCreateDto request)
        {
            try
            {
                if (request == null)
                    throw new ArgumentNullException(nameof(request));

                var dto = _mapper.Map<ContextDto>(request);
                return await CreateAsync(dto);
            }
            catch (Exception ex)
            {
                return new ServiceResponse<ContextDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<ContextDto>> UpdateAsync(Guid id, ContextUpdateDto request)
        {
            try
            {
                if (request == null)
                    throw new ArgumentNullException(nameof(request));

                var dto = _mapper.Map<ContextDto>(request);
                return await UpdateAsync(id, dto);
            }
            catch (Exception ex)
            {
                return new ServiceResponse<ContextDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }
    }
}
