import 'package:dartz/dartz.dart';
import '../../entities/song.dart';
import '../../entities/enums.dart';
import '../../failures/failure.dart';
import '../../repositories/base_repository.dart';
import '../../repositories/song_repository.dart';

/// Use case for getting songs by instrument
class GetSongsByInstrument {
  final SongRepository repository;

  GetSongsByInstrument(this.repository);

  Future<Either<Failure, PaginatedResponse<Song>>> call({
    required String instrumentId,
    QueryParams? params,
    UserRole? userRole,
    String? currentUserId,
  }) async {
    if (instrumentId.isEmpty) {
      return Left(
        Failure.validation(message: 'Instrument ID is required'),
      );
    }

    return await repository.getSongsByInstrument(
      instrumentId,
      params ?? const QueryParams(),
      userRole: userRole,
      currentUserId: currentUserId,
    );
  }
}
