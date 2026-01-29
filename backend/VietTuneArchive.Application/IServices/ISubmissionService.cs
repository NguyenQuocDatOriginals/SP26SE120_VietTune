using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Domain.Entities.Enum;
using VietTuneArchive.Application.Responses;

namespace VietTuneArchive.Application.IServices
{
    /// <summary>
    /// Service interface for Submission business logic
    /// </summary>
    public interface ISubmissionService
    {
        /// <summary>
        /// Get submissions by status
        /// </summary>
        Task<ServiceResponse<object>> GetByStatusAsync(SubmissionStatus status);

        /// <summary>
        /// Get pending submissions
        /// </summary>
        Task<ServiceResponse<object>> GetPendingSubmissionsAsync();

        /// <summary>
        /// Get approved submissions
        /// </summary>
        Task<ServiceResponse<object>> GetApprovedSubmissionsAsync();

        /// <summary>
        /// Get rejected submissions
        /// </summary>
        Task<ServiceResponse<object>> GetRejectedSubmissionsAsync();

        /// <summary>
        /// Get submissions by genre
        /// </summary>
        Task<ServiceResponse<object>> GetByGenreAsync(Guid genreId);

        /// <summary>
        /// Get submissions by province
        /// </summary>
        Task<ServiceResponse<object>> GetByProvinceAsync(Guid provinceId);

        /// <summary>
        /// Get submissions by context
        /// </summary>
        Task<ServiceResponse<object>> GetByContextAsync(Guid contextId);

        /// <summary>
        /// Approve submission
        /// </summary>
        Task<ServiceResponse<object>> ApproveSubmissionAsync(Guid submissionId, string reviewNotes = null);

        /// <summary>
        /// Reject submission
        /// </summary>
        Task<ServiceResponse<object>> RejectSubmissionAsync(Guid submissionId, string reviewNotes);

        /// <summary>
        /// Get pending submissions count
        /// </summary>
        Task<ServiceResponse<int>> GetPendingSubmissionsCountAsync();
    }
}
