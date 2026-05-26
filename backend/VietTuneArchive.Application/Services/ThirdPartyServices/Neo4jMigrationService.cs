using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Neo4j.Driver;
using VietTuneArchive.Domain.Context;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Application.IServices.IThirdPartyServices;

namespace VietTuneArchive.Application.Services.ThirdPartyServices
{
    public class Neo4jMigrationService : INeo4jMigrationService
    {
        private readonly DBContext _pgContext;
        private readonly IDriver _neo4jDriver;
        private const int BatchSize = 500;

        public Neo4jMigrationService(DBContext pgContext, IDriver neo4jDriver)
        {
            _pgContext = pgContext;
            _neo4jDriver = neo4jDriver;
        }

        public async Task<MigrationResultDto> RunFullMigrationAsync()
        {
            try
            {
                await InitializeConstraintsAsync();
                
                int nodesCount = 0;
                int relsCount = 0;

                // ==========================================
                // PHASE 1: MASTER ONTOLOGY INFRASTRUCTURE
                // ==========================================
                nodesCount += await MigrateLocationsAsync();
                nodesCount += await MigrateEthnicGroupsAsync();
                nodesCount += await MigrateCeremoniesAsync();
                nodesCount += await MigrateVocalStylesAsync();
                nodesCount += await MigrateMusicalScalesAsync();
                nodesCount += await MigrateTagsAsync();
                nodesCount += await MigrateInstrumentsAsync();
                nodesCount += await MigrateKBEntriesAsync();

                // ==========================================
                // PHASE 2: RECORDINGS & SEMANTIC TYING
                // ==========================================
                var recordingStats = await MigrateRecordingsAndLinksAsync();
                nodesCount += recordingStats.nodes;
                relsCount += recordingStats.rels;

                // Build secondary connections derived from junction tables
                relsCount += await ConnectInstrumentEthnicGroupsAsync();
                relsCount += await ConnectEthnicGroupCeremoniesAsync();

                return new MigrationResultDto
                {
                    Success = true,
                    Message = "Data migration successfully completed across all architectural layer scopes.",
                    NodesProcessed = nodesCount,
                    RelationshipsProcessed = relsCount
                };
            }
            catch (Exception ex)
            {
                return new MigrationResultDto
                {
                    Success = false,
                    Message = $"Migration failure encountered: {ex.Message} -> {ex.InnerException?.Message}",
                    NodesProcessed = 0,
                    RelationshipsProcessed = 0
                };
            }
        }

        private async Task InitializeConstraintsAsync()
        {
            await using var session = _neo4jDriver.AsyncSession();
            string[] constraintQueries = new[]
            {
                "CREATE CONSTRAINT FOR (r:Recording) REQUIRE r.Id IS UNIQUE IF NOT EXISTS",
                "CREATE CONSTRAINT FOR (i:Instrument) REQUIRE i.Id IS UNIQUE IF NOT EXISTS",
                "CREATE CONSTRAINT FOR (e:EthnicGroup) REQUIRE e.Id IS UNIQUE IF NOT EXISTS",
                "CREATE CONSTRAINT FOR (c:Ceremony) REQUIRE c.Id IS UNIQUE IF NOT EXISTS",
                "CREATE CONSTRAINT FOR (v:VocalStyle) REQUIRE v.Id IS UNIQUE IF NOT EXISTS",
                "CREATE CONSTRAINT FOR (m:MusicalScale) REQUIRE m.Id IS UNIQUE IF NOT EXISTS",
                "CREATE CONSTRAINT FOR (t:Tag) REQUIRE t.Id IS UNIQUE IF NOT EXISTS",
                "CREATE CONSTRAINT FOR (k:KBEntry) REQUIRE k.Id IS UNIQUE IF NOT EXISTS",
                "CREATE CONSTRAINT FOR (loc:Location) REQUIRE loc.Id IS UNIQUE IF NOT EXISTS"
            };

            foreach (var query in constraintQueries)
            {
                await session.ExecuteWriteAsync(async tx => await tx.RunAsync(query));
            }
        }

