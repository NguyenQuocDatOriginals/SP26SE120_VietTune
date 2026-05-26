markdown_content = """# Backend Implementation Guide: Comprehensive Neo4j Integration & Data Migration

This document outlines the definitive, production-ready specifications for integrating Neo4j into the `VietTuneArchive` backend application and executing a complete, one-way data migration from PostgreSQL to Neo4j.

## 🛑 IMMUTABLE RULE: NO MODIFICATION OF EXISTING LOGIC
1. **Preserve PostgreSQL & EF Core:** The existing PostgreSQL database, Entity Framework Core contexts (`AppDbContext`), schemas, migrations, repositories, and existing business operations MUST remain completely untouched and fully functional. Neo4j acts strictly as a secondary graph database (Polyglot Persistence architecture) to power Knowledge Graph queries, semantic links, and AI/GraphRAG workflows.
2. **Add-Only Approach:** Create new extension methods, services, interfaces, interfaces/DTOs, and controllers. Do not alter existing business flows or modify existing database records during the setup phase.

---

## 1. Installation & Infrastructure Configuration

### 1.1 Install NuGet Package
Execute the following .NET CLI command in your backend project directory to install the official Neo4j Driver:

```

```text
SUCCESS

```bash
dotnet add package Neo4j.Driver

### 1.3 Dependency Injection Setup

Create a new file under the extensions directory: `Extensions/Neo4jServiceExtensions.cs`. This handles the initialization of the Neo4j Driver instance as a thread-safe singleton.

```csharp
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Neo4j.Driver;

public static class Neo4jServiceExtensions
{
    public static IServiceCollection AddNeo4jGraph(this IServiceCollection services, IConfiguration configuration)
    {
        var uri = configuration["Neo4j:Uri"];
        var username = configuration["Neo4j:Username"];
        var password = configuration["Neo4j:Password"];

        // The Driver instance is thread-safe and acts as a connection pool; it must be registered as a Singleton
        var driver = GraphDatabase.Driver(uri, AuthTokens.Basic(username, password));
        services.AddSingleton<IDriver>(driver);

        return services;
    }
}

```

*Note for AI Agent:* In `Program.cs`, simply call `builder.Services.AddNeo4jGraph(builder.Configuration);` and register the new migration service. Do not touch or reorder existing middleware configurations.

---

## 2. Definitive Knowledge Graph Mapping Specification

Based on the target PostgreSQL database dump (`viettunearchivedatabase.sql`), the following mapping rules define how relational tables, foreign keys, junction tables, and JSON metadata are converted into a Native Graph Schema inside Neo4j.

### 2.1 Nodes (Entities)

All text content fields that are extremely lengthy (such as full lyrics or heavy body contents) should be omitted from graph nodes unless specifically required for full-text search indexing. Nodes must hold IDs matching the PostgreSQL UUIDs to allow seamless cross-database mapping.

| Relational Source Table | Neo4j Target Label | Properties to Map |
| --- | --- | --- |
| `Recordings` | `(:Recording)` | `Id` (String/UUID), `Title`, `AudioFileUrl`, `Tempo` (Float), `KeySignature`, `DurationSeconds` (Int), `PerformanceContext` |
| `Instruments` | `(:Instrument)` | `Id` (String/UUID), `Name`, `Category`, `TuningSystem` |
| `EthnicGroups` | `(:EthnicGroup)` | `Id` (String/UUID), `Name`, `LanguageFamily`, `PrimaryRegion` |
| `Ceremonies` | `(:Ceremony)` | `Id` (String/UUID), `Name`, `Type`, `Season` |
| `VocalStyles` | `(:VocalStyle)` | `Id` (String/UUID), `Name` |
| `MusicalScales` | `(:MusicalScale)` | `Id` (String/UUID), `Name`, `NotePattern` |
| `Tags` | `(:Tag)` | `Id` (String/UUID), `Name`, `Category` |
| `KBEntries` | `(:KBEntry)` | `Id` (String/UUID), `Title`, `Slug`, `Category` |
| `Provinces` | `(:Location:Province)` | `Id` (String/UUID), `Name`, `RegionCode` |
| `Districts` | `(:Location:District)` | `Id` (String/UUID), `Name` |
| `Communes` | `(:Location:Commune)` | `Id` (String/UUID), `Name`, `Latitude` (Float), `Longitude` (Float) |

### 2.2 Relationships (Edges)

Relational foreign keys and explicit many-to-many junction tables are mapped directly into directed, semantic relationships in Neo4j.

| Structural Connection Source | Neo4j Cypher Relationship Pattern |
| --- | --- |
| Junction Table `RecordingInstruments` | `(:Recording)-[:USES_INSTRUMENT {PlayingTechnique: row.technique}]->(:Instrument)` |
| Junction Table `InstrumentEthnicGroups` | `(:Instrument)-[:USED_BY_ETHNIC_GROUP]->(:EthnicGroup)` |
| Junction Table `EthnicGroupCeremonies` | `(:EthnicGroup)-[:HAS_CEREMONY]->(:Ceremony)` |
| Junction Table `RecordingTags` | `(:Recording)-[:HAS_TAG]->(:Tag)` |
| Foreign Key `Recordings.EthnicGroupId` | `(:Recording)-[:BELONGS_TO_CULTURE]->(:EthnicGroup)` |
| Foreign Key `Recordings.CeremonyId` | `(:Recording)-[:PERFORMED_DURING]->(:Ceremony)` |
| Foreign Key `Recordings.VocalStyleId` | `(:Recording)-[:HAS_VOCAL_STYLE]->(:VocalStyle)` |
| Foreign Key `Recordings.MusicalScaleId` | `(:Recording)-[:USES_SCALE]->(:MusicalScale)` |
| Foreign Key `Recordings.CommuneId` | `(:Recording)-[:RECORDED_AT]->(:Location:Commune)` |
| Foreign Key `Instruments.OriginEthnicGroupId` | `(:Instrument)-[:ORIGINATES_FROM]->(:EthnicGroup)` |
| Foreign Key `VocalStyles.EthnicGroupId` | `(:VocalStyle)-[:ASSOCIATED_WITH]->(:EthnicGroup)` |
| Foreign Key `Communes.DistrictId` | `(:Location:Commune)-[:PART_OF]->(:Location:District)` |
| Foreign Key `Districts.ProvinceId` | `(:Location:District)-[:PART_OF]->(:Location:Province)` |

### 2.3 Vector Embeddings Integration

The application utilizes the `VectorEmbeddings` table to store semantic models. Do not create an independent node for vector representations. Parse `EmbeddingJson` into a float array (`List<float>`) and save it directly as an `embedding` property inside the corresponding `(:Recording)` or `(:KBEntry)` node. This architecture ensures optimal efficiency when invoking Neo4j's native Vector Index lookups during GraphRAG operations.

---

## 3. Two-Phase Robust Migration Service Implementation

To prevent Out-Of-Memory (OOM) exceptions and connection timeouts on both PostgreSQL and the Neo4j AuraDB Free cluster, the migration process must be strictly decoupled into **Two Phases**.

* **Phase 1 (Master Data):** Migrates independent geographical, cultural, and metadata entities, building the fundamental ontology framework.
* **Phase 2 (Recordings & Structural Links):** Migrates core recordings, maps many-to-many links, and injects vector properties.

### 3.1 Migration Database Constraints

Prior to feeding data batches via code, the service must verify or execute the following unique constraint initializations inside Neo4j to guarantee high-performance lookup indexes and strict data integrity during `MERGE` statements.

```cypher
CREATE CONSTRAINT FOR (r:Recording) REQUIRE r.Id IS UNIQUE;
CREATE CONSTRAINT FOR (i:Instrument) REQUIRE i.Id IS UNIQUE;
CREATE CONSTRAINT FOR (e:EthnicGroup) REQUIRE e.Id IS UNIQUE;
CREATE CONSTRAINT FOR (c:Ceremony) REQUIRE c.Id IS UNIQUE;
CREATE CONSTRAINT FOR (v:VocalStyle) REQUIRE v.Id IS UNIQUE;
CREATE CONSTRAINT FOR (m:MusicalScale) REQUIRE m.Id IS UNIQUE;
CREATE CONSTRAINT FOR (t:Tag) REQUIRE t.Id IS UNIQUE;
CREATE CONSTRAINT FOR (k:KBEntry) REQUIRE k.Id IS UNIQUE;
CREATE CONSTRAINT FOR (loc:Location) REQUIRE loc.Id IS UNIQUE;

```

### 3.2 Code Architecture

Create the following contract and implementation:

* `Services/Interfaces/INeo4jMigrationService.cs`
* `Services/Neo4jMigrationService.cs`

#### INeo4jMigrationService.cs

```csharp
using System.Threading.Tasks;

public interface INeo4jMigrationService
{
    Task<MigrationResultDto> RunFullMigrationAsync();
}

public class MigrationResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public int NodesProcessed { get; set; }
    public int RelationshipsProcessed { get; set; }
}

```

#### Neo4jMigrationService.cs Implementation Blueprint

The implementation must run inside a resilient framework using EF Core `.AsNoTracking()` and Neo4j batch arrays wrapped in `UNWIND` blocks. Process records in chunks of 500.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Neo4j.Driver;

public class Neo4jMigrationService : INeo4jMigrationService
{
    private readonly AppDbContext _pgContext;
    private readonly IDriver _neo4jDriver;
    private const int BatchSize = 500;

    public Neo4jMigrationService(AppDbContext pgContext, IDriver neo4jDriver)
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
        var links = await _pgContext.Set<Dictionary<string, object>>()
            .FromSqlRaw("SELECT \"InstrumentId\", \"EthnicGroupId\" FROM public.\"InstrumentEthnicGroups\"")
            .Select(x => new { 
                instId = x["InstrumentId"].ToString(), 
                ethnicId = x["EthnicGroupId"].ToString() 
            }).AsNoTracking().ToListAsync();

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
        var links = await _pgContext.Set<Dictionary<string, object>>()
            .FromSqlRaw("SELECT \"EthnicGroupId\", \"CeremonyId\" FROM public.\"EthnicGroupCeremonies\"")
            .Select(x => new { 
                ethnicId = x["EthnicGroupId"].ToString(), 
                ceremonyId = x["CeremonyId"].ToString() 
            }).AsNoTracking().ToListAsync();

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

```

---

## 4. Secure Administrative Trigger Endpoint

Create an exclusive, isolated administrative API Controller to trigger the execution process manually. Security configurations must mirror the patterns applied within standard RAG system setups.

**File Location:** `Controllers/Admin/Neo4jAdminController.cs`

```csharp
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/admin/neo4j")]
[Authorize(Roles = "Admin")] // Strict role guard protection
public class Neo4jAdminController : ControllerBase
{
    private readonly INeo4jMigrationService _migrationService;

    public Neo4jAdminController(INeo4jMigrationService migrationService)
    {
        _migrationService = migrationService;
    }

    [HttpPost("migrate-data")]
    public async Task<IActionResult> TriggerMigration()
    {
        var result = await _migrationService.RunFullMigrationAsync();
        
        if (!result.Success)
        {
            return StatusCode(500, new { 
                error = "Migration failed internally", 
                details = result.Message 
            });
        }

        return Ok(new {
            message = result.Message,
            nodesCount = result.NodesProcessed,
            relationshipsCount = result.RelationshipsProcessed
        });
    }
}

```

### 🛑 OPERATIONAL SECURITY RULES:

1. **Explicit Role Enforcement:** The endpoint is locked under `[Authorize(Roles = "Admin")]`. Any execution triggered from accounts holding lower classification rankings (Contributor, Researcher, or Public End-user) will instantly return a `403 Forbidden` response.
2. **Manual Target Pipeline:** This script should never be loaded inside automated startup chains or health checks. Execute exclusively through trusted platforms (e.g., Postman or Swagger UI auth screens) during maintenance windows.
"""

with open("BE-Neo4j-Full-Migration-Guide.md", "w", encoding="utf-8") as f:
f.write(markdown_content)

print("SUCCESS")

```