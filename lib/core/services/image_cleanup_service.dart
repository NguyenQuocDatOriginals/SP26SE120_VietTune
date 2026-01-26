import 'dart:io';
import 'image_storage_service.dart';
import '../utils/image_utils.dart';

/// Service for cleaning up orphan image files
/// 
/// Prevents storage bloat by removing images that are no longer
/// referenced in any active draft.
class ImageCleanupService {
  final ImageStorageService _storageService;

  ImageCleanupService(this._storageService);

  /// Clean up orphan images
  /// 
  /// Scans draft_images directory and deletes files not in activeRelativePaths
  Future<CleanupResult> cleanupOrphanImages({
    required List<String> activeRelativePaths,
  }) async {
    try {
      final deletedCount = await _storageService.cleanupOrphanFiles(
        activeRelativePaths,
      );

      // Calculate freed space
      int freedBytes = 0;
      // Note: We could track this more precisely, but for now
      // we'll estimate based on average file size
      // In a production app, you might want to track this during deletion

      return CleanupResult(
        deletedCount: deletedCount,
        freedBytes: freedBytes,
        deletedFiles: [], // Could be populated if needed
      );
    } catch (e) {
      return CleanupResult(
        deletedCount: 0,
        freedBytes: 0,
        deletedFiles: [],
        error: e.toString(),
      );
    }
  }

  /// Get storage size of draft images
  Future<int> getDraftImagesStorageSize() async {
    return await _storageService.getDraftImagesStorageSize();
  }

  /// Get human-readable storage size
  Future<String> getDraftImagesStorageSizeFormatted() async {
    final size = await getDraftImagesStorageSize();
    return ImageUtils.formatFileSize(size);
  }

  /// Check if cleanup is needed
  /// 
  /// Returns true if storage size exceeds threshold (e.g., 100MB)
  Future<bool> isCleanupNeeded({int thresholdBytes = 100 * 1024 * 1024}) async {
    final size = await getDraftImagesStorageSize();
    return size > thresholdBytes;
  }
}

/// Result of cleanup operation
class CleanupResult {
  final int deletedCount;
  final int freedBytes;
  final List<String> deletedFiles;
  final String? error;

  CleanupResult({
    required this.deletedCount,
    required this.freedBytes,
    required this.deletedFiles,
    this.error,
  });

  bool get isSuccess => error == null;
}
