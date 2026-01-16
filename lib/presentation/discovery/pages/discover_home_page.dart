import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../domain/entities/song.dart';
import '../../../domain/entities/enums.dart';
import '../../../domain/usecases/discovery/get_featured_songs.dart';
import '../../../domain/usecases/reference/get_ethnic_groups.dart';
import '../../../domain/usecases/reference/get_instruments.dart';
import '../../../core/di/injection.dart';
import '../../../core/utils/constants.dart';
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
      appBar: AppBar(
        title: const Text('Khám phá'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => context.push(AppRoutes.discoverSearch),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(featuredSongsProvider);
          ref.invalidate(ethnicGroupsListProvider);
          ref.invalidate(instrumentsListProvider);
        },
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Featured Songs
              _buildSectionHeader(context, 'Bài hát nổi bật'),
              _buildFeaturedSongs(context, ref),
              const SizedBox(height: 24),
              // Browse by Ethnic Group
              _buildSectionHeader(context, 'Dân tộc'),
              _buildEthnicGroups(context, ref),
              const SizedBox(height: 24),
              // Browse by Instrument
              _buildSectionHeader(context, 'Nhạc cụ'),
              _buildInstruments(context, ref),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Text(
        title,
        style: Theme.of(context).textTheme.headlineSmall,
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
          height: 200,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: songs.length,
            itemBuilder: (context, index) {
              final song = songs[index];
              return SizedBox(
                width: 300,
                child: SongCard(
                  song: song,
                  onTap: () {
                    context.push('/discover/song/${song.id}');
                  },
                ),
              );
            },
          ),
        );
      },
      loading: () => const SizedBox(
        height: 200,
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (error, stack) => const SizedBox.shrink(),
    );
  }

  Widget _buildEthnicGroups(BuildContext context, WidgetRef ref) {
    final groupsAsync = ref.watch(ethnicGroupsListProvider);

    return groupsAsync.when(
      data: (groups) {
        return SizedBox(
          height: 150,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: groups.length,
            itemBuilder: (context, index) {
              final group = groups[index];
              return Padding(
                padding: const EdgeInsets.only(right: 12),
                child: Card(
                  child: InkWell(
                    onTap: () {
                      context.push('/discover/ethnic-group/${group.id}');
                    },
                    child: Container(
                      width: 120,
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.people,
                            size: 40,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            group.name,
                            style: Theme.of(context).textTheme.bodyMedium,
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
      loading: () => const SizedBox(
        height: 150,
        child: Center(child: CircularProgressIndicator()),
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
          padding: const EdgeInsets.all(16),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.5,
          ),
          itemCount: instruments.length,
          itemBuilder: (context, index) {
            final instrument = instruments[index];
            return Card(
              child: InkWell(
                onTap: () {
                  context.push('/discover/instrument/${instrument.id}');
                },
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.music_note,
                        size: 32,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        instrument.name,
                        style: Theme.of(context).textTheme.bodyMedium,
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
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
