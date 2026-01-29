using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Domain.Context;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Domain.Entities.Enum;
using VietTuneArchive.Domain.IRepositories;

namespace VietTuneArchive.Domain.Repositories
{
    /// <summary>
    /// Repository implementation for Submission entity
    /// </summary>
    public class SubmissionRepository : GenericRepository<Submission>, ISubmissionRepository
    {
        public SubmissionRepository(DBContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Submission>> GetByStatusAsync(SubmissionStatus status)
        {
            return await GetAsync(s => s.Status == status);
        }

        public async Task<IEnumerable<Submission>> GetPendingSubmissionsAsync()
        {
            return await GetByStatusAsync(SubmissionStatus.Pending);
        }

        public async Task<IEnumerable<Submission>> GetApprovedSubmissionsAsync()
        {
            return await GetByStatusAsync(SubmissionStatus.Approved);
        }

        public async Task<IEnumerable<Submission>> GetRejectedSubmissionsAsync()
        {
            return await GetByStatusAsync(SubmissionStatus.Rejected);
        }

        public async Task<IEnumerable<Submission>> GetByGenreAsync(Guid genreId)
        {
            return await GetAsync(s => s.GenreId == genreId);
        }

        public async Task<IEnumerable<Submission>> GetByProvinceAsync(Guid provinceId)
        {
            return await GetAsync(s => s.ProvinceId == provinceId);
        }

        public async Task<IEnumerable<Submission>> GetByContextAsync(Guid contextId)
        {
            return await GetAsync(s => s.ContextId == contextId);
        }
    }
}
