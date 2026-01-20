using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VietTuneArchive.Application.Mapper.DTOs.Request
{
    public class SubmissionRequest
    {
        public class CreateSubmissionRequest { public string Title { get; set; } = default!; /* ... */ }
        public class UpdateSubmissionRequest { /* full fields */ }
    }
}
