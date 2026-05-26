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
    public class Neo4jSyncService : INeo4jSyncService
    {
        private readonly DBContext _pgContext;
        private readonly IDriver _neo4jDriver;

        public Neo4jSyncService(DBContext pgContext, IDriver neo4jDriver)
        {
            _pgContext = pgContext;
            _neo4jDriver = neo4jDriver;
        }

        #region Recording Sync

        public async Task SyncCreateRecordingAsync(Recording recording)
        {
            if (recording == null) return;

            var recordingId = recording.Id;

            var recordingInstruments = await _pgContext.RecordingInstruments
                .AsNoTracking()
                .Where(ri => ri.RecordingId == recordingId)
                .ToListAsync();

            var recordingTags = await _pgContext.RecordingTags
                .AsNoTracking()
                .Where(rt => rt.RecordingId == recordingId)
                .ToListAsync();

            var vectorEmbeddings = await _pgContext.VectorEmbeddings
                .AsNoTracking()
                .Where(ve => ve.RecordingId == recordingId)
                .ToListAsync();

            var embeddingList = new List<float>();
            if (vectorEmbeddings.Any())
            {
                var firstEmbedding = vectorEmbeddings.First();
                embeddingList = ParseVector(firstEmbedding.EmbeddingJson);
            }

            var data = new
            {
                id = recording.Id.ToString(),
                title = recording.Title ?? "Untitled Recording",
                url = recording.AudioFileUrl ?? "",
                tempo = (double?)(recording.Tempo) ?? 0.0,
                keySig = recording.KeySignature ?? "Unknown",
                duration = recording.DurationSeconds ?? 0,
                context = recording.PerformanceContext ?? "",
                communeId = recording.CommuneId?.ToString(),
                ethnicGroupId = recording.EthnicGroupId?.ToString(),
                ceremonyId = recording.CeremonyId?.ToString(),
                vocalStyleId = recording.VocalStyleId?.ToString(),
                scaleId = recording.MusicalScaleId?.ToString(),
                embedding = embeddingList,
                instruments = recordingInstruments.Select(ri => new { id = ri.InstrumentId.ToString(), tech = ri.PlayingTechnique ?? "Standard" }).ToList(),
                tags = recordingTags.Select(rt => rt.TagId.ToString()).ToList()
            };

            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(@"
                    MERGE (r:Recording {Id: $id})
                    ON CREATE SET 
                      r.Title = $title, 
                      r.AudioFileUrl = $url, 
                      r.Tempo = $tempo, 
                      r.KeySignature = $keySig, 
                      r.DurationSeconds = $duration, 
                      r.PerformanceContext = $context
                    ON MATCH SET
                      r.Title = $title, 
                      r.AudioFileUrl = $url, 
                      r.Tempo = $tempo, 
                      r.KeySignature = $keySig, 
                      r.DurationSeconds = $duration, 
                      r.PerformanceContext = $context
                ", data);

                if (embeddingList.Any())
                {
                    await tx.RunAsync("MATCH (r:Recording {Id: $id}) SET r.embedding = $embedding", new { id = data.id, embedding = embeddingList });
                }

                await tx.RunAsync(@"
                    MATCH (r:Recording {Id: $id})
                    
                    // Link Geographical Node
                    WITH r
                    FOREACH (ignored IN case when $communeId IS NOT NULL then [1] else [] |
                      MERGE (loc:Location:Commune {Id: $communeId})
                      MERGE (r)-[:RECORDED_AT]->(loc)
                    )
                    
                    // Link Cultural Node
                    WITH r
                    FOREACH (ignored IN case when $ethnicGroupId IS NOT NULL then [1] else [] |
                      MERGE (e:EthnicGroup {Id: $ethnicGroupId})
                      MERGE (r)-[:BELONGS_TO_CULTURE]->(e)
                    )
                    
                    // Link Ceremony Node
                    WITH r
                    FOREACH (ignored IN case when $ceremonyId IS NOT NULL then [1] else [] |
                      MERGE (c:Ceremony {Id: $ceremonyId})
                      MERGE (r)-[:PERFORMED_DURING]->(c)
                    )
                    
                    // Link Vocal Style Node
                    WITH r
                    FOREACH (ignored IN case when $vocalStyleId IS NOT NULL then [1] else [] |
                      MERGE (v:VocalStyle {Id: $vocalStyleId})
                      MERGE (r)-[:HAS_VOCAL_STYLE]->(v)
                    )
                    
                    // Link Musical Scale Node
                    WITH r
                    FOREACH (ignored IN case when $scaleId IS NOT NULL then [1] else [] |
                      MERGE (m:MusicalScale {Id: $scaleId})
                      MERGE (r)-[:USES_SCALE]->(m)
                    )
                ", data);

                if (data.instruments.Any())
                {
                    await tx.RunAsync(@"
                        MATCH (r:Recording {Id: $id})
                        UNWIND $instruments AS inst
                          MATCH (i:Instrument {Id: inst.id})
                          MERGE (r)-[rel:USES_INSTRUMENT]->(i)
                          ON CREATE SET rel.PlayingTechnique = inst.tech
                          ON MATCH SET rel.PlayingTechnique = inst.tech
                    ", data);
                }

                if (data.tags.Any())
                {
                    await tx.RunAsync(@"
                        MATCH (r:Recording {Id: $id})
                        UNWIND $tags AS tagId
                          MATCH (t:Tag {Id: tagId})
                          MERGE (r)-[:HAS_TAG]->(t)
                    ", data);
                }
            });
        }

        public async Task SyncUpdateRecordingAsync(Recording recording)
        {
            if (recording == null) return;

            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(@"
                    MATCH (r:Recording {Id: $id})
                    OPTIONAL MATCH (r)-[rel1:RECORDED_AT]->() DELETE rel1
                    WITH r
                    OPTIONAL MATCH (r)-[rel2:BELONGS_TO_CULTURE]->() DELETE rel2
                    WITH r
                    OPTIONAL MATCH (r)-[rel3:PERFORMED_DURING]->() DELETE rel3
                    WITH r
                    OPTIONAL MATCH (r)-[rel4:HAS_VOCAL_STYLE]->() DELETE rel4
                    WITH r
                    OPTIONAL MATCH (r)-[rel5:USES_SCALE]->() DELETE rel5
                    WITH r
                    OPTIONAL MATCH (r)-[rel6:USES_INSTRUMENT]->() DELETE rel6
                    WITH r
                    OPTIONAL MATCH (r)-[rel7:HAS_TAG]->() DELETE rel7
                ", new { id = recording.Id.ToString() });
            });

            await SyncCreateRecordingAsync(recording);
        }

        public async Task SyncDeleteRecordingAsync(Guid recordingId)
        {
            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(@"
                    MATCH (r:Recording {Id: $id})
                    DETACH DELETE r
                ", new { id = recordingId.ToString() });
            });
        }

        #endregion

        #region Instrument Sync

        public async Task SyncCreateInstrumentAsync(Instrument instrument)
        {
            if (instrument == null) return;

            var data = new
            {
                id = instrument.Id.ToString(),
                name = instrument.Name,
                category = instrument.Category,
                tuning = instrument.TuningSystem ?? "",
                originId = instrument.OriginEthnicGroupId?.ToString()
            };

            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(@"
                    MERGE (i:Instrument {Id: $id})
                    ON CREATE SET i.Name = $name, i.Category = $category, i.TuningSystem = $tuning
                    ON MATCH SET i.Name = $name, i.Category = $category, i.TuningSystem = $tuning
                ", data);

                if (!string.IsNullOrEmpty(data.originId))
                {
                    await tx.RunAsync(@"
                        MATCH (i:Instrument {Id: $id})
                        MATCH (e:EthnicGroup {Id: $originId})
                        MERGE (i)-[:ORIGINATES_FROM]->(e)
                    ", data);
                }
            });
        }

        public async Task SyncUpdateInstrumentAsync(Instrument instrument)
        {
            if (instrument == null) return;

            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(@"
                    MATCH (i:Instrument {Id: $id})
                    OPTIONAL MATCH (i)-[rel:ORIGINATES_FROM]->() DELETE rel
                ", new { id = instrument.Id.ToString() });
            });

            await SyncCreateInstrumentAsync(instrument);
        }

        public async Task SyncDeleteInstrumentAsync(Guid instrumentId)
        {
            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync("MATCH (i:Instrument {Id: $id}) DETACH DELETE i", new { id = instrumentId.ToString() });
            });
        }

        #endregion

        #region EthnicGroup Sync

        public async Task SyncCreateEthnicGroupAsync(EthnicGroup ethnicGroup)
        {
            if (ethnicGroup == null) return;

            var data = new
            {
                id = ethnicGroup.Id.ToString(),
                name = ethnicGroup.Name,
                family = ethnicGroup.LanguageFamily ?? "",
                region = ethnicGroup.PrimaryRegion ?? ""
            };

            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(@"
                    MERGE (e:EthnicGroup {Id: $id})
                    ON CREATE SET e.Name = $name, e.LanguageFamily = $family, e.PrimaryRegion = $region
                    ON MATCH SET e.Name = $name, e.LanguageFamily = $family, e.PrimaryRegion = $region
                ", data);
            });
        }

        public async Task SyncUpdateEthnicGroupAsync(EthnicGroup ethnicGroup) => await SyncCreateEthnicGroupAsync(ethnicGroup);

        public async Task SyncDeleteEthnicGroupAsync(Guid ethnicGroupId)
        {
            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync("MATCH (e:EthnicGroup {Id: $id}) DETACH DELETE e", new { id = ethnicGroupId.ToString() });
            });
        }

        #endregion

        #region Ceremony Sync

        public async Task SyncCreateCeremonyAsync(Ceremony ceremony)
        {
            if (ceremony == null) return;

            var data = new
            {
                id = ceremony.Id.ToString(),
                name = ceremony.Name,
                type = ceremony.Type,
                season = ceremony.Season ?? ""
            };

            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(@"
                    MERGE (c:Ceremony {Id: $id})
                    ON CREATE SET c.Name = $name, c.Type = $type, c.Season = $season
                    ON MATCH SET c.Name = $name, c.Type = $type, c.Season = $season
                ", data);
            });
        }

        public async Task SyncUpdateCeremonyAsync(Ceremony ceremony) => await SyncCreateCeremonyAsync(ceremony);

        public async Task SyncDeleteCeremonyAsync(Guid ceremonyId)
        {
            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync("MATCH (c:Ceremony {Id: $id}) DETACH DELETE c", new { id = ceremonyId.ToString() });
            });
        }

        #endregion

        #region VocalStyle Sync

        public async Task SyncCreateVocalStyleAsync(VocalStyle vocalStyle)
        {
            if (vocalStyle == null) return;

            var data = new
            {
                id = vocalStyle.Id.ToString(),
                name = vocalStyle.Name,
                ethnicGroupId = vocalStyle.EthnicGroupId?.ToString()
            };

            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(@"
                    MERGE (v:VocalStyle {Id: $id})
                    ON CREATE SET v.Name = $name
                    ON MATCH SET v.Name = $name
                ", data);

                if (!string.IsNullOrEmpty(data.ethnicGroupId))
                {
                    await tx.RunAsync(@"
                        MATCH (v:VocalStyle {Id: $id})
                        MATCH (e:EthnicGroup {Id: $ethnicGroupId})
                        MERGE (v)-[:ASSOCIATED_WITH]->(e)
                    ", data);
                }
            });
        }

        public async Task SyncUpdateVocalStyleAsync(VocalStyle vocalStyle)
        {
            if (vocalStyle == null) return;

            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(@"
                    MATCH (v:VocalStyle {Id: $id})
                    OPTIONAL MATCH (v)-[rel:ASSOCIATED_WITH]->() DELETE rel
                ", new { id = vocalStyle.Id.ToString() });
            });

            await SyncCreateVocalStyleAsync(vocalStyle);
        }

        public async Task SyncDeleteVocalStyleAsync(Guid vocalStyleId)
        {
            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync("MATCH (v:VocalStyle {Id: $id}) DETACH DELETE v", new { id = vocalStyleId.ToString() });
            });
        }

        #endregion

        #region MusicalScale Sync

        public async Task SyncCreateMusicalScaleAsync(MusicalScale musicalScale)
        {
            if (musicalScale == null) return;

            var data = new
            {
                id = musicalScale.Id.ToString(),
                name = musicalScale.Name,
                pattern = musicalScale.NotePattern ?? ""
            };

            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(@"
                    MERGE (m:MusicalScale {Id: $id})
                    ON CREATE SET m.Name = $name, m.NotePattern = $pattern
                    ON MATCH SET m.Name = $name, m.NotePattern = $pattern
                ", data);
            });
        }

        public async Task SyncUpdateMusicalScaleAsync(MusicalScale musicalScale) => await SyncCreateMusicalScaleAsync(musicalScale);

        public async Task SyncDeleteMusicalScaleAsync(Guid musicalScaleId)
        {
            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync("MATCH (m:MusicalScale {Id: $id}) DETACH DELETE m", new { id = musicalScaleId.ToString() });
            });
        }

        #endregion

        #region Location Sync - Province, District, Commune

        public async Task SyncCreateProvinceAsync(Province province)
        {
            if (province == null) return;

            var data = new
            {
                id = province.Id.ToString(),
                name = province.Name,
                code = province.RegionCode
            };

            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(@"
                    MERGE (loc:Location:Province {Id: $id})
                    ON CREATE SET loc.Name = $name, loc.RegionCode = $code
                    ON MATCH SET loc.Name = $name, loc.RegionCode = $code
                ", data);
            });
        }

        public async Task SyncUpdateProvinceAsync(Province province) => await SyncCreateProvinceAsync(province);

        public async Task SyncDeleteProvinceAsync(Guid provinceId)
        {
            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync("MATCH (loc:Location:Province {Id: $id}) DETACH DELETE loc", new { id = provinceId.ToString() });
            });
        }

        public async Task SyncCreateDistrictAsync(District district)
        {
            if (district == null) return;

            var data = new
            {
                id = district.Id.ToString(),
                name = district.Name,
                provinceId = district.ProvinceId.ToString()
            };

            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(@"
                    MERGE (d:Location:District {Id: $id})
                    ON CREATE SET d.Name = $name
                    ON MATCH SET d.Name = $name
                ", data);

                await tx.RunAsync(@"
                    MATCH (d:Location:District {Id: $id})
                    MATCH (p:Location:Province {Id: $provinceId})
                    MERGE (d)-[:PART_OF]->(p)
                ", data);
            });
        }

        public async Task SyncUpdateDistrictAsync(District district)
        {
            if (district == null) return;

            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(@"
                    MATCH (d:Location:District {Id: $id})
                    OPTIONAL MATCH (d)-[rel:PART_OF]->() DELETE rel
                ", new { id = district.Id.ToString() });
            });

            await SyncCreateDistrictAsync(district);
        }

        public async Task SyncDeleteDistrictAsync(Guid districtId)
        {
            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync("MATCH (d:Location:District {Id: $id}) DETACH DELETE d", new { id = districtId.ToString() });
            });
        }

        public async Task SyncCreateCommuneAsync(Commune commune)
        {
            if (commune == null) return;

            var data = new
            {
                id = commune.Id.ToString(),
                name = commune.Name,
                lat = (double?)commune.Latitude ?? 0.0,
                lng = (double?)commune.Longitude ?? 0.0,
                districtId = commune.DistrictId.ToString()
            };

            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(@"
                    MERGE (c:Location:Commune {Id: $id})
                    ON CREATE SET c.Name = $name, c.Latitude = $lat, c.Longitude = $lng
                    ON MATCH SET c.Name = $name, c.Latitude = $lat, c.Longitude = $lng
                ", data);

                await tx.RunAsync(@"
                    MATCH (c:Location:Commune {Id: $id})
                    MATCH (d:Location:District {Id: $districtId})
                    MERGE (c)-[:PART_OF]->(d)
                ", data);
            });
        }

        public async Task SyncUpdateCommuneAsync(Commune commune)
        {
            if (commune == null) return;

            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(@"
                    MATCH (c:Location:Commune {Id: $id})
                    OPTIONAL MATCH (c)-[rel:PART_OF]->() DELETE rel
                ", new { id = commune.Id.ToString() });
            });

            await SyncCreateCommuneAsync(commune);
        }

        public async Task SyncDeleteCommuneAsync(Guid communeId)
        {
            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync("MATCH (c:Location:Commune {Id: $id}) DETACH DELETE c", new { id = communeId.ToString() });
            });
        }

        #endregion

        #region Tag Sync

        public async Task SyncCreateTagAsync(Tag tag)
        {
            if (tag == null) return;

            var data = new
            {
                id = tag.Id.ToString(),
                name = tag.Name,
                category = tag.Category ?? ""
            };

            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(@"
                    MERGE (t:Tag {Id: $id})
                    ON CREATE SET t.Name = $name, t.Category = $category
                    ON MATCH SET t.Name = $name, t.Category = $category
                ", data);
            });
        }

        public async Task SyncUpdateTagAsync(Tag tag) => await SyncCreateTagAsync(tag);

        public async Task SyncDeleteTagAsync(Guid tagId)
        {
            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync("MATCH (t:Tag {Id: $id}) DETACH DELETE t", new { id = tagId.ToString() });
            });
        }

        #endregion

        #region KBEntry Sync

        public async Task SyncCreateKBEntryAsync(KBEntry kbEntry)
        {
            if (kbEntry == null) return;

            var kbId = kbEntry.Id;

            var embeddings = await _pgContext.VectorEmbeddings
                .AsNoTracking()
                .Where(ve => ve.KBEntryId == kbId)
                .ToListAsync();

            var embeddingList = new List<float>();
            if (embeddings.Any())
            {
                embeddingList = ParseVector(embeddings.First().EmbeddingJson);
            }

            var data = new
            {
                id = kbEntry.Id.ToString(),
                title = kbEntry.Title,
                slug = kbEntry.Slug,
                category = kbEntry.Category ?? "",
                embedding = embeddingList
            };

            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(@"
                    MERGE (k:KBEntry {Id: $id})
                    ON CREATE SET k.Title = $title, k.Slug = $slug, k.Category = $category
                    ON MATCH SET k.Title = $title, k.Slug = $slug, k.Category = $category
                ", data);

                if (embeddingList.Any())
                {
                    await tx.RunAsync("MATCH (k:KBEntry {Id: $id}) SET k.embedding = $embedding", new { id = data.id, embedding = embeddingList });
                }
            });
        }

        public async Task SyncUpdateKBEntryAsync(KBEntry kbEntry) => await SyncCreateKBEntryAsync(kbEntry);

        public async Task SyncDeleteKBEntryAsync(Guid kbEntryId)
        {
            await using var session = _neo4jDriver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync("MATCH (k:KBEntry {Id: $id}) DETACH DELETE k", new { id = kbEntryId.ToString() });
            });
        }

        #endregion

        #region Vector Parser Helper

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

        #endregion
    }
}
