import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/contribution_providers.dart';
import '../../../domain/entities/enums.dart';
import '../../../core/utils/extensions.dart';
import '../../shared/widgets/status_badge.dart';
import '../../shared/widgets/genre_tag.dart';
import '../../shared/widgets/loading_indicator.dart';
import '../../shared/widgets/error_view.dart';
import '../../../core/theme/app_theme.dart';

class ContributionDetailPage extends ConsumerWidget {
  final String contributionId;

  const ContributionDetailPage({super.key, required this.contributionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final contributionAsync = ref.watch(
      contributionByIdProvider(contributionId),
    );

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Chi tiết đóng góp'),
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.textOnGradient,
      ),
      body: Container(
        decoration: AppTheme.gradientBackground,
        child: SafeArea(
          child: contributionAsync.when(
            data: (contribution) {
              final song = contribution.songData;
              return SingleChildScrollView(
                padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Status badge
                StatusBadge(status: contribution.status),
                const SizedBox(height: 24),
                const SizedBox(height: 20),
                // Song title
                if (song != null) ...[
                  Text(
                    song.title,
                    style: AppTypography.heading4(color: AppColors.textOnGradient).copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Genre
                  GenreTag(label: _getGenreText(song.genre)),
                  const SizedBox(height: 24),
                  // Submitted date
                  if (contribution.submittedAt != null)
                    Text(
                      'Gửi lúc: ${contribution.submittedAt!.toVietnameseDateTime()}',
                      style: AppTypography.bodyMedium(),
                    ),
                  const SizedBox(height: 16),
                  // Review comments
                  if (contribution.reviewComments != null) ...[
                    Card(
                      color: Colors.orange[50],
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Nhận xét từ người duyệt:',
                              style: AppTypography.titleSmall(),
                            ),
                            const SizedBox(height: 8),
                            Text(contribution.reviewComments!),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                  // Song details
                  if (song.description != null) ...[
                    Text(
                      'Mô tả',
                      style: AppTypography.titleMedium(),
                    ),
                    const SizedBox(height: 8),
                    Text(song.description!),
                    const SizedBox(height: 24),
                  ],
                ],
              ],
            ),
          );
        },
            loading: () => const LoadingIndicator(),
            error: (error, stack) => ErrorView(
              message: 'Lỗi khi tải chi tiết: $error',
              onRetry: () {
                ref.invalidate(contributionByIdProvider(contributionId));
              },
            ),
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
