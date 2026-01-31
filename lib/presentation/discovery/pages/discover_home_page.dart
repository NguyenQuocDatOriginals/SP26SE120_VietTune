import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../domain/entities/enums.dart';
import '../../../domain/usecases/discovery/get_featured_songs.dart';
import '../../../domain/usecases/reference/get_ethnic_groups.dart';
import '../../../domain/usecases/reference/get_instruments.dart';
import '../../../core/di/injection.dart';
import '../../../core/theme/app_theme.dart';
import '../../../domain/repositories/base_repository.dart';
import '../../shared/widgets/error_view.dart';
import '../../shared/widgets/sliver_ai_app_bar.dart';
import '../../shared/widgets/ethnic_categories_list.dart';
import '../../shared/widgets/hero_heritage_card.dart';
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
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(featuredSongsProvider);
            ref.invalidate(ethnicGroupsListProvider);
            ref.invalidate(instrumentsListProvider);
          },
        color: AppColors.primary,
        child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // SliverAIAppBar with gradient border search
            const SliverAIAppBar(),
            // Ethnic Categories List with Brocade pattern
            SliverToBoxAdapter(
              child: ref.watch(ethnicGroupsListProvider).when(
                data: (groups) => EthnicCategoriesList(
                  ethnicGroups: groups,
                ),
                loading: () => const SizedBox(
                  height: 120,
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (error, stack) => const SizedBox.shrink(),
              ),
            ),
            const SliverPadding(padding: EdgeInsets.only(top: 24)),
            // Hero Heritage Card with waveform
            SliverToBoxAdapter(
              child: ref.watch(featuredSongsProvider).when(
                data: (songs) {
                  if (songs.isEmpty) return const SizedBox.shrink();
                  return HeroHeritageCard(
                    song: songs.first,
                    artistName: 'Nghệ nhân dân gian',
                  );
                },
                loading: () => const SizedBox(
                  height: 320,
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (error, stack) => const SizedBox.shrink(),
              ),
            ),
            const SliverPadding(padding: EdgeInsets.only(top: 24)),
            // Instruments section
            _buildInstrumentsSection(context, ref),
            // Bottom padding to avoid nav overlap
            const SliverPadding(padding: EdgeInsets.only(bottom: 96)),
          ],
        ),
      ),
    );
  }



  /// Instruments section with grid layout
  Widget _buildInstrumentsSection(BuildContext context, WidgetRef ref) {
    final instrumentsAsync = ref.watch(instrumentsListProvider);

    return SliverToBoxAdapter(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader(context, 'Nhạc cụ truyền thống', 'Xem tất cả'),
          const SizedBox(height: 16),
          instrumentsAsync.when(
            data: (instruments) {
              return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
                child: GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 1.1,
                  ),
                  itemCount: instruments.length > 6 ? 6 : instruments.length,
            itemBuilder: (context, index) {
                    final instrument = instruments[index];
                    return _buildInstrumentCard(context, instrument);
            },
          ),
        );
      },
            loading: () => const Padding(
              padding: EdgeInsets.all(40),
        child: Center(
                child: CircularProgressIndicator(),
        ),
      ),
            error: (error, stack) => ErrorView(
              message: 'Lỗi khi tải nhạc cụ',
              onRetry: () {
                ref.invalidate(instrumentsListProvider);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInstrumentCard(BuildContext context, instrument) {
    return GestureDetector(
      onTap: () => context.push('/discover/instrument/${instrument.id}'),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: AppColors.secondary.withValues(alpha: 0.08),
              blurRadius: 12,
              offset: const Offset(0, 4),
              spreadRadius: 0,
            ),
          ],
        ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
              padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                color: AppColors.secondary.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: PhosphorIcon(
                PhosphorIconsLight.musicNotes,
                size: 32,
                color: AppColors.secondary,
                            ),
                          ),
                          const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text(
                          instrument.name,
                style: AppTypography.labelLarge(color: AppColors.textPrimary),
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
            );
  }

  /// Section header with title and action
  Widget _buildSectionHeader(BuildContext context, String title, String action) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Row(
            children: [
              Container(
                width: 4,
                height: 24,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      AppColors.primary,
                      AppColors.warning,
                    ],
                  ),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: AppTypography.heading3(),
              ),
            ],
          ),
          GestureDetector(
            onTap: () {
              // TODO: Navigate to full list
            },
            child: Text(
              action,
              style: AppTypography.labelLarge(color: AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }
}
