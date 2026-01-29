using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Responses;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Domain.IRepositories;

namespace VietTuneArchive.Application.Services
{
    /// <summary>
    /// Service implementation for Genre business logic
    /// </summary>
    public class GenreService : GenericService<Genre, GenreDto>, IGenreService
    {
        private readonly IGenreRepository _genreRepository;

        public GenreService(IGenreRepository genreRepository, IMapper mapper) 
            : base(genreRepository, mapper)
        {
            _genreRepository = genreRepository;
        }

        public async Task<ServiceResponse<GenreDto>> GetByNameAsync(string name)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                    throw new ArgumentException("Name cannot be empty", nameof(name));

                var genre = await _genreRepository.GetByNameAsync(name);
                if (genre == null)
                    return new ServiceResponse<GenreDto>
                    {
                        Success = false,
                        Message = "Genre not found"
                    };

                var dto = _mapper.Map<GenreDto>(genre);
                return new ServiceResponse<GenreDto>
                {
                    Success = true,
                    Data = dto,
                    Message = "Retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<GenreDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<bool>> NameExistsAsync(string name)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                    throw new ArgumentException("Name cannot be empty", nameof(name));

                var exists = await _genreRepository.NameExistsAsync(name);
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

        public async Task<PagedResponse<GenreDto>> SearchAsync(string searchTerm, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                    throw new ArgumentException("Search term cannot be empty", nameof(searchTerm));

                var genres = await GetAsync(g => g.Name.Contains(searchTerm) || g.Description.Contains(searchTerm));
                var pagedGenres = genres.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
                var dtos = _mapper.Map<List<GenreDto>>(pagedGenres);

                return new PagedResponse<GenreDto>
                {
                    Success = true,
                    Data = dtos,
                    Total = genres.Count(),
                    Page = pageNumber,
                    PageSize = pageSize,
                    Message = "Retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new PagedResponse<GenreDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<GenreDto>> CreateAsync(GenreCreateDto request)
        {
            try
            {
                if (request == null)
                    throw new ArgumentNullException(nameof(request));

                var dto = _mapper.Map<GenreDto>(request);
                return await CreateAsync(dto);
            }
            catch (Exception ex)
            {
                return new ServiceResponse<GenreDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ServiceResponse<GenreDto>> UpdateAsync(Guid id, GenreUpdateDto request)
        {
            try
            {
                if (request == null)
                    throw new ArgumentNullException(nameof(request));

                var dto = _mapper.Map<GenreDto>(request);
                return await UpdateAsync(id, dto);
            }
            catch (Exception ex)
            {
                return new ServiceResponse<GenreDto>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                };
            }
        }
    }
}
