using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using VietTuneArchive.Application.IServices;
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

        public KnowledgeGraphService(DBContext db, ILogger<KnowledgeGraphService> logger)
        {
            _db = db;
            _logger = logger;
        }

        // ================================================================
        // EXPLORE NODE — Lấy subgraph xung quanh một node trung tâm
        // ================================================================
        public async Task<GraphResponseDto> ExploreNodeAsync(GraphExploreRequest request)
        {
            // Validate
            request.Depth = Math.Clamp(request.Depth, 1, 3);
            request.MaxNodes = Math.Clamp(request.MaxNodes, 1, 200);

            if (!Guid.TryParse(request.NodeId, out var nodeId))
            {
                return new GraphResponseDto();
            }

            var nodes = new Dictionary<string, GraphNodeDto>();
            var edges = new List<GraphEdgeDto>();

            var visited = new HashSet<string>();
            var queue = new Queue<(Guid Id, string Type, int CurrentDepth)>();
            queue.Enqueue((nodeId, request.NodeType, 0));

            while (queue.Count > 0 && nodes.Count < request.MaxNodes)
            {
                var (currentId, currentType, currentDepth) = queue.Dequeue();
                var key = $"{currentType}:{currentId}";

                if (visited.Contains(key)) continue;
                visited.Add(key);

                var node = await GetNodeByIdAsync(currentId, currentType);
                if (node == null) continue;
                nodes[key] = node;

                if (currentDepth < request.Depth)
                {
                    var neighbors = await GetNeighborsAsync(currentId, currentType, request.FilterTypes);
                    foreach (var (neighborNode, edge) in neighbors)
                    {
                        var neighborKey = $"{neighborNode.Type}:{neighborNode.Id}";

                        edges.Add(edge);

                        if (!visited.Contains(neighborKey) && nodes.Count < request.MaxNodes)
                        {
                            if (Guid.TryParse(neighborNode.Id, out var nId))
                            {
                                queue.Enqueue((nId, neighborNode.Type, currentDepth + 1));
                            }
                        }

                        if (!nodes.ContainsKey(neighborKey))
                        {
                            nodes[neighborKey] = neighborNode;
                        }
                    }
                }
            }

            return new GraphResponseDto
            {
                Nodes = nodes.Values.ToList(),
                Edges = DeduplicateEdges(edges),
                TotalNodes = nodes.Count
            };
        }

        // ================================================================
        // SEARCH NODES — Tìm kiếm node theo keyword
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
        // OVERVIEW GRAPH — Graph tổng quan cho trang chủ
        // ================================================================
        public async Task<GraphResponseDto> GetOverviewGraphAsync(int maxNodes = 100)
        {
            var nodes = new Dictionary<string, GraphNodeDto>();
            var edges = new List<GraphEdgeDto>();

            var ethnicGroups = await _db.EthnicGroups.ToListAsync();
            foreach (var eg in ethnicGroups)
                nodes[$"EthnicGroup:{eg.Id}"] = ToNodeEthnicGroup(eg);

            var instruments = await _db.Instruments.ToListAsync();
            foreach (var inst in instruments)
                nodes[$"Instrument:{inst.Id}"] = ToNodeInstrument(inst);

            var ceremonies = await _db.Ceremonies.ToListAsync();
            foreach (var cer in ceremonies)
                nodes[$"Ceremony:{cer.Id}"] = ToNodeCeremony(cer);

            var instEthnicEdges = await _db.InstrumentEthnicGroups.ToListAsync();
            edges.AddRange(instEthnicEdges.Select(ie => new GraphEdgeDto
            {
                SourceId = ie.InstrumentId.ToString(),
                TargetId = ie.EthnicGroupId.ToString(),
                Relation = "BELONGS_TO_ETHNIC_GROUP"
            }));

            var ethCerEdges = await _db.EthnicGroupCeremonies.ToListAsync();
            edges.AddRange(ethCerEdges.Select(ec => new GraphEdgeDto
            {
                SourceId = ec.EthnicGroupId.ToString(),
                TargetId = ec.CeremonyId.ToString(),
                Relation = "HAS_CEREMONY"
            }));

            var originInsts = await _db.Instruments.Where(i => i.OriginEthnicGroupId != null).ToListAsync();
            edges.AddRange(originInsts.Select(i => new GraphEdgeDto
            {
                SourceId = i.Id.ToString(),
                TargetId = i.OriginEthnicGroupId.ToString()!,
                Relation = "ORIGIN_ETHNIC_GROUP"
            }));

            return new GraphResponseDto
            {
                Nodes = nodes.Values.Take(maxNodes).ToList(),
                Edges = DeduplicateEdges(edges),
                TotalNodes = nodes.Count
            };
        }

        // ================================================================
        // STATS — Thống kê tổng quan
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
        // RELATIONSHIP GRAPH — Graph giữa 2 entity types
        // ================================================================
        public async Task<GraphResponseDto> GetRelationshipGraphAsync(string sourceType, string targetType, int limit = 100)
        {
            var nodes = new Dictionary<string, GraphNodeDto>();
            var edges = new List<GraphEdgeDto>();

            var pair = $"{sourceType}-{targetType}";

            switch (pair)
            {
                case "Instrument-EthnicGroup":
                case "EthnicGroup-Instrument":
                    {
                        var rels = await _db.InstrumentEthnicGroups
                            .Include(ie => ie.Instrument)
                            .Include(ie => ie.EthnicGroup)
                            .Take(limit)
                            .ToListAsync();

                        foreach (var rel in rels)
                        {
                            if (rel.Instrument == null || rel.EthnicGroup == null) continue;

                            var instKey = $"Instrument:{rel.InstrumentId}";
                            var ethKey = $"EthnicGroup:{rel.EthnicGroupId}";

                            if (!nodes.ContainsKey(instKey)) nodes[instKey] = ToNodeInstrument(rel.Instrument);
                            if (!nodes.ContainsKey(ethKey)) nodes[ethKey] = ToNodeEthnicGroup(rel.EthnicGroup);

                            edges.Add(new GraphEdgeDto
                            {
                                SourceId = rel.InstrumentId.ToString(),
                                TargetId = rel.EthnicGroupId.ToString(),
                                Relation = "BELONGS_TO_ETHNIC_GROUP"
                            });
                        }
                        break;
                    }

                case "EthnicGroup-Ceremony":
                case "Ceremony-EthnicGroup":
                    {
                        var rels = await _db.EthnicGroupCeremonies
                            .Include(ec => ec.EthnicGroup)
                            .Include(ec => ec.Ceremony)
                            .Take(limit)
                            .ToListAsync();

                        foreach (var rel in rels)
                        {
                            if (rel.EthnicGroup == null || rel.Ceremony == null) continue;

                            var ethKey = $"EthnicGroup:{rel.EthnicGroupId}";
                            var cerKey = $"Ceremony:{rel.CeremonyId}";

                            if (!nodes.ContainsKey(ethKey)) nodes[ethKey] = ToNodeEthnicGroup(rel.EthnicGroup);
                            if (!nodes.ContainsKey(cerKey)) nodes[cerKey] = ToNodeCeremony(rel.Ceremony);

                            edges.Add(new GraphEdgeDto
                            {
                                SourceId = rel.EthnicGroupId.ToString(),
                                TargetId = rel.CeremonyId.ToString(),
                                Relation = "HAS_CEREMONY"
                            });
                        }
                        break;
                    }

                case "Recording-Instrument":
                case "Instrument-Recording":
                    {
                        var rels = await _db.RecordingInstruments
                            .Include(ri => ri.Recording)
                            .Include(ri => ri.Instrument)
                            .Take(limit)
                            .ToListAsync();

                        foreach (var rel in rels)
                        {
                            if (rel.Recording == null || rel.Instrument == null) continue;

                            var recKey = $"Recording:{rel.RecordingId}";
                            var instKey = $"Instrument:{rel.InstrumentId}";

                            if (!nodes.ContainsKey(recKey)) nodes[recKey] = ToNodeRecording(rel.Recording);
                            if (!nodes.ContainsKey(instKey)) nodes[instKey] = ToNodeInstrument(rel.Instrument);

                            edges.Add(new GraphEdgeDto
                            {
                                SourceId = rel.RecordingId.ToString(),
                                TargetId = rel.InstrumentId.ToString(),
                                Relation = "USES_INSTRUMENT",
                                Properties = new Dictionary<string, object?> { ["playingTechnique"] = rel.PlayingTechnique }
                            });
                        }
                        break;
                    }

                default:
                    _logger.LogWarning("Unsupported relationship pair: {Pair}", pair);
                    break;
            }

            return new GraphResponseDto
            {
                Nodes = nodes.Values.ToList(),
                Edges = DeduplicateEdges(edges),
                TotalNodes = nodes.Count
            };
        }

        // ================================================================
        // PRIVATE HELPERS
        // ================================================================

        private async Task<GraphNodeDto?> GetNodeByIdAsync(Guid id, string type)
        {
            return type switch
            {
                "EthnicGroup" => await _db.EthnicGroups.Where(e => e.Id == id).Select(e => new { e.Id, e.Name, e.LanguageFamily, e.PrimaryRegion, e.ImageUrl }).FirstOrDefaultAsync() is var eg && eg != null ? new GraphNodeDto
                {
                    Id = eg.Id.ToString(),
                    Type = "EthnicGroup",
                    Label = eg.Name,
                    Properties = new Dictionary<string, object?> { ["languageFamily"] = eg.LanguageFamily, ["primaryRegion"] = eg.PrimaryRegion, ["imageUrl"] = eg.ImageUrl }
                } : null,

                "Instrument" => await _db.Instruments.Where(i => i.Id == id).Select(i => new { i.Id, i.Name, i.Category, i.TuningSystem, i.ImageUrl }).FirstOrDefaultAsync() is var ins && ins != null ? new GraphNodeDto
                {
                    Id = ins.Id.ToString(),
                    Type = "Instrument",
                    Label = ins.Name,
                    Properties = new Dictionary<string, object?> { ["category"] = ins.Category, ["tuningSystem"] = ins.TuningSystem, ["imageUrl"] = ins.ImageUrl }
                } : null,

                "Ceremony" => await _db.Ceremonies.Where(c => c.Id == id).Select(c => new { c.Id, c.Name, c.Type, c.Season }).FirstOrDefaultAsync() is var cer && cer != null ? new GraphNodeDto
                {
                    Id = cer.Id.ToString(),
                    Type = "Ceremony",
                    Label = cer.Name,
                    Properties = new Dictionary<string, object?> { ["type"] = cer.Type, ["season"] = cer.Season }
                } : null,

                "Recording" => await _db.Recordings.Where(r => r.Id == id).Select(r => new { r.Id, r.Title, r.PerformerName, r.DurationSeconds, r.PerformanceContext }).FirstOrDefaultAsync() is var rec && rec != null ? new GraphNodeDto
                {
                    Id = rec.Id.ToString(),
                    Type = "Recording",
                    Label = rec.Title ?? "Untitled",
                    Properties = new Dictionary<string, object?> { ["performerName"] = rec.PerformerName, ["durationSeconds"] = rec.DurationSeconds, ["performanceContext"] = rec.PerformanceContext }
                } : null,

                "VocalStyle" => await _db.VocalStyles.Where(v => v.Id == id).Select(v => new { v.Id, v.Name }).FirstOrDefaultAsync() is var vs && vs != null ? new GraphNodeDto
                {
                    Id = vs.Id.ToString(),
                    Type = "VocalStyle",
                    Label = vs.Name
                } : null,

                "MusicalScale" => await _db.MusicalScales.Where(m => m.Id == id).Select(m => new { m.Id, m.Name, m.NotePattern }).FirstOrDefaultAsync() is var ms && ms != null ? new GraphNodeDto
                {
                    Id = ms.Id.ToString(),
                    Type = "MusicalScale",
                    Label = ms.Name,
                    Properties = new Dictionary<string, object?> { ["notePattern"] = ms.NotePattern }
                } : null,

                "Tag" => await _db.Tags.Where(t => t.Id == id).Select(t => new { t.Id, t.Name, t.Category }).FirstOrDefaultAsync() is var tg && tg != null ? new GraphNodeDto
                {
                    Id = tg.Id.ToString(),
                    Type = "Tag",
                    Label = tg.Name,
                    Properties = new Dictionary<string, object?> { ["category"] = tg.Category }
                } : null,

                "Province" => await _db.Provinces.Where(p => p.Id == id).Select(p => new { p.Id, p.Name, p.RegionCode }).FirstOrDefaultAsync() is var pv && pv != null ? new GraphNodeDto
                {
                    Id = pv.Id.ToString(),
                    Type = "Province",
                    Label = pv.Name,
                    Properties = new Dictionary<string, object?> { ["regionCode"] = pv.RegionCode }
                } : null,

                _ => null
            };
        }

        private async Task<List<(GraphNodeDto Node, GraphEdgeDto Edge)>> GetNeighborsAsync(Guid nodeId, string nodeType, List<string>? filterTypes)
        {
            var neighbors = new List<(GraphNodeDto, GraphEdgeDto)>();
            bool includeType(string t) => filterTypes == null || filterTypes.Contains(t);

            switch (nodeType)
            {
                case "EthnicGroup":
                    if (includeType("Instrument"))
                    {
                        var ieRel = await _db.InstrumentEthnicGroups.Where(ie => ie.EthnicGroupId == nodeId).Include(ie => ie.Instrument).ToListAsync();
                        foreach (var ie in ieRel.Where(x => x.Instrument != null))
                            neighbors.Add((ToNodeInstrument(ie.Instrument), new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = ie.InstrumentId.ToString(), Relation = "ETHNIC_GROUP_HAS_INSTRUMENT" }));
                    }
                    if (includeType("Ceremony"))
                    {
                        var ecRel = await _db.EthnicGroupCeremonies.Where(ec => ec.EthnicGroupId == nodeId).Include(ec => ec.Ceremony).ToListAsync();
                        foreach (var ec in ecRel.Where(x => x.Ceremony != null))
                            neighbors.Add((ToNodeCeremony(ec.Ceremony), new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = ec.CeremonyId.ToString(), Relation = "HAS_CEREMONY" }));
                    }
                    if (includeType("Recording"))
                    {
                        var recs = await _db.Recordings.Where(r => r.EthnicGroupId == nodeId && r.Status == SubmissionStatus.Approved).Take(20).ToListAsync();
                        foreach (var r in recs)
                            neighbors.Add((ToNodeRecording(r), new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = r.Id.ToString(), Relation = "HAS_RECORDING" }));
                    }
                    if (includeType("VocalStyle"))
                    {
                        var styles = await _db.VocalStyles.Where(v => v.EthnicGroupId == nodeId).ToListAsync();
                        foreach (var v in styles)
                            neighbors.Add((ToNodeVocalStyle(v), new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = v.Id.ToString(), Relation = "HAS_VOCAL_STYLE" }));
                    }
                    break;

                case "Instrument":
                    if (includeType("EthnicGroup"))
                    {
                        var ieRel = await _db.InstrumentEthnicGroups.Where(ie => ie.InstrumentId == nodeId).Include(ie => ie.EthnicGroup).ToListAsync();
                        foreach (var ie in ieRel.Where(x => x.EthnicGroup != null))
                            neighbors.Add((ToNodeEthnicGroup(ie.EthnicGroup), new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = ie.EthnicGroupId.ToString(), Relation = "BELONGS_TO_ETHNIC_GROUP" }));
                    }
                    if (includeType("Recording"))
                    {
                        var riRel = await _db.RecordingInstruments.Where(ri => ri.InstrumentId == nodeId).Include(ri => ri.Recording).Take(20).ToListAsync();
                        foreach (var ri in riRel.Where(x => x.Recording != null))
                            neighbors.Add((ToNodeRecording(ri.Recording), new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = ri.RecordingId.ToString(), Relation = "USED_IN_RECORDING", Properties = new Dictionary<string, object?> { ["playingTechnique"] = ri.PlayingTechnique } }));
                    }
                    break;

                case "Ceremony":
                    if (includeType("EthnicGroup"))
                    {
                        var ecRel = await _db.EthnicGroupCeremonies.Where(ec => ec.CeremonyId == nodeId).Include(ec => ec.EthnicGroup).ToListAsync();
                        foreach (var ec in ecRel.Where(x => x.EthnicGroup != null))
                            neighbors.Add((ToNodeEthnicGroup(ec.EthnicGroup), new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = ec.EthnicGroupId.ToString(), Relation = "PERFORMED_BY_ETHNIC_GROUP" }));
                    }
                    if (includeType("Recording"))
                    {
                        var recs = await _db.Recordings.Where(r => r.CeremonyId == nodeId && r.Status == SubmissionStatus.Approved).Take(20).ToListAsync();
                        foreach (var r in recs)
                            neighbors.Add((ToNodeRecording(r), new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = r.Id.ToString(), Relation = "FEATURED_IN_RECORDING" }));
                    }
                    break;

                case "Recording":
                    if (includeType("EthnicGroup"))
                    {
                        var r = await _db.Recordings.Include(x => x.EthnicGroup).FirstOrDefaultAsync(x => x.Id == nodeId);
                        if (r?.EthnicGroup != null)
                            neighbors.Add((ToNodeEthnicGroup(r.EthnicGroup), new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = r.EthnicGroupId.ToString()!, Relation = "BELONGS_TO_ETHNIC_GROUP" }));
                    }
                    if (includeType("Instrument"))
                    {
                        var riRel = await _db.RecordingInstruments.Where(ri => ri.RecordingId == nodeId).Include(ri => ri.Instrument).ToListAsync();
                        foreach (var ri in riRel.Where(x => x.Instrument != null))
                            neighbors.Add((ToNodeInstrument(ri.Instrument), new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = ri.InstrumentId.ToString(), Relation = "USES_INSTRUMENT", Properties = new Dictionary<string, object?> { ["playingTechnique"] = ri.PlayingTechnique } }));
                    }
                    if (includeType("Ceremony"))
                    {
                        var r = await _db.Recordings.Include(x => x.Ceremony).FirstOrDefaultAsync(x => x.Id == nodeId);
                        if (r?.Ceremony != null)
                            neighbors.Add((ToNodeCeremony(r.Ceremony), new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = r.CeremonyId.ToString()!, Relation = "PERFORMED_IN_CEREMONY" }));
                    }
                    if (includeType("Tag"))
                    {
                        var rtRel = await _db.RecordingTags.Where(rt => rt.RecordingId == nodeId).Include(rt => rt.Tag).ToListAsync();
                        foreach (var rt in rtRel.Where(x => x.Tag != null))
                            neighbors.Add((ToNodeTag(rt.Tag), new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = rt.TagId.ToString(), Relation = "HAS_TAG" }));
                    }
                    if (includeType("VocalStyle"))
                    {
                        var r = await _db.Recordings.Include(x => x.VocalStyle).FirstOrDefaultAsync(x => x.Id == nodeId);
                        if (r?.VocalStyle != null)
                            neighbors.Add((ToNodeVocalStyle(r.VocalStyle), new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = r.VocalStyleId.ToString()!, Relation = "HAS_VOCAL_STYLE" }));
                    }
                    if (includeType("MusicalScale"))
                    {
                        var r = await _db.Recordings.Include(x => x.MusicalScale).FirstOrDefaultAsync(x => x.Id == nodeId);
                        if (r?.MusicalScale != null)
                            neighbors.Add((ToNodeMusicalScale(r.MusicalScale), new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = r.MusicalScaleId.ToString()!, Relation = "HAS_SCALE" }));
                    }
                    break;

                case "Tag":
                    if (includeType("Recording"))
                    {
                        var rtRel = await _db.RecordingTags.Where(rt => rt.TagId == nodeId).Include(rt => rt.Recording).Take(20).ToListAsync();
                        foreach (var rt in rtRel.Where(x => x.Recording != null))
                            neighbors.Add((ToNodeRecording(rt.Recording), new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = rt.RecordingId.ToString(), Relation = "TAGGED_RECORDING" }));
                    }
                    break;

                case "VocalStyle":
                    if (includeType("EthnicGroup"))
                    {
                        var v = await _db.VocalStyles.Include(x => x.EthnicGroup).FirstOrDefaultAsync(x => x.Id == nodeId);
                        if (v?.EthnicGroup != null)
                            neighbors.Add((ToNodeEthnicGroup(v.EthnicGroup), new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = v.EthnicGroupId.ToString()!, Relation = "BELONGS_TO_ETHNIC_GROUP" }));
                    }
                    break;
            }

            return neighbors;
        }

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

        private List<GraphEdgeDto> DeduplicateEdges(List<GraphEdgeDto> edges)
        {
            return edges
                .GroupBy(e => $"{e.SourceId}-{e.TargetId}-{e.Relation}")
                .Select(g => g.First())
                .ToList();
        }

        private static readonly Dictionary<string, string> RelationLabels = new()
        {
            { "BELONGS_TO_ETHNIC_GROUP", "Thuộc về dân tộc" },
            { "ETHNIC_GROUP_HAS_INSTRUMENT", "Nhạc cụ đặc trưng" },
            { "HAS_INSTRUMENT", "Nhạc cụ liên quan" },
            { "USES_INSTRUMENT", "Sử dụng nhạc cụ" },
            { "USED_IN_RECORDING", "Sử dụng trong bản ghi" },
            { "HAS_CEREMONY", "Nghi lễ đặc trưng" },
            { "PERFORMED_BY_ETHNIC_GROUP", "Thực hiện bởi dân tộc" },
            { "FEATURED_IN_RECORDING", "Có trong bản ghi" },
            { "PERFORMED_IN_CEREMONY", "Biểu diễn trong nghi lễ" },
            { "HAS_RECORDING", "Bản ghi âm nhạc" },
            { "HAS_VOCAL_STYLE", "Lối hát đặc trưng" },
            { "HAS_SCALE", "Điệu/Hệ âm" },
            { "HAS_TAG", "Từ khóa liên quan" },
            { "TAGGED_RECORDING", "Bản ghi liên quan" }
        };

        public async Task<NodeDetailDto?> GetNodeDetailAsync(Guid id, string nodeType)
        {
            var detail = new NodeDetailDto
            {
                Id = id.ToString(),
                Type = nodeType,
                RelationGroups = new List<NodeRelationGroupDto>(),
                Properties = new Dictionary<string, object?>()
            };

            List<Recording> relatedRecordings = new();

            if (nodeType == "EthnicGroup")
            {
                var eg = await _db.EthnicGroups.FirstOrDefaultAsync(e => e.Id == id);
                if (eg == null) return null;

                detail.Label = eg.Name;
                detail.Description = eg.Description;
                detail.Properties["languageFamily"] = eg.LanguageFamily;
                detail.Properties["primaryRegion"] = eg.PrimaryRegion;
                detail.Properties["imageUrl"] = eg.ImageUrl;

                var instruments = await _db.InstrumentEthnicGroups.Where(ie => ie.EthnicGroupId == id).Include(ie => ie.Instrument).Select(ie => ie.Instrument).ToListAsync();
                var ceremonies = await _db.EthnicGroupCeremonies.Where(ec => ec.EthnicGroupId == id).Include(ec => ec.Ceremony).Select(ec => ec.Ceremony).ToListAsync();
                var recordings = await _db.Recordings.Where(r => r.EthnicGroupId == id && r.Status == SubmissionStatus.Approved).ToListAsync();
                var vocalStyles = await _db.VocalStyles.Where(v => v.EthnicGroupId == id).ToListAsync();

                relatedRecordings = recordings;

                if (instruments.Count > 0)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "ETHNIC_GROUP_HAS_INSTRUMENT",
                        RelationLabel = RelationLabels.GetValueOrDefault("ETHNIC_GROUP_HAS_INSTRUMENT", "Nhạc cụ đặc trưng"),
                        Count = instruments.Count,
                        Samples = instruments.Take(5).Select(i => new NodeSummaryDto { Id = i.Id.ToString(), Type = "Instrument", Label = i.Name }).ToList()
                    });
                }

                if (ceremonies.Count > 0)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "HAS_CEREMONY",
                        RelationLabel = RelationLabels.GetValueOrDefault("HAS_CEREMONY", "Nghi lễ đặc trưng"),
                        Count = ceremonies.Count,
                        Samples = ceremonies.Take(5).Select(c => new NodeSummaryDto { Id = c.Id.ToString(), Type = "Ceremony", Label = c.Name }).ToList()
                    });
                }

                if (recordings.Count > 0)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "HAS_RECORDING",
                        RelationLabel = RelationLabels.GetValueOrDefault("HAS_RECORDING", "Bản ghi âm nhạc"),
                        Count = recordings.Count,
                        Samples = recordings.Take(5).Select(r => new NodeSummaryDto { Id = r.Id.ToString(), Type = "Recording", Label = r.Title ?? "Untitled" }).ToList()
                    });
                }

                if (vocalStyles.Count > 0)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "HAS_VOCAL_STYLE",
                        RelationLabel = RelationLabels.GetValueOrDefault("HAS_VOCAL_STYLE", "Lối hát đặc trưng"),
                        Count = vocalStyles.Count,
                        Samples = vocalStyles.Take(5).Select(v => new NodeSummaryDto { Id = v.Id.ToString(), Type = "VocalStyle", Label = v.Name }).ToList()
                    });
                }
            }
            else if (nodeType == "Instrument")
            {
                var inst = await _db.Instruments.FirstOrDefaultAsync(i => i.Id == id);
                if (inst == null) return null;

                detail.Label = inst.Name;
                detail.Description = inst.Description;
                detail.Properties["category"] = inst.Category;
                detail.Properties["tuningSystem"] = inst.TuningSystem;
                detail.Properties["constructionMethod"] = inst.ConstructionMethod;
                detail.Properties["imageUrl"] = inst.ImageUrl;

                var ethnicGroups = await _db.InstrumentEthnicGroups.Where(ie => ie.InstrumentId == id).Include(ie => ie.EthnicGroup).Select(ie => ie.EthnicGroup).ToListAsync();
                var recordings = await _db.RecordingInstruments.Where(ri => ri.InstrumentId == id).Include(ri => ri.Recording).Where(ri => ri.Recording.Status == SubmissionStatus.Approved).Select(ri => ri.Recording).Distinct().ToListAsync();

                relatedRecordings = recordings;

                if (ethnicGroups.Count > 0)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "BELONGS_TO_ETHNIC_GROUP",
                        RelationLabel = RelationLabels.GetValueOrDefault("BELONGS_TO_ETHNIC_GROUP", "Thuộc về dân tộc"),
                        Count = ethnicGroups.Count,
                        Samples = ethnicGroups.Take(5).Select(e => new NodeSummaryDto { Id = e.Id.ToString(), Type = "EthnicGroup", Label = e.Name }).ToList()
                    });
                }

                if (recordings.Count > 0)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "USED_IN_RECORDING",
                        RelationLabel = RelationLabels.GetValueOrDefault("USED_IN_RECORDING", "Sử dụng trong bản ghi"),
                        Count = recordings.Count,
                        Samples = recordings.Take(5).Select(r => new NodeSummaryDto { Id = r.Id.ToString(), Type = "Recording", Label = r.Title ?? "Untitled" }).ToList()
                    });
                }
            }
            else if (nodeType == "Ceremony")
            {
                var cer = await _db.Ceremonies.FirstOrDefaultAsync(c => c.Id == id);
                if (cer == null) return null;

                detail.Label = cer.Name;
                detail.Description = cer.Description;
                detail.Properties["type"] = cer.Type;
                detail.Properties["season"] = cer.Season;

                var ethnicGroups = await _db.EthnicGroupCeremonies.Where(ec => ec.CeremonyId == id).Include(ec => ec.EthnicGroup).Select(ec => ec.EthnicGroup).ToListAsync();
                var recordings = await _db.Recordings.Where(r => r.CeremonyId == id && r.Status == SubmissionStatus.Approved).ToListAsync();

                relatedRecordings = recordings;

                if (ethnicGroups.Count > 0)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "PERFORMED_BY_ETHNIC_GROUP",
                        RelationLabel = RelationLabels.GetValueOrDefault("PERFORMED_BY_ETHNIC_GROUP", "Thực hiện bởi dân tộc"),
                        Count = ethnicGroups.Count,
                        Samples = ethnicGroups.Take(5).Select(e => new NodeSummaryDto { Id = e.Id.ToString(), Type = "EthnicGroup", Label = e.Name }).ToList()
                    });
                }

                if (recordings.Count > 0)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "FEATURED_IN_RECORDING",
                        RelationLabel = RelationLabels.GetValueOrDefault("FEATURED_IN_RECORDING", "Có trong bản ghi"),
                        Count = recordings.Count,
                        Samples = recordings.Take(5).Select(r => new NodeSummaryDto { Id = r.Id.ToString(), Type = "Recording", Label = r.Title ?? "Untitled" }).ToList()
                    });
                }
            }
            else if (nodeType == "Recording")
            {
                var rec = await _db.Recordings
                    .Include(r => r.EthnicGroup)
                    .Include(r => r.Ceremony)
                    .Include(r => r.VocalStyle)
                    .Include(r => r.MusicalScale)
                    .FirstOrDefaultAsync(r => r.Id == id);
                if (rec == null) return null;

                detail.Label = rec.Title ?? "Untitled";
                detail.Description = rec.Description;
                detail.Properties["performerName"] = rec.PerformerName;
                detail.Properties["durationSeconds"] = rec.DurationSeconds;
                detail.Properties["performanceContext"] = rec.PerformanceContext;
                detail.Properties["recordingLocation"] = rec.RecordingLocation;
                detail.Properties["recordingDate"] = rec.RecordingDate;

                var instruments = await _db.RecordingInstruments.Where(ri => ri.RecordingId == id).Include(ri => ri.Instrument).Select(ri => ri.Instrument).ToListAsync();
                var tags = await _db.RecordingTags.Where(rt => rt.RecordingId == id).Include(rt => rt.Tag).Select(rt => rt.Tag).ToListAsync();

                if (rec.Status == SubmissionStatus.Approved)
                {
                    relatedRecordings.Add(rec);
                }

                if (rec.EthnicGroup != null)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "BELONGS_TO_ETHNIC_GROUP",
                        RelationLabel = RelationLabels.GetValueOrDefault("BELONGS_TO_ETHNIC_GROUP", "Thuộc về dân tộc"),
                        Count = 1,
                        Samples = new List<NodeSummaryDto> { new NodeSummaryDto { Id = rec.EthnicGroup.Id.ToString(), Type = "EthnicGroup", Label = rec.EthnicGroup.Name } }
                    });
                }

                if (rec.Ceremony != null)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "PERFORMED_IN_CEREMONY",
                        RelationLabel = RelationLabels.GetValueOrDefault("PERFORMED_IN_CEREMONY", "Biểu diễn trong nghi lễ"),
                        Count = 1,
                        Samples = new List<NodeSummaryDto> { new NodeSummaryDto { Id = rec.Ceremony.Id.ToString(), Type = "Ceremony", Label = rec.Ceremony.Name } }
                    });
                }

                if (rec.VocalStyle != null)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "HAS_VOCAL_STYLE",
                        RelationLabel = RelationLabels.GetValueOrDefault("HAS_VOCAL_STYLE", "Lối hát đặc trưng"),
                        Count = 1,
                        Samples = new List<NodeSummaryDto> { new NodeSummaryDto { Id = rec.VocalStyle.Id.ToString(), Type = "VocalStyle", Label = rec.VocalStyle.Name } }
                    });
                }

                if (rec.MusicalScale != null)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "HAS_SCALE",
                        RelationLabel = RelationLabels.GetValueOrDefault("HAS_SCALE", "Điệu/Hệ âm"),
                        Count = 1,
                        Samples = new List<NodeSummaryDto> { new NodeSummaryDto { Id = rec.MusicalScale.Id.ToString(), Type = "MusicalScale", Label = rec.MusicalScale.Name } }
                    });
                }

                if (instruments.Count > 0)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "USES_INSTRUMENT",
                        RelationLabel = RelationLabels.GetValueOrDefault("USES_INSTRUMENT", "Sử dụng nhạc cụ"),
                        Count = instruments.Count,
                        Samples = instruments.Take(5).Select(i => new NodeSummaryDto { Id = i.Id.ToString(), Type = "Instrument", Label = i.Name }).ToList()
                    });
                }

                if (tags.Count > 0)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "HAS_TAG",
                        RelationLabel = RelationLabels.GetValueOrDefault("HAS_TAG", "Từ khóa liên quan"),
                        Count = tags.Count,
                        Samples = tags.Take(5).Select(t => new NodeSummaryDto { Id = t.Id.ToString(), Type = "Tag", Label = t.Name }).ToList()
                    });
                }
            }
            else if (nodeType == "Province")
            {
                var prov = await _db.Provinces.FirstOrDefaultAsync(p => p.Id == id);
                if (prov == null) return null;

                detail.Label = prov.Name;
                detail.Properties["regionCode"] = prov.RegionCode;

                var districtIds = await _db.Districts.Where(d => d.ProvinceId == id).Select(d => d.Id).ToListAsync();
                var communeIds = await _db.Communes.Where(c => districtIds.Contains(c.DistrictId)).Select(c => c.Id).ToListAsync();
                var recordings = await _db.Recordings.Where(r => r.CommuneId != null && communeIds.Contains(r.CommuneId.Value) && r.Status == SubmissionStatus.Approved).ToListAsync();

                relatedRecordings = recordings;

                if (recordings.Count > 0)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "HAS_RECORDING",
                        RelationLabel = RelationLabels.GetValueOrDefault("HAS_RECORDING", "Bản ghi tại địa phương"),
                        Count = recordings.Count,
                        Samples = recordings.Take(5).Select(r => new NodeSummaryDto { Id = r.Id.ToString(), Type = "Recording", Label = r.Title ?? "Untitled" }).ToList()
                    });
                }
            }
            else if (nodeType == "VocalStyle")
            {
                var vs = await _db.VocalStyles.Include(v => v.EthnicGroup).FirstOrDefaultAsync(v => v.Id == id);
                if (vs == null) return null;

                detail.Label = vs.Name;
                detail.Description = vs.Description;

                var recordings = await _db.Recordings.Where(r => r.VocalStyleId == id && r.Status == SubmissionStatus.Approved).ToListAsync();

                relatedRecordings = recordings;

                if (vs.EthnicGroup != null)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "BELONGS_TO_ETHNIC_GROUP",
                        RelationLabel = RelationLabels.GetValueOrDefault("BELONGS_TO_ETHNIC_GROUP", "Thuộc về dân tộc"),
                        Count = 1,
                        Samples = new List<NodeSummaryDto> { new NodeSummaryDto { Id = vs.EthnicGroup.Id.ToString(), Type = "EthnicGroup", Label = vs.EthnicGroup.Name } }
                    });
                }

                if (recordings.Count > 0)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "HAS_RECORDING",
                        RelationLabel = RelationLabels.GetValueOrDefault("HAS_RECORDING", "Bản ghi sử dụng lối hát"),
                        Count = recordings.Count,
                        Samples = recordings.Take(5).Select(r => new NodeSummaryDto { Id = r.Id.ToString(), Type = "Recording", Label = r.Title ?? "Untitled" }).ToList()
                    });
                }
            }
            else if (nodeType == "MusicalScale")
            {
                var ms = await _db.MusicalScales.FirstOrDefaultAsync(m => m.Id == id);
                if (ms == null) return null;

                detail.Label = ms.Name;
                detail.Description = ms.Description;
                detail.Properties["notePattern"] = ms.NotePattern;

                var recordings = await _db.Recordings.Where(r => r.MusicalScaleId == id && r.Status == SubmissionStatus.Approved).ToListAsync();

                relatedRecordings = recordings;

                if (recordings.Count > 0)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "HAS_RECORDING",
                        RelationLabel = RelationLabels.GetValueOrDefault("HAS_RECORDING", "Bản ghi sử dụng điệu nhạc"),
                        Count = recordings.Count,
                        Samples = recordings.Take(5).Select(r => new NodeSummaryDto { Id = r.Id.ToString(), Type = "Recording", Label = r.Title ?? "Untitled" }).ToList()
                    });
                }
            }
            else if (nodeType == "Tag")
            {
                var tag = await _db.Tags.FirstOrDefaultAsync(t => t.Id == id);
                if (tag == null) return null;

                detail.Label = tag.Name;
                detail.Properties["category"] = tag.Category;

                var recordings = await _db.RecordingTags.Where(rt => rt.TagId == id).Include(rt => rt.Recording).Where(rt => rt.Recording.Status == SubmissionStatus.Approved).Select(rt => rt.Recording).ToListAsync();

                relatedRecordings = recordings;

                if (recordings.Count > 0)
                {
                    detail.RelationGroups.Add(new NodeRelationGroupDto
                    {
                        RelationType = "TAGGED_RECORDING",
                        RelationLabel = RelationLabels.GetValueOrDefault("TAGGED_RECORDING", "Bản ghi liên quan"),
                        Count = recordings.Count,
                        Samples = recordings.Take(5).Select(r => new NodeSummaryDto { Id = r.Id.ToString(), Type = "Recording", Label = r.Title ?? "Untitled" }).ToList()
                    });
                }
            }
            else
            {
                return null;
            }

            var totalConnections = detail.RelationGroups.Sum(g => g.Count);
            var directNeighbors = detail.RelationGroups
                .SelectMany(g => g.Samples.Select(s => s.Id))
                .Distinct()
                .Count();

            var totalArtists = relatedRecordings
                .Where(r => !string.IsNullOrEmpty(r.PerformerName))
                .Select(r => r.PerformerName!.Trim())
                .Distinct()
                .Count();

            detail.Stats = new NodeStatsDto
            {
                TotalConnections = totalConnections,
                TotalRecordings = relatedRecordings.Count,
                TotalArtists = totalArtists,
                DirectNeighbors = directNeighbors
            };

            return detail;
        }

        public async Task<ShortestPathResponseDto> GetShortestPathAsync(Guid fromId, string fromType, Guid toId, string toType, int maxDepth)
        {
            var response = new ShortestPathResponseDto();
            if (fromId == toId)
            {
                return response;
            }

            maxDepth = Math.Clamp(maxDepth, 1, 6);

            var visited = new HashSet<string>();
            var parentTracker = new Dictionary<string, (NodeSummaryDto Parent, string RelationType, string RelationLabel)>();

            var currentLayer = new List<NodeSummaryDto>
            {
                new NodeSummaryDto { Id = fromId.ToString(), Type = fromType, Label = "" }
            };
            visited.Add($"{fromType}:{fromId}");

            bool found = false;
            int depth = 0;

            while (currentLayer.Count > 0 && depth < maxDepth)
            {
                var nextLayer = new List<NodeSummaryDto>();

                foreach (var node in currentLayer)
                {
                    var nodeId = Guid.Parse(node.Id);
                    var neighbors = await GetNeighborsForBFSAsync(nodeId, node.Type);
                    foreach (var neighbor in neighbors)
                    {
                        var key = $"{neighbor.Node.Type}:{neighbor.Node.Id}";
                        if (!visited.Contains(key))
                        {
                            visited.Add(key);
                            parentTracker[key] = (node, neighbor.Edge.Relation, RelationLabels.GetValueOrDefault(neighbor.Edge.Relation, neighbor.Edge.Relation));
                            
                            nextLayer.Add(neighbor.Node);

                            if (neighbor.Node.Id == toId.ToString() && neighbor.Node.Type == toType)
                            {
                                found = true;
                                break;
                            }
                        }
                    }
                    if (found) break;
                }

                if (found) break;
                currentLayer = nextLayer;
                depth++;
            }

            if (found)
            {
                response.PathFound = true;
                var pathNodes = new List<PathNodeDto>();
                var pathEdges = new List<PathEdgeDto>();

                var currentKey = $"{toType}:{toId}";
                var stepList = new List<NodeSummaryDto>();

                var targetNode = await GetNodeSummaryAsync(toId, toType);
                stepList.Add(targetNode);

                while (parentTracker.ContainsKey(currentKey))
                {
                    var parentInfo = parentTracker[currentKey];
                    var parentNode = await GetNodeSummaryAsync(Guid.Parse(parentInfo.Parent.Id), parentInfo.Parent.Type);
                    
                    pathEdges.Insert(0, new PathEdgeDto
                    {
                        FromId = parentNode.Id,
                        ToId = stepList[0].Id,
                        RelationType = parentInfo.RelationType,
                        RelationLabel = parentInfo.RelationLabel
                    });

                    stepList.Insert(0, parentNode);
                    currentKey = $"{parentNode.Type}:{parentNode.Id}";
                }

                for (int i = 0; i < stepList.Count; i++)
                {
                    pathNodes.Add(new PathNodeDto
                    {
                        Id = stepList[i].Id,
                        Type = stepList[i].Type,
                        Label = stepList[i].Label,
                        StepIndex = i
                    });
                }

                response.Nodes = pathNodes;
                response.Edges = pathEdges;
                response.PathLength = pathEdges.Count;
            }
            else
            {
                var fromNeighbors = await GetNeighborsForBFSAsync(fromId, fromType);
                var toNeighbors = await GetNeighborsForBFSAsync(toId, toType);

                var fromNeighborKeys = fromNeighbors.Select(n => $"{n.Node.Type}:{n.Node.Id}").ToHashSet();
                var commonNeighbors = toNeighbors
                    .Where(n => fromNeighborKeys.Contains($"{n.Node.Type}:{n.Node.Id}"))
                    .Select(n => n.Node)
                    .Take(5)
                    .ToList();

                response.SuggestedBridges = commonNeighbors.Count > 0 ? commonNeighbors : null;
            }

            return response;
        }

        private async Task<List<(NodeSummaryDto Node, GraphEdgeDto Edge)>> GetNeighborsForBFSAsync(Guid nodeId, string nodeType)
        {
            var neighbors = new List<(NodeSummaryDto, GraphEdgeDto)>();

            switch (nodeType)
            {
                case "EthnicGroup":
                    {
                        var ieRel = await _db.InstrumentEthnicGroups.Where(ie => ie.EthnicGroupId == nodeId).Include(ie => ie.Instrument).ToListAsync();
                        foreach (var ie in ieRel.Where(x => x.Instrument != null))
                            neighbors.Add((new NodeSummaryDto { Id = ie.InstrumentId.ToString(), Type = "Instrument", Label = ie.Instrument.Name }, new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = ie.InstrumentId.ToString(), Relation = "ETHNIC_GROUP_HAS_INSTRUMENT" }));

                        var ecRel = await _db.EthnicGroupCeremonies.Where(ec => ec.EthnicGroupId == nodeId).Include(ec => ec.Ceremony).ToListAsync();
                        foreach (var ec in ecRel.Where(x => x.Ceremony != null))
                            neighbors.Add((new NodeSummaryDto { Id = ec.CeremonyId.ToString(), Type = "Ceremony", Label = ec.Ceremony.Name }, new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = ec.CeremonyId.ToString(), Relation = "HAS_CEREMONY" }));

                        var recs = await _db.Recordings.Where(r => r.EthnicGroupId == nodeId && r.Status == SubmissionStatus.Approved).Take(100).ToListAsync();
                        foreach (var r in recs)
                            neighbors.Add((new NodeSummaryDto { Id = r.Id.ToString(), Type = "Recording", Label = r.Title ?? "Untitled" }, new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = r.Id.ToString(), Relation = "HAS_RECORDING" }));

                        var styles = await _db.VocalStyles.Where(v => v.EthnicGroupId == nodeId).ToListAsync();
                        foreach (var v in styles)
                            neighbors.Add((new NodeSummaryDto { Id = v.Id.ToString(), Type = "VocalStyle", Label = v.Name }, new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = v.Id.ToString(), Relation = "HAS_VOCAL_STYLE" }));
                    }
                    break;

                case "Instrument":
                    {
                        var ieRel = await _db.InstrumentEthnicGroups.Where(ie => ie.InstrumentId == nodeId).Include(ie => ie.EthnicGroup).ToListAsync();
                        foreach (var ie in ieRel.Where(x => x.EthnicGroup != null))
                            neighbors.Add((new NodeSummaryDto { Id = ie.EthnicGroupId.ToString(), Type = "EthnicGroup", Label = ie.EthnicGroup.Name }, new GraphEdgeDto { SourceId = ie.EthnicGroupId.ToString(), TargetId = nodeId.ToString(), Relation = "BELONGS_TO_ETHNIC_GROUP" }));

                        var riRel = await _db.RecordingInstruments.Where(ri => ri.InstrumentId == nodeId).Include(ri => ri.Recording).Take(100).ToListAsync();
                        foreach (var ri in riRel.Where(x => x.Recording != null && x.Recording.Status == SubmissionStatus.Approved))
                            neighbors.Add((new NodeSummaryDto { Id = ri.RecordingId.ToString(), Type = "Recording", Label = ri.Recording.Title ?? "Untitled" }, new GraphEdgeDto { SourceId = ri.RecordingId.ToString(), TargetId = nodeId.ToString(), Relation = "USED_IN_RECORDING" }));
                    }
                    break;

                case "Ceremony":
                    {
                        var ecRel = await _db.EthnicGroupCeremonies.Where(ec => ec.CeremonyId == nodeId).Include(ec => ec.EthnicGroup).ToListAsync();
                        foreach (var ec in ecRel.Where(x => x.EthnicGroup != null))
                            neighbors.Add((new NodeSummaryDto { Id = ec.EthnicGroupId.ToString(), Type = "EthnicGroup", Label = ec.EthnicGroup.Name }, new GraphEdgeDto { SourceId = ec.EthnicGroupId.ToString(), TargetId = nodeId.ToString(), Relation = "PERFORMED_BY_ETHNIC_GROUP" }));

                        var recs = await _db.Recordings.Where(r => r.CeremonyId == nodeId && r.Status == SubmissionStatus.Approved).Take(100).ToListAsync();
                        foreach (var r in recs)
                            neighbors.Add((new NodeSummaryDto { Id = r.Id.ToString(), Type = "Recording", Label = r.Title ?? "Untitled" }, new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = r.Id.ToString(), Relation = "FEATURED_IN_RECORDING" }));
                    }
                    break;

                case "Recording":
                    {
                        var r = await _db.Recordings.Include(x => x.EthnicGroup).Include(x => x.Ceremony).Include(x => x.VocalStyle).Include(x => x.MusicalScale).FirstOrDefaultAsync(x => x.Id == nodeId);
                        if (r != null)
                        {
                            if (r.EthnicGroup != null)
                                neighbors.Add((new NodeSummaryDto { Id = r.EthnicGroupId.ToString()!, Type = "EthnicGroup", Label = r.EthnicGroup.Name }, new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = r.EthnicGroupId.ToString()!, Relation = "BELONGS_TO_ETHNIC_GROUP" }));
                            if (r.Ceremony != null)
                                neighbors.Add((new NodeSummaryDto { Id = r.CeremonyId.ToString()!, Type = "Ceremony", Label = r.Ceremony.Name }, new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = r.CeremonyId.ToString()!, Relation = "PERFORMED_IN_CEREMONY" }));
                            if (r.VocalStyle != null)
                                neighbors.Add((new NodeSummaryDto { Id = r.VocalStyleId.ToString()!, Type = "VocalStyle", Label = r.VocalStyle.Name }, new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = r.VocalStyleId.ToString()!, Relation = "HAS_VOCAL_STYLE" }));
                            if (r.MusicalScale != null)
                                neighbors.Add((new NodeSummaryDto { Id = r.MusicalScaleId.ToString()!, Type = "MusicalScale", Label = r.MusicalScale.Name }, new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = r.MusicalScaleId.ToString()!, Relation = "HAS_SCALE" }));
                        }

                        var riRel = await _db.RecordingInstruments.Where(ri => ri.RecordingId == nodeId).Include(ri => ri.Instrument).ToListAsync();
                        foreach (var ri in riRel.Where(x => x.Instrument != null))
                            neighbors.Add((new NodeSummaryDto { Id = ri.InstrumentId.ToString(), Type = "Instrument", Label = ri.Instrument.Name }, new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = ri.InstrumentId.ToString(), Relation = "USES_INSTRUMENT" }));

                        var rtRel = await _db.RecordingTags.Where(rt => rt.RecordingId == nodeId).Include(rt => rt.Tag).ToListAsync();
                        foreach (var rt in rtRel.Where(x => x.Tag != null))
                            neighbors.Add((new NodeSummaryDto { Id = rt.TagId.ToString(), Type = "Tag", Label = rt.Tag.Name }, new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = rt.TagId.ToString(), Relation = "HAS_TAG" }));
                    }
                    break;

                case "Tag":
                    {
                        var rtRel = await _db.RecordingTags.Where(rt => rt.TagId == nodeId).Include(rt => rt.Recording).Take(100).ToListAsync();
                        foreach (var rt in rtRel.Where(x => x.Recording != null && x.Recording.Status == SubmissionStatus.Approved))
                            neighbors.Add((new NodeSummaryDto { Id = rt.RecordingId.ToString(), Type = "Recording", Label = rt.Recording.Title ?? "Untitled" }, new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = rt.RecordingId.ToString(), Relation = "TAGGED_RECORDING" }));
                    }
                    break;

                case "VocalStyle":
                    {
                        var v = await _db.VocalStyles.Include(x => x.EthnicGroup).FirstOrDefaultAsync(x => x.Id == nodeId);
                        if (v?.EthnicGroup != null)
                            neighbors.Add((new NodeSummaryDto { Id = v.EthnicGroupId.ToString()!, Type = "EthnicGroup", Label = v.EthnicGroup.Name }, new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = v.EthnicGroupId.ToString()!, Relation = "BELONGS_TO_ETHNIC_GROUP" }));

                        var recs = await _db.Recordings.Where(r => r.VocalStyleId == nodeId && r.Status == SubmissionStatus.Approved).Take(100).ToListAsync();
                        foreach (var r in recs)
                            neighbors.Add((new NodeSummaryDto { Id = r.Id.ToString(), Type = "Recording", Label = r.Title ?? "Untitled" }, new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = r.Id.ToString(), Relation = "HAS_RECORDING" }));
                    }
                    break;

                case "MusicalScale":
                    {
                        var recs = await _db.Recordings.Where(r => r.MusicalScaleId == nodeId && r.Status == SubmissionStatus.Approved).Take(100).ToListAsync();
                        foreach (var r in recs)
                            neighbors.Add((new NodeSummaryDto { Id = r.Id.ToString(), Type = "Recording", Label = r.Title ?? "Untitled" }, new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = r.Id.ToString(), Relation = "HAS_RECORDING" }));
                    }
                    break;

                case "Province":
                    {
                        var districtIds = await _db.Districts.Where(d => d.ProvinceId == nodeId).Select(d => d.Id).ToListAsync();
                        var communeIds = await _db.Communes.Where(c => districtIds.Contains(c.DistrictId)).Select(c => c.Id).ToListAsync();
                        var recordings = await _db.Recordings.Where(r => r.CommuneId != null && communeIds.Contains(r.CommuneId.Value) && r.Status == SubmissionStatus.Approved).Take(100).ToListAsync();
                        foreach (var r in recordings)
                            neighbors.Add((new NodeSummaryDto { Id = r.Id.ToString(), Type = "Recording", Label = r.Title ?? "Untitled" }, new GraphEdgeDto { SourceId = nodeId.ToString(), TargetId = r.Id.ToString(), Relation = "HAS_RECORDING" }));
                    }
                    break;
            }

            return neighbors;
        }

        private async Task<NodeSummaryDto> GetNodeSummaryAsync(Guid id, string type)
        {
            var summary = new NodeSummaryDto { Id = id.ToString(), Type = type };
            switch (type)
            {
                case "EthnicGroup":
                    summary.Label = await _db.EthnicGroups.Where(e => e.Id == id).Select(e => e.Name).FirstOrDefaultAsync() ?? "";
                    break;
                case "Instrument":
                    summary.Label = await _db.Instruments.Where(i => i.Id == id).Select(i => i.Name).FirstOrDefaultAsync() ?? "";
                    break;
                case "Ceremony":
                    summary.Label = await _db.Ceremonies.Where(c => c.Id == id).Select(c => c.Name).FirstOrDefaultAsync() ?? "";
                    break;
                case "Recording":
                    summary.Label = await _db.Recordings.Where(r => r.Id == id).Select(r => r.Title).FirstOrDefaultAsync() ?? "Untitled";
                    break;
                case "VocalStyle":
                    summary.Label = await _db.VocalStyles.Where(v => v.Id == id).Select(v => v.Name).FirstOrDefaultAsync() ?? "";
                    break;
                case "MusicalScale":
                    summary.Label = await _db.MusicalScales.Where(m => m.Id == id).Select(m => m.Name).FirstOrDefaultAsync() ?? "";
                    break;
                case "Tag":
                    summary.Label = await _db.Tags.Where(t => t.Id == id).Select(t => t.Name).FirstOrDefaultAsync() ?? "";
                    break;
                case "Province":
                    summary.Label = await _db.Provinces.Where(p => p.Id == id).Select(p => p.Name).FirstOrDefaultAsync() ?? "";
                    break;
            }
            return summary;
        }
    }
}
