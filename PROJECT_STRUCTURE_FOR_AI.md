    # VietTune Archive - Flutter Mobile App - Project Structure

    ## 📋 Project Overview

    **Project**: VietTune Archive - Intelligent Vietnamese Traditional Music Documentation System  
    **Platform**: Flutter Mobile (iOS & Android) + Web  
    **Architecture**: Clean Architecture (Domain, Data, Presentation)  
    **Current Status**: ~85% Complete  

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
    │   │   │   ├── app_router.dart              ✅ GoRouter configuration (with auth redirects)
    │   │   │   └── auth_session.dart            ✅ Global auth session state
    │   │   ├── theme/
    │   │   │   └── app_theme.dart               ✅ App theming (Vietnamese colors)
    │   │   └── utils/
    │   │       ├── constants.dart               ✅ App constants, routes, provinces
    │   │       ├── extensions.dart              ✅ Dart extensions
    │   │       ├── validators.dart              ✅ Form validators
    │   │       ├── audio_utils.dart             ✅ Audio helpers
    │   │       ├── audio_metadata_extractor.dart ✅ Audio metadata extraction (just_audio)
    │   │       └── location_utils.dart          ✅ GPS/location helpers
    │   │
    │   ├── domain/                               # Business Logic Layer
    │   │   ├── entities/                         # Pure Dart models
    │   │   │   ├── enums.dart                   ✅ All enums (Status, Types, Genres, UserRole, PerformanceType)
    │   │   │   ├── song.dart                    ✅ Song entity + freezed (with new fields: author, performanceType, copyrightInfo, fieldNotes, isRecordingDateEstimated)
    │   │   │   ├── instrument.dart              ✅ Instrument entity + freezed
    │   │   │   ├── ethnic_group.dart            ✅ Ethnic group entity + freezed
    │   │   │   ├── contribution_request.dart    ✅ Contribution entity + freezed
    │   │   │   ├── audio_metadata.dart          ✅ Audio metadata entity + freezed (with sampleRate)
    │   │   │   ├── cultural_context.dart        ✅ Cultural context entity + freezed
    │   │   │   ├── location.dart                ✅ Location entity + freezed
    │   │   │   ├── user.dart                    ✅ User entity + freezed (with role, profile fields)
    │   │   │   ├── auth_state.dart              ✅ AuthState (authenticated/unauthenticated/loading) + freezed
    │   │   │   ├── contribution_statistics.dart ✅ Contribution statistics entity + freezed
    │   │   │   └── *.freezed.dart, *.g.dart     ✅ Generated files
    │   │   │
    │   │   ├── repositories/                     # Abstract interfaces
    │   │   │   ├── base_repository.dart         ✅ Base repo + QueryParams
    │   │   │   ├── song_repository.dart         ✅ Song operations interface (with RBAC support)
    │   │   │   ├── instrument_repository.dart   ✅ Instrument operations interface
    │   │   │   ├── ethnic_group_repository.dart ✅ Ethnic group operations interface
    │   │   │   ├── contribution_repository.dart ✅ Contribution operations interface (with RBAC support)
    │   │   │   ├── auth_repository.dart         ✅ Auth operations interface (login, register, logout, refresh token)
    │   │   │   └── user_repository.dart         ✅ User operations interface (profile, stats, role management)
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
    │   │   │   ├── auth/
    │   │   │   │   ├── login.dart               ✅ Login use case
    │   │   │   │   ├── register.dart            ✅ Register use case
    │   │   │   │   ├── logout.dart              ✅ Logout use case
    │   │   │   │   ├── get_current_user.dart    ✅ Get current user
    │   │   │   │   ├── refresh_token.dart       ✅ Refresh token
    │   │   │   │   ├── update_profile.dart      ✅ Update user profile
    │   │   │   │   ├── change_password.dart     ✅ Change password
    │   │   │   │   └── request_contributor_role.dart ✅ Request contributor role
    │   │   │   ├── user/
    │   │   │   │   ├── get_user_by_id.dart      ✅ Get user by ID
    │   │   │   │   ├── get_user_stats.dart      ✅ Get user statistics
    │   │   │   │   ├── search_users.dart        ✅ Search users
    │   │   │   │   ├── promote_to_contributor.dart ✅ Promote user to contributor
    │   │   │   │   └── promote_to_expert.dart   ✅ Promote user to expert
    │   │   │   └── reference/
    │   │   │       ├── get_instruments.dart     ✅ Get instrument list
    │   │   │       ├── get_ethnic_groups.dart   ✅ Get ethnic group list
    │   │   │       └── get_regions.dart         ✅ Get regions
    │   │   │
    │   │   ├── services/
    │   │   │   └── permission_guard.dart        ✅ RBAC permission checks (canViewSong, canEditSong, canReviewContributions, canSubmitContributions)
    │   │   │
    │   │   └── failures/
    │   │       ├── failure.dart                 ✅ Failure union types
    │   │       └── failure.freezed.dart         ✅ Generated
    │   │
    │   ├── data/                                 # Data Layer
    │   │   ├── models/                           # JSON serializable DTOs
    │   │   │   ├── models.dart                  ✅ Barrel export
    │   │   │   ├── song_model.dart              ✅ Song DTO + toEntity() (with new fields)
    │   │   │   ├── instrument_model.dart        ✅ Instrument DTO
    │   │   │   ├── ethnic_group_model.dart      ✅ Ethnic group DTO
    │   │   │   ├── contribution_request_model.dart ✅ Contribution DTO
    │   │   │   ├── audio_metadata_model.dart    ✅ Audio metadata DTO (with sampleRate)
    │   │   │   ├── cultural_context_model.dart  ✅ Cultural context DTO
    │   │   │   ├── location_model.dart          ✅ Location DTO
    │   │   │   ├── user_model.dart              ✅ User DTO + toEntity()
    │   │   │   ├── auth_response_model.dart     ✅ Auth response DTO
    │   │   │   └── *.g.dart                     ✅ Generated JSON serialization
    │   │   │
    │   │   ├── datasources/
    │   │   │   └── mock/                         # Mock data for development
    │   │   │       ├── mock_data_sources.dart   ✅ Barrel export
    │   │   │       ├── mock_song_data_source.dart ✅ ~50 Vietnamese songs (with new fields)
    │   │   │       ├── mock_instrument_data_source.dart ✅ 50+ instruments
    │   │   │       ├── mock_ethnic_group_data_source.dart ✅ 54 ethnic groups
    │   │   │       ├── mock_contribution_data_source.dart ✅ Sample contributions
    │   │   │       └── mock_auth_data_source.dart ✅ Mock auth with sample users (researcher, contributor, expert, admin)
    │   │   │
    │   │   └── repositories/                     # Repository implementations
    │   │       ├── repositories.dart            ✅ Barrel export
    │   │       ├── song_repository_impl.dart    ✅ Song repo with mock data (RBAC support)
    │   │       ├── instrument_repository_impl.dart ✅
    │   │       ├── ethnic_group_repository_impl.dart ✅
    │   │       ├── contribution_repository_impl.dart ✅ (RBAC support, approve/reject for experts)
    │   │       ├── auth_repository_impl.dart    ✅ Auth repo with mock auth data source
    │   │       └── user_repository_impl.dart    ✅ User repo with user operations
    │   │
    │   ├── presentation/                         # UI Layer
    │   │   ├── shared/
    │   │   │   ├── pages/
    │   │   │   │   ├── splash_page.dart         ✅ Splash screen
    │   │   │   │   └── home_page.dart           ✅ Bottom nav (3 tabs, conditional based on role)
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
    │   │   │   │   ├── new_contribution_page.dart ✅ Wizard container (5 steps)
    │   │   │   │   ├── submissions_page.dart    ✅ User submissions list with status
    │   │   │   │   ├── contribution_detail_page.dart ⚠️ Needs implementation
    │   │   │   │   └── contribution_wizard_steps/
    │   │   │   │       ├── audio_upload_step.dart ✅ File picker + auto metadata extraction (format, bitrate, sample rate, duration)
    │   │   │   │       ├── basic_info_step.dart   ✅ Title, Artist, Author, Genre, Language
    │   │   │   │       ├── cultural_context_step.dart ✅ Ethnic Group, Region (Province/City), Event Type, Location
    │   │   │   │       ├── performance_details_step.dart ✅ Performance Type, Instruments, Recording Date, Estimated Date checkbox
    │   │   │   │       ├── notes_copyright_step.dart ✅ Lyrics (Native/Vietnamese), Copyright, Field Notes
    │   │   │   │       ├── lyrics_step.dart       ⚠️ Legacy file (kept for reference)
    │   │   │   │       └── review_submit_step.dart ⚠️ Legacy file (kept for reference)
    │   │   │   └── providers/
    │   │   │       └── contribution_providers.dart ✅ Full form state management with all fields
    │   │   │
    │   │   ├── auth/                             # Authentication & Authorization
    │   │   │   ├── pages/
    │   │   │   │   ├── login_page.dart          ✅ Login UI with email/password
    │   │   │   │   └── register_page.dart       ✅ Registration UI
    │   │   │   ├── providers/
    │   │   │   │   └── auth_provider.dart       ✅ AuthNotifier with Riverpod (login/logout/session restore)
    │   │   │   └── widgets/
    │   │   │       └── role_badge.dart          ✅ User role display badge
    │   │   │
    │   │   ├── review/                           # Expert Review Portal
    │   │   │   └── pages/
    │   │   │       └── review_queue_page.dart   ✅ Review queue for experts/admins
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
    just_audio: ^0.9.36           # Audio playback + metadata extraction
    audio_service: ^0.18.12       # Background audio
    image_picker: ^1.0.7          # Image selection
    file_picker: ^6.1.1           # File selection (web + mobile)
    path_provider: ^2.1.2         # File paths
    ```
    
    ### Security & Storage
    ```yaml
    flutter_secure_storage: ^9.0.0 # Secure token storage
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
    | **DOMAIN** | Entities (11 files) | ✅ Done | 100% |
    | | Enums (includes UserRole, PerformanceType) | ✅ Done | 100% |
    | | Repository Interfaces (7) | ✅ Done | 100% |
    | | Use Cases (21+) | ✅ Done | 100% |
    | | Services (PermissionGuard) | ✅ Done | 100% |
    | | Failures | ✅ Done | 100% |
    | **DATA** | Models/DTOs (9) | ✅ Done | 100% |
    | | Mock DataSources (5) | ✅ Done | 100% |
    | | Repository Impls (7) | ✅ Done | 100% |
    | **INFRASTRUCTURE** | DI Setup | ✅ Done | 100% |
    | | Router (with auth guards) | ✅ Done | 100% |
    | | Theme | ✅ Done | 100% |
    | | Utils (includes AudioMetadataExtractor) | ✅ Done | 100% |
    | **PRESENTATION** | Shared Widgets | ✅ Done | 95% |
    | | Home & Navigation (RBAC-aware) | ✅ Done | 100% |
    | | Auth Pages (Login/Register) | ✅ Done | 100% |
    | | Auth Providers (Riverpod) | ✅ Done | 100% |
    | | Discovery Home | ✅ Done | 80% |
    | | Contribution Wizard (5 steps) | ✅ Done | 95% |
    | | Contribution Providers | ✅ Done | 100% |
    | | Review Queue (Expert) | ✅ Done | 90% |
    | | Detail Pages | ⚠️ Partial | 50% |
    | | Search & Discovery | ⚠️ Partial | 30% |
    | | Profile Pages | ⚠️ Partial | 40% |
    | **TESTING** | Unit Tests (Auth/Permissions) | ⚠️ Partial | 20% |
    | | Widget Tests | ❌ Missing | 0% |

    **Overall: ~85% Complete**

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