        private async Task<int> MigrateLocationsAsync()
        {
            // Fetch hierarchically linked regions
            var provinces = await _pgContext.Provinces.AsNoTracking().ToListAsync();
            var districts = await _pgContext.Districts.AsNoTracking().ToListAsync();
            var communes = await _pgContext.Communes.AsNoTracking().ToListAsync();

            await using var session = _neo4jDriver.AsyncSession();

            // 1. Process Provinces
            foreach (var chunk in provinces.Chunk(BatchSize))
            {
                var data = chunk.Select(p => new { id = p.Id.ToString(), name = p.Name, code = p.RegionCode }).ToList();
                await session.ExecuteWriteAsync(async tx => await tx.RunAsync(
                    "UNWIND $data AS row MERGE (loc:Location:Province {Id: row.id}) ON CREATE SET loc.Name = row.name, loc.RegionCode = row.code", 
                    new { data }));
            }

            // 2. Process Districts & link to Province
            foreach (var chunk in districts.Chunk(BatchSize))
            {
                var data = chunk.Select(d => new { id = d.Id.ToString(), name = d.Name, provinceId = d.ProvinceId.ToString() }).ToList();
                await session.ExecuteWriteAsync(async tx => await tx.RunAsync(
                    @"UNWIND $data AS row 
                      MERGE (d:Location:District {Id: row.id}) ON CREATE SET d.Name = row.name
                      WITH d, row MATCH (p:Location:Province {Id: row.provinceId})
                      MERGE (d)-[:PART_OF]->(p)", 
                    new { data }));
            }

            // 3. Process Communes & link to District
            foreach (var chunk in communes.Chunk(BatchSize))
            {
                var data = chunk.Select(c => new { 
                    id = c.Id.ToString(), 
                    name = c.Name, 
                    lat = (double?)c.Latitude ?? 0.0, 
                    lng = (double?)c.Longitude ?? 0.0, 
                    districtId = c.DistrictId.ToString() 
                }).ToList();
                
                await session.ExecuteWriteAsync(async tx => await tx.RunAsync(
                    @"UNWIND $data AS row 
                      MERGE (c:Location:Commune {Id: row.id}) ON CREATE SET c.Name = row.name, c.Latitude = row.lat, c.Longitude = row.lng
                      WITH c, row MATCH (d:Location:District {Id: row.districtId})
                      MERGE (c)-[:PART_OF]->(d)", 
                    new { data }));
            }

            return provinces.Count + districts.Count + communes.Count;
        }

        private async Task<int> MigrateEthnicGroupsAsync()
        {
            var items = await _pgContext.EthnicGroups.AsNoTracking().ToListAsync();
            await using var session = _neo4jDriver.AsyncSession();
            foreach (var chunk in items.Chunk(BatchSize))
            {
                var data = chunk.Select(x => new { id = x.Id.ToString(), name = x.Name, family = x.LanguageFamily, region = x.PrimaryRegion }).ToList();
                await session.ExecuteWriteAsync(async tx => await tx.RunAsync(
                    "UNWIND $data AS row MERGE (e:EthnicGroup {Id: row.id}) ON CREATE SET e.Name = row.name, e.LanguageFamily = row.family, e.PrimaryRegion = row.region", 
                    new { data }));
            }
            return items.Count;
        }

        private async Task<int> MigrateCeremoniesAsync()
        {
            var items = await _pgContext.Ceremonies.AsNoTracking().ToListAsync();
            await using var session = _neo4jDriver.AsyncSession();
            foreach (var chunk in items.Chunk(BatchSize))
            {
                var data = chunk.Select(x => new { id = x.Id.ToString(), name = x.Name, type = x.Type, season = x.Season }).ToList();
                await session.ExecuteWriteAsync(async tx => await tx.RunAsync(
                    "UNWIND $data AS row MERGE (c:Ceremony {Id: row.id}) ON CREATE SET c.Name = row.name, c.Type = row.type, c.Season = row.season", 
                    new { data }));
            }
            return items.Count;
        }

