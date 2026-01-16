import 'package:dartz/dartz.dart';
import '../../domain/entities/song.dart';
import '../../domain/entities/enums.dart';
import '../../domain/failures/failure.dart';
import '../../domain/repositories/base_repository.dart';
import '../../domain/repositories/song_repository.dart';
import '../datasources/mock/mock_song_data_source.dart';
import '../models/song_model.dart';

/// Implementation of SongRepository using mock data source
class SongRepositoryImpl implements SongRepository {
  final MockSongDataSource _dataSource;

  SongRepositoryImpl(this._dataSource);

  List<SongModel> _applyRoleFilter(
    List<SongModel> songs,
    UserRole? userRole,
    String? currentUserId,
  ) {
    if (userRole == null) {
      return songs
          .where((s) => s.verificationStatus == VerificationStatus.verified.name)
          .toList();
    }

    switch (userRole) {
      case UserRole.researcher:
        return songs
            .where((s) =>
                s.verificationStatus == VerificationStatus.verified.name)
            .toList();
      case UserRole.contributor:
        return songs.where((s) {
          final isVerified =
              s.verificationStatus == VerificationStatus.verified.name;
          final isOwner = currentUserId != null && s.contributorId == currentUserId;
          return isVerified || isOwner;
        }).toList();
      case UserRole.expert:
      case UserRole.admin:
        return songs;
    }
  }

