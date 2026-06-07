using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.IServices.IThirdPartyServices;
using VietTuneArchive.Application.Mapper.DTOs.KnowledgeGraph;
using VietTuneArchive.Domain.Context;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Domain.Entities.Enum;

namespace VietTuneArchive.Application.Services
{
    public class KnowledgeGraphService : IKnowledgeGraphService
    {
        private readonly DBContext _db;
        private readonly ILogger<KnowledgeGraphService> _logger;
        private readonly IGraphExplorerService _graphExplorerService;

        public KnowledgeGraphService(
            DBContext db, 
            ILogger<KnowledgeGraphService> logger,
            IGraphExplorerService graphExplorerService)
        {
            _db = db;
            _logger = logger;
            _graphExplorerService = graphExplorerService;
        }

        // ================================================================
        // EXPLORE NODE — Delegate to Neo4j
        // ================================================================
        public async Task<GraphResponseDto> ExploreNodeAsync(GraphExploreRequest request)
        {
            var result = await _graphExplorerService.ExpandNodeAsync(request.NodeId, request.NodeType, null);
            return new GraphResponseDto
            {
                Nodes = result.Nodes.Select(n => new GraphNodeDto
                {
                    Id = n.Id,
                    Type = n.Group,
                    Label = n.Label
                }).ToList(),
                Edges = result.Links.Select(l => new GraphEdgeDto
                {
                    SourceId = l.Source,
                    TargetId = l.Target,
                    Relation = l.Type
                }).ToList(),
                TotalNodes = result.Nodes.Count
            };
        }

        // ================================================================
        // SEARCH NODES — Tìm kiếm node theo keyword (Query PG)
        // ================================================================
        public async Task<List<GraphNodeDto>> SearchNodesAsync(GraphSearchRequest request)
        {
            var query = request.Query.ToLower().Trim();
            var limit = Math.Clamp(request.Limit, 1, 50);
            var results = new List<GraphNodeDto>();
            var types = request.Types ?? new List<string>
            {
                "EthnicGroup", "Instrument", "Ceremony", "Recording",
                "VocalStyle", "MusicalScale", "Tag", "Province"
            };

            if (types.Contains("EthnicGroup"))
            {
                var entities = await _db.EthnicGroups
                    .Where(e => EF.Functions.ILike(e.Name, $"%{query}%"))
                    .Take(limit)
                    .ToListAsync();
                results.AddRange(entities.Select(ToNodeEthnicGroup));
            }

            if (types.Contains("Instrument"))
            {
                var entities = await _db.Instruments
                    .Where(i => EF.Functions.ILike(i.Name, $"%{query}%"))
                    .Take(limit)
                    .ToListAsync();
                results.AddRange(entities.Select(ToNodeInstrument));
            }

            if (types.Contains("Ceremony"))
            {
                var entities = await _db.Ceremonies
                    .Where(c => EF.Functions.ILike(c.Name, $"%{query}%"))
                    .Take(limit)
                    .ToListAsync();
                results.AddRange(entities.Select(ToNodeCeremony));
            }

            if (types.Contains("Recording"))
            {
                var entities = await _db.Recordings
                    .Where(r => r.Title != null && EF.Functions.ILike(r.Title, $"%{query}%")
                                && r.Status == SubmissionStatus.Approved)
                    .Take(limit)
                    .ToListAsync();
                results.AddRange(entities.Select(ToNodeRecording));
            }

            if (types.Contains("VocalStyle"))
            {
                var entities = await _db.VocalStyles
                    .Where(v => EF.Functions.ILike(v.Name, $"%{query}%"))
                    .Take(limit)
                    .ToListAsync();
                results.AddRange(entities.Select(ToNodeVocalStyle));
            }

            if (types.Contains("MusicalScale"))
            {
                var entities = await _db.MusicalScales
                    .Where(m => EF.Functions.ILike(m.Name, $"%{query}%"))
                    .Take(limit)
                    .ToListAsync();
                results.AddRange(entities.Select(ToNodeMusicalScale));
            }

            if (types.Contains("Tag"))
            {
                var entities = await _db.Tags
                    .Where(t => EF.Functions.ILike(t.Name, $"%{query}%"))
                    .Take(limit)
                    .ToListAsync();
                results.AddRange(entities.Select(ToNodeTag));
            }

            if (types.Contains("Province"))
            {
                var entities = await _db.Provinces
                    .Where(p => EF.Functions.ILike(p.Name, $"%{query}%"))
                    .Take(limit)
                    .ToListAsync();
                results.AddRange(entities.Select(ToNodeProvince));
            }

            return results.Take(limit).ToList();
        }

        // ================================================================
        // OVERVIEW GRAPH — Delegate to Neo4j
        // ================================================================
        public async Task<GraphResponseDto> GetOverviewGraphAsync(int maxNodes = 100)
        {
            var result = await _graphExplorerService.GetOverviewGraphAsync(maxNodes);
            return new GraphResponseDto
            {
                Nodes = result.Nodes.Select(n => new GraphNodeDto
                {
                    Id = n.Id,
                    Type = n.Group,
                    Label = n.Label
                }).ToList(),
                Edges = result.Links.Select(l => new GraphEdgeDto
                {
                    SourceId = l.Source,
                    TargetId = l.Target,
                    Relation = l.Type
                }).ToList(),
                TotalNodes = result.Nodes.Count
            };
        }

