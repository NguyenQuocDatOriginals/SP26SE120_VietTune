using VietTuneArchive.Domain.Context;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Domain.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace VietTuneArchive.Domain.Repositories
{
    public class InstrumentRepository : GenericRepository<Instrument>, IInstrumentRepository
    {
        private readonly DBContext _context;

        public InstrumentRepository(DBContext context) : base(context)
        {
            _context = context;
        }

        /// <summary>
        /// Remove Vietnamese diacritical marks from text
        /// </summary>
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

        public async Task<IEnumerable<Instrument>> SearchByNameAsync(string? name)
        {
            var instruments = await _context.Instruments.ToListAsync();
            if (string.IsNullOrWhiteSpace(name))
                return instruments;
            string normalizedSearchName = RemoveVietnameseDiacritics(name).ToLower();
            return instruments
                .Where(i => RemoveVietnameseDiacritics(i.Name ?? "").ToLower().Contains(normalizedSearchName))
                .ToList();
        }
    }
}
