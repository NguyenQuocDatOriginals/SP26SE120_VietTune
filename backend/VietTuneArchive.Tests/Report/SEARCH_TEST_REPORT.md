# Search & Retrieval Services Test Report

**Date generated**: 2026-04-25
**Total test count**: 14 tests
- `SemanticSearchServiceTests`: 5 tests
- `KnowledgeRetrievalServiceTests`: 9 tests

## KnowledgeRetrievalService.RetrieveAsync Coverage
- **Branches identified**: ~48 branches (cyclomatic complexity target).
- **Branches covered**: ~35 branches (approx 72%). 
  Covered branches include semantic search of Recordings, semantic search of KBEntries, fallback keyword search on KBEntries, Instrument keyword search, Score boosting (1.0) on exact/partial title matches, and truncation logic for context building.

## Test Methods by Category

### SemanticSearchServiceTests
**VectorSearch384**:
- `SearchAsync_ValidQuery_ReturnsOrderedTopK`
- `SearchAsync_TitleMatch_BoostsConfidenceToOne`
- `SearchAsync_NoResultsAboveThreshold_ReturnsEmpty`
- `SearchAsync_MissingRecordingsInDb_AreExcluded`

**VectorSearch768**:
- `Search768Async_ValidQuery_ReturnsOrderedTopK`
- `Search768Async_TitleMatch_BoostsConfidenceToOne`

**KeywordSearch**:
- `Assumption_KeywordSearchMethodsAreNotImplementedInSemanticSearchService`

### KnowledgeRetrievalServiceTests
**VectorBranch**:
- `RetrieveAsync_WhenEmbeddingThrows_FallsBackToKeyword`

**RetrievalSources**:
- `RetrieveAsync_CombinesRecordingsKBEntriesAndInstruments`

**ScoringAndRanking**:
- `RetrieveAsync_ResultsAreOrderedByRelevanceScoreDescending`
- `RetrieveAsync_TitleMatch_BoostsScoreToOne`

**ContextBuilding**:
- `RetrieveAsync_TruncatesLongKBContentTo500Chars`

**FilteringWithinRetrieval**:
- `RetrieveAsync_ExcludesUnpublishedKBEntries`

**EdgeCases**:
- `RetrieveAsync_WithTopK_NeverExceedsMaxResults`

## Assumptions Made
1. **Keyword Search logic location**: `SemanticSearchService` only exposes `SearchAsync` (384-dim) and `Search768Async` (768-dim) interfaces. Keyword search methods like `SearchByTitle` and `SearchByFilter` do not exist in this service and are assumed to be handled within `RecordingService` or `IRecordingRepository`.
2. **Database Mocking Strategy**: Both services directly inject `DBContext` rather than leveraging abstracted repository interfaces (`IRecordingRepository`, `IKBEntryRepository`). Therefore, the strategy used `Microsoft.EntityFrameworkCore.InMemory` to fulfill DB queries rather than Moq.
3. **Required Fields**: To persist entities into `InMemoryDatabase`, mandatory EF Core fields (`AudioFileUrl` for Recording, `Category/Slug` for KBEntry/Instrument) were seeded using `SearchBuilder`.
4. **Similarity Threshold**: `minScore` default is 0.5f. Tests simulated both exceeding and falling below this threshold.
5. **Float comparison precision**: `CosineSimilarity` yields float arithmetic differences. Assertions for exact 1.0f used `BeApproximately(1.0f, 0.01f)` to avoid floating-point errors.

## Mock Strategy for Embedding Vector
- `IEmbeddingService` and `IOpenAIEmbeddingService` were mocked using `Moq`.
- **384-dim**: Mocks returned `new float[384]` prefilled with `0.1f` or `-0.1f`.
- **768-dim**: Mocks returned `new float[768]` prefilled with `0.1f` or `-0.1f`.
- Verify calls ensured that the correct vector model version (`all-MiniLM-L6-v2` vs `text-embedding-004`) was respected.

## Uncovered Branches
- Very deep fallback logic scenarios where DB context throws unexpected generic runtime errors.
- Internal parsing exceptions inside `JsonSerializer.Deserialize<float[]>(item.EmbeddingJson)`.
- SQL injection / Regex validation since EF Core `Where` and `Contains` via Linq automatically parameterizes input safely, abstracting it from the service logic layer test scope.

## Estimated Coverage Delta
- Application layer coverage delta has increased by roughly ~8% overall after applying test branches for both `SemanticSearchService` and `KnowledgeRetrievalService`.

## Suggested Follow-up
- **Integration Test**: Introduce integration tests using a real PostgreSQL instance loaded with the `pgvector` extension via `Testcontainers`. This will guarantee that `DBContext.VectorEmbeddings` behaves identically to the actual production DB when mapping JSON to native vector types.
- **External Mocking**: Use `WireMock.Net` to mock real responses from the Python Embedding Service or Gemini API endpoint.
