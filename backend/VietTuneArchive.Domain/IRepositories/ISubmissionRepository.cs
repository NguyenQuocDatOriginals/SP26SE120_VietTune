using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Domain.Entities.Enum;

namespace VietTuneArchive.Domain.IRepositories
{
    /// <summary>
    /// Repository interface for Submission entity
    /// </summary>
    public interface ISubmissionRepository : IGenericRepository<Submission>
    {
        /// <summary>
        /// Get submissions by status
        /// </summary>
        Task<IEnumerable<Submission>> GetByStatusAsync(SubmissionStatus status);

        /// <summary>
        /// Get pending submissions
        /// </summary>
        Task<IEnumerable<Submission>> GetPendingSubmissionsAsync();

        /// <summary>
        /// Get approved submissions
        /// </summary>
        Task<IEnumerable<Submission>> GetApprovedSubmissionsAsync();

        /// <summary>
        /// Get rejected submissions
        /// </summary>
        Task<IEnumerable<Submission>> GetRejectedSubmissionsAsync();

        /// <summary>
        /// Get submissions by genre
        /// </summary>
        Task<IEnumerable<Submission>> GetByGenreAsync(Guid genreId);

        /// <summary>
        /// Get submissions by province
        /// </summary>
        Task<IEnumerable<Submission>> GetByProvinceAsync(Guid provinceId);

        /// <summary>
        /// Get submissions by context
        /// </summary>
        Task<IEnumerable<Submission>> GetByContextAsync(Guid contextId);
    }
}
