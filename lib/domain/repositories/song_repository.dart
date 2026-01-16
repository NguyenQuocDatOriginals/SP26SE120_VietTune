import 'package:dartz/dartz.dart';
import '../entities/song.dart';
import '../entities/enums.dart';
import '../failures/failure.dart';
import 'base_repository.dart';

/// Repository interface for song-related operations
abstract class SongRepository extends BaseRepository<Song> {
  /// Search songs with advanced filters
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
  });

  /// Get songs filtered by user role
  Future<Either<Failure, PaginatedResponse<Song>>> getSongsForRole({
    required UserRole userRole,
    String? currentUserId,
    QueryParams? params,
  });

  /// Get song by ID with permission check
  Future<Either<Failure, Song>> getSongById({
    required String id,
    required UserRole userRole,
    String? currentUserId,
  });

  /// Get songs by ethnic group
  Future<Either<Failure, PaginatedResponse<Song>>> getSongsByEthnicGroup(
    String ethnicGroupId,
    QueryParams params, {
    UserRole? userRole,
    String? currentUserId,
  }
  );

  /// Get songs by instrument
  Future<Either<Failure, PaginatedResponse<Song>>> getSongsByInstrument(
    String instrumentId,
    QueryParams params, {
    UserRole? userRole,
    String? currentUserId,
  }
  );

  /// Get featured songs for homepage
  Future<Either<Failure, List<Song>>> getFeaturedSongs({
    int limit = 10,
    UserRole? userRole,
    String? currentUserId,
  });

  /// Get recently added songs
  Future<Either<Failure, List<Song>>> getRecentSongs({
    int limit = 20,
    UserRole? userRole,
    String? currentUserId,
  });

  /// Get related songs based on similarity
  Future<Either<Failure, List<Song>>> getRelatedSongs(
    String songId, {
    int limit = 10,
    UserRole? userRole,
    String? currentUserId,
  });

  /// Toggle favorite status for a song
  Future<Either<Failure, void>> toggleFavorite(String songId, String userId);

  /// Get user's favorite songs
  Future<Either<Failure, PaginatedResponse<Song>>> getFavoriteSongs(
    String userId,
    QueryParams params,
  );

  /// Increment play count
  Future<Either<Failure, void>> incrementPlayCount(String songId);

  /// Expert-only: pending songs queue
  Future<Either<Failure, PaginatedResponse<Song>>> getPendingSongs({
    QueryParams? params,
  });
}
