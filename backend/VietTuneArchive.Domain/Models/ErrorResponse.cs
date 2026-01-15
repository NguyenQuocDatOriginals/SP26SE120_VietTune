using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VietTuneArchive.Domain.Models
{
    public class ErrorResponse
    {
        public bool Success { get; set; } = false;
        public string? Error { get; set; }
        public string? Code { get; set; }
    }
}
