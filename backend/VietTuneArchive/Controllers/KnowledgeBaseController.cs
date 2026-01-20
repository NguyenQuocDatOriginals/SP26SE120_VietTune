using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VietTuneArchive.Application.Mapper.DTOs;
using VietTuneArchive.Application.Mapper.DTOs.Response;
using static VietTuneArchive.Application.Mapper.DTOs.KnowledgeBaseDto;
using static VietTuneArchive.Application.Mapper.DTOs.Request.KnowledgeBaseRequest;
using CategoryDto = VietTuneArchive.Application.Mapper.DTOs.KnowledgeBaseDto.CategoryDto;
using SongSummaryDto = VietTuneArchive.Application.Mapper.DTOs.KnowledgeBaseDto.SongSummaryDto;

namespace VietTuneArchive.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KnowledgeBaseController : ControllerBase
    {
        // GET: /api/knowledge-base
        [HttpGet]
        public ActionResult<PagedList<ArticleSummaryDto>> GetArticles(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15,
            [FromQuery] string? category = null,
            [FromQuery] string? search = null)
        {
            var articles = new PagedList<ArticleSummaryDto>
            {
                Items = new List<ArticleSummaryDto>(),
                Page = page,
                PageSize = pageSize,
                Total = 89
            };
            return Ok(articles);
        }

        // GET: /api/knowledge-base/{id}
        [HttpGet("{id}")]
        public ActionResult<ArticleDetailDto> GetArticle(string id)
        {
            var article = new ArticleDetailDto
            {
                Id = id,
                Title = "Lịch sử phát triển nhạc cụ dân tộc Việt Nam",
                Category = "Culture",
                Content = "Nhạc cụ dân tộc Việt Nam có lịch sử hàng nghìn năm...",
                Author = "TS. Nguyễn Văn Học",
                PublishedAt = DateTime.UtcNow.AddMonths(-6),
                Views = 4500,
                RelatedSongIds = new[] { "song-001", "song-002" }
            };
            return Ok(article);
        }

        // GET: /api/knowledge-base/categories
        [HttpGet("categories")]
        public ActionResult<List<CategoryDto>> GetCategories()
        {
            var categories = new List<CategoryDto>
            {
                new() { Id = "culture", Name = "Văn hóa", Icon = "book" },
                new() { Id = "technique", Name = "Kỹ thuật", Icon = "music-note" },
                new() { Id = "history", Name = "Lịch sử", Icon = "clock" }
            };
            return Ok(categories);
        }

        // GET: /api/knowledge-base/by-type/{type}
        [HttpGet("by-type/{type}")]
        public ActionResult<PagedList<ArticleSummaryDto>> GetByType(string type,
            [FromQuery] int page = 1, [FromQuery] int pageSize = 15)
        {
            var articles = new PagedList<ArticleSummaryDto>();
            return Ok(articles);
        }

        // GET: /api/knowledge-base/{id}/related-songs
        [HttpGet("{id}/related-songs")]
        public ActionResult<List<SongSummaryDto>> GetRelatedSongs(string id)
        {
            var songs = new List<SongSummaryDto>();
            return Ok(songs);
        }

        // POST: /api/knowledge-base
        [HttpPost]
        [Authorize(Policy = "Expert")]
        public ActionResult<ArticleDetailDto> CreateArticle([FromBody] CreateArticleRequest request)
        {
            var article = new ArticleDetailDto
            {
                Id = "kb-001",
                Title = request.Title,
                Category = request.Category
            };
            return Created(article.Id, article);
        }

        // PUT: /api/knowledge-base/{id}
        [HttpPut("{id}")]
        [Authorize(Policy = "Author")]
        public ActionResult<BaseResponse> UpdateArticle(string id, [FromBody] UpdateArticleRequest request)
        {
            return Ok(new BaseResponse { Success = true, Message = "Article updated" });
        }

        // DELETE: /api/knowledge-base/{id}
        [HttpDelete("{id}")]
        [Authorize(Policy = "Admin")]
        public ActionResult<BaseResponse> DeleteArticle(string id)
        {
            return Ok(new BaseResponse { Success = true, Message = "Article deleted" });
        }
    }
}
