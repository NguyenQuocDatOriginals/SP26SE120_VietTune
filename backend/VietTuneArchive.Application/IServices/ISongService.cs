using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Application.Responses;

namespace VietTuneArchive.Application.IServices
{
    /// <summary>
    /// Service interface for Song business logic
    /// </summary>
    public interface ISongService
    {
        /// <summary>
        /// Get songs by performer
        /// </summary>
        Task<ServiceResponse<object>> GetByPerformerAsync(string performer);

        /// <summary>
        /// Get songs by author
        /// </summary>
        Task<ServiceResponse<object>> GetByAuthorAsync(string author);

        /// <summary>
        /// Get songs by genre
        /// </summary>
        Task<ServiceResponse<object>> GetByGenreAsync(string genre);

        /// <summary>
        /// Get songs by dialect
        /// </summary>
        Task<ServiceResponse<object>> GetByDialectAsync(string dialect);

        /// <summary>
        /// Get songs by province
        /// </summary>
        Task<ServiceResponse<object>> GetByProvinceAsync(string province);

        /// <summary>
        /// Search songs by title
        /// </summary>
        Task<ServiceResponse<object>> SearchByTitleAsync(string title);
    }
}
