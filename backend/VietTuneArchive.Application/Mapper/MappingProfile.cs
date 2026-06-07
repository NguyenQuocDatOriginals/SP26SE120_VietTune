using AutoMapper;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Domain.Entities;

namespace VietTuneArchive.Application.Mapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // ============= GEOGRAPHIC ENTITIES =============
            CreateMap<Province, ProvinceDto>().ReverseMap();
            CreateMap<District, DistrictDto>().ReverseMap();
            CreateMap<Commune, CommuneDto>().ReverseMap();

            // ============= REFERENCE DATA =============
            CreateMap<EthnicGroup, EthnicGroupDto>().ReverseMap();
            CreateMap<Instrument, InstrumentDto>().ReverseMap();
            CreateMap<Instrument, GetInstrumentDto>();
            CreateMap<Ceremony, CeremonyDto>().ReverseMap();
            CreateMap<VocalStyle, VocalStyleDto>().ReverseMap();
            CreateMap<MusicalScale, MusicalScaleDto>().ReverseMap();
            CreateMap<Tag, TagDto>().ReverseMap();

            // ============= USER & AUTH =============
            CreateMap<User, UserDTO>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
                .ReverseMap()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.UserId));
            CreateMap<CreateExpertUserDTO, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.Role, opt => opt.MapFrom(_ => "Expert"))
                .ForMember(dest => dest.IsEmailConfirmed, opt => opt.MapFrom(_ => true))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(_ => true))
                .ForMember(dest => dest.ContributionScore, opt => opt.MapFrom(_ => 0))
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.ConfirmEmailToken, opt => opt.Ignore())
                .ForMember(dest => dest.ResetPasswordToken, opt => opt.Ignore())
                .ForMember(dest => dest.ResetPasswordTokenExpiry, opt => opt.Ignore());
            CreateMap<RefreshToken, RefreshTokenDto>().ReverseMap();
            CreateMap<AuditLog, AuditLogDto>().ReverseMap();

            // ============= RECORDING & RELATED =============
            CreateMap<Recording, RecordingDto>()
                .ForMember(dest => dest.InstrumentIds,
                    opt => opt.MapFrom(src => src.RecordingInstruments != null
                        ? src.RecordingInstruments.Select(ri => ri.InstrumentId).ToList()
                        : new List<Guid>()))
                .ReverseMap();
            CreateMap<Recording, GetRecordingDto>()
                .ForMember(dest => dest.Instruments,
                    opt => opt.MapFrom(src => src.RecordingInstruments != null
                        ? src.RecordingInstruments.Select(ri => new GetInstrumentDto { Id = ri.Instrument.Id, Name = ri.Instrument.Name }).ToList()
                        : new List<GetInstrumentDto>()));
            CreateMap<RecordingImage, RecordingImageDto>().ReverseMap();

            // ============= EMBARGO =============
            CreateMap<Embargo, EmbargoDto>().ReverseMap();

            // ============= SUBMISSION & REVIEW =============
            CreateMap<Submission, SubmissionDto>().ReverseMap();
            CreateMap<Submission, GetSubmissionDto>()
                .ForMember(dest => dest.ReviewerName, opt => opt.MapFrom(src => src.Reviewer != null ? src.Reviewer.FullName : null));
            CreateMap<Submission, GetRelatedSubmissionDto>()
                .ForMember(dest => dest.ReviewerName, opt => opt.MapFrom(src => src.Reviewer != null ? src.Reviewer.FullName : null));
            CreateMap<SubmissionVersion, SubmissionVersionDto>().ReverseMap();
            CreateMap<Review, ReviewDto>().ReverseMap();

            // ============= ANNOTATION =============
            CreateMap<Annotation, AnnotationDto>().ReverseMap();

            // ============= VECTOR & AUDIO ANALYSIS =============
            CreateMap<VectorEmbedding, VectorEmbeddingDto>().ReverseMap();
            CreateMap<AudioAnalysisResult, AudioAnalysisResultDto>().ReverseMap();

            // ============= KNOWLEDGE BASE =============
            CreateMap<KBEntry, KBEntryDto>().ReverseMap();
            CreateMap<KBRevision, KBRevisionDto>().ReverseMap();
            CreateMap<KBCitation, KBCitationDto>().ReverseMap();

            // ============= Q&A SYSTEM =============
            CreateMap<QAConversation, QAConversationDto>().ReverseMap();
            CreateMap<QAMessage, QAMessageDto>().ReverseMap();

            // ============= COPYRIGHT DISPUTE =============
            CreateMap<CopyrightDispute, CopyrightDisputeDto>()
                .ForMember(dest => dest.RecordingTitle, opt => opt.MapFrom(src => src.Recording != null ? src.Recording.Title : null))
                .ForMember(dest => dest.ReportedByUserName, opt => opt.MapFrom(src => src.ReportedByUser != null ? src.ReportedByUser.FullName : null))
                .ForMember(dest => dest.AssignedReviewerName, opt => opt.MapFrom(src => src.AssignedReviewer != null ? src.AssignedReviewer.FullName : null))
                .ReverseMap();
        }
    }
}
