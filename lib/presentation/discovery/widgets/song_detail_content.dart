import 'package:flutter/material.dart';
import '../../../domain/entities/enums.dart';
import '../../../domain/entities/song.dart';
import '../../../domain/entities/user.dart';
import '../../../domain/services/permission_guard.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/location_utils.dart';
import '../../shared/widgets/status_badge.dart';
import '../../shared/widgets/genre_tag.dart';

/// Scrollable detail content for a song: metadata, cultural context, lyrics,
/// description, stats, and action buttons. Used by [UnifiedSongPage] and
/// [SongDetailPage]. Does not include mini player or "Mở player full màn hình".
class SongDetailContent extends StatelessWidget {
  final Song song;
  final User? user;
  final void Function(String message) onShowMessage;

  const SongDetailContent({
    super.key,
    required this.song,
    required this.user,
    required this.onShowMessage,
  });

  @override
  Widget build(BuildContext context) {
    final currentUser = user;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          song.title,
          style: AppTypography.heading4(),
        ),
        if (song.alternativeTitles != null &&
            song.alternativeTitles!.isNotEmpty) ...[
          const SizedBox(height: 8),
          Text(
            song.alternativeTitles!.join(', '),
            style: AppTypography.bodyLarge(),
          ),
        ],
        const SizedBox(height: 16),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            StatusBadge(status: song.verificationStatus),
            GenreTag(label: _genreLabel(song.genre)),
          ],
        ),
        const SizedBox(height: 24),
        if (song.audioMetadata != null) ...[
          _buildSectionHeader(context, 'Thông tin'),
          _buildMetadataSection(context, song),
          const SizedBox(height: 24),
        ],
        if (song.culturalContext != null) ...[
          _buildSectionHeader(context, 'Bối cảnh văn hóa'),
          _buildCulturalContextSection(context, song),
          const SizedBox(height: 24),
        ],
        if (song.lyricsNativeScript != null ||
            song.lyricsVietnameseTranslation != null) ...[
          _buildSectionHeader(context, 'Lời bài hát'),
          _buildLyricsSection(context, song),
          const SizedBox(height: 24),
        ],
        if (song.description != null) ...[
          _buildSectionHeader(context, 'Mô tả'),
          Text(song.description!),
          const SizedBox(height: 24),
        ],
        _buildStatsSection(context, song),
        const SizedBox(height: 24),
        if (currentUser != null && PermissionGuard.canEditSong(song, currentUser))
          ElevatedButton(
            onPressed: () => onShowMessage(
              'Chức năng chỉnh sửa đang được phát triển.',
            ),
            child: const Text('Chỉnh sửa'),
          ),
        if (currentUser != null &&
            currentUser.role.canReviewContributions &&
            song.verificationStatus == VerificationStatus.pending) ...[
          const SizedBox(height: 12),
          Row(
            children: [
              ElevatedButton(
                onPressed: () => onShowMessage('Đã phê duyệt (mock).'),
                child: const Text('Phê duyệt'),
              ),
              const SizedBox(width: 12),
              OutlinedButton(
                onPressed: () => onShowMessage('Đã từ chối (mock).'),
                child: const Text('Từ chối'),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: AppTypography.titleLarge(),
      ),
    );
  }

  Widget _buildMetadataSection(BuildContext context, Song song) {
    final metadata = song.audioMetadata!;
    final recDate = metadata.recordingDate is DateTime
        ? metadata.recordingDate as DateTime
        : null;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (recDate != null)
              _buildMetadataRow(
                context,
                'Ngày ghi âm',
                recDate.toVietnameseDate(),
              ),
            if (metadata.recordingLocation != null)
              _buildMetadataRow(
                context,
                'Địa điểm',
                LocationUtils.formatVietnameseAddress(
                  metadata.recordingLocation!,
                ),
              ),
            if (metadata.performerNames != null &&
                metadata.performerNames!.isNotEmpty)
              _buildMetadataRow(
                context,
                'Người biểu diễn',
                metadata.performerNames!.join(', '),
              ),
            if (metadata.recordedBy != null)
              _buildMetadataRow(
                context,
                'Ghi âm bởi',
                metadata.recordedBy!,
              ),
            if (metadata.quality != null)
              _buildMetadataRow(
                context,
                'Chất lượng',
                (metadata.quality as AudioQuality).displayName,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetadataRow(
    BuildContext context,
    String label,
    String value,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: AppTypography.bodyMedium().copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: AppTypography.bodyMedium(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCulturalContextSection(BuildContext context, Song song) {
    final culturalContext = song.culturalContext!;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildMetadataRow(
              context,
              'Loại',
              _contextTypeLabel(culturalContext.type),
            ),
            if (culturalContext.season != null)
              _buildMetadataRow(context, 'Mùa', culturalContext.season!),
            if (culturalContext.occasion != null)
              _buildMetadataRow(context, 'Dịp', culturalContext.occasion!),
            if (culturalContext.significance != null)
              _buildMetadataRow(
                  context, 'Ý nghĩa', culturalContext.significance!),
            if (culturalContext.historicalBackground != null)
              _buildMetadataRow(
                context,
                'Bối cảnh lịch sử',
                culturalContext.historicalBackground!,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildLyricsSection(BuildContext context, Song song) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (song.lyricsNativeScript != null) ...[
              Text(
                'Ngôn ngữ gốc',
                style: AppTypography.titleSmall(),
              ),
              const SizedBox(height: 8),
              Text(song.lyricsNativeScript!),
              const SizedBox(height: 16),
            ],
            if (song.lyricsVietnameseTranslation != null) ...[
              Text(
                'Bản dịch tiếng Việt',
                style: AppTypography.titleSmall(),
              ),
              const SizedBox(height: 8),
              Text(song.lyricsVietnameseTranslation!),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatsSection(BuildContext context, Song song) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            if (song.playCount != null)
              _buildStatItem(context, 'Lượt nghe', '${song.playCount}'),
            if (song.favoriteCount != null)
              _buildStatItem(context, 'Yêu thích', '${song.favoriteCount}'),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(
      BuildContext context, String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: AppTypography.heading5(),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: AppTypography.bodySmall(),
        ),
      ],
    );
  }

  static String _genreLabel(MusicGenre genre) {
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

  static String _contextTypeLabel(ContextType type) {
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
        return 'Ru con';
    }
  }
}
