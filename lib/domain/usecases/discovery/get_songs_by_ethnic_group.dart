import 'package:dartz/dartz.dart';
import '../../entities/song.dart';
import '../../entities/enums.dart';
import '../../failures/failure.dart';
import '../../repositories/base_repository.dart';
import '../../repositories/song_repository.dart';

/// Use case for getting songs by ethnic group
class GetSongsByEthnicGroup {
  final SongRepository repository;

  GetSongsByEthnicGroup(this.repository);

  Future<Either<Failure, PaginatedResponse<Song>>> call({
    required String ethnicGroupId,
    QueryParams? params,
    UserRole? userRole,
    String? currentUserId,
  }) async {
    if (ethnicGroupId.isEmpty) {
      return Left(
        Failure.validation(message: 'Ethnic group ID is required'),
      );
    }

    return await repository.getSongsByEthnicGroup(
      ethnicGroupId,
      params ?? const QueryParams(),
      userRole: userRole,
      currentUserId: currentUserId,
    );
  }
}
