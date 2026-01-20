using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VietTuneArchive.Application.Mapper.DTOs
{
    public class UserDto
    {
        public class UserProfileDto
        {
            public string Id { get; set; } = default!;
            public string Email { get; set; } = default!;
            public string FullName { get; set; } = default!;
            public string AvatarUrl { get; set; } = default!;
            public string? Bio { get; set; }
            public string Role { get; set; } = default!;
        }
        public class UserStatsDto
        {
            public int TotalPosts { get; set; }
            public int TotalLikes { get; set; }
            public int TotalContributions { get; set; }
            public string Rank { get; set; } = default!;
        }

        public class UserContributionsDto
        {
            public string UserId { get; set; } = default!;
            public int TotalContributions { get; set; }
            public List<ContributionItemDto> Contributions { get; set; } = default!;
        }

        public class ContributionItemDto
        {
            public string Id { get; set; } = default!;
            public string Title { get; set; } = default!;
            public int Points { get; set; }
            public string Date { get; set; } = default!;
        }
    }
}
