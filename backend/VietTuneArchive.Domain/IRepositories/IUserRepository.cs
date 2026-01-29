using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Domain.Entities;

namespace VietTuneArchive.Domain.IRepositories
{
    /// <summary>
    /// Repository interface for User entity
    /// </summary>
    public interface IUserRepository : IGenericRepository<User>
    {
        /// <summary>
        /// Get user by email
        /// </summary>
        Task<User> GetByEmailAsync(string email);

        /// <summary>
        /// Get user by phone number
        /// </summary>
        Task<User> GetByPhoneNumberAsync(string phoneNumber);

        /// <summary>
        /// Check if user email exists
        /// </summary>
        Task<bool> EmailExistsAsync(string email);

        /// <summary>
        /// Check if user phone number exists
        /// </summary>
        Task<bool> PhoneNumberExistsAsync(string phoneNumber);
    }
}
