using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Domain.IRepositories;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Responses;

namespace VietTuneArchive.Application.Services
{
    /// <summary>
    /// Service implementation for User business logic
    /// </summary>
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<ServiceResponse<object>> GetByEmailAsync(string email)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email))
                    throw new ArgumentException("Email cannot be empty", nameof(email));

                var user = await _userRepository.GetByEmailAsync(email);
                return new ServiceResponse<object>
                {
                    Success = user != null,
                    Data = user,
                    Message = user != null ? "Found" : "Not found"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<object>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<object>> GetByPhoneNumberAsync(string phoneNumber)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(phoneNumber))
                    throw new ArgumentException("Phone number cannot be empty", nameof(phoneNumber));

                var user = await _userRepository.GetByPhoneNumberAsync(phoneNumber);
                return new ServiceResponse<object>
                {
                    Success = user != null,
                    Data = user,
                    Message = user != null ? "Found" : "Not found"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<object>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<bool>> EmailExistsAsync(string email)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email))
                    throw new ArgumentException("Email cannot be empty", nameof(email));

                var exists = await _userRepository.EmailExistsAsync(email);
                return new ServiceResponse<bool>
                {
                    Success = true,
                    Data = exists,
                    Message = "Checked successfully"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<bool>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<bool>> PhoneNumberExistsAsync(string phoneNumber)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(phoneNumber))
                    throw new ArgumentException("Phone number cannot be empty", nameof(phoneNumber));

                var exists = await _userRepository.PhoneNumberExistsAsync(phoneNumber);
                return new ServiceResponse<bool>
                {
                    Success = true,
                    Data = exists,
                    Message = "Checked successfully"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<bool>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<object>> GetActiveUsersAsync()
        {
            try
            {
                var users = await _userRepository.GetAsync(u => u.IsActive);
                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = users,
                    Message = "Retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<object>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<object>> ActivateUserAsync(Guid userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                    return new ServiceResponse<object>
                    {
                        Success = false,
                        Message = "User not found"
                    };

                user.IsActive = true;
                await _userRepository.UpdateAsync(user);
                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = user,
                    Message = "User activated"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<object>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<object>> DeactivateUserAsync(Guid userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                    return new ServiceResponse<object>
                    {
                        Success = false,
                        Message = "User not found"
                    };

                user.IsActive = false;
                await _userRepository.UpdateAsync(user);
                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = user,
                    Message = "User deactivated"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<object>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }
    }
}
