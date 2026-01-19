import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../domain/entities/enums.dart';
import '../../../domain/usecases/discovery/get_featured_songs.dart';
import '../../../domain/usecases/reference/get_ethnic_groups.dart';
import '../../../domain/usecases/reference/get_instruments.dart';
import '../../../core/di/injection.dart';
import '../../../core/utils/constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../../domain/repositories/base_repository.dart';
import '../../shared/widgets/song_card.dart';
import '../../shared/widgets/loading_indicator.dart';
import '../../shared/widgets/error_view.dart';
import '../../auth/providers/auth_provider.dart';

/// Provider for featured songs
final featuredSongsProvider = FutureProvider((ref) async {
  final useCase = getIt<GetFeaturedSongs>();
  final user = ref.watch(currentUserProvider);
  final role = user?.role ?? UserRole.researcher;
  final result = await useCase(
    limit: 10,
    userRole: role,
    currentUserId: user?.id,
  );
  return result.fold(
    (failure) => throw failure,
    (songs) => songs,
  );
});

/// Provider for ethnic groups
final ethnicGroupsListProvider = FutureProvider((ref) async {
  final useCase = getIt<GetEthnicGroups>();
  final result = await useCase();
  return result.fold(
    (failure) => throw failure,
    (response) => response.items,
  );
});

/// Provider for instruments
final instrumentsListProvider = FutureProvider((ref) async {
  final useCase = getIt<GetInstruments>();
  final result = await useCase(params: const QueryParams());
  return result.fold(
    (failure) => throw failure,
    (response) => response.items,
  );
});

class DiscoverHomePage extends ConsumerWidget {
  const DiscoverHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Khám phá'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => context.push(AppRoutes.discoverSearch),
            tooltip: 'Tìm kiếm',
          ),
        ],
      ),
      body: Container(
        decoration: AppTheme.gradientBackground,
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(featuredSongsProvider);
            ref.invalidate(ethnicGroupsListProvider);
            ref.invalidate(instrumentsListProvider);
          },
          color: AppColors.textOnGradient,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 80), // Space for AppBar
                // Featured Songs
                _buildSectionHeader(context, 'Bài hát nổi bật'),
                _buildFeaturedSongs(context, ref),
                const SizedBox(height: 32),
                // Browse by Ethnic Group
                _buildSectionHeader(context, 'Dân tộc'),
                _buildEthnicGroups(context, ref),
                const SizedBox(height: 32),
                // Browse by Instrument
                _buildSectionHeader(context, 'Nhạc cụ'),
                _buildInstruments(context, ref),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Text(
        title,
        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
          color: AppColors.textOnGradient,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildFeaturedSongs(BuildContext context, WidgetRef ref) {
    final featuredAsync = ref.watch(featuredSongsProvider);

    return featuredAsync.when(
      data: (songs) {
        if (songs.isEmpty) {
          return const SizedBox.shrink();
        }

        return SizedBox(
          height: 260,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: songs.length,
            itemBuilder: (context, index) {
              final song = songs[index];
              return SizedBox(
                width: 320,
                child: Padding(
                  padding: const EdgeInsets.only(right: 16),
                  child: SongCard(
                    song: song,
                    margin: const EdgeInsets.symmetric(horizontal: 0, vertical: 8),
                    onTap: () {
                      context.push('/discover/song/${song.id}');
                    },
                  ),
                ),
              );
            },
          ),
        );
      },
      loading: () => SizedBox(
        height: 260,
        child: Center(
          child: CircularProgressIndicator(
            color: AppColors.textOnGradient,
          ),
        ),
      ),
      error: (error, stack) => const SizedBox.shrink(),
    );
  }

  Widget _buildEthnicGroups(BuildContext context, WidgetRef ref) {
    final groupsAsync = ref.watch(ethnicGroupsListProvider);

    return groupsAsync.when(
      data: (groups) {
        return SizedBox(
          height: 160,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: groups.length,
            itemBuilder: (context, index) {
              final group = groups[index];
              return Padding(
                padding: const EdgeInsets.only(right: 16),
                child: Card(
                  elevation: 6,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: InkWell(
                    onTap: () {
                      context.push('/discover/ethnic-group/${group.id}');
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      width: 130,
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.primaryRed.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.people,
                              size: 36,
                              color: AppColors.primaryRed,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            group.name,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        );
      },
      loading: () => SizedBox(
        height: 160,
        child: Center(
          child: CircularProgressIndicator(
            color: AppColors.textOnGradient,
          ),
        ),
      ),
      error: (error, stack) => const SizedBox.shrink(),
    );
  }

  Widget _buildInstruments(BuildContext context, WidgetRef ref) {
    final instrumentsAsync = ref.watch(instrumentsListProvider);

    return instrumentsAsync.when(
      data: (instruments) {
        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 1.2,
          ),
          itemCount: instruments.length,
          itemBuilder: (context, index) {
            final instrument = instruments[index];
            return Card(
              elevation: 6,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: InkWell(
                onTap: () {
                  context.push('/discover/instrument/${instrument.id}');
                },
                borderRadius: BorderRadius.circular(16),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Flexible(
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.primaryGold.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            Icons.music_note,
                            size: 28,
                            color: AppColors.primaryGold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Flexible(
                        child: Text(
                          instrument.name,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
      loading: () => const LoadingIndicator(),
      error: (error, stack) => ErrorView(
        message: 'Error loading instruments',
        onRetry: () {
          ref.invalidate(instrumentsListProvider);
        },
      ),
    );
  }
}
