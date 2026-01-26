import 'dart:io';
import 'package:path/path.dart' as path;
import 'package:path_provider/path_provider.dart';
import 'package:uuid/uuid.dart';
import '../utils/image_utils.dart';

/// Service for managing image storage in draft directory
/// 
/// ⚠️ CRITICAL: This service handles permanent storage for draft images.
/// Images are copied from cache to ApplicationDocumentsDirectory/draft_images/
/// and only relative paths are returned (never absolute paths).
class ImageStorageService {
  static const String _draftImagesSubdir = 'draft_images';
  final Uuid _uuid = const Uuid();

  /// Get the draft images directory
  /// Creates directory if it doesn't exist
  Future<Directory> getDraftImagesDirectory() async {
    final documentsDir = await getApplicationDocumentsDirectory();
    final draftDir = Directory(path.join(documentsDir.path, _draftImagesSubdir));
    
    if (!await draftDir.exists()) {
      await draftDir.create(recursive: true);
    }
    
    return draftDir;
  }

  /// Copy image from source (cache) to permanent draft storage
  /// 
  /// Returns relative path (e.g., "draft_images/abc123.jpg")
  /// Never returns absolute path!
  Future<String> copyToDraftStorage(File sourceFile) async {
    // Validate source file exists
    if (!await sourceFile.exists()) {
      throw Exception('Source file does not exist: ${sourceFile.path}');
    }

    // Get draft directory
    final draftDir = await getDraftImagesDirectory();

    // Generate unique filename with UUID
    final extension = path.extension(sourceFile.path);
    final filename = '${_uuid.v4()}$extension';
    final destinationPath = path.join(draftDir.path, filename);
    final destinationFile = File(destinationPath);

    // Copy file
    await sourceFile.copy(destinationPath);

    // Return relative path only
    return path.join(_draftImagesSubdir, filename);
  }

  /// Get full file path from relative path
  /// 
  /// Example: "draft_images/abc123.jpg" -> "/data/user/0/.../draft_images/abc123.jpg"
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

  /// Delete image by relative path
  Future<bool> deleteImage(String relativePath) async {
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

  /// Delete multiple images by relative paths
  Future<int> deleteImages(List<String> relativePaths) async {
    int deletedCount = 0;
    for (final relativePath in relativePaths) {
      if (await deleteImage(relativePath)) {
        deletedCount++;
      }
    }
    return deletedCount;
  }

  /// Clean up orphan files (files not in activeRelativePaths list)
  /// 
  /// Scans draft_images directory and deletes files not referenced
  /// in the provided activeRelativePaths list.
  Future<int> cleanupOrphanFiles(List<String> activeRelativePaths) async {
    try {
      final draftDir = await getDraftImagesDirectory();
      
      if (!await draftDir.exists()) {
        return 0;
      }

      // Get all files in draft directory
      final allFiles = await draftDir.list().toList();
      final orphanFiles = <File>[];

      for (final entity in allFiles) {
        if (entity is File) {
          // Get relative path of this file
          final documentsDir = await getApplicationDocumentsDirectory();
          final relativePath = path.relative(entity.path, from: documentsDir.path);
          
          // Check if this file is in the active list
          if (!activeRelativePaths.contains(relativePath)) {
            orphanFiles.add(entity);
          }
        }
      }

      // Delete orphan files
      int deletedCount = 0;
      for (final file in orphanFiles) {
        try {
          await file.delete();
          deletedCount++;
        } catch (e) {
          // Continue even if one file fails
        }
      }

      return deletedCount;
    } catch (e) {
      return 0;
    }
  }

  /// Get storage size of draft images directory
  Future<int> getDraftImagesStorageSize() async {
    try {
      final draftDir = await getDraftImagesDirectory();
      
      if (!await draftDir.exists()) {
        return 0;
      }

      int totalSize = 0;
      await for (final entity in draftDir.list()) {
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
