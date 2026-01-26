import 'dart:io';
import 'package:path/path.dart' as path;
import 'package:path_provider/path_provider.dart';
import 'package:uuid/uuid.dart';

/// Service for managing video storage in draft directory
/// 
/// ⚠️ CRITICAL: This service handles permanent storage for draft videos.
/// Videos are copied from cache to ApplicationDocumentsDirectory/draft_videos/
/// and only relative paths are returned (never absolute paths).
/// 
/// Thumbnails are stored separately in draft_videos/thumbnails/ directory.
class VideoStorageService {
  static const String _draftVideosSubdir = 'draft_videos';
  static const String _thumbnailsSubdir = 'thumbnails';
  final Uuid _uuid = const Uuid();

  /// Get the draft videos directory
  /// Creates directory if it doesn't exist
  Future<Directory> getDraftVideosDirectory() async {
    final documentsDir = await getApplicationDocumentsDirectory();
    final draftDir = Directory(path.join(documentsDir.path, _draftVideosSubdir));
    
    if (!await draftDir.exists()) {
      await draftDir.create(recursive: true);
    }
    
    return draftDir;
  }

  /// Get the thumbnails directory
  /// Creates directory if it doesn't exist
  Future<Directory> getThumbnailsDirectory() async {
    final draftDir = await getDraftVideosDirectory();
    final thumbnailsDir = Directory(path.join(draftDir.path, _thumbnailsSubdir));
    
    if (!await thumbnailsDir.exists()) {
      await thumbnailsDir.create(recursive: true);
    }
    
    return thumbnailsDir;
  }

  /// Copy video from source (cache) to permanent draft storage
  /// 
  /// Returns relative path (e.g., "draft_videos/abc123.mp4")
  /// Never returns absolute path!
  Future<String> copyToDraftStorage(File sourceFile) async {
    // Validate source file exists
    if (!await sourceFile.exists()) {
      throw Exception('Source file does not exist: ${sourceFile.path}');
    }

    // Get draft directory
    final draftDir = await getDraftVideosDirectory();

    // Generate unique filename with UUID
    final extension = path.extension(sourceFile.path);
    final filename = '${_uuid.v4()}$extension';
    final destinationPath = path.join(draftDir.path, filename);

    // Copy file
    await sourceFile.copy(destinationPath);

    // Return relative path only
    return path.join(_draftVideosSubdir, filename);
  }

  /// Copy thumbnail from source to permanent draft storage
  /// 
  /// Returns relative path (e.g., "draft_videos/thumbnails/abc123.jpg")
  /// Never returns absolute path!
  Future<String> copyThumbnailToDraftStorage(File thumbnailFile) async {
    // Validate source file exists
    if (!await thumbnailFile.exists()) {
      throw Exception('Thumbnail file does not exist: ${thumbnailFile.path}');
    }

    // Get thumbnails directory
    final thumbnailsDir = await getThumbnailsDirectory();

    // Generate unique filename with UUID (use .jpg extension for thumbnails)
    final filename = '${_uuid.v4()}.jpg';
    final destinationPath = path.join(thumbnailsDir.path, filename);

    // Copy file
    await thumbnailFile.copy(destinationPath);

    // Return relative path only
    return path.join(_draftVideosSubdir, _thumbnailsSubdir, filename);
  }

  /// Get full file path from relative path
  /// 
  /// Example: "draft_videos/abc123.mp4" -> "/data/user/0/.../draft_videos/abc123.mp4"
  Future<File?> getFileFromRelativePath(String relativePath) async {
    try {
      final documentsDir = await getApplicationDocumentsDirectory();
      final fullPath = path.join(documentsDir.path, relativePath);
      final file = File(fullPath);
      
      if (await file.exists()) {
        return file;
      }
      
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Get full thumbnail file path from relative path
  /// 
  /// Example: "draft_videos/thumbnails/abc123.jpg" -> "/data/user/0/.../draft_videos/thumbnails/abc123.jpg"
  Future<File?> getThumbnailFileFromRelativePath(String thumbnailRelativePath) async {
    try {
      final documentsDir = await getApplicationDocumentsDirectory();
      final fullPath = path.join(documentsDir.path, thumbnailRelativePath);
      final file = File(fullPath);
      
      if (await file.exists()) {
        return file;
      }
      
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Delete video by relative path
  Future<bool> deleteVideo(String relativePath) async {
    try {
      final file = await getFileFromRelativePath(relativePath);
      if (file != null && await file.exists()) {
        await file.delete();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /// Delete thumbnail by relative path
  Future<bool> deleteThumbnail(String thumbnailRelativePath) async {
    try {
      final file = await getThumbnailFileFromRelativePath(thumbnailRelativePath);
      if (file != null && await file.exists()) {
        await file.delete();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /// Delete video and its associated thumbnail
  Future<bool> deleteVideoAndThumbnail({
    required String videoRelativePath,
    String? thumbnailRelativePath,
  }) async {
    bool videoDeleted = await deleteVideo(videoRelativePath);
    bool thumbnailDeleted = true;
    
    if (thumbnailRelativePath != null) {
      thumbnailDeleted = await deleteThumbnail(thumbnailRelativePath);
    }
    
    return videoDeleted && thumbnailDeleted;
  }

  /// Clean up orphan files (files not in activeRelativePaths list)
  /// 
  /// Scans draft_videos/ directory and deletes files not referenced
  /// Also cleans up orphan thumbnails
  Future<int> cleanupOrphanFiles(List<String> activeRelativePaths) async {
    try {
      final draftDir = await getDraftVideosDirectory();
      if (!await draftDir.exists()) {
        return 0;
      }

      // Get all files in draft directory (excluding thumbnails subdirectory)
      final allFiles = await draftDir
          .list()
          .where((entity) => entity is File)
          .cast<File>()
          .toList();

      final documentsDir = await getApplicationDocumentsDirectory();
      final activePaths = activeRelativePaths.toSet();

      int deletedCount = 0;
      for (final file in allFiles) {
        final relativePath = path.relative(file.path, from: documentsDir.path);
        if (!activePaths.contains(relativePath)) {
          try {
            await file.delete();
            deletedCount++;
          } catch (e) {
            // Continue with other files
          }
        }
      }

      // Also clean up orphan thumbnails
      final thumbnailsDir = await getThumbnailsDirectory();
      if (await thumbnailsDir.exists()) {
        final allThumbnails = await thumbnailsDir
            .list()
            .where((entity) => entity is File)
            .cast<File>()
            .toList();

        // Extract video UUIDs from active paths to match thumbnails
        final activeVideoUuids = activeRelativePaths
            .map((p) => path.basenameWithoutExtension(p))
            .toSet();

        for (final thumbnailFile in allThumbnails) {
          final thumbnailUuid = path.basenameWithoutExtension(thumbnailFile.path);
          if (!activeVideoUuids.contains(thumbnailUuid)) {
            try {
              await thumbnailFile.delete();
              deletedCount++;
            } catch (e) {
              // Continue with other files
            }
          }
        }
      }

      return deletedCount;
    } catch (e) {
      return 0;
    }
  }

  /// Get total storage size of draft videos (in bytes)
  Future<int> getDraftVideosStorageSize() async {
    try {
      final draftDir = await getDraftVideosDirectory();
      if (!await draftDir.exists()) {
        return 0;
      }

      int totalSize = 0;
      await for (final entity in draftDir.list(recursive: true)) {
        if (entity is File) {
          totalSize += await entity.length();
        }
      }

      return totalSize;
    } catch (e) {
      return 0;
    }
  }
}
