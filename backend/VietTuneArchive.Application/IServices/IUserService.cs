using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Application.Responses;

namespace VietTuneArchive.Application.IServices
{
    /// <summary>
    /// Service interface for User business logic
    /// </summary>
    public interface IUserService
    {
        /// <summary>
        /// Get user by email
        /// </summary>
        Task<ServiceResponse<object>> GetByEmailAsync(string email);

        /// <summary>
        /// Get user by phone number
        /// </summary>
        Task<ServiceResponse<object>> GetByPhoneNumberAsync(string phoneNumber);

        /// <summary>
        /// Check if user email exists
        /// </summary>
        Task<ServiceResponse<bool>> EmailExistsAsync(string email);

        /// <summary>
        /// Check if user phone number exists
        /// </summary>
        Task<ServiceResponse<bool>> PhoneNumberExistsAsync(string phoneNumber);

        /// <summary>
        /// Get active users
        /// </summary>
        Task<ServiceResponse<object>> GetActiveUsersAsync();

        /// <summary>
        /// Activate user
        /// </summary>
        Task<ServiceResponse<object>> ActivateUserAsync(Guid userId);

        /// <summary>
        /// Deactivate user
        /// </summary>
        Task<ServiceResponse<object>> DeactivateUserAsync(Guid userId);
    }
}
