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
    /// Service implementation for Song business logic
    /// </summary>
    public class SongService : ISongService
    {
        private readonly ISongRepository _songRepository;

        public SongService(ISongRepository songRepository)
        {
            _songRepository = songRepository;
        }

        public async Task<ServiceResponse<object>> GetByPerformerAsync(string performer)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(performer))
                    throw new ArgumentException("Performer cannot be empty", nameof(performer));

                var songs = await _songRepository.GetByPerformerAsync(performer);
                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = songs,
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

        public async Task<ServiceResponse<object>> GetByAuthorAsync(string author)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(author))
                    throw new ArgumentException("Author cannot be empty", nameof(author));

                var songs = await _songRepository.GetByAuthorAsync(author);
                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = songs,
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

        public async Task<ServiceResponse<object>> GetByGenreAsync(string genre)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(genre))
                    throw new ArgumentException("Genre cannot be empty", nameof(genre));

                var songs = await _songRepository.GetByGenreAsync(genre);
                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = songs,
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

        public async Task<ServiceResponse<object>> GetByDialectAsync(string dialect)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dialect))
                    throw new ArgumentException("Dialect cannot be empty", nameof(dialect));

                var songs = await _songRepository.GetByDialectAsync(dialect);
                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = songs,
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

        public async Task<ServiceResponse<object>> GetByProvinceAsync(string province)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(province))
                    throw new ArgumentException("Province cannot be empty", nameof(province));

                var songs = await _songRepository.GetByProvinceAsync(province);
                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = songs,
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

        public async Task<ServiceResponse<object>> SearchByTitleAsync(string title)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(title))
                    throw new ArgumentException("Title cannot be empty", nameof(title));

                var songs = await _songRepository.GetAsync(s => s.Title.Contains(title));
                return new ServiceResponse<object>
                {
                    Success = true,
                    Data = songs,
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
    }
}
