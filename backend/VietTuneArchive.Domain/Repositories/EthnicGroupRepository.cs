using VietTuneArchive.Domain.Context;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Domain.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace VietTuneArchive.Domain.Repositories
{
    public class EthnicGroupRepository : GenericRepository<EthnicGroup>, IEthnicGroupRepository
    {
        private readonly DBContext _context;

        public EthnicGroupRepository(DBContext context) : base(context)
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

        public async Task<IEnumerable<EthnicGroup>> SearchByNameAsync(string? name)
        {
            var ethnicGroups = await _context.EthnicGroups.ToListAsync();
            if (string.IsNullOrWhiteSpace(name))
                return ethnicGroups;
            string normalizedSearchName = RemoveVietnameseDiacritics(name).ToLower();
            return ethnicGroups
                .Where(eg => RemoveVietnameseDiacritics(eg.Name ?? "").ToLower().Contains(normalizedSearchName))
                .ToList();
        }
    }
}
