You are implementing unit tests for the Search Flow in VietTuneArchive.Tests.
The backend is .NET 8 / ASP.NET Core. Test project is already scaffolded.

## CONTEXT — read these files first before writing any test
- VietTuneArchive.Application/Services/SemanticSearchService.cs     ← PRIMARY
- VietTuneArchive.Application/IServices/ISemanticSearchService.cs
- VietTuneArchive.Application/Services/KnowledgeRetrievalService.cs ← SECONDARY
- VietTuneArchive.Application/IServices/IKnowledgeRetrievalService.cs
- VietTuneArchive.Application/DTOs/Search/ (all files)
- VietTuneArchive.Domain/Entities/Recording.cs
- VietTuneArchive.Domain/Entities/KBEntry.cs
- VietTuneArchive.Application/IRepositories/IRecordingRepository.cs
- VietTuneArchive.Application/IRepositories/IKBEntryRepository.cs
- VietTuneArchive.Application/IServices/IEmbeddingService.cs

KnowledgeRetrievalService.RetrieveAsync has Crap Score 2352 / Cyclomatic 48.
Read both services fully, map every branch before writing tests.

## TARGET FILES
- VietTuneArchive.Tests/Unit/Services/SemanticSearchServiceTests.cs
- VietTuneArchive.Tests/Unit/Services/KnowledgeRetrievalServiceTests.cs

## TEST CASES TO IMPLEMENT

### SemanticSearchService — Text/Keyword Search
- SearchByTitle: exact match → returns correct recording(s)
- SearchByTitle: partial match → returns all partial matches
- SearchByTitle: no match → returns empty list, not error
- SearchByTitle: empty/null query → validation error or empty result per impl
- SearchByTitle: Vietnamese diacritics query → matched correctly
- SearchByFilter: filter by ethnicGroupId → correct subset returned
- SearchByFilter: filter by instrumentId → correct subset
- SearchByFilter: filter by ceremonyId → correct subset
- SearchByFilter: filter by provinceId → correct subset
- SearchByFilter: filter by approvalStatus → correct subset
- SearchByFilter: multiple filters combined → intersection returned
- SearchByFilter: no filters → returns all (paginated)
- SearchByFilter: pagination page 1 → first N results
- SearchByFilter: pagination page 2 → next N results
- SearchByFilter: page beyond total → empty list, not error

### SemanticSearchService — Vector/Semantic Search (384-dim)
- SemanticSearch: valid query → IEmbeddingService called to embed query
- SemanticSearch: embedding returned → repository called with vector
- SemanticSearch: top-k results returned ordered by similarity score desc
- SemanticSearch: similarity threshold applied (results below threshold excluded)
- SemanticSearch: 0 results above threshold → empty list returned
- SemanticSearch: IEmbeddingService throws → error returned gracefully

### SemanticSearchService — Vector/Semantic Search (768-dim)
- Same pattern as 384-dim but verify correct embedding dimension used
- Verify correct repository method called (768 vs 384 variant)
- Results schema identical regardless of dimension

### SemanticSearchService — Unified Search
- UnifiedSearch (if exists): queries recordings + KB entries simultaneously
- Results merged and deduplicated by source type
- Results ranked by relevance score across types
- One source throws → other source results still returned (partial resilience)

### KnowledgeRetrievalService.RetrieveAsync — Branch Coverage
(Cyclomatic 48 — map and cover each branch)

Query Processing:
- Empty query string → returns empty or throws per impl
- Query with stopwords only → handled without crash
- Query length exceeds max → truncated or rejected per impl

Retrieval Sources:
- Retrieves from KB entries → results include KB type
- Retrieves from Recording metadata → results include Recording type
- Retrieves from both sources → combined, ordered by relevance
- KB repository returns empty → recordings still returned
- Recording repository returns empty → KB entries still returned
- Both return empty → empty list returned

