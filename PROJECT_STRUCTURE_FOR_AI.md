    # VietTune Archive - Flutter Mobile App - Project Structure

    ## 📋 Project Overview

    **Project**: VietTune Archive - Intelligent Vietnamese Traditional Music Documentation System  
    **Platform**: Flutter Mobile (iOS & Android)  
    **Architecture**: Clean Architecture (Domain, Data, Presentation)  
    **Current Status**: ~70% Complete  

    ## 🏗️ Architecture Layers

    ```
    ┌─────────────────────────────────────────┐
    │      PRESENTATION LAYER                 │
    │  (UI, Pages, Widgets, Providers)        │
    └──────────────┬──────────────────────────┘
                │ depends on
    ┌──────────────▼──────────────────────────┐
    │         DOMAIN LAYER                    │
    │  (Entities, Use Cases, Repositories)    │
    └──────────────┬──────────────────────────┘
                │ implemented by
    ┌──────────────▼──────────────────────────┐
    │          DATA LAYER                     │
    │  (Models, Repo Impls, Data Sources)     │
    └─────────────────────────────────────────┘
    ```

    ## 📁 Complete File Structure

    ```
    viettune_archive/
    ├── lib/
    │   ├── core/                                 # Infrastructure Layer
    │   │   ├── di/
    │   │   │   ├── injection.dart               ✅ DI configuration (GetIt + Injectable)
    │   │   │   └── injection.config.dart        ✅ Generated DI config
    │   │   ├── router/
    │   │   │   └── app_router.dart              ✅ GoRouter configuration
    │   │   ├── theme/
    │   │   │   └── app_theme.dart               ✅ App theming (Vietnamese colors)
    │   │   └── utils/
    │   │       ├── constants.dart               ✅ App constants, routes, provinces
    │   │       ├── extensions.dart              ✅ Dart extensions
    │   │       ├── validators.dart              ✅ Form validators
    │   │       ├── audio_utils.dart             ✅ Audio helpers
    │   │       └── location_utils.dart          ✅ GPS/location helpers
    │   │
    │   ├── domain/                               # Business Logic Layer
    │   │   ├── entities/                         # Pure Dart models
    │   │   │   ├── enums.dart                   ✅ All enums (Status, Types, Genres)
    │   │   │   ├── song.dart                    ✅ Song entity + freezed
    │   │   │   ├── instrument.dart              ✅ Instrument entity + freezed
    │   │   │   ├── ethnic_group.dart            ✅ Ethnic group entity + freezed
    │   │   │   ├── contribution_request.dart    ✅ Contribution entity + freezed
    │   │   │   ├── audio_metadata.dart          ✅ Audio metadata entity + freezed
    │   │   │   ├── cultural_context.dart        ✅ Cultural context entity + freezed
    │   │   │   ├── location.dart                ✅ Location entity + freezed
    │   │   │   └── *.freezed.dart, *.g.dart     ✅ Generated files
    │   │   │
    │   │   ├── repositories/                     # Abstract interfaces
    │   │   │   ├── base_repository.dart         ✅ Base repo + QueryParams
    │   │   │   ├── song_repository.dart         ✅ Song operations interface
    │   │   │   ├── instrument_repository.dart   ✅ Instrument operations interface
    │   │   │   ├── ethnic_group_repository.dart ✅ Ethnic group operations interface
    │   │   │   └── contribution_repository.dart ✅ Contribution operations interface
    │   │   │
    │   │   ├── usecases/                         # Business logic operations
    │   │   │   ├── discovery/
    │   │   │   │   ├── search_songs.dart        ✅ Search with filters
    │   │   │   │   ├── get_song_by_id.dart      ✅ Get single song
    │   │   │   │   ├── get_featured_songs.dart  ✅ Get featured
    │   │   │   │   ├── get_songs_by_ethnic_group.dart ✅
    │   │   │   │   ├── get_songs_by_instrument.dart   ✅
    │   │   │   │   └── toggle_favorite.dart     ✅ Favorite functionality
    │   │   │   ├── contribution/
    │   │   │   │   ├── submit_contribution.dart ✅ Submit new contribution
    │   │   │   │   ├── get_user_contributions.dart ✅ Get user's submissions
    │   │   │   │   ├── get_contribution_by_id.dart ✅
    │   │   │   │   └── update_contribution.dart ✅
    │   │   │   └── reference/
    │   │   │       ├── get_instruments.dart     ✅ Get instrument list
    │   │   │       ├── get_ethnic_groups.dart   ✅ Get ethnic group list
    │   │   │       └── get_regions.dart         ✅ Get regions
    │   │   │
    │   │   └── failures/
    │   │       ├── failure.dart                 ✅ Failure union types
    │   │       └── failure.freezed.dart         ✅ Generated
    │   │
    │   ├── data/                                 # Data Layer
    │   │   ├── models/                           # JSON serializable DTOs
    │   │   │   ├── models.dart                  ✅ Barrel export
    │   │   │   ├── song_model.dart              ✅ Song DTO + toEntity()
    │   │   │   ├── instrument_model.dart        ✅ Instrument DTO
    │   │   │   ├── ethnic_group_model.dart      ✅ Ethnic group DTO
    │   │   │   ├── contribution_request_model.dart ✅ Contribution DTO
    │   │   │   ├── audio_metadata_model.dart    ✅ Audio metadata DTO
    │   │   │   ├── cultural_context_model.dart  ✅ Cultural context DTO
    │   │   │   ├── location_model.dart          ✅ Location DTO
    │   │   │   └── *.g.dart                     ✅ Generated JSON serialization
    │   │   │
    │   │   ├── datasources/
    │   │   │   └── mock/                         # Mock data for development
    │   │   │       ├── mock_data_sources.dart   ✅ Barrel export
    │   │   │       ├── mock_song_data_source.dart ✅ ~50 Vietnamese songs
    │   │   │       ├── mock_instrument_data_source.dart ✅ 50+ instruments
    │   │   │       ├── mock_ethnic_group_data_source.dart ✅ 54 ethnic groups
    │   │   │       └── mock_contribution_data_source.dart ✅ Sample contributions
    │   │   │
    │   │   └── repositories/                     # Repository implementations
    │   │       ├── repositories.dart            ✅ Barrel export
    │   │       ├── song_repository_impl.dart    ✅ Song repo with mock data
    │   │       ├── instrument_repository_impl.dart ✅
    │   │       ├── ethnic_group_repository_impl.dart ✅
    │   │       └── contribution_repository_impl.dart ✅
    │   │
    │   ├── presentation/                         # UI Layer
    │   │   ├── shared/
    │   │   │   ├── pages/
    │   │   │   │   ├── splash_page.dart         ✅ Splash screen
    │   │   │   │   └── home_page.dart           ✅ Bottom nav (3 tabs)
    │   │   │   └── widgets/
    │   │   │       ├── audio_player_widget.dart ⚠️ Widget exists, needs audio logic
    │   │   │       ├── song_card.dart           ✅ Song list item
    │   │   │       ├── metadata_chip.dart       ✅ Tag chips
    │   │   │       ├── status_badge.dart        ✅ Verification status
    │   │   │       ├── location_picker.dart     ✅ Vietnamese address picker
    │   │   │       ├── ethnic_group_selector.dart ✅ Searchable dropdown
    │   │   │       ├── instrument_selector.dart ✅ Multi-select
    │   │   │       ├── loading_indicator.dart   ✅ Loading state
    │   │   │       └── error_view.dart          ✅ Error state
    │   │   │
    │   │   ├── discovery/                        # Research & Discovery
    │   │   │   └── pages/
    │   │   │       ├── discover_home_page.dart  ✅ Home with featured songs
    │   │   │       ├── song_detail_page.dart    ⚠️ Skeleton exists, needs content
    │   │   │       ├── search_page.dart         ⚠️ Needs implementation
    │   │   │       ├── instrument_detail_page.dart ⚠️ Needs implementation
    │   │   │       └── ethnic_group_detail_page.dart ⚠️ Needs implementation
    │   │   │
    │   │   ├── contribution/                     # Contributor Portal
    │   │   │   ├── pages/
    │   │   │   │   ├── new_contribution_page.dart ✅ Wizard container
    │   │   │   │   ├── submissions_page.dart    ⚠️ Needs implementation
    │   │   │   │   ├── contribution_detail_page.dart ⚠️ Needs implementation
    │   │   │   │   └── contribution_wizard_steps/
    │   │   │   │       ├── audio_upload_step.dart ⚠️ Needs file picker logic
    │   │   │   │       ├── basic_info_step.dart   ⚠️ Needs form logic
    │   │   │   │       ├── cultural_context_step.dart ⚠️ Needs form logic
    │   │   │   │       ├── lyrics_step.dart       ⚠️ Needs form logic
    │   │   │   │       └── review_submit_step.dart ⚠️ Needs submission logic
    │   │   │   └── providers/
    │   │   │       └── contribution_providers.dart ❌ CRITICAL - needs implementation
    │   │   │
    │   │   └── profile/                          # Profile & Settings
    │   │       └── pages/
    │   │           ├── profile_page.dart        ⚠️ Skeleton exists
    │   │           ├── favorites_page.dart      ⚠️ Needs implementation
    │   │           └── settings_page.dart       ⚠️ Needs implementation
    │   │
    │   └── main.dart                            ✅ App entry point
    │
    ├── pubspec.yaml                             ✅ Dependencies configured
    ├── analysis_options.yaml                    ✅ Linter rules
    └── README.md                                ✅ Comprehensive documentation
    ```

    ## 🔧 Dependencies (pubspec.yaml)

    ### Core Architecture
    ```yaml
    flutter_riverpod: ^2.5.1      # State management
    go_router: ^14.0.2            # Navigation
    get_it: ^7.6.7                # Service locator
    injectable: ^2.4.0            # DI code generation
    ```

    ### Networking & Data
    ```yaml
    dio: ^5.4.1                   # HTTP client (future-ready)
    retrofit: ^4.1.0              # REST API client (future-ready)
    dartz: ^0.10.1                # Functional programming (Either)
    freezed_annotation: ^2.4.1    # Immutable models
    json_annotation: ^4.8.1       # JSON serialization
    ```

    ### Media & Files
    ```yaml
    just_audio: ^0.9.36           # Audio playback
    audio_service: ^0.18.12       # Background audio
    image_picker: ^1.0.7          # Image selection
    file_picker: ^6.1.1           # File selection
    path_provider: ^2.1.2         # File paths
    ```

    ### Location & UI
    ```yaml
    geolocator: ^11.0.0           # GPS
    google_fonts: ^6.2.1          # Typography
    cached_network_image: ^3.3.1  # Image caching
    intl: ^0.19.0                 # Internationalization
    ```

    ## 📊 Completion Status by Layer

    | Layer | Component | Status | Completion |
    |-------|-----------|--------|------------|
    | **DOMAIN** | Entities (8 files) | ✅ Done | 100% |
    | | Enums | ✅ Done | 100% |
    | | Repository Interfaces (4) | ✅ Done | 100% |
    | | Use Cases (13) | ✅ Done | 100% |
    | | Failures | ✅ Done | 100% |
    | **DATA** | Models/DTOs (7) | ✅ Done | 100% |
    | | Mock DataSources (4) | ✅ Done | 95% |
    | | Repository Impls (4) | ✅ Done | 100% |
    | **INFRASTRUCTURE** | DI Setup | ✅ Done | 100% |
    | | Router | ✅ Done | 100% |
    | | Theme | ✅ Done | 100% |
    | | Utils | ✅ Done | 100% |
    | **PRESENTATION** | Shared Widgets | ✅ Done | 90% |
    | | Home & Navigation | ✅ Done | 100% |
    | | Discovery Home | ✅ Done | 80% |
    | | Contribution Wizard | ⚠️ Partial | 40% |
    | | Detail Pages | ⚠️ Partial | 30% |
    | | Search & Discovery | ⚠️ Partial | 20% |
    | | Profile Pages | ⚠️ Partial | 40% |
    | **TESTING** | Unit Tests | ❌ Missing | 0% |
    | | Widget Tests | ❌ Missing | 0% |

    **Overall: ~70% Complete**

    ## 🎯 Key Code Samples

    ### 1. Dependency Injection (injection.dart)

    ```dart
    final getIt = GetIt.instance;

    @InjectableInit()
    void configureDependencies() => getIt.init();

    @module
    abstract class DataSourceModule {
    @lazySingleton
    MockSongDataSource get songDataSource => MockSongDataSourceImpl();
    // ... other datasources
    }

    @module
    abstract class RepositoryModule {
    @LazySingleton(as: SongRepository)
    SongRepositoryImpl songRepository(MockSongDataSource dataSource);
    // ... other repositories
    }

    @module
    abstract class UseCaseModule {
    @lazySingleton
    SearchSongs searchSongs(SongRepository repository);
    // ... 13 use cases total
    }
    ```

    ### 2. Main App Entry (main.dart)

    ```dart
    void main() {
    WidgetsFlutterBinding.ensureInitialized();
    configureDependencies();  // Initialize DI
    
    runApp(
        const ProviderScope(
        child: VietTuneApp(),
        ),
    );
    }

    class VietTuneApp extends StatelessWidget {
    @override
    Widget build(BuildContext context) {
        return MaterialApp.router(
        title: 'VietTune Archive',
        theme: AppTheme.lightTheme,
        routerConfig: appRouter,  // GoRouter
        );
    }
    }
    ```

    ### 3. Song Entity (domain/entities/song.dart)

    ```dart
    @freezed
    class Song with _$Song {
    const factory Song({
        required String id,
        required String title,
        List<String>? alternativeTitles,
        required MusicGenre genre,
        required String ethnicGroupId,
        required VerificationStatus verificationStatus,
        AudioMetadata? audioMetadata,
        CulturalContext? culturalContext,
        String? lyricsNativeScript,
        String? lyricsVietnameseTranslation,
        String? description,
        int? playCount,
        int? favoriteCount,
        DateTime? createdAt,
        DateTime? updatedAt,
        String? contributorId,
        List<String>? tags,
    }) = _Song;

    factory Song.fromJson(Map<String, dynamic> json) => _$SongFromJson(json);
    }
    ```

    ### 4. Use Case Example (search_songs.dart)

    ```dart
    class SearchSongs {
    final SongRepository _repository;
    
    SearchSongs(this._repository);
    
    RepositoryResult<PaginatedResponse<Song>> call({
        String? query,
        List<String>? ethnicGroupIds,
        List<String>? instrumentIds,
        QueryParams? params,
    }) {
        return _repository.searchSongs(
        query: query,
        params: params,
        );
    }
    }
    ```

    ### 5. Repository Interface (song_repository.dart)

    ```dart
    abstract class SongRepository extends BaseRepository {
    RepositoryResult<Song> getSongById(String id);
    RepositoryResult<PaginatedResponse<Song>> getSongs({QueryParams? params});
    RepositoryResult<PaginatedResponse<Song>> searchSongs({
        required String query,
        QueryParams? params,
    });
    RepositoryResult<PaginatedResponse<Song>> getSongsByEthnicGroup({
        required String ethnicGroupId,
        QueryParams? params,
    });
    // ... more methods
    }

    // RepositoryResult is: Future<Either<Failure, T>>
    typedef RepositoryResult<T> = Future<Either<Failure, T>>;
    ```

    ### 6. Discover Home with Riverpod (discover_home_page.dart)

    ```dart
    final featuredSongsProvider = FutureProvider((ref) async {
    final useCase = getIt<GetFeaturedSongs>();
    final result = await useCase(limit: 10);
    return result.fold(
        (failure) => throw failure,
        (songs) => songs,
    );
    });

    class DiscoverHomePage extends ConsumerWidget {
    @override
    Widget build(BuildContext context, WidgetRef ref) {
        final featuredAsync = ref.watch(featuredSongsProvider);
        
        return featuredAsync.when(
        data: (songs) => ListView.builder(...),
        loading: () => LoadingIndicator(),
        error: (error, stack) => ErrorView(...),
        );
    }
    }
    ```

    ### 7. Contribution Wizard (new_contribution_page.dart)

    ```dart
    class NewContributionPage extends ConsumerWidget {
    @override
    Widget build(BuildContext context, WidgetRef ref) {
        final formState = ref.watch(contributionFormProvider);
        
        final steps = [
        AudioUploadStep(),
        BasicInfoStep(),
        CulturalContextStep(),
        LyricsStep(),
        ReviewSubmitStep(),
        ];
        
        return Scaffold(
        body: Column(
            children: [
            // Step indicator progress bar
            StepIndicator(currentStep: formState.currentStep),
            // Current step content
            Expanded(child: steps[formState.currentStep]),
            // Navigation buttons
            NavigationButtons(...),
            ],
        ),
        );
    }
    }
    ```

    ### 8. Mock Data Example (mock_song_data_source.dart)

    ```dart
    class MockSongDataSourceImpl implements MockSongDataSource {
    static final List<SongModel> _songs = [
        SongModel(
        id: '1',
        title: 'Lý Con Sáo',
        genre: 'folk',
        ethnicGroupId: 'kinh',
        verificationStatus: 'verified',
        audioMetadata: AudioMetadataModel(
            audioUrl: 'https://example.com/ly-con-sao.mp3',
            durationSeconds: 245,
            instrumentIds: ['dan_tranh', 'dan_bau'],
            recordingLocation: LocationModel(
            latitude: 21.0285,
            longitude: 105.8542,
            province: 'Hà Nội',
            ),
        ),
        culturalContext: CulturalContextModel(
            type: 'entertainment',
            description: 'Dân ca phổ biến miền Bắc',
        ),
        lyricsNativeScript: 'Lý con sáo...',
        description: 'Một trong những làn điệu dân ca cổ...',
        ),
        // ... ~50 more songs
    ];
    
    @override
    Future<List<SongModel>> searchSongs({
        String? query,
        List<String>? ethnicGroupIds,
        // ... filters
    }) async {
        await Future.delayed(Duration(milliseconds: 400));
        var results = List<SongModel>.from(_songs);
        
        if (query != null && query.isNotEmpty) {
        results = results.where((song) => 
            song.title.toLowerCase().contains(query.toLowerCase())
        ).toList();
        }
        
        // Apply other filters...
        return results;
    }
    }
    ```

    ## 🚨 Critical Missing Implementations

    ### 1. **contribution_providers.dart** (HIGHEST PRIORITY)
    ```dart
    // NEEDS IMPLEMENTATION
    @riverpod
    class ContributionForm extends _$ContributionForm {
    @override
    ContributionFormState build() {
        return ContributionFormState(
        currentStep: 0,
        audioFile: null,
        formData: {},
        isValid: false,
        );
    }
    
    void nextStep() { /* TODO */ }
    void previousStep() { /* TODO */ }
    void updateFormData(String key, dynamic value) { /* TODO */ }
    Future<void> submitContribution() async { /* TODO */ }
    }

    class ContributionFormState {
    final int currentStep;
    final File? audioFile;
    final Map<String, dynamic> formData;
    final bool isValid;
    // ... validation errors, etc.
    }
    ```

    ### 2. **Wizard Steps Need Forms** (HIGH PRIORITY)
    Each step file needs:
    - Form fields with controllers
    - Validation logic
    - State management integration
    - Error handling

    ### 3. **Detail Pages** (HIGH PRIORITY)
    - `song_detail_page.dart`: Complete song view with player
    - `instrument_detail_page.dart`: Instrument info + related songs
    - `ethnic_group_detail_page.dart`: Ethnic group info + songs
    - `contribution_detail_page.dart`: View submission status

    ### 4. **Search Page** (MEDIUM PRIORITY)
    Advanced search UI with:
    - Text search input
    - Filter chips (ethnic group, instrument, genre, region)
    - Results list with pagination
    - Empty/error states

    ### 5. **Audio Player Logic** (MEDIUM PRIORITY)
    `audio_player_widget.dart` needs:
    - just_audio integration
    - Play/pause/seek controls
    - Progress indicator
    - Speed control
    - Error handling

    ## 📈 Progress Roadmap

    ```
    Week 1-2 (COMPLETED):
    ✅ Domain layer complete
    ✅ Data layer with mock data
    ✅ Infrastructure (DI, Router, Theme)
    ✅ Basic UI structure

    Week 3-4 (IN PROGRESS - 40%):
    ⚠️ Contribution wizard structure
    ❌ Wizard form logic
    ❌ File upload handling

    Week 5-7 (NOT STARTED):
    ❌ Detail pages
    ❌ Search functionality
    ❌ Audio player integration

    Week 8-9 (NOT STARTED):
    ❌ Profile pages
    ❌ Favorites functionality
    ❌ Settings

    Week 10-11 (NOT STARTED):
    ❌ Testing
    ❌ Polish & refinement
    ❌ Documentation updates
    ```

    ## 💡 Architecture Highlights

    ### Clean Architecture Benefits:
    1. **Domain Layer** is pure Dart (no Flutter dependencies)
    2. **Business logic** is testable without UI
    3. **Data sources** are swappable (mock → API)
    4. **UI** depends only on abstractions (use cases)

    ### State Management Strategy:
    - **Riverpod** for reactive state
    - **FutureProvider** for async data fetching
    - **StateNotifier/Notifier** for complex state (forms)
    - **GetIt** for service location (use cases, repos)

    ### Error Handling Pattern:
    - **Either<Failure, Success>** from dartz
    - **Failure** union types (Server, Network, Validation, etc.)
    - **fold()** to handle both cases
    - UI shows user-friendly error messages

    ### Mock Data Strategy:
    - ~50 Vietnamese traditional songs with rich metadata
    - 54 ethnic groups (matching Vietnam's reality)
    - 50+ traditional instruments categorized by type
    - Sample contribution requests in various states
    - Realistic data for testing and demo purposes

    ## 🎨 UI/UX Features

    ### Vietnamese Localization:
    - All UI text in Vietnamese
    - Vietnamese address structure (Province/District/Commune)
    - Cultural context appropriate for Vietnamese users

    ### Color Scheme:
    - Primary: Red #D32F2F (Vietnamese flag red)
    - Accent: Gold #FFB300 (traditional Vietnamese gold)
    - Typography: Google Fonts (Roboto + Noto Serif)

    ### Key User Flows:

    **Discovery Flow:**
    Home → Browse (Featured/Ethnic Groups/Instruments) → Song Detail → Play Audio → Add to Favorites

    **Contribution Flow:**
    New Contribution → Upload Audio → Fill Info → Add Context → Add Lyrics → Review → Submit → Track Status

    **Profile Flow:**
    Profile → View Stats → Favorites → Submissions → Settings

    ## 🔄 Data Flow Example: Song Search

    ```
    [UI: SearchPage]
        ↓ user types query
    [Riverpod Provider]
        ↓ calls
    [UseCase: SearchSongs]
        ↓ calls
    [Repository Interface: SongRepository]
        ↓ implemented by
    [Repository Impl: SongRepositoryImpl]
        ↓ calls
    [DataSource: MockSongDataSource]
        ↓ returns
    [Models: List<SongModel>]
        ↓ converts to
    [Entities: List<Song>]
        ↓ wrapped in
    [Either<Failure, List<Song>>]
        ↓ handled by
    [UI: displays results or error]
    ```

    ## 🎯 Next Steps Recommendation

    **Priority Order:**
    1. ✅ Implement `contribution_providers.dart` with form state management
    2. ✅ Complete wizard step implementations (file picker, form validation)
    3. ✅ Build detail pages (song, instrument, ethnic group)
    4. ✅ Implement search page with advanced filters
    5. ✅ Add audio player logic with just_audio
    6. ✅ Complete profile pages
    7. ✅ Add unit tests for use cases
    8. ✅ Add widget tests for key screens

    ## 📝 Notes for AI Assistant

    - Project uses **Flutter 3.0+** with Dart 3.0+
    - **Code generation** required after entity/model changes: `flutter pub run build_runner build`
    - All async operations use **Either<Failure, T>** for error handling
    - **Mock data** is realistic Vietnamese cultural content
    - UI text is in **Vietnamese** (not English)
    - **User ID** is currently hardcoded as 'current_user_id' (needs auth later)
    - **Audio/image URLs** are mock (ready for real file upload integration)

    ## 🐛 Known Issues

    1. `contribution_providers.dart` is empty/stub - needs full implementation
    2. Wizard steps have UI but no form logic
    3. Detail pages are skeletons without content
    4. Audio player widget has no playback logic
    5. No authentication system yet (user ID hardcoded)
    6. No tests written yet
    7. Some mock data could be more diverse (geographic distribution)

    ---

    **Generated**: 2026-01-16  
    **Project Status**: 70% Complete, Domain & Infrastructure Solid, UI Needs Implementation  
    **Ready for**: AI-assisted completion of Presentation layer
