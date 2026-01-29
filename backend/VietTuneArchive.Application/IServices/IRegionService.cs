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
    /// Service interface for Region business logic
    /// </summary>
    public interface IRegionService : IGenericService<RegionDto>
    {
        /// <summary>
        /// Get region by name
        /// </summary>
        Task<ServiceResponse<RegionDto>> GetByNameAsync(string name);

        /// <summary>
        /// Check if region name exists
        /// </summary>
        Task<ServiceResponse<bool>> NameExistsAsync(string name);

        /// <summary>
        /// Get region with provinces
        /// </summary>
        Task<ServiceResponse<RegionDto>> GetWithProvincesAsync(Guid id);

        /// <summary>
        /// Get regions by search term
        /// </summary>
        Task<PagedResponse<RegionDto>> SearchAsync(string searchTerm, int pageNumber = 1, int pageSize = 10);
    }
}