        private async Task<int> MigrateVocalStylesAsync()
        {
            var items = await _pgContext.VocalStyles.AsNoTracking().ToListAsync();
            await using var session = _neo4jDriver.AsyncSession();
            foreach (var chunk in items.Chunk(BatchSize))
            {
                var data = chunk.Select(x => new { id = x.Id.ToString(), name = x.Name, ethnicGroupId = x.EthnicGroupId?.ToString() }).ToList();
                await session.ExecuteWriteAsync(async tx => await tx.RunAsync(
                    @"UNWIND $data AS row 
                      MERGE (v:VocalStyle {Id: row.id}) ON CREATE SET v.Name = row.name
                      WITH v, row WHERE row.ethnicGroupId IS NOT NULL
                      MATCH (e:EthnicGroup {Id: row.ethnicGroupId})
                      MERGE (v)-[:ASSOCIATED_WITH]->(e)", 
                    new { data }));
            }
            return items.Count;
        }

        private async Task<int> MigrateMusicalScalesAsync()
        {
            var items = await _pgContext.MusicalScales.AsNoTracking().ToListAsync();
            await using var session = _neo4jDriver.AsyncSession();
            foreach (var chunk in items.Chunk(BatchSize))
            {
                var data = chunk.Select(x => new { id = x.Id.ToString(), name = x.Name, pattern = x.NotePattern }).ToList();
                await session.ExecuteWriteAsync(async tx => await tx.RunAsync(
                    "UNWIND $data AS row MERGE (m:MusicalScale {Id: row.id}) ON CREATE SET m.Name = row.name, m.NotePattern = row.pattern", 
                    new { data }));
            }
            return items.Count;
        }

        private async Task<int> MigrateTagsAsync()
        {
            var items = await _pgContext.Tags.AsNoTracking().ToListAsync();
            await using var session = _neo4jDriver.AsyncSession();
            foreach (var chunk in items.Chunk(BatchSize))
            {
                var data = chunk.Select(x => new { id = x.Id.ToString(), name = x.Name, category = x.Category }).ToList();
                await session.ExecuteWriteAsync(async tx => await tx.RunAsync(
                    "UNWIND $data AS row MERGE (t:Tag {Id: row.id}) ON CREATE SET t.Name = row.name, t.Category = row.category", 
                    new { data }));
            }
            return items.Count;
        }

        private async Task<int> MigrateInstrumentsAsync()
        {
            var items = await _pgContext.Instruments.AsNoTracking().ToListAsync();
            await using var session = _neo4jDriver.AsyncSession();
            foreach (var chunk in items.Chunk(BatchSize))
            {
                var data = chunk.Select(x => new { 
                    id = x.Id.ToString(), 
                    name = x.Name, 
                    category = x.Category, 
                    tuning = x.TuningSystem,
                    originId = x.OriginEthnicGroupId?.ToString()
                }).ToList();
                
                await session.ExecuteWriteAsync(async tx => await tx.RunAsync(
                    @"UNWIND $data AS row 
                      MERGE (i:Instrument {Id: row.id}) ON CREATE SET i.Name = row.name, i.Category = row.category, i.TuningSystem = row.tuning
                      WITH i, row WHERE row.originId IS NOT NULL
                      MATCH (e:EthnicGroup {Id: row.originId})
                      MERGE (i)-[:ORIGINATES_FROM]->(e)", 
                    new { data }));
            }
            return items.Count;
        }

