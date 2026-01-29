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
    /// Service interface for Context business logic
    /// </summary>
    public interface IContextService : IGenericService<ContextDto>
    {
        /// <summary>
        /// Get context by name
        /// </summary>
        Task<ServiceResponse<ContextDto>> GetByNameAsync(string name);

        /// <summary>
        /// Check if context name exists
        /// </summary>
        Task<ServiceResponse<bool>> NameExistsAsync(string name);

        /// <summary>
        /// Get contexts by search term
        /// </summary>
        Task<PagedResponse<ContextDto>> SearchAsync(string searchTerm, int pageNumber = 1, int pageSize = 10);
    }
}