### 7. Contribution Wizard - 5-Step Flow (new_contribution_page.dart)

**Step 1: Audio Upload & Auto-detection**
- File picker (web + mobile compatible)
- Automatic metadata extraction: Format, Bitrate, Sample Rate, Duration
- Display "Thông tin ghi âm" card with extracted info

**Step 2: Basic Description**
- Title, Artist (performerNames), Author
- Genre (dropdown), Language (ethnic groups or "Tiếng Việt")

**Step 3: Cultural Context**
- Ethnic Group (searchable dropdown)
- Region (Province/City - 63 Vietnamese provinces)
- Event Type, Specific Location

**Step 4: Performance Details & Instruments**
- Performance Type (Instrumental/Vocal/Both - radio buttons)
- Instruments (multi-select tags/chips)
- Recording Date (date picker) + "Estimated Date" checkbox

**Step 5: Notes & Copyright**
- Lyrics (Native Script and Vietnamese Translation)
- Copyright/Archive Organization
- Field Notes

```dart
class NewContributionPage extends ConsumerWidget {
@override
Widget build(BuildContext context, WidgetRef ref) {
    final formState = ref.watch(contributionFormProvider);
    
    final steps = [
    AudioUploadStep(),      // Step 1: Upload + metadata extraction
    BasicInfoStep(),        // Step 2: Title, Artist, Author, Genre, Language
    CulturalContextStep(),  // Step 3: Ethnic Group, Region, Event, Location
    PerformanceDetailsStep(), // Step 4: Performance Type, Instruments, Date
    NotesCopyrightStep(),   // Step 5: Lyrics, Copyright, Field Notes
    ];
    
    return Scaffold(
    body: Column(
        children: [
        // 5-step progress indicator
        StepIndicator(currentStep: formState.currentStep),
        // Current step content
        Expanded(child: steps[formState.currentStep]),
        // Navigation buttons (Prev/Next)
        NavigationButtons(...),
        ],
    ),
    );
}
}
```

