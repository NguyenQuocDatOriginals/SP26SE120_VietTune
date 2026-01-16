import 'package:dartz/dartz.dart';
import '../../entities/song.dart';
import '../../entities/enums.dart';
import '../../failures/failure.dart';
import '../../repositories/song_repository.dart';

/// Use case for getting a specific song by ID
class GetSongById {
  final SongRepository repository;

  GetSongById(this.repository);

  Future<Either<Failure, Song>> call(
    String id, {
    UserRole? userRole,
    String? currentUserId,
  }) async {
    if (id.isEmpty) {
      return Left(
        Failure.validation(message: 'Song ID is required'),
      );
    }

    if (userRole == null) {
      return await repository.getById(id);
    }
    return await repository.getSongById(
      id: id,
      userRole: userRole,
      currentUserId: currentUserId,
    );
  }
}
