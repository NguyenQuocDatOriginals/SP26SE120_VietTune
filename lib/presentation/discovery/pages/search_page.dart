import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../domain/entities/enums.dart';
import '../../../domain/entities/song.dart';
import '../../../domain/usecases/discovery/search_songs.dart';
import '../../../domain/repositories/base_repository.dart';
import '../../../core/di/injection.dart';
import '../../../core/utils/constants.dart';
import '../../shared/widgets/song_card.dart';
import '../../shared/widgets/loading_indicator.dart';
import '../../shared/widgets/error_view.dart';
import '../../shared/widgets/ethnic_group_selector.dart';
import '../../shared/widgets/instrument_selector.dart';
import '../../auth/providers/auth_provider.dart';

/// Search state
class SearchState {
  final String? query;
  final List<String>? ethnicGroupIds;
  final List<String>? instrumentIds;
  final List<MusicGenre>? genres;
  final List<ContextType>? contextTypes;
  final String? province;
  final VerificationStatus? verificationStatus;

  SearchState({
    this.query,
    this.ethnicGroupIds,
    this.instrumentIds,
    this.genres,
    this.contextTypes,
    this.province,
    this.verificationStatus,
  });

  SearchState copyWith({
    String? query,
    List<String>? ethnicGroupIds,
    List<String>? instrumentIds,
    List<MusicGenre>? genres,
    List<ContextType>? contextTypes,
    String? province,
    VerificationStatus? verificationStatus,
  }) {
    return SearchState(
      query: query ?? this.query,
      ethnicGroupIds: ethnicGroupIds ?? this.ethnicGroupIds,
      instrumentIds: instrumentIds ?? this.instrumentIds,
      genres: genres ?? this.genres,
      contextTypes: contextTypes ?? this.contextTypes,
      province: province ?? this.province,
      verificationStatus: verificationStatus ?? this.verificationStatus,
    );
  }
}

/// Search provider
final searchProvider = StateNotifierProvider<SearchNotifier, SearchState>(
  (ref) => SearchNotifier(),
);

class SearchNotifier extends StateNotifier<SearchState> {
  SearchNotifier() : super(SearchState());

  void updateQuery(String? query) {
    state = state.copyWith(query: query);
  }

  void updateEthnicGroups(List<String>? ids) {
    state = state.copyWith(ethnicGroupIds: ids);
  }

  void updateInstruments(List<String>? ids) {
    state = state.copyWith(instrumentIds: ids);
  }

  void updateGenres(List<MusicGenre>? genres) {
    state = state.copyWith(genres: genres);
  }

  void updateContextTypes(List<ContextType>? types) {
    state = state.copyWith(contextTypes: types);
  }

  void updateProvince(String? province) {
    state = state.copyWith(province: province);
  }

  void updateVerificationStatus(VerificationStatus? status) {
    state = state.copyWith(verificationStatus: status);
  }

  void clearFilters() {
    state = SearchState();
  }
}

/// Search results provider
final searchResultsProvider = FutureProvider.family<
    PaginatedResponse<Song>,
    SearchState>((ref, searchState) async {
  final useCase = getIt<SearchSongs>();
  final user = ref.watch(currentUserProvider);
  final role = user?.role ?? UserRole.researcher;
  final result = await useCase(
    query: searchState.query,
    ethnicGroupIds: searchState.ethnicGroupIds,
    instrumentIds: searchState.instrumentIds,
    genres: searchState.genres,
    contextTypes: searchState.contextTypes,
    province: searchState.province,
    verificationStatus: searchState.verificationStatus,
    userRole: role,
    currentUserId: user?.id,
    params: const QueryParams(),
  );
  return result.fold(
    (failure) => throw failure,
    (response) => response,
  );
});

class SearchPage extends ConsumerStatefulWidget {
  const SearchPage({super.key});

  @override
  ConsumerState<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends ConsumerState<SearchPage> {
  final _searchController = TextEditingController();
  bool _showFilters = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _performSearch() {
    ref.read(searchProvider.notifier).updateQuery(_searchController.text);
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(searchProvider);
    final resultsAsync = ref.watch(searchResultsProvider(searchState));

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          decoration: const InputDecoration(
            hintText: 'Tìm kiếm bài hát...',
            border: InputBorder.none,
          ),
          onSubmitted: (_) => _performSearch(),
        ),
        actions: [
          IconButton(
            icon: Icon(_showFilters ? Icons.filter_alt : Icons.filter_alt_outlined),
            onPressed: () {
              setState(() => _showFilters = !_showFilters);
            },
          ),
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: _performSearch,
          ),
        ],
      ),
      body: Column(
        children: [
          // Filters
          if (_showFilters)
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.grey[100],
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Bộ lọc',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      TextButton(
                        onPressed: () {
                          ref.read(searchProvider.notifier).clearFilters();
                        },
                        child: const Text('Xóa bộ lọc'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Genre checkboxes
                  Text(
                    'Thể loại',
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  Wrap(
                    spacing: 8,
                    children: MusicGenre.values.map((genre) {
                      final isSelected = searchState.genres?.contains(genre) ?? false;
                      return FilterChip(
                        label: Text(_getGenreText(genre)),
                        selected: isSelected,
                        onSelected: (selected) {
                          final currentGenres = searchState.genres ?? [];
                          final newGenres = selected
                              ? [...currentGenres, genre]
                              : currentGenres.where((g) => g != genre).toList();
                          ref.read(searchProvider.notifier).updateGenres(
                                newGenres.isEmpty ? null : newGenres,
                              );
                        },
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          // Results
          Expanded(
            child: resultsAsync.when(
              data: (response) {
                if (response.items.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.search_off, size: 64, color: Colors.grey[400]),
                        const SizedBox(height: 16),
                        Text(
                          'Không tìm thấy kết quả',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  itemCount: response.items.length,
                  itemBuilder: (context, index) {
                    final song = response.items[index];
                    return SongCard(
                      song: song,
                      onTap: () {
                        context.push('/discover/song/${song.id}');
                      },
                    );
                  },
                );
              },
              loading: () => const LoadingIndicator(),
              error: (error, stack) => ErrorView(
                message: 'Error searching: $error',
                onRetry: () {
                  ref.invalidate(searchResultsProvider(searchState));
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getGenreText(MusicGenre genre) {
    switch (genre) {
      case MusicGenre.folk:
        return 'Dân ca';
      case MusicGenre.ceremonial:
        return 'Nghi lễ';
      case MusicGenre.courtMusic:
        return 'Nhã nhạc';
      case MusicGenre.operatic:
        return 'Tuồng';
      case MusicGenre.contemporary:
        return 'Đương đại';
    }
  }
}
