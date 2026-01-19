import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../domain/entities/enums.dart';
import '../../../domain/usecases/discovery/get_song_by_id.dart';
import '../../../domain/usecases/discovery/toggle_favorite.dart';
import '../../../core/di/injection.dart';
import '../../../core/services/guest_favorite_service.dart';
import '../../../core/utils/constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../shared/widgets/audio_player_widget.dart';
import '../../shared/widgets/status_badge.dart';
import '../../shared/widgets/loading_indicator.dart';
import '../../shared/widgets/error_view.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/location_utils.dart';
import '../../../domain/services/permission_guard.dart';
import '../../auth/providers/auth_provider.dart';

/// Provider for song by ID
final songByIdProvider = FutureProvider.family((ref, String songId) async {
  final useCase = getIt<GetSongById>();
  final role = ref.watch(currentUserRoleProvider);
  final user = ref.watch(currentUserProvider);
  final result = await useCase(
    songId,
    userRole: role ?? UserRole.researcher,
    currentUserId: user?.id,
  );
  return result.fold(
    (failure) => throw failure,
    (song) => song,
  );
});

class SongDetailPage extends ConsumerStatefulWidget {
  final String songId;

  const SongDetailPage({super.key, required this.songId});

  @override
  ConsumerState<SongDetailPage> createState() => _SongDetailPageState();
}

class _SongDetailPageState extends ConsumerState<SongDetailPage> {
  bool _isFavorite = false;
  bool _isLoadingFavorite = false;

  @override
  void initState() {
    super.initState();
    _checkFavoriteStatus();
  }

  Future<void> _checkFavoriteStatus() async {
    final user = ref.read(currentUserProvider);

    if (user == null) {
      // Guest - check local storage
      final guestService = getIt<GuestFavoriteService>();
      final isFav = await guestService.isFavorite(widget.songId);
      if (mounted) {
        setState(() {
          _isFavorite = isFav;
        });
      }
    } else {
      // Authenticated - check from repository/use case
      // TODO: Implement server-side favorite check
      // For now, assume not favorite
      setState(() {
        _isFavorite = false;
      });
    }
  }

