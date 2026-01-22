import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../domain/entities/song.dart';
import '../../../domain/entities/enums.dart';
import '../../../domain/usecases/reference/get_ethnic_groups.dart';
import '../../../domain/usecases/discovery/get_songs_by_ethnic_group.dart';
import '../../../domain/repositories/base_repository.dart';
import '../../../core/di/injection.dart';
import '../../../core/utils/constants.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/theme/app_theme.dart';
import '../../shared/widgets/song_card.dart';
import '../../shared/widgets/loading_indicator.dart';
import '../../shared/widgets/error_view.dart';
import '../../auth/providers/auth_provider.dart';

/// Provider for ethnic group by ID
final ethnicGroupByIdProvider = FutureProvider.family((ref, String ethnicGroupId) async {
  final useCase = getIt<GetEthnicGroups>();
  final result = await useCase(params: const QueryParams());
  return result.fold(
    (failure) => throw failure,
    (response) => response.items.firstWhere(
      (group) => group.id == ethnicGroupId,
      orElse: () => throw Exception('Ethnic group not found'),
    ),
  );
});

/// Provider for songs by ethnic group
final songsByEthnicGroupProvider = FutureProvider.family<
    PaginatedResponse<Song>,
    String>((ref, ethnicGroupId) async {
  final useCase = getIt<GetSongsByEthnicGroup>();
  final user = ref.watch(currentUserProvider);
  final role = user?.role ?? UserRole.researcher;
  final result = await useCase(
    ethnicGroupId: ethnicGroupId,
    params: const QueryParams(),
    userRole: role,
    currentUserId: user?.id,
  );
  return result.fold(
    (failure) => throw failure,
    (response) => response,
  );
});

class EthnicGroupDetailPage extends ConsumerWidget {
  final String ethnicGroupId;

  const EthnicGroupDetailPage({super.key, required this.ethnicGroupId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final groupAsync = ref.watch(ethnicGroupByIdProvider(ethnicGroupId));
    final songsAsync = ref.watch(songsByEthnicGroupProvider(ethnicGroupId));

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text(
          'Chi tiết dân tộc',
          style: AppTypography.heading4(color: AppColors.textOnGradient),
        ),
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.textOnGradient,
      ),
      body: Container(
        decoration: AppTheme.gradientBackground,
        child: SafeArea(
          child: groupAsync.when(
            data: (group) {
              return SingleChildScrollView(
                padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                // Group name
                Text(
                  group.name,
                  style: AppTypography.heading2(color: AppColors.textOnGradient),
                ),
                if (group.nameInNativeLanguage != group.name) ...[
                  const SizedBox(height: 8),
                  Text(
                    group.nameInNativeLanguage,
                    style: AppTypography.heading5(color: AppColors.textSecondaryOnGradient),
                  ),
                ],
                const SizedBox(height: 16),
                // Region
                Chip(
                  label: Text(group.region),
                ),
                const SizedBox(height: 24),
                // Description
                if (group.description != null && group.description!.isNotEmpty) ...[
                  Text(
                    'Mô tả',
                    style: AppTypography.heading5(color: AppColors.textOnGradient),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    group.description!,
                    style: AppTypography.bodyLarge(color: AppColors.textSecondaryOnGradient),
                  ),
                  const SizedBox(height: 24),
                ],
                // Stats
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStatItem(
                          context,
                          'Dân số',
                          '${group.population.toVietnameseNumber()}',
                        ),
                        _buildStatItem(
                          context,
                          'Ngôn ngữ',
                          group.languageFamily,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                // Songs from this ethnic group
                Text(
                  'Bài hát của dân tộc này',
                  style: AppTypography.heading5(color: AppColors.textOnGradient),
                ),
                const SizedBox(height: 16),
                songsAsync.when(
                  data: (response) {
                    if (response.items.isEmpty) {
                      return const Text('Chưa có bài hát nào');
                    }
                    return ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
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
                    message: 'Error loading songs: $error',
                    onRetry: () {
                      ref.invalidate(songsByEthnicGroupProvider(ethnicGroupId));
                    },
                  ),
                ),
              ],
            ),
          );
        },
            loading: () => const LoadingIndicator(),
            error: (error, stack) => ErrorView(
              message: 'Error loading ethnic group: $error',
              onRetry: () {
                ref.invalidate(ethnicGroupByIdProvider(ethnicGroupId));
              },
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(BuildContext context, String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: AppTypography.heading4(color: AppColors.textPrimary),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: AppTypography.bodySmall(color: AppColors.textSecondary),
        ),
      ],
    );
  }
}
