using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Responses;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Domain.Entities.Enum;
using VietTuneArchive.Domain.IRepositories;

namespace VietTuneArchive.Application.Services
{
    /// <summary>
    /// Service implementation for Submission business logic
    /// </summary>
    public class SubmissionService : ISubmissionService
    {
        private readonly ISubmissionRepository _submissionRepository;

        public SubmissionService(ISubmissionRepository submissionRepository)
        {
            _submissionRepository = submissionRepository;
        }

        public async Task<ServiceResponse<object>> GetByStatusAsync(SubmissionStatus status)
        {
            try
            {
                var submissions = await _submissionRepository.GetByStatusAsync(status);
                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = submissions,
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

        public async Task<ServiceResponse<object>> GetPendingSubmissionsAsync()
        {
            try
            {
                var submissions = await _submissionRepository.GetPendingSubmissionsAsync();
                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = submissions,
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

        public async Task<ServiceResponse<object>> GetApprovedSubmissionsAsync()
        {
            try
            {
                var submissions = await _submissionRepository.GetApprovedSubmissionsAsync();
                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = submissions,
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

        public async Task<ServiceResponse<object>> GetRejectedSubmissionsAsync()
        {
            try
            {
                var submissions = await _submissionRepository.GetRejectedSubmissionsAsync();
                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = submissions,
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

        public async Task<ServiceResponse<object>> GetByGenreAsync(Guid genreId)
        {
            try
            {
                if (genreId == Guid.Empty)
                    throw new ArgumentException("Genre id cannot be empty", nameof(genreId));

                var submissions = await _submissionRepository.GetByGenreAsync(genreId);
                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = submissions,
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

        public async Task<ServiceResponse<object>> GetByProvinceAsync(Guid provinceId)
        {
            try
            {
                if (provinceId == Guid.Empty)
                    throw new ArgumentException("Province id cannot be empty", nameof(provinceId));

                var submissions = await _submissionRepository.GetByProvinceAsync(provinceId);
                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = submissions,
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

        public async Task<ServiceResponse<object>> GetByContextAsync(Guid contextId)
        {
            try
            {
                if (contextId == Guid.Empty)
                    throw new ArgumentException("Context id cannot be empty", nameof(contextId));

                var submissions = await _submissionRepository.GetByContextAsync(contextId);
                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = submissions,
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

        public async Task<ServiceResponse<object>> ApproveSubmissionAsync(Guid submissionId, string reviewNotes = null)
        {
            try
            {
                var submission = await _submissionRepository.GetByIdAsync(submissionId);
                if (submission == null)
                    return new ServiceResponse<object>
                    {
                        Success = false,
                        Message = "Submission not found"
                    };

                submission.Status = SubmissionStatus.Approved;
                submission.ReviewNotes = reviewNotes;
                submission.UpdatedAt = DateTime.UtcNow;
                await _submissionRepository.UpdateAsync(submission);

                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = submission,
                    Message = "Submission approved"
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

        public async Task<ServiceResponse<object>> RejectSubmissionAsync(Guid submissionId, string reviewNotes)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(reviewNotes))
                    throw new ArgumentException("Review notes are required for rejection", nameof(reviewNotes));

                var submission = await _submissionRepository.GetByIdAsync(submissionId);
                if (submission == null)
                    return new ServiceResponse<object>
                    {
                        Success = false,
                        Message = "Submission not found"
                    };

                submission.Status = SubmissionStatus.Rejected;
                submission.ReviewNotes = reviewNotes;
                submission.UpdatedAt = DateTime.UtcNow;
                await _submissionRepository.UpdateAsync(submission);

                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = submission,
                    Message = "Submission rejected"
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

        public async Task<ServiceResponse<int>> GetPendingSubmissionsCountAsync()
        {
            try
            {
                var count = await _submissionRepository.CountAsync(s => s.Status == SubmissionStatus.Pending);
                return new ServiceResponse<int>
                {
                    Success = true,
                    Data = count,
                    Message = "Retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<int>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }
    }
}