### 8. Authentication & RBAC System

**Auth Provider with Riverpod:**
```dart
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repository = getIt<AuthRepository>();
  final storage = getIt<FlutterSecureStorage>();
  return AuthNotifier(repository, storage);
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;
  final FlutterSecureStorage _storage;
  
  AuthNotifier(this._repository, this._storage)
      : super(const AuthState.loading()) {
    _restoreSession();
  }
  
  Future<void> login(String email, String password) async {
    state = const AuthState.loading();
    final result = await _repository.login(email: email, password: password);
    // Handle result, store tokens, update state...
  }
}
```

**Permission Guard (RBAC):**
```dart
class PermissionGuard {
  static bool canViewSong(Song song, User user) {
    switch (user.role) {
      case UserRole.researcher:
        return song.verificationStatus == VerificationStatus.verified;
      case UserRole.contributor:
        return song.verificationStatus == VerificationStatus.verified ||
            song.contributorId == user.id;
      case UserRole.expert:
      case UserRole.admin:
        return true;
    }
  }
  
  static bool canReviewContributions(User user) =>
      user.role == UserRole.expert || user.role == UserRole.admin;
}
```

**User Roles:**
- **Researcher**: View verified songs only
- **Contributor**: View verified + own submissions, can submit contributions
- **Expert**: Full access, can review contributions
- **Admin**: Full access + user management

