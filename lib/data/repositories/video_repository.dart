import 'dart:io';
import 'package:image_picker/image_picker.dart';
import '../../core/services/video_upload_service.dart';

/// Repository interface for video operations
/// 
/// Follows Clean Architecture - UI should not directly call services.
/// This repository provides a clean interface for the presentation layer.
abstract class VideoRepository {
  /// Pick and process videos
  /// 
  /// Returns stream of VideoProcessingResult with progress tracking
  Stream<VideoProcessingResult> pickAndProcessVideos({
    required int maxVideos,
    ImageSource? source,
  });

  /// Get video file from relative path
  Future<File?> getVideoFile(String relativePath);

  /// Get thumbnail file from relative path
  Future<File?> getThumbnailFile(String thumbnailRelativePath);

  /// Delete video by relative path
  Future<bool> deleteVideo(String relativePath);

  /// Delete thumbnail by relative path
  Future<bool> deleteThumbnail(String thumbnailRelativePath);

  /// Delete video and its thumbnail
  Future<bool> deleteVideoAndThumbnail({
    required String videoRelativePath,
    String? thumbnailRelativePath,
  });

  /// Clean up orphan files
  /// 
  /// Deletes files not in activeRelativePaths list
  Future<int> cleanupOrphanFiles(List<String> activeRelativePaths);

  /// Get storage size of draft videos
  Future<int> getDraftVideosStorageSize();
}
