import 'package:dartz/dartz.dart';
import '../../entities/song.dart';
import '../../entities/enums.dart';
import '../../failures/failure.dart';
import '../../repositories/song_repository.dart';

/// Use case for getting featured songs for homepage
class GetFeaturedSongs {
  final SongRepository repository;

  GetFeaturedSongs(this.repository);

  Future<Either<Failure, List<Song>>> call({
    int limit = 10,
    UserRole? userRole,
    String? currentUserId,
  }) async {
    if (limit <= 0) {
      return Left(
        Failure.validation(message: 'Limit must be greater than 0'),
      );
    }

    return await repository.getFeaturedSongs(
      limit: limit,
      userRole: userRole,
      currentUserId: currentUserId,
    );
  }
}
