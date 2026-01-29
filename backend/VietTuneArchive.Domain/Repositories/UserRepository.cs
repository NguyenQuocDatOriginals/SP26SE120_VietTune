using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Domain.Context;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Domain.IRepositories;

namespace VietTuneArchive.Domain.Repositories
{
    /// <summary>
    /// Repository implementation for User entity
    /// </summary>
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(DBContext context) : base(context)
        {
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            return await GetFirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> GetByPhoneNumberAsync(string phoneNumber)
        {
            return await GetFirstOrDefaultAsync(u => u.PhoneNumber == phoneNumber);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            var result = await GetFirstOrDefaultAsync(u => u.Email == email);
            return result != null;
        }

        public async Task<bool> PhoneNumberExistsAsync(string phoneNumber)
        {
            var result = await GetFirstOrDefaultAsync(u => u.PhoneNumber == phoneNumber);
            return result != null;
        }
    }
}
