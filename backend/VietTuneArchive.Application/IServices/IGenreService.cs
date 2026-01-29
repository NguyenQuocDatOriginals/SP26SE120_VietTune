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
    /// Service interface for Genre business logic
    /// </summary>
    public interface IGenreService : IGenericService<GenreDto>
    {
        /// <summary>
        /// Get genre by name
        /// </summary>
        Task<ServiceResponse<GenreDto>> GetByNameAsync(string name);

        /// <summary>
        /// Check if genre name exists
        /// </summary>
        Task<ServiceResponse<bool>> NameExistsAsync(string name);

        /// <summary>
        /// Get genres by search term
        /// </summary>
        Task<PagedResponse<GenreDto>> SearchAsync(string searchTerm, int pageNumber = 1, int pageSize = 10);
    }
}
