using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Responses;

namespace VietTuneArchive.Application.IServices
{
    public interface IMusicalScaleService : IGenericService<MusicalScaleDto>
    {
        Task<ServiceResponse<List<MusicalScaleDto>>> SearchByNameAsync(string name);
        Task<PagedResponse<MusicalScaleDto>> SearchByNameAsync(string? name, int pageNumber, int pageSize);
        Task<ServiceResponse<List<MusicalScaleDto>>> GetWithNotePatternAsync();
        Task<ServiceResponse<List<MusicalScaleDto>>> GetByPatternAsync(string pattern);
        Task<ServiceResponse<List<string>>> GetAllPatternsAsync();
    }
}
