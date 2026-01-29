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
    /// Service interface for Province business logic
    /// </summary>
    public interface IProvinceService : IGenericService<ProvinceDto>
    {
        /// <summary>
        /// Get province by name
        /// </summary>
        Task<ServiceResponse<ProvinceDto>> GetByNameAsync(string name);

        /// <summary>
        /// Check if province name exists
        /// </summary>
        Task<ServiceResponse<bool>> NameExistsAsync(string name);

        /// <summary>
        /// Get provinces by region
        /// </summary>
        Task<PagedResponse<ProvinceDto>> GetByRegionAsync(Guid regionId, int pageNumber = 1, int pageSize = 10);

        /// <summary>
        /// Get province with region
        /// </summary>
        Task<ServiceResponse<ProvinceDto>> GetWithRegionAsync(Guid id);

        /// <summary>
        /// Get provinces by search term
        /// </summary>
        Task<PagedResponse<ProvinceDto>> SearchAsync(string searchTerm, int pageNumber = 1, int pageSize = 10);
    }
}
