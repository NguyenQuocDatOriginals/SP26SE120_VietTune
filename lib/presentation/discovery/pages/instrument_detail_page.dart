import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../domain/entities/song.dart';
import '../../../domain/entities/enums.dart';
import '../../../domain/usecases/reference/get_instruments.dart';
import '../../../domain/usecases/discovery/get_songs_by_instrument.dart';
import '../../../domain/repositories/base_repository.dart';
import '../../../core/di/injection.dart';
import '../../../core/utils/constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../shared/widgets/song_card.dart';
import '../../shared/widgets/loading_indicator.dart';
import '../../shared/widgets/error_view.dart';
import '../../auth/providers/auth_provider.dart';

/// Provider for instrument by ID
final instrumentByIdProvider = FutureProvider.family((ref, String instrumentId) async {
  final useCase = getIt<GetInstruments>();
  final result = await useCase(params: const QueryParams());
  return result.fold(
    (failure) => throw failure,
    (response) => response.items.firstWhere(
      (inst) => inst.id == instrumentId,
      orElse: () => throw Exception('Instrument not found'),
    ),
  );
});

/// Provider for songs by instrument
final songsByInstrumentProvider = FutureProvider.family<
    PaginatedResponse<Song>,
    String>((ref, instrumentId) async {
  final useCase = getIt<GetSongsByInstrument>();
  final user = ref.watch(currentUserProvider);
  final role = user?.role ?? UserRole.researcher;
  final result = await useCase(
    instrumentId: instrumentId,
    params: const QueryParams(),
    userRole: role,
    currentUserId: user?.id,
  );
  return result.fold(
    (failure) => throw failure,
    (response) => response,
  );
});

class InstrumentDetailPage extends ConsumerWidget {
  final String instrumentId;

  const InstrumentDetailPage({super.key, required this.instrumentId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final instrumentAsync = ref.watch(instrumentByIdProvider(instrumentId));
    final songsAsync = ref.watch(songsByInstrumentProvider(instrumentId));

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text(
          'Chi tiết nhạc cụ',
          style: AppTypography.heading4(color: AppColors.textOnGradient),
        ),
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.textOnGradient,
      ),
      body: Container(
        decoration: AppTheme.gradientBackground,
        child: SafeArea(
          child: instrumentAsync.when(
            data: (instrument) {
              return SingleChildScrollView(
                padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                // Instrument name
                Text(
                  instrument.name,
                  style: AppTypography.heading2(color: AppColors.textOnGradient),
                ),
                const SizedBox(height: 16),
                // Type
                Chip(
                  label: Text(_getTypeText(instrument.type)),
                ),
                const SizedBox(height: 24),
                // Description
                if (instrument.description.isNotEmpty) ...[
                  Text(
                    'Mô tả',
                    style: AppTypography.heading5(color: AppColors.textOnGradient),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    instrument.description,
                    style: AppTypography.bodyLarge(color: AppColors.textSecondaryOnGradient),
                  ),
                  const SizedBox(height: 24),
                ],
                // Materials
                if (instrument.materials != null &&
                    instrument.materials!.isNotEmpty) ...[
                  Text(
                    'Chất liệu',
                    style: AppTypography.heading5(color: AppColors.textOnGradient),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: instrument.materials!
                        .map((material) => Chip(label: Text(material)))
                        .toList(),
                  ),
                  const SizedBox(height: 24),
                ],
                // Playing technique
                if (instrument.playingTechnique != null) ...[
                  Text(
                    'Kỹ thuật chơi',
                    style: AppTypography.heading5(color: AppColors.textOnGradient),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    instrument.playingTechnique!,
                    style: AppTypography.bodyLarge(color: AppColors.textSecondaryOnGradient),
                  ),
                  const SizedBox(height: 24),
                ],
                // Songs using this instrument
                Text(
                  'Bài hát sử dụng nhạc cụ này',
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
                            context.push('${AppRoutes.discoverSongPath}/${song.id}');
                          },
                        );
                      },
                    );
                  },
                  loading: () => const LoadingIndicator(),
                  error: (error, stack) => ErrorView(
                    message: 'Error loading songs: $error',
                    onRetry: () {
                      ref.invalidate(songsByInstrumentProvider(instrumentId));
                    },
                  ),
                ),
              ],
            ),
          );
        },
            loading: () => const LoadingIndicator(),
            error: (error, stack) => ErrorView(
              message: 'Error loading instrument: $error',
              onRetry: () {
                ref.invalidate(instrumentByIdProvider(instrumentId));
              },
            ),
          ),
        ),
      ),
    );
  }

  String _getTypeText(InstrumentType type) {
    switch (type) {
      case InstrumentType.string:
        return 'Dây';
      case InstrumentType.wind:
        return 'Hơi';
      case InstrumentType.percussion:
        return 'Gõ';
      case InstrumentType.keyboard:
        return 'Phím';
      case InstrumentType.other:
        return 'Khác';
    }
  }
}
