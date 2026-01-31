import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../../domain/entities/enums.dart';
import '../../../domain/entities/song.dart';
import '../../../core/di/injection.dart';
import '../../../core/services/guest_favorite_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_size_tokens.dart';
import '../../../core/utils/constants.dart';
import '../providers/song_providers.dart';
import '../widgets/song_detail_content.dart';
import '../../shared/widgets/error_view.dart';
import '../../shared/widgets/player_section.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../domain/usecases/discovery/toggle_favorite.dart';

/// Unified Song Experience (Option A): one screen with 40% fixed player on top
/// and 60% scrollable detail below. Tap song from anywhere opens this page.
class UnifiedSongPage extends ConsumerStatefulWidget {
  final String songId;

  const UnifiedSongPage({super.key, required this.songId});

  @override
  ConsumerState<UnifiedSongPage> createState() => _UnifiedSongPageState();
}

class _UnifiedSongPageState extends ConsumerState<UnifiedSongPage> {
  bool _isFavorite = false;
  bool _isLoadingFavorite = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkFavoriteStatus());
  }

  Future<void> _checkFavoriteStatus() async {
    final user = ref.read(currentUserProvider);
    if (user == null) {
      final guestService = getIt<GuestFavoriteService>();
      final isFav = await guestService.isFavorite(widget.songId);
      if (mounted) setState(() => _isFavorite = isFav);
    } else {
      // TODO: server-side favorite check
      if (mounted) setState(() => _isFavorite = false);
    }
  }

  Future<void> _toggleFavorite() async {
    final user = ref.read(currentUserProvider);
    if (user == null) {
      setState(() => _isLoadingFavorite = true);
      final guestService = getIt<GuestFavoriteService>();
      if (_isFavorite) {
        await guestService.removeFavorite(widget.songId);
      } else {
        await guestService.addFavorite(widget.songId);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text(
                'Đã lưu vào danh sách yêu thích (chỉ trên thiết bị này)',
              ),
              action: SnackBarAction(
                label: 'Đăng nhập để đồng bộ',
                onPressed: () => context.push(AppRoutes.authLogin),
              ),
              duration: const Duration(seconds: 4),
            ),
          );
        }
      }
      if (mounted) setState(() {
        _isFavorite = !_isFavorite;
        _isLoadingFavorite = false;
      });
    } else {
      setState(() => _isLoadingFavorite = true);
      await getIt<ToggleFavorite>()(songId: widget.songId, userId: user.id);
      if (mounted) setState(() {
        _isFavorite = !_isFavorite;
        _isLoadingFavorite = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final songAsync = ref.watch(songByIdProvider(widget.songId));
    final user = ref.watch(currentUserProvider);
    final height = MediaQuery.sizeOf(context).height;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Bài hát'),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        actions: [
          IconButton(
            icon: PhosphorIcon(
              PhosphorIconsLight.heart,
              color: _isFavorite ? AppColors.primary : null,
            ),
            onPressed: _isLoadingFavorite ? null : _toggleFavorite,
          ),
        ],
      ),
      body: songAsync.when(
        data: (song) {
          final playerHeight = _playerSectionHeight(height);
          final hasAudio = song.audioMetadata != null;
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(
                height: playerHeight,
                child: hasAudio
                    ? PlayerSection(
                        audioUrl: song.audioMetadata!.url,
                        title: song.title,
                        artist: song.audioMetadata!.performerNames?.isNotEmpty == true
                            ? song.audioMetadata!.performerNames!.first
                            : null,
                        imageUrl: null,
                        duration: Duration(
                          seconds: song.audioMetadata!.durationInSeconds,
                        ),
                        metadataChipLabels: _metadataChipLabels(song),
                        onClose: null,
                        maxHeight: playerHeight,
                      )
                    : _NoAudioPlaceholder(songTitle: song.title),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: SongDetailContent(
                    song: song,
                    user: user,
                    onShowMessage: (msg) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(msg)),
                      );
                    },
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => _UnifiedSongLoadingSkeleton(
          playerHeight: _playerSectionHeight(height),
        ),
        error: (error, stack) => ErrorView(
          message: 'Không tải được bài hát: $error',
          onRetry: () => ref.invalidate(songByIdProvider(widget.songId)),
        ),
      ),
    );
  }

  double _playerSectionHeight(double screenHeight) {
    final isSmallScreen = screenHeight < AppSizeTokens.kSmallScreenHeightBreakpoint;
    final fraction = isSmallScreen
        ? AppSizeTokens.kPlayerSectionSmallScreenFraction
        : AppSizeTokens.kPlayerSectionFraction;
    final fractionHeight = screenHeight * fraction;
    if (fractionHeight < AppSizeTokens.kPlayerSectionMinHeight) {
      return AppSizeTokens.kPlayerSectionMinHeight;
    }
    return fractionHeight;
  }

  List<String> _metadataChipLabels(Song song) {
    final labels = <String>[_genreLabel(song.genre)];
    if (song.audioMetadata?.recordingLocation?.province != null) {
      labels.add(song.audioMetadata!.recordingLocation!.province!);
    }
    return labels;
  }

  String _genreLabel(MusicGenre genre) {
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

/// Skeleton shown while song is loading. Matches 40/60 layout.
class _UnifiedSongLoadingSkeleton extends StatelessWidget {
  final double playerHeight;

  const _UnifiedSongLoadingSkeleton({required this.playerHeight});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Player section skeleton
        Container(
          height: playerHeight,
          color: AppColors.surface,
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: AppColors.divider,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  width: 160,
                  height: 16,
                  decoration: BoxDecoration(
                    color: AppColors.divider,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  width: 100,
                  height: 12,
                  decoration: BoxDecoration(
                    color: AppColors.divider,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ],
            ),
          ),
        ),
        // Detail section skeleton
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 120,
                  height: 24,
                  decoration: BoxDecoration(
                    color: AppColors.divider,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  width: double.infinity,
                  height: 20,
                  decoration: BoxDecoration(
                    color: AppColors.divider,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  width: 200,
                  height: 16,
                  decoration: BoxDecoration(
                    color: AppColors.divider,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(height: 24),
                Container(
                  width: 80,
                  height: 20,
                  decoration: BoxDecoration(
                    color: AppColors.divider,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.divider,
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

/// Shown when song has no audio metadata.
class _NoAudioPlaceholder extends StatelessWidget {
  final String songTitle;

  const _NoAudioPlaceholder({required this.songTitle});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: AppColors.surface,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.music_off, size: 48, color: AppColors.textSecondary),
            const SizedBox(height: 12),
            Text(
              songTitle,
              style: AppTypography.titleSmall(color: AppColors.textPrimary),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Không có bản ghi âm',
              style: AppTypography.bodySmall(color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}
