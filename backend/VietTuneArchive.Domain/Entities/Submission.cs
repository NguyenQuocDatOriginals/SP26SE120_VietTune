using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Domain.Entities.Enum;

namespace VietTuneArchive.Domain.Entities
{
    public class Submission
    {
        [Key]
        public Guid Id { get; set; }
        public string? Key { get; set; }
        public string? Tempo { get; set; }
        public string? Bitrate { get; set; }
        public string? Duration { get; set; }
        // Basic Information
        public string Title { get; set; }
        public string Performer { get; set; }
        public string Author { get; set; }
        public string Dialect { get; set; }
        public Guid? GenreId { get; set; }
        public Genre? Genre { get; set; }
        public DateTime? RecordDate { get; set; }
        public string? RecordLocation { get; set; }
        public string? EthnicGroup { get; set; }
        public Guid? ProvinceId { get; set; }
        public Province? Province { get; set; }
        public Guid? ContextId { get; set; }
        public Context? Context { get; set; }
        public ICollection<Instrument>? Instruments { get; set; }
        public string? InstrumentPhotoUrl { get; set; }
        // Additional Information
        public string? Description { get; set; }
        public string? FieldNotes { get; set; }
        public string? Transcription { get; set; }
        // Copyright
        public string? CopyrightHolder { get; set; }
        public string? CopyrightInfo { get; set; }
        public string? CopyrightOrganization { get; set; }
        public string? CopyrightID { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        // Status
        public SubmissionStatus Status { get; set; }
        // Review Notes
        public string? ReviewNotes { get; set; }
    }
}