        private async Task<int> MigrateKBEntriesAsync()
        {
            var items = await _pgContext.KBEntries.AsNoTracking().ToListAsync();
            var embeddings = await _pgContext.VectorEmbeddings.Where(v => v.KBEntryId != null).AsNoTracking().ToListAsync();
            
            var embeddingMap = embeddings.ToDictionary(v => v.KBEntryId!.Value, v => ParseVector(v.EmbeddingJson));

            await using var session = _neo4jDriver.AsyncSession();
            foreach (var chunk in items.Chunk(BatchSize))
            {
                var data = chunk.Select(x => new { 
                    id = x.Id.ToString(), 
                    title = x.Title, 
                    slug = x.Slug, 
                    category = x.Category,
                    embedding = embeddingMap.ContainsKey(x.Id) ? embeddingMap[x.Id] : new List<float>()
                }).ToList();

                await session.ExecuteWriteAsync(async tx => await tx.RunAsync(
                    @"UNWIND $data AS row 
                      MERGE (k:KBEntry {Id: row.id}) ON CREATE SET k.Title = row.title, k.Slug = row.slug, k.Category = row.category
                      WITH k, row WHERE size(row.embedding) > 0
                      SET k.embedding = row.embedding", 
                    new { data }));
            }
            return items.Count;
        }