**Router with Auth Guards:**
```dart
final appRouter = GoRouter(
  redirect: (context, state) {
    final authState = ref.read(authProvider);
    final isLoggedIn = authState.maybeWhen(
      authenticated: (_, __, ___) => true,
      orElse: () => false,
    );
    
    final isLoginRoute = state.uri.path == authLogin;
    if (!isLoggedIn && !isLoginRoute) return authLogin;
    if (isLoggedIn && isLoginRoute) return home;
    return null;
  },
  // ... routes
);
```

### 9. Mock Data Example (mock_song_data_source.dart)

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

- `song_detail_page.dart`: Complete song view with player (skeleton exists, needs content)
- `instrument_detail_page.dart`: Instrument info + related songs
- `ethnic_group_detail_page.dart`: Ethnic group info + songs
- `contribution_detail_page.dart`: View submission status

### 2. **Search Page** (MEDIUM PRIORITY)
    Advanced search UI with:
    - Text search input
    - Filter chips (ethnic group, instrument, genre, region)
    - Results list with pagination
    - Empty/error states

    ### 3. **Audio Player Logic** (MEDIUM PRIORITY)
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

    Week 3-4 (COMPLETED - 100%):
    ✅ Contribution wizard structure (5 steps)
    ✅ Wizard form logic (full state management)
    ✅ File upload handling + metadata extraction
    ✅ Authentication & RBAC system

    Week 5-7 (IN PROGRESS - 50%):
    ⚠️ Detail pages (song detail has skeleton, needs content)
    ⚠️ Search functionality (basic structure exists)
    ⚠️ Audio player integration (widget exists, needs logic)

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
    - **Authentication** is fully implemented with mock data (ready for real API integration)
    - **RBAC** is active - navigation and actions are role-based
    - **Audio/image URLs** are mock (ready for real file upload integration)

## 🐛 Known Issues

1. ~~`contribution_providers.dart` is empty/stub~~ ✅ **FIXED** - Full implementation complete
2. ~~Wizard steps have UI but no form logic~~ ✅ **FIXED** - All 5 steps fully functional
3. Detail pages are skeletons without content - **IN PROGRESS**
4. Audio player widget has no playback logic - **TODO**
5. ~~No authentication system~~ ✅ **FIXED** - Full auth + RBAC implemented
6. Unit tests exist for auth/permissions (20% coverage) - **NEEDS EXPANSION**
7. Some mock data could be more diverse (geographic distribution) - **MINOR**
8. File picker on web has limitations (metadata extraction skipped) - **PLATFORM LIMITATION**

    ---

    **Generated**: 2026-01-16  
    **Last Updated**: 2026-01-16  
    **Project Status**: 85% Complete  
    **Completed**: Domain, Data, Infrastructure, Auth/RBAC, Contribution Wizard  
    **In Progress**: Detail Pages, Search, Audio Player  
    **Ready for**: AI-assisted completion of remaining Presentation features