        // ================================================================
        // STATS — Thống kê tổng quan (Query PG)
        // ================================================================
        public async Task<GraphStatsDto> GetStatsAsync()
        {
            var stats = new GraphStatsDto
            {
                TotalEthnicGroups = await _db.EthnicGroups.CountAsync(),
                TotalInstruments = await _db.Instruments.CountAsync(),
                TotalCeremonies = await _db.Ceremonies.CountAsync(),
                TotalRecordings = await _db.Recordings.CountAsync(),
                TotalVocalStyles = await _db.VocalStyles.CountAsync(),
                TotalMusicalScales = await _db.MusicalScales.CountAsync(),
                TotalTags = await _db.Tags.CountAsync(),
                TotalProvinces = await _db.Provinces.CountAsync()
            };

            var insEthCount = await _db.InstrumentEthnicGroups.CountAsync();
            var ethCerCount = await _db.EthnicGroupCeremonies.CountAsync();
            var recInsCount = await _db.RecordingInstruments.CountAsync();
            var recTagCount = await _db.RecordingTags.CountAsync();

            stats.TotalEdges = insEthCount + ethCerCount + recInsCount + recTagCount;

            return stats;
        }

        // ================================================================
        // RELATIONSHIP GRAPH — Delegate to Neo4j
        // ================================================================
        public async Task<GraphResponseDto> GetRelationshipGraphAsync(string sourceType, string targetType, int limit = 100)
        {
            var result = await _graphExplorerService.GetRelationshipGraphAsync(sourceType, targetType, limit);
            return new GraphResponseDto
            {
                Nodes = result.Nodes.Select(n => new GraphNodeDto
                {
                    Id = n.Id,
                    Type = n.Group,
                    Label = n.Label
                }).ToList(),
                Edges = result.Links.Select(l => new GraphEdgeDto
                {
                    SourceId = l.Source,
                    TargetId = l.Target,
                    Relation = l.Type
                }).ToList(),
                TotalNodes = result.Nodes.Count
            };
        }

        // ================================================================
        // PRIVATE HELPERS
        // ================================================================
        private GraphNodeDto ToNodeEthnicGroup(EthnicGroup entity) => new GraphNodeDto
        {
            Id = entity.Id.ToString(),
            Type = "EthnicGroup",
            Label = entity.Name,
            Properties = new Dictionary<string, object?> { ["languageFamily"] = entity.LanguageFamily, ["primaryRegion"] = entity.PrimaryRegion, ["imageUrl"] = entity.ImageUrl }
        };

        private GraphNodeDto ToNodeInstrument(Instrument entity) => new GraphNodeDto
        {
            Id = entity.Id.ToString(),
            Type = "Instrument",
            Label = entity.Name,
            Properties = new Dictionary<string, object?> { ["category"] = entity.Category, ["tuningSystem"] = entity.TuningSystem, ["imageUrl"] = entity.ImageUrl }
        };

        private GraphNodeDto ToNodeCeremony(Ceremony entity) => new GraphNodeDto
        {
            Id = entity.Id.ToString(),
            Type = "Ceremony",
            Label = entity.Name,
            Properties = new Dictionary<string, object?> { ["type"] = entity.Type, ["season"] = entity.Season }
        };

        private GraphNodeDto ToNodeRecording(Recording entity) => new GraphNodeDto
        {
            Id = entity.Id.ToString(),
            Type = "Recording",
            Label = entity.Title ?? "Untitled",
            Properties = new Dictionary<string, object?> { ["performerName"] = entity.PerformerName, ["durationSeconds"] = entity.DurationSeconds }
        };

        private GraphNodeDto ToNodeVocalStyle(VocalStyle entity) => new GraphNodeDto
        {
            Id = entity.Id.ToString(),
            Type = "VocalStyle",
            Label = entity.Name,
            Properties = new Dictionary<string, object?> { ["description"] = entity.Description }
        };

        private GraphNodeDto ToNodeMusicalScale(MusicalScale entity) => new GraphNodeDto
        {
            Id = entity.Id.ToString(),
            Type = "MusicalScale",
            Label = entity.Name,
            Properties = new Dictionary<string, object?> { ["notePattern"] = entity.NotePattern }
        };

        private GraphNodeDto ToNodeTag(Tag entity) => new GraphNodeDto
        {
            Id = entity.Id.ToString(),
            Type = "Tag",
            Label = entity.Name,
            Properties = new Dictionary<string, object?> { ["category"] = entity.Category }
        };

        private GraphNodeDto ToNodeProvince(Province entity) => new GraphNodeDto
        {
            Id = entity.Id.ToString(),
            Type = "Province",
            Label = entity.Name,
            Properties = new Dictionary<string, object?> { ["regionCode"] = entity.RegionCode }
        };
    }
}
