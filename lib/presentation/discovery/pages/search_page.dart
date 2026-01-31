import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:go_router/go_router.dart';
import '../../../domain/entities/enums.dart';
import '../../../domain/entities/song.dart';
import '../../../domain/usecases/discovery/search_songs.dart';
import '../../../domain/repositories/base_repository.dart';
import '../../../core/di/injection.dart';
import '../../../core/utils/constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/data/facet_suggestion.dart';
import '../../../core/data/semantic_search_params.dart';
import '../../../core/services/semantic_mapper.dart';
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
  final String? initialQuery;
  final List<String>? initialEthnicGroupIds;
  final List<String>? initialInstrumentIds;
  final String? initialRegion;

  const SearchPage({
    super.key,
    this.initialQuery,
    this.initialEthnicGroupIds,
    this.initialInstrumentIds,
    this.initialRegion,
  });

  @override
  ConsumerState<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends ConsumerState<SearchPage> {
  final _searchController = TextEditingController();
  bool _showFilters = false;
  List<FacetSuggestion> _suggestions = [];
  static const _suggestionDebounceMs = 200;
  Timer? _suggestionTimer;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchTextChanged);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final notifier = ref.read(searchProvider.notifier);
      if (widget.initialQuery != null && widget.initialQuery!.trim().isNotEmpty) {
        _searchController.text = widget.initialQuery!;
        final params = getIt<SemanticMapper>().parse(widget.initialQuery!);
        _applySemanticParams(notifier, params);
      }
      if (widget.initialEthnicGroupIds != null) {
        notifier.updateEthnicGroups(widget.initialEthnicGroupIds);
      }
      if (widget.initialInstrumentIds != null) {
        notifier.updateInstruments(widget.initialInstrumentIds);
      }
    });
  }

  void _onSearchTextChanged() {
    _suggestionTimer?.cancel();
    _suggestionTimer = Timer(
      const Duration(milliseconds: _suggestionDebounceMs),
      () {
        if (!mounted) return;
        final prefix = _searchController.text;
        setState(() {
          _suggestions = getIt<SemanticMapper>().getSuggestions(prefix);
        });
      },
    );
  }

  void _applySemanticParams(SearchNotifier notifier, SemanticSearchParams params) {
    notifier.updateQuery(params.query);
    notifier.updateContextTypes(params.contextTypes);
    notifier.updateGenres(params.genres);
    notifier.updateProvince(params.province);
    notifier.updateEthnicGroups(params.ethnicGroupIds);
    notifier.updateInstruments(params.instrumentIds);
  }

  @override
  void dispose() {
    _suggestionTimer?.cancel();
    _searchController.removeListener(_onSearchTextChanged);
    _searchController.dispose();
    super.dispose();
  }

  void _performSearch() {
    final query = _searchController.text.trim();
    final notifier = ref.read(searchProvider.notifier);
    final params = getIt<SemanticMapper>().parse(query);
    _applySemanticParams(notifier, params);
  }

  /// Khi bấm icon search: có text thì chạy tìm kiếm; luôn cập nhật gợi ý
  /// (gợi ý mặc định nếu ô trống, gợi ý theo prefix nếu có text).
  void _onSearchIconPressed() {
    final query = _searchController.text.trim();
    final mapper = getIt<SemanticMapper>();
    if (query.isEmpty) {
      setState(() {
        _suggestions = mapper.getDefaultSuggestions();
      });
    } else {
      _performSearch();
      setState(() {
        _suggestions = mapper.getSuggestions(query);
      });
    }
  }

  /// Gợi ý đã nằm trong filter hiện tại thì không hiển thị (tránh trùng tag).
  bool _isSuggestionAlreadyApplied(FacetSuggestion s, SearchState state) {
    switch (s.kind) {
      case FacetSuggestionKind.contextType:
        return (state.contextTypes ?? []).contains(s.value);
      case FacetSuggestionKind.musicGenre:
        return (state.genres ?? []).contains(s.value);
      case FacetSuggestionKind.province:
        return state.province == s.value;
      case FacetSuggestionKind.ethnicGroup:
        return (state.ethnicGroupIds ?? []).contains(s.value);
      case FacetSuggestionKind.instrument:
        return (state.instrumentIds ?? []).contains(s.value);
    }
  }

  void _applySuggestion(FacetSuggestion s) {
    final notifier = ref.read(searchProvider.notifier);
    final state = ref.read(searchProvider);
    switch (s.kind) {
      case FacetSuggestionKind.contextType:
        final next = <ContextType>[
          ...(state.contextTypes ?? <ContextType>[]),
          s.value as ContextType,
        ];
        notifier.updateContextTypes(next);
        break;
      case FacetSuggestionKind.musicGenre:
        final next = <MusicGenre>[
          ...(state.genres ?? <MusicGenre>[]),
          s.value as MusicGenre,
        ];
        notifier.updateGenres(next);
        break;
      case FacetSuggestionKind.province:
        notifier.updateProvince(s.value as String);
        break;
      case FacetSuggestionKind.ethnicGroup:
        final next = <String>[
          ...(state.ethnicGroupIds ?? <String>[]),
          s.value as String,
        ];
        notifier.updateEthnicGroups(next);
        break;
      case FacetSuggestionKind.instrument:
        final next = <String>[
          ...(state.instrumentIds ?? <String>[]),
          s.value as String,
        ];
        notifier.updateInstruments(next);
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(searchProvider);
    final resultsAsync = ref.watch(searchResultsProvider(searchState));

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        titleSpacing: 0,
        title: Container(
          height: 44,
          margin: const EdgeInsets.only(right: 8),
          decoration: BoxDecoration(
            color: AppColors.surface.withValues(alpha: 0.95),
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: AppColors.border.withValues(alpha: 0.8)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.06),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: TextField(
            controller: _searchController,
            style: AppTypography.bodyLarge(color: AppColors.textPrimary),
            decoration: InputDecoration(
              hintText: 'Tìm kiếm bài hát...',
              hintStyle: AppTypography.bodyLarge(color: AppColors.textSecondary),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
            onSubmitted: (_) => _performSearch(),
          ),
        ),
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.textPrimary,
        actions: [
          IconButton(
            icon: PhosphorIcon(
              PhosphorIconsLight.funnel,
              color: _showFilters ? AppColors.primary : AppColors.textPrimary,
            ),
            onPressed: () {
              setState(() => _showFilters = !_showFilters);
            },
          ),
          IconButton(
            icon: PhosphorIcon(PhosphorIconsLight.magnifyingGlass, color: AppColors.textPrimary),
            onPressed: _onSearchIconPressed,
          ),
        ],
      ),
      body: Container(
        decoration: AppTheme.gradientBackground,
        child: SafeArea(
          child: Column(
        children: [
          // Phase 4: Autocomplete suggestions (tap to add filter) — ẩn gợi ý đã áp dụng
          Builder(
            builder: (context) {
              final toShow = _suggestions
                  .where((s) => !_isSuggestionAlreadyApplied(s, searchState))
                  .toList();
              if (toShow.isEmpty) return const SizedBox.shrink();
              return Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          'Gợi ý',
                          style: AppTypography.labelSmall(color: AppColors.textSecondary),
                        ),
                        Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () {
                              setState(() => _suggestions = []);
                            },
                            borderRadius: BorderRadius.circular(6),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                              child: Text(
                                'Hủy gợi ý',
                                style: AppTypography.labelSmall(color: AppColors.textSecondary),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: toShow.map((s) {
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              onTap: () => _applySuggestion(s),
                              borderRadius: BorderRadius.circular(20),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                decoration: BoxDecoration(
                                  color: AppColors.surface,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: AppColors.primary.withValues(alpha: 0.5),
                                    width: 1.5,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppColors.primary.withValues(alpha: 0.08),
                                      blurRadius: 6,
                                      offset: const Offset(0, 1),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    PhosphorIcon(
                                      PhosphorIconsLight.plus,
                                      size: 18,
                                      color: AppColors.primary,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      s.displayLabel,
                                      style: AppTypography.labelMedium(color: AppColors.primary),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
          // Semantic filter chips (Phase 3)
          _SemanticFilterChips(searchState: searchState),
          // Filters
          if (_showFilters)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
              decoration: BoxDecoration(
                color: AppColors.surface,
                border: Border(
                  top: BorderSide(color: AppColors.divider, width: 1),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        'Bộ lọc',
                        style: AppTypography.heading5(color: AppColors.textPrimary),
                      ),
                      Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: () {
                            ref.read(searchProvider.notifier).clearFilters();
                          },
                          borderRadius: BorderRadius.circular(8),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                PhosphorIcon(
                                  PhosphorIconsLight.trash,
                                  size: 18,
                                  color: AppColors.textSecondary,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  'Xóa bộ lọc',
                                  style: AppTypography.labelMedium(color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Thể loại',
                    style: AppTypography.labelLarge(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: MusicGenre.values.map((genre) {
                      final isSelected = searchState.genres?.contains(genre) ?? false;
                      return FilterChip(
                        label: Text(
                          _getGenreText(genre),
                          style: AppTypography.labelMedium(
                            color: isSelected
                                ? AppColors.textOnPrimary
                                : AppColors.textPrimary,
                          ),
                        ),
                        selected: isSelected,
                        onSelected: (selected) {
                          final currentGenres = searchState.genres ?? [];
                          final newGenres = selected
                              ? [...currentGenres, genre]
                              : currentGenres.where((g) => g != genre).toList();
                          ref.read(searchProvider.notifier).updateGenres(newGenres);
                        },
                        selectedColor: AppColors.primary,
                        backgroundColor: AppColors.backgroundDark,
                        side: BorderSide(
                          color: isSelected
                              ? AppColors.primary
                              : AppColors.border,
                          width: isSelected ? 1.5 : 1,
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
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
                        PhosphorIcon(PhosphorIconsLight.ghost, size: 64, color: AppColors.textSecondary),
                        const SizedBox(height: 16),
                        Text(
                          'Không tìm thấy kết quả',
                          style: AppTypography.labelLarge(color: AppColors.textSecondary),
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
                        context.push('${AppRoutes.discoverSongPath}/${song.id}');
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
        ),
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

String _getContextTypeLabel(ContextType type) {
  switch (type) {
    case ContextType.wedding:
      return 'Đám cưới';
    case ContextType.funeral:
      return 'Đám tang';
    case ContextType.festival:
      return 'Lễ hội';
    case ContextType.religious:
      return 'Tôn giáo';
    case ContextType.entertainment:
      return 'Giải trí';
    case ContextType.work:
      return 'Lao động';
    case ContextType.lullaby:
      return 'Hát ru';
  }
}

/// Filter chips for semantic facets (Phase 3): show active filters with X to remove one.
class _SemanticFilterChips extends ConsumerWidget {
  final SearchState searchState;

  const _SemanticFilterChips({required this.searchState});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(searchProvider.notifier);
    final chips = <Widget>[];

    for (final type in searchState.contextTypes ?? []) {
      chips.add(
        _FilterChip(
          key: ValueKey('context_$type'),
          label: 'Bối cảnh: ${_getContextTypeLabel(type)}',
          onRemove: () {
            final next = (searchState.contextTypes ?? [])
                .where((t) => t != type)
                .toList();
            notifier.updateContextTypes(next);
          },
        ),
      );
    }
    for (final genre in searchState.genres ?? []) {
      chips.add(
        _FilterChip(
          key: ValueKey('genre_$genre'),
          label: 'Thể loại: ${_genreText(genre)}',
          onRemove: () {
            final next = (searchState.genres ?? [])
                .where((g) => g != genre)
                .toList();
            notifier.updateGenres(next);
          },
        ),
      );
    }
    if (searchState.province != null && searchState.province!.isNotEmpty) {
      chips.add(
        _FilterChip(
          key: ValueKey('province_${searchState.province}'),
          label: 'Tỉnh: ${searchState.province}',
          onRemove: () => notifier.updateProvince(null),
        ),
      );
    }
    for (final id in searchState.ethnicGroupIds ?? []) {
      chips.add(
        _FilterChip(
          key: ValueKey('ethnic_$id'),
          label: 'Dân tộc: $id',
          onRemove: () {
            final next = (searchState.ethnicGroupIds ?? [])
                .where((e) => e != id)
                .toList();
            notifier.updateEthnicGroups(next);
          },
        ),
      );
    }
    for (final id in searchState.instrumentIds ?? []) {
      chips.add(
        _FilterChip(
          key: ValueKey('instrument_$id'),
          label: 'Nhạc cụ: $id',
          onRemove: () {
            final next = (searchState.instrumentIds ?? [])
                .where((i) => i != id)
                .toList();
            notifier.updateInstruments(next);
          },
        ),
      );
    }

    if (chips.isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: chips,
      ),
    );
  }

  String _genreText(MusicGenre genre) {
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

class _FilterChip extends StatelessWidget {
  final String label;
  final VoidCallback onRemove;

  _FilterChip({super.key, required this.label, required this.onRemove});

  /// Minimum touch target 48dp (iOS/Android a11y).
  static const double _kRemoveButtonMinSize = 48;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.primaryDark.withValues(alpha: 0.3),
        ),
      ),
      padding: const EdgeInsets.only(left: 14, top: 6, bottom: 6, right: 2),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Flexible(
            child: Text(
              label,
              style: AppTypography.labelMedium(color: AppColors.textOnPrimary),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: onRemove,
            child: SizedBox(
              width: _kRemoveButtonMinSize,
              height: _kRemoveButtonMinSize,
              child: Center(
                child: PhosphorIcon(
                  PhosphorIconsLight.x,
                  size: 22,
                  color: AppColors.textOnPrimary,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
