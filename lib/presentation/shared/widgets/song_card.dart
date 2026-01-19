import 'package:flutter/material.dart';
import '../../../domain/entities/song.dart';
import '../../../domain/entities/enums.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/theme/app_theme.dart';
import 'status_badge.dart';

/// Song card widget for displaying songs in lists
class SongCard extends StatelessWidget {
  final Song song;
  final VoidCallback? onTap;
  final VoidCallback? onFavoriteTap;
  final EdgeInsets? margin;

  const SongCard({
    super.key,
    required this.song,
    this.onTap,
    this.onFavoriteTap,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: margin ?? const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Thumbnail
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  width: 80,
                  height: 80,
                  color: AppColors.divider,
                  child: song.audioMetadata?.url != null
                      ? const Icon(Icons.music_note, size: 40)
                      : const Icon(Icons.audio_file, size: 40),
                ),
              ),
              const SizedBox(width: 16),
              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            song.title,
                            style: Theme.of(context).textTheme.titleMedium,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (onFavoriteTap != null)
                          IconButton(
                            icon: const Icon(Icons.favorite_border),
                            onPressed: onFavoriteTap,
                            iconSize: 20,
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                      ],
                    ),
                    if (song.alternativeTitles != null &&
                        song.alternativeTitles!.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        song.alternativeTitles!.join(', '),
                        style: Theme.of(context).textTheme.bodySmall,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 4,
                      children: [
                        StatusBadge(status: song.verificationStatus),
                        Chip(
                          label: Text(
                            _getGenreText(song.genre),
                            style: Theme.of(context).textTheme.labelSmall,
                          ),
                          padding: EdgeInsets.zero,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          visualDensity: VisualDensity.compact,
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        if (song.playCount != null) ...[
                          Icon(
                            Icons.play_arrow,
                            size: 14,
                            color: AppColors.textSecondary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${song.playCount}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          const SizedBox(width: 16),
                        ],
                        if (song.audioMetadata != null) ...[
                          Icon(
                            Icons.access_time,
                            size: 14,
                            color: AppColors.textSecondary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            Duration(seconds: song.audioMetadata!.durationInSeconds)
                                .toMMSS(),
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ],
                    ),
                  ],
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
