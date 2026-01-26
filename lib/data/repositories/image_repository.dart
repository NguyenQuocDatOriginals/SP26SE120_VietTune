import 'dart:io';
import 'package:image_picker/image_picker.dart';
import '../../domain/entities/image_metadata.dart';
import '../../core/services/image_upload_service.dart';
import '../../core/services/image_storage_service.dart';

/// Repository interface for image operations
/// 
/// Follows Clean Architecture - UI should not directly call services.
/// This repository provides a clean interface for the presentation layer.
abstract class ImageRepository {
  /// Pick and process images
  /// 
  /// Returns stream of ImageProcessingResult with progress tracking
  Stream<ImageProcessingResult> pickAndProcessImages({
    required int maxImages,
    ImageSource? source,
  });

  /// Get image file from relative path
  Future<File?> getImageFile(String relativePath);

  /// Delete image by relative path
  Future<bool> deleteImage(String relativePath);

  /// Delete multiple images
  Future<int> deleteImages(List<String> relativePaths);

  /// Clean up orphan files
  /// 
  /// Deletes files not in activeRelativePaths list
  Future<int> cleanupOrphanFiles(List<String> activeRelativePaths);

  /// Get storage size of draft images
  Future<int> getDraftImagesStorageSize();
}
