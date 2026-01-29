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
    /// Service implementation for Instrument business logic
    /// </summary>
    public class InstrumentService : GenericService<Instrument, InstrumentDto>, IInstrumentService
    {
        private readonly IInstrumentRepository _instrumentRepository;

        public InstrumentService(IInstrumentRepository instrumentRepository, IMapper mapper) 
            : base(instrumentRepository, mapper)
        {
            _instrumentRepository = instrumentRepository;
        }

        public async Task<ServiceResponse<InstrumentDto>> GetByNameAsync(string name)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                    throw new ArgumentException("Name cannot be empty", nameof(name));

                var instrument = await _instrumentRepository.GetByNameAsync(name);
                if (instrument == null)
                    return new ServiceResponse<InstrumentDto>
                    {
                        Success = false,
                        Message = "Instrument not found"
                    };

                var dto = _mapper.Map<InstrumentDto>(instrument);
                return new ServiceResponse<InstrumentDto>
                {
                    Success = true,
                    Data = dto,
                    Message = "Retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<InstrumentDto>
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

                var exists = await _instrumentRepository.NameExistsAsync(name);
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

        public async Task<PagedResponse<InstrumentDto>> SearchAsync(string searchTerm, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                    throw new ArgumentException("Search term cannot be empty", nameof(searchTerm));

                var instruments = await GetAsync(i => i.Name.Contains(searchTerm) || i.Description.Contains(searchTerm));
                var pagedInstruments = instruments.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
                var dtos = _mapper.Map<List<InstrumentDto>>(pagedInstruments);

                return new PagedResponse<InstrumentDto>
                {
                    Success = true,
                    Data = dtos,
                    Total = instruments.Count(),
                    Page = pageNumber,
                    PageSize = pageSize,
                    Message = "Retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new PagedResponse<InstrumentDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }
    }
}
