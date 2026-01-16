import 'package:dartz/dartz.dart';
import '../../entities/song.dart';
import '../../entities/enums.dart';
import '../../failures/failure.dart';
import '../../repositories/base_repository.dart';
import '../../repositories/song_repository.dart';

/// Use case for advanced song search with filters
class SearchSongs {
  final SongRepository repository;

  SearchSongs(this.repository);

  Future<Either<Failure, PaginatedResponse<Song>>> call({
    String? query,
    List<String>? ethnicGroupIds,
    List<String>? instrumentIds,
    List<MusicGenre>? genres,
    List<ContextType>? contextTypes,
    String? province,
    VerificationStatus? verificationStatus,
    UserRole? userRole,
    String? currentUserId,
    QueryParams? params,
  }) async {
    return await repository.searchSongs(
      query: query,
      ethnicGroupIds: ethnicGroupIds,
      instrumentIds: instrumentIds,
      genres: genres,
      contextTypes: contextTypes,
      province: province,
      verificationStatus: verificationStatus,
      userRole: userRole,
      currentUserId: currentUserId,
      params: params,
    );
  }
}
