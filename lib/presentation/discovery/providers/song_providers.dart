import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../domain/entities/enums.dart';
import '../../../domain/usecases/discovery/get_song_by_id.dart';
import '../../../core/di/injection.dart';
import '../../auth/providers/auth_provider.dart';

/// Provider for song by ID. Used by [UnifiedSongPage] and [SongDetailPage].
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
