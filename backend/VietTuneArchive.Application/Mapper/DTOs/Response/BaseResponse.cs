using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VietTuneArchive.Application.Mapper.DTOs.Response
{
    public class BaseResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = default!;
        public object? Data { get; set; }
    }
}