  @override
  Future<Either<Failure, Song>> getById(String id) async {
    try {
      final model = await _dataSource.getSongById(id);
      if (model == null) {
        return Left(Failure.notFound(
          message: 'Song not found',
          resourceId: id,
        ));
      }
      return Right(model.toEntity());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, PaginatedResponse<Song>>> getAll(QueryParams params) async {
    try {
      final allSongs = await _dataSource.getAllSongs();
      final startIndex = (params.page - 1) * params.limit;
      final endIndex = startIndex + params.limit;
      final paginatedSongs = allSongs.sublist(
        startIndex.clamp(0, allSongs.length),
        endIndex.clamp(0, allSongs.length),
      );

      return Right(PaginatedResponse<Song>(
        items: paginatedSongs.map((m) => m.toEntity()).toList(),
        totalCount: allSongs.length,
        page: params.page,
        limit: params.limit,
      ));
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, Song>> create(Song entity) async {
    try {
      // In a real implementation, this would create a new song
      // For mock, we'll just return the entity
      return Right(entity);
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, Song>> update(String id, Song entity) async {
    try {
      // In a real implementation, this would update the song
      // For mock, we'll just return the entity
      return Right(entity);
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> delete(String id) async {
    try {
      // In a real implementation, this would delete the song
      return const Right(null);
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, PaginatedResponse<Song>>> searchSongs({
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
    try {
      final genreStrings = genres?.map((g) => g.name).toList();
      final contextTypeStrings = contextTypes?.map((c) => c.name).toList();
      final verificationStatusString = verificationStatus?.name;

      final results = await _dataSource.searchSongs(
        query: query,
        ethnicGroupIds: ethnicGroupIds,
        instrumentIds: instrumentIds,
        genres: genreStrings,
        contextTypes: contextTypeStrings,
        province: province,
        verificationStatus: verificationStatusString,
      );

      final filtered = _applyRoleFilter(results, userRole, currentUserId);
      final queryParams = params ?? const QueryParams();
      final startIndex = (queryParams.page - 1) * queryParams.limit;
      final endIndex = startIndex + queryParams.limit;
      final paginatedResults = filtered.sublist(
        startIndex.clamp(0, filtered.length),
        endIndex.clamp(0, filtered.length),
      );

      return Right(PaginatedResponse<Song>(
        items: paginatedResults.map((m) => m.toEntity()).toList(),
        totalCount: filtered.length,
        page: queryParams.page,
        limit: queryParams.limit,
      ));
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, PaginatedResponse<Song>>> getSongsForRole({
    required UserRole userRole,
    String? currentUserId,
    QueryParams? params,
  }) async {
    try {
      final allSongs = await _dataSource.getAllSongs();
      final filtered = _applyRoleFilter(allSongs, userRole, currentUserId);
      final queryParams = params ?? const QueryParams();
      final startIndex = (queryParams.page - 1) * queryParams.limit;
      final endIndex = startIndex + queryParams.limit;
      final paginatedSongs = filtered.sublist(
        startIndex.clamp(0, filtered.length),
        endIndex.clamp(0, filtered.length),
      );

      return Right(PaginatedResponse<Song>(
        items: paginatedSongs.map((m) => m.toEntity()).toList(),
        totalCount: filtered.length,
        page: queryParams.page,
        limit: queryParams.limit,
      ));
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, Song>> getSongById({
    required String id,
    required UserRole userRole,
    String? currentUserId,
  }) async {
    try {
      final model = await _dataSource.getSongById(id);
      if (model == null) {
        return Left(Failure.notFound(message: 'Song not found', resourceId: id));
      }
      final canView = _applyRoleFilter([model], userRole, currentUserId).isNotEmpty;
      if (!canView) {
        return Left(Failure.unauthorized(message: 'Access denied'));
      }
      return Right(model.toEntity());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, PaginatedResponse<Song>>> getSongsByEthnicGroup(
    String ethnicGroupId,
    QueryParams params, {
    UserRole? userRole,
    String? currentUserId,
  }
  ) async {
    try {
      final results = await _dataSource.searchSongs(
        ethnicGroupIds: [ethnicGroupId],
      );

      final filtered = _applyRoleFilter(results, userRole, currentUserId);
      final startIndex = (params.page - 1) * params.limit;
      final endIndex = startIndex + params.limit;
      final paginatedResults = filtered.sublist(
        startIndex.clamp(0, filtered.length),
        endIndex.clamp(0, filtered.length),
      );

      return Right(PaginatedResponse<Song>(
        items: paginatedResults.map((m) => m.toEntity()).toList(),
        totalCount: filtered.length,
        page: params.page,
        limit: params.limit,
      ));
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, PaginatedResponse<Song>>> getSongsByInstrument(
    String instrumentId,
    QueryParams params, {
    UserRole? userRole,
    String? currentUserId,
  }
  ) async {
    try {
      final results = await _dataSource.searchSongs(
        instrumentIds: [instrumentId],
      );

      final filtered = _applyRoleFilter(results, userRole, currentUserId);
      final startIndex = (params.page - 1) * params.limit;
      final endIndex = startIndex + params.limit;
      final paginatedResults = filtered.sublist(
        startIndex.clamp(0, filtered.length),
        endIndex.clamp(0, filtered.length),
      );

      return Right(PaginatedResponse<Song>(
        items: paginatedResults.map((m) => m.toEntity()).toList(),
        totalCount: filtered.length,
        page: params.page,
        limit: params.limit,
      ));
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<Song>>> getFeaturedSongs({
    int limit = 10,
    UserRole? userRole,
    String? currentUserId,
  }) async {
    try {
      final allSongs = await _dataSource.getAllSongs();
      // Sort by play count and favorite count
      allSongs.sort((a, b) {
        final aScore = (a.playCount ?? 0) + (a.favoriteCount ?? 0);
        final bScore = (b.playCount ?? 0) + (b.favoriteCount ?? 0);
        return bScore.compareTo(aScore);
      });

      final filtered = _applyRoleFilter(allSongs, userRole, currentUserId);
      final featured = filtered.take(limit).toList();
      return Right(featured.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<Song>>> getRecentSongs({
    int limit = 20,
    UserRole? userRole,
    String? currentUserId,
  }) async {
    try {
      final allSongs = await _dataSource.getAllSongs();
      // Sort by creation date
      allSongs.sort((a, b) {
        final aDate = a.createdAt != null ? DateTime.parse(a.createdAt!) : DateTime(1970);
        final bDate = b.createdAt != null ? DateTime.parse(b.createdAt!) : DateTime(1970);
        return bDate.compareTo(aDate);
      });

      final filtered = _applyRoleFilter(allSongs, userRole, currentUserId);
      final recent = filtered.take(limit).toList();
      return Right(recent.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<Song>>> getRelatedSongs(
    String songId, {
    int limit = 10,
    UserRole? userRole,
    String? currentUserId,
  }) async {
    try {
      final song = await _dataSource.getSongById(songId);
      if (song == null) {
        return Left(Failure.notFound(message: 'Song not found', resourceId: songId));
      }

      final allSongs = await _dataSource.getAllSongs();
      // Find songs with same ethnic group or instruments
      final related = allSongs.where((s) {
        if (s.id == songId) return false;
        return s.ethnicGroupId == song.ethnicGroupId ||
            s.audioMetadata?.instrumentIds?.any((id) =>
                song.audioMetadata?.instrumentIds?.contains(id) == true) == true;
      }).take(limit).toList();

      final filtered = _applyRoleFilter(related, userRole, currentUserId);
      return Right(filtered.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> toggleFavorite(String songId, String userId) async {
    try {
      // In a real implementation, this would toggle favorite status
      // For mock, we'll just return success
      return const Right(null);
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, PaginatedResponse<Song>>> getFavoriteSongs(
    String userId,
    QueryParams params,
  ) async {
    try {
      // In a real implementation, this would get user's favorites
      // For mock, return empty list
      return Right(PaginatedResponse<Song>(
        items: [],
        totalCount: 0,
        page: params.page,
        limit: params.limit,
      ));
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> incrementPlayCount(String songId) async {
    try {
      // In a real implementation, this would increment play count
      // For mock, we'll just return success
      return const Right(null);
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, PaginatedResponse<Song>>> getPendingSongs({
    QueryParams? params,
  }) async {
    try {
      final allSongs = await _dataSource.getAllSongs();
      final pending = allSongs
          .where((s) =>
              s.verificationStatus == VerificationStatus.pending.name)
          .toList();
      final queryParams = params ?? const QueryParams();
      final startIndex = (queryParams.page - 1) * queryParams.limit;
      final endIndex = startIndex + queryParams.limit;
      final paginated = pending.sublist(
        startIndex.clamp(0, pending.length),
        endIndex.clamp(0, pending.length),
      );
      return Right(PaginatedResponse<Song>(
        items: paginated.map((m) => m.toEntity()).toList(),
        totalCount: pending.length,
        page: queryParams.page,
        limit: queryParams.limit,
      ));
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }
}
