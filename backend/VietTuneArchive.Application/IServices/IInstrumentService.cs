using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Responses;

namespace VietTuneArchive.Application.IServices
{
    /// <summary>
    /// Service interface for Instrument business logic
    /// </summary>
    public interface IInstrumentService : IGenericService<InstrumentDto>
    {
        /// <summary>
        /// Get instrument by name
        /// </summary>
        Task<ServiceResponse<InstrumentDto>> GetByNameAsync(string name);

        /// <summary>
        /// Check if instrument name exists
        /// </summary>
        Task<ServiceResponse<bool>> NameExistsAsync(string name);

        /// <summary>
        /// Get instruments by search term
        /// </summary>
        Task<PagedResponse<InstrumentDto>> SearchAsync(string searchTerm, int pageNumber = 1, int pageSize = 10);
    }
}