  Future<void> _toggleFavorite() async {
    final user = ref.read(currentUserProvider);

    if (user == null) {
      // Guest - save to local storage
      setState(() {
        _isLoadingFavorite = true;
      });

      final guestService = getIt<GuestFavoriteService>();

      if (_isFavorite) {
        await guestService.removeFavorite(widget.songId);
      } else {
        await guestService.addFavorite(widget.songId);

        // Show sync prompt
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text(
                'Đã lưu vào danh sách yêu thích (chỉ trên thiết bị này)',
              ),
              action: SnackBarAction(
                label: 'Đăng nhập để đồng bộ',
                onPressed: () {
                  context.push(AppRoutes.authLogin);
                },
              ),
              duration: const Duration(seconds: 4),
            ),
          );
        }
      }

      if (mounted) {
        setState(() {
          _isFavorite = !_isFavorite;
          _isLoadingFavorite = false;
        });
      }
    } else {
      // Authenticated - use existing toggle favorite use case
      setState(() {
        _isLoadingFavorite = true;
      });

      final useCase = getIt<ToggleFavorite>();
      await useCase(songId: widget.songId, userId: user.id);

      if (mounted) {
        setState(() {
          _isFavorite = !_isFavorite;
          _isLoadingFavorite = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final songAsync = ref.watch(songByIdProvider(widget.songId));
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết bài hát'),
        actions: [
          IconButton(
            icon: Icon(
              _isFavorite ? Icons.favorite : Icons.favorite_border,
              color: _isFavorite ? Colors.red : null,
            ),
            onPressed: _isLoadingFavorite ? null : _toggleFavorite,
          ),
        ],
      ),
      body: Container(
        decoration: AppTheme.gradientBackground,
        child: SafeArea(
          child: songAsync.when(
            data: (song) {
              return SingleChildScrollView(
                padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Text(
                  song.title,
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                if (song.alternativeTitles != null &&
                    song.alternativeTitles!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    song.alternativeTitles!.join(', '),
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                ],
                const SizedBox(height: 16),
                // Status and genre
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    StatusBadge(status: song.verificationStatus),
                    Chip(
                      label: Text(_getGenreText(song.genre)),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                // Audio player
                if (song.audioMetadata != null)
                  AudioPlayerWidget(
                    audioUrl: song.audioMetadata!.url,
                    title: song.title,
                    duration: Duration(
                      seconds: song.audioMetadata!.durationInSeconds,
                    ),
                  ),
                const SizedBox(height: 24),
                // Metadata section
                if (song.audioMetadata != null) ...[
                  _buildSectionHeader(context, 'Thông tin'),
                  _buildMetadataSection(context, song),
                  const SizedBox(height: 24),
                ],
                // Cultural context
                if (song.culturalContext != null) ...[
                  _buildSectionHeader(context, 'Bối cảnh văn hóa'),
                  _buildCulturalContextSection(context, song),
                  const SizedBox(height: 24),
                ],
                // Lyrics
                if (song.lyricsNativeScript != null ||
                    song.lyricsVietnameseTranslation != null) ...[
                  _buildSectionHeader(context, 'Lời bài hát'),
                  _buildLyricsSection(context, song),
                  const SizedBox(height: 24),
                ],
                // Description
                if (song.description != null) ...[
                  _buildSectionHeader(context, 'Mô tả'),
                  Text(song.description!),
                  const SizedBox(height: 24),
                ],
                // Stats
                _buildStatsSection(context, song),
                const SizedBox(height: 24),
                if (user != null && PermissionGuard.canEditSong(song, user))
                  ElevatedButton(
                    onPressed: () => _showActionMessage(
                      context,
                      'Chức năng chỉnh sửa đang được phát triển.',
                    ),
                    child: const Text('Chỉnh sửa'),
                  ),
                if (user != null &&
                    user.role.canReviewContributions &&
                    song.verificationStatus == VerificationStatus.pending)
                  Row(
                    children: [
                      ElevatedButton(
                        onPressed: () => _showActionMessage(
                          context,
                          'Đã phê duyệt (mock).',
                        ),
                        child: const Text('Phê duyệt'),
                      ),
                      const SizedBox(width: 12),
                      OutlinedButton(
                        onPressed: () => _showActionMessage(
                          context,
                          'Đã từ chối (mock).',
                        ),
                        child: const Text('Từ chối'),
                      ),
                    ],
                  ),
              ],
            ),
          );
        },
            loading: () => const LoadingIndicator(),
            error: (error, stack) => ErrorView(
              message: 'Error loading song: $error',
              onRetry: () {
                ref.invalidate(songByIdProvider(widget.songId));
              },
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleLarge,
      ),
    );
  }

  Widget _buildMetadataSection(BuildContext context, song) {
    final metadata = song.audioMetadata!;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (metadata.recordingDate != null)
              _buildMetadataRow(
                context,
                'Ngày ghi âm',
                metadata.recordingDate.toVietnameseDate(),
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
                metadata.quality.name,
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
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCulturalContextSection(BuildContext context, song) {
    final context = song.culturalContext!;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildMetadataRow(
              context,
              'Loại',
              _getContextTypeText(context.type),
            ),
            if (context.season != null)
              _buildMetadataRow(context, 'Mùa', context.season!),
            if (context.occasion != null)
              _buildMetadataRow(context, 'Dịp', context.occasion!),
            if (context.significance != null)
              _buildMetadataRow(context, 'Ý nghĩa', context.significance!),
            if (context.historicalBackground != null)
              _buildMetadataRow(
                context,
                'Bối cảnh lịch sử',
                context.historicalBackground!,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildLyricsSection(BuildContext context, song) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (song.lyricsNativeScript != null) ...[
              Text(
                'Ngôn ngữ gốc',
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(height: 8),
              Text(song.lyricsNativeScript!),
              const SizedBox(height: 16),
            ],
            if (song.lyricsVietnameseTranslation != null) ...[
              Text(
                'Bản dịch tiếng Việt',
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(height: 8),
              Text(song.lyricsVietnameseTranslation!),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatsSection(BuildContext context, song) {
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

  Widget _buildStatItem(BuildContext context, String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
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

  String _getContextTypeText(ContextType type) {
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

  void _showActionMessage(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}
