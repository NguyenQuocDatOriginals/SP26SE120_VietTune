using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Responses;

namespace VietTuneArchive.Application.IServices
{
    public interface IVocalStyleService : IGenericService<VocalStyleDto>
    {
        Task<ServiceResponse<List<VocalStyleDto>>> GetByEthnicGroupAsync(Guid ethnicGroupId);
        Task<ServiceResponse<List<VocalStyleDto>>> SearchByNameAsync(string? name);
        Task<PagedResponse<VocalStyleDto>> SearchByNameAsync(string? name, int pageNumber, int pageSize);
        Task<ServiceResponse<List<VocalStyleDto>>> GetWithDescriptionsAsync();
    }
}
