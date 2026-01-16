import 'package:dartz/dartz.dart';
import '../../failures/failure.dart';
import '../../repositories/song_repository.dart';

/// Use case for toggling favorite status of a song
class ToggleFavorite {
  final SongRepository repository;

  ToggleFavorite(this.repository);

  Future<Either<Failure, void>> call({
    required String songId,
    required String userId,
  }) async {
    if (songId.isEmpty) {
      return Left(
        Failure.validation(message: 'Song ID is required'),
      );
    }

    if (userId.isEmpty) {
      return Left(
        Failure.validation(message: 'User ID is required'),
      );
    }

    return await repository.toggleFavorite(songId, userId);
  }
}
