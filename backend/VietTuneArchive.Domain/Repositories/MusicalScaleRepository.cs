using Microsoft.EntityFrameworkCore;
using VietTuneArchive.Domain.Context;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Domain.IRepositories;

namespace VietTuneArchive.Domain.Repositories
{
    public class MusicalScaleRepository : GenericRepository<MusicalScale>, IMusicalScaleRepository
    {
        private readonly DBContext _context;

        public MusicalScaleRepository(DBContext context) : base(context)
        {
            _context = context;
        }

        private static readonly string[] VietnameseSigns = new string[]
        {
            "aAeEoOuUiIdDyY",
            "áàạảãâấầậẩẫăắằặẳẵ",
            "ÁÀẠẢÃÂẤẦẬẨẪĂẮẰẶẲẴ",
            "éèẹẻẽêếềệểễ",
            "ÉÈẸẺẼÊẾỀỆỂỄ",
            "óòọỏõôốồộổỗơớờợởỡ",
            "ÓÒỌỎÕÔỐỒỘỔỖƠỚỜỢỞỠ",
            "úùụủũưứừựửữ",
            "ÚÙỤỦŨƯỨỪỰỬỮ",
            "íìịỉĩ",
            "ÍÌỊỈĨ",
            "đ",
            "Đ",
            "ýỳỵỷỹ",
            "ÝỲỴỶỸ"
        };

        public static string RemoveVietnameseDiacritics(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return text;

            for (int i = 1; i < VietnameseSigns.Length; i++)
            {
                for (int j = 0; j < VietnameseSigns[i].Length; j++)
                {
                    text = text.Replace(VietnameseSigns[i][j], VietnameseSigns[0][i - 1]);
                }
            }
            return text;
        }

        public async Task<IEnumerable<MusicalScale>> SearchByNameAsync(string? name)
        {
            var scales = await _context.MusicalScales.ToListAsync();
            if (string.IsNullOrWhiteSpace(name))
                return scales;
            string normalizedSearchName = RemoveVietnameseDiacritics(name).ToLower();
            return scales
                .Where(ms => RemoveVietnameseDiacritics(ms.Name ?? "").ToLower().Contains(normalizedSearchName))
                .ToList();
        }
    }
}