Scoring & Ranking:
- Results ranked by relevance score descending
- Top-5 limit enforced (returns max 5 regardless of total matches)
- Tie scores → stable ordering (same source type grouped or by id)
- Relevance score stored per result item

Filtering within Retrieval:
- Filters by approvalStatus if specified
- Filters by ethnicGroupId if specified
- Unpublished KB entries excluded from results
- Embargoed recordings excluded from results (if rule exists)

Vector Branch (if RetrieveAsync uses vector internally):
- Embedding generated for query before retrieval
- Cosine similarity used for ranking
- Falls back to keyword if embedding fails (if fallback exists)

Context Building:
- Each result includes: sourceType, referenceId, content snippet, score
- Content snippet truncated to max length if needed
- Source metadata (title, ethnicGroup) included per result

### SearchController-level behavior (service layer only)
- Search with role Researcher → allowed
- Search with role Expert → allowed
- Search with role Admin → allowed
- Search result DTO contains all required fields for API response

### Edge Cases
- Very long query string (1000+ chars) → handled
- Special regex characters in query → not interpreted as regex
- SQL injection attempt in query → sanitized/parameterized (mock verifies
  repo called with sanitized param, not raw input)
- Concurrent search requests → no shared state corruption
- All recordings soft-deleted → empty result returned

## IMPLEMENTATION RULES

1. Use xUnit + Moq + FluentAssertions only
2. Mock ALL dependencies:
   - IRecordingRepository      ← mock search/vector methods
   - IKBEntryRepository        ← mock search/vector methods
   - IEmbeddingService         ← mock to return fixed float[] vector
   - IUserRepository           ← if role checks inside service
3. Arrange / Act / Assert with comments in each test
4. Naming: MethodName_Scenario_ExpectedResult
   Example: SemanticSearch_WithValidQuery_CallsEmbeddingServiceOnce
            RetrieveAsync_WhenKBRepositoryEmpty_StillReturnsRecordingResults
            SearchByFilter_WithMultipleCombinedFilters_ReturnsIntersection
            RetrieveAsync_WithTop5Limit_NeverExceedsFiveResults
5. Group by nested classes:
   SemanticSearchServiceTests:
   - KeywordSearch
   - VectorSearch384
   - VectorSearch768
   - UnifiedSearch
   - EdgeCases

   KnowledgeRetrievalServiceTests:
   - QueryProcessing
   - RetrievalSources
   - ScoringAndRanking
   - FilteringWithinRetrieval
   - VectorBranch
   - ContextBuilding
   - EdgeCases
6. Create helpers in TestHelpers/:
   - SearchResultBuilder   → builds fake search result / retrieval doc
   - EmbeddingHelper       → returns deterministic float[] of correct dimension
     (384-dim: new float[384] filled with 0.1f)
     (768-dim: new float[768] filled with 0.1f)
7. For vector repo mock: verify it was called with a float[] of correct length
8. Assert mock call order where critical:
   - EmbeddingService called BEFORE repository vector search
   - Repository called exactly once per search invocation
9. If Result<T> pattern used, assert IsSuccess/IsFailure and value

## AFTER ALL TESTS PASS

Run `dotnet test --filter "SemanticSearchServiceTests|KnowledgeRetrievalServiceTests"`
All must be green. Fix any errors before proceeding.

Then create the report file at:
VietTuneArchive.Tests/Report/SEARCH_TEST_REPORT.md

Report must include:
- Date generated
- Total test count per file (SemanticSearch / KnowledgeRetrieval separately)
- KnowledgeRetrievalService.RetrieveAsync: branches mapped (target 48) vs covered
- All test method names grouped by category
- Assumptions made:
    (top-k limit value, similarity threshold, embargo exclusion rule,
     embedding dimension separation logic)
- Mock strategy for embedding vector (document exact float[] size used)
- Uncovered branches and reason
- Estimated coverage delta for both services after this phase
- Suggested follow-up:
    (integration test with real PostgreSQL pgvector extension,
     WireMock for external embedding API if applicable)

Keep report concise — no fluff.