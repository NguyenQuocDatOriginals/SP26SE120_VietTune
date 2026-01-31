import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../domain/entities/song.dart';
import '../../../domain/usecases/discovery/toggle_favorite.dart';
import '../../../core/di/injection.dart';
import '../../../core/services/guest_favorite_service.dart';
import '../../../core/utils/constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../shared/widgets/loading_indicator.dart';
import '../../shared/widgets/error_view.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/song_providers.dart';
import '../widgets/song_detail_content.dart';

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
            icon: PhosphorIcon(
              PhosphorIconsLight.heart,
              color: _isFavorite ? AppColors.primary : null,
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
                child: SongDetailContent(
                  song: song,
                  user: user,
                  onShowMessage: (msg) => _showActionMessage(context, msg),
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

  void _showActionMessage(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}