        private async Task<(int nodes, int rels)> MigrateRecordingsAndLinksAsync()
        {
            // Materialize baseline structural records and pre-map many-to-many junction data
            var recordings = await _pgContext.Recordings.AsNoTracking().ToListAsync();
            var recordingInstruments = await _pgContext.RecordingInstruments.AsNoTracking().ToListAsync();
            var recordingTags = await _pgContext.RecordingTags.AsNoTracking().ToListAsync();
            
            var recEmbeddings = await _pgContext.VectorEmbeddings.Where(v => v.RecordingId != null).AsNoTracking().ToListAsync();
            var embeddingMap = recEmbeddings.ToDictionary(v => v.RecordingId!.Value, v => ParseVector(v.EmbeddingJson));

            await using var session = _neo4jDriver.AsyncSession();
            int nodesProcessed = recordings.Count;
            int relsProcessed = 0;

            // 1. Load basic nodes with embedding attributes
            foreach (var chunk in recordings.Chunk(BatchSize))
            {
                var data = chunk.Select(x => new {
                    id = x.Id.ToString(),
                    title = x.Title ?? "Untitled Recording",
                    url = x.AudioFileUrl,
                    tempo = (double?)(x.Tempo) ?? 0.0,
                    keySig = x.KeySignature ?? "Unknown",
                    duration = x.DurationSeconds ?? 0,
                    context = x.PerformanceContext ?? "",
                    communeId = x.CommuneId?.ToString(),
                    ethnicGroupId = x.EthnicGroupId?.ToString(),
                    ceremonyId = x.CeremonyId?.ToString(),
                    vocalStyleId = x.VocalStyleId?.ToString(),
                    scaleId = x.MusicalScaleId?.ToString(),
                    embedding = embeddingMap.ContainsKey(x.Id) ? embeddingMap[x.Id] : new List<float>()
                }).ToList();

                await session.ExecuteWriteAsync(async tx => await tx.RunAsync(
                    @"UNWIND $data AS row
                      MERGE (r:Recording {Id: row.id})
                      ON CREATE SET r.Title = row.title, r.AudioFileUrl = row.url, r.Tempo = row.tempo, 
                                    r.KeySignature = row.keySig, r.DurationSeconds = row.duration, r.PerformanceContext = row.context
                      WITH r, row WHERE size(row.embedding) > 0
                      SET r.embedding = row.embedding", new { data }));

                // 2. Tie internal structural ontology links
                await session.ExecuteWriteAsync(async tx => await tx.RunAsync(
                    @"UNWIND $data AS row
                      MATCH (r:Recording {Id: row.id})
                      
                      // Link Geographical Node
                      WITH r, row WHERE row.communeId IS NOT NULL
                      MATCH (loc:Location:Commune {Id: row.communeId})
                      MERGE (r)-[:RECORDED_AT]->(loc)
                      
                      // Link Cultural Node
                      WITH r, row WHERE row.ethnicGroupId IS NOT NULL
                      MATCH (e:EthnicGroup {Id: row.ethnicGroupId})
                      MERGE (r)-[:BELONGS_TO_CULTURE]->(e)
                      
                      // Link Ceremony Node
                      WITH r, row WHERE row.ceremonyId IS NOT NULL
                      MATCH (c:Ceremony {Id: row.ceremonyId})
                      MERGE (r)-[:PERFORMED_DURING]->(c)
                      
                      // Link Vocal Style Node
                      WITH r, row WHERE row.vocalStyleId IS NOT NULL
                      MATCH (v:VocalStyle {Id: row.vocalStyleId})
                      MERGE (r)-[:HAS_VOCAL_STYLE]->(v)
                      
                      // Link Musical Scale Node
                      WITH r, row WHERE row.scaleId IS NOT NULL
                      MATCH (m:MusicalScale {Id: row.scaleId})
                      MERGE (r)-[:USES_SCALE]->(m)", new { data }));
            }

            // 3. Process Junction: Recording-Instruments
            foreach (var chunk in recordingInstruments.Chunk(BatchSize))
            {
                var data = chunk.Select(ri => new { recId = ri.RecordingId.ToString(), instId = ri.InstrumentId.ToString(), tech = ri.PlayingTechnique ?? "Standard" }).ToList();
                await session.ExecuteWriteAsync(async tx => {
                    var res = await tx.RunAsync(
                        @"UNWIND $data AS row
                          MATCH (r:Recording {Id: row.recId})
                          MATCH (i:Instrument {Id: row.instId})
                          MERGE (r)-[rel:USES_INSTRUMENT]->(i)
                          ON CREATE SET rel.PlayingTechnique = row.tech", new { data });
                    return res;
                });
                relsProcessed += chunk.Length;
            }

            // 4. Process Junction: Recording-Tags
            foreach (var chunk in recordingTags.Chunk(BatchSize))
            {
                var data = chunk.Select(rt => new { recId = rt.RecordingId.ToString(), tagId = rt.TagId.ToString() }).ToList();
                await session.ExecuteWriteAsync(async tx => await tx.RunAsync(
                    @"UNWIND $data AS row
                      MATCH (r:Recording {Id: row.recId})
                      MATCH (t:Tag {Id: row.tagId})
                      MERGE (r)-[:HAS_TAG]->(t)", new { data }));
                relsProcessed += chunk.Length;
            }

            return (nodesProcessed, relsProcessed);
        }

        private async Task<int> ConnectInstrumentEthnicGroupsAsync()
        {
            var links = await _pgContext.InstrumentEthnicGroups
                .AsNoTracking()
                .Select(x => new { 
                    instId = x.InstrumentId.ToString(), 
                    ethnicId = x.EthnicGroupId.ToString() 
                }).ToListAsync();

            await using var session = _neo4jDriver.AsyncSession();
            foreach (var chunk in links.Chunk(BatchSize))
            {
                await session.ExecuteWriteAsync(async tx => await tx.RunAsync(
                    @"UNWIND $data AS row
                      MATCH (i:Instrument {Id: row.instId})
                      MATCH (e:EthnicGroup {Id: row.ethnicId})
                      MERGE (i)-[:USED_BY_ETHNIC_GROUP]->(e)", new { data = chunk }));
            }
            return links.Count;
        }

        private async Task<int> ConnectEthnicGroupCeremoniesAsync()
        {
            var links = await _pgContext.EthnicGroupCeremonies
                .AsNoTracking()
                .Select(x => new { 
                    ethnicId = x.EthnicGroupId.ToString(), 
                    ceremonyId = x.CeremonyId.ToString() 
                }).ToListAsync();

            await using var session = _neo4jDriver.AsyncSession();
            foreach (var chunk in links.Chunk(BatchSize))
            {
                await session.ExecuteWriteAsync(async tx => await tx.RunAsync(
                    @"UNWIND $data AS row
                      MATCH (e:EthnicGroup {Id: row.ethnicId})
                      MATCH (c:Ceremony {Id: row.ceremonyId})
                      MERGE (e)-[:HAS_CEREMONY]->(c)", new { data = chunk }));
            }
            return links.Count;
        }

        private List<float> ParseVector(string json)
        {
            if (string.IsNullOrWhiteSpace(json)) return new List<float>();
            try
            {
                return JsonSerializer.Deserialize<List<float>>(json) ?? new List<float>();
            }
            catch
            {
                return new List<float>();
            }
        }
    }
}
