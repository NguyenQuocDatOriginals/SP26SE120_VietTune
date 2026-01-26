import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';
import 'package:video_thumbnail/video_thumbnail.dart';
import 'package:v_video_compressor/v_video_compressor.dart';
import '../../domain/entities/video_metadata.dart';
import '../utils/video_utils.dart';
import 'video_storage_service.dart';

/// Service for picking and processing videos
/// 
/// Handles:
/// - Video picking from gallery/camera
/// - Thumbnail generation (BẮT BUỘC - performance critical!)
/// - Video compression in isolates (BẮT BUỘC - not optional!)
/// - Video validation
/// - Video metadata extraction
/// - Coordination with VideoStorageService
class VideoUploadService {
  final ImagePicker _picker = ImagePicker();
  final VideoStorageService _storageService;

  VideoUploadService(this._storageService);

  /// Pick and process a single video
  /// 
  /// Returns VideoMetadata with relative paths, or null if cancelled/error
  /// 
  /// ⚠️ CRITICAL: 
  /// - Thumbnail generation is BẮT BUỘC (required)
  /// - Video compression is BẮT BUỘC (required) - compresses to 720p/1080p medium quality
  Future<VideoMetadata?> pickAndProcessVideo({
    ImageSource source = ImageSource.gallery,
    bool compress = true, // BẮT BUỘC - always compress
  }) async {
    try {
      // Pick video
      final XFile? pickedFile = await _picker.pickVideo(
        source: source,
      );

      if (pickedFile == null) {
        return null; // User cancelled
      }

      final file = File(pickedFile.path);

      // Validate video (chặn > 100MB)
      final validation = await VideoUtils.validateVideoFile(file);
      if (!validation.isValid) {
        throw Exception(validation.error ?? 'Invalid video');
      }

      // Compress video if needed (BẮT BUỘC)
      File processedFile = file;
      if (compress) {
        processedFile = await compressVideo(file);
      }

      // Generate thumbnail (BẮT BUỘC - performance critical!)
      final thumbnailRelativePath = await generateThumbnail(processedFile);

      // Extract video metadata
      final metadata = await extractVideoMetadata(processedFile);
      final fileSize = await VideoUtils.getVideoFileSize(processedFile);
      final mimeType = VideoUtils.getMimeTypeFromPath(processedFile.path);
      final stat = await processedFile.stat();
      final recordedDate = stat.modified;

      // Copy to draft storage (returns relative path)
      final relativePath = await _storageService.copyToDraftStorage(processedFile);

      // Create VideoMetadata
      return VideoMetadata(
        relativePath: relativePath,
        thumbnailRelativePath: thumbnailRelativePath,
        recordedDate: recordedDate,
        fileSizeBytes: fileSize,
        mimeType: mimeType,
        durationInSeconds: metadata?['duration'] as int?,
        width: metadata?['width'] as int?,
        height: metadata?['height'] as int?,
        bitrate: metadata?['bitrate'] as int?,
        codec: metadata?['codec'] as String?,
        metadata: metadata,
      );
    } catch (e) {
      throw Exception('Failed to pick and process video: $e');
    }
  }

  /// Pick and process multiple videos
  /// 
  /// Returns stream of VideoProcessingResult with progress tracking
  Stream<VideoProcessingResult> pickAndProcessMultipleVideos({
    required int maxVideos,
  }) async* {
    try {
      // Note: image_picker doesn't support pickMultiVideo
      // For multiple videos, we'll need to call pickVideo multiple times
      // or use file_picker package
      
      // For now, we'll support single video pick
      // Multiple video support can be added later with file_picker
      
      final video = await pickAndProcessVideo(source: ImageSource.gallery);
      
      if (video != null) {
        yield VideoProcessingResult(
          video: video,
          progress: 1.0,
          isComplete: true,
          error: null,
        );
      } else {
        yield VideoProcessingResult(
          video: null,
          progress: 1.0,
          isComplete: true,
          error: null,
        );
      }
    } catch (e) {
      yield VideoProcessingResult(
        video: null,
        progress: 1.0,
        isComplete: true,
        error: 'Failed to pick videos: $e',
      );
    }
  }

  /// Generate thumbnail from video (BẮT BUỘC)
  /// 
  /// Returns relative path to thumbnail JPG file
  /// 
  /// ⚠️ CRITICAL: This is called immediately after pick/record
  /// to avoid loading VideoPlayerController just for thumbnail
  Future<String> generateThumbnail(File videoFile) async {
    try {
      // Generate thumbnail at first frame (timeMs: 0)
      final thumbnailData = await VideoThumbnail.thumbnailData(
        video: videoFile.path,
        imageFormat: ImageFormat.JPEG,
        maxWidth: 512, // Thumbnail size - balance between quality and file size
        quality: 85,
        timeMs: 0, // First frame
      );

      if (thumbnailData == null) {
        throw Exception('Failed to generate thumbnail');
      }

      // Save thumbnail to temporary file
      final tempDir = Directory.systemTemp;
      final tempThumbnail = File(
        '${tempDir.path}/${DateTime.now().millisecondsSinceEpoch}_thumb.jpg',
      );
      await tempThumbnail.writeAsBytes(thumbnailData);

      // Copy to draft storage (returns relative path)
      final thumbnailRelativePath = await _storageService
          .copyThumbnailToDraftStorage(tempThumbnail);

      // Clean up temp file
      try {
        await tempThumbnail.delete();
      } catch (e) {
        // Ignore cleanup errors
      }

      return thumbnailRelativePath;
    } catch (e) {
      throw Exception('Failed to generate thumbnail: $e');
    }
  }

  /// Compress video to reduce size (BẮT BUỘC cho MVP)
  /// 
  /// Transcodes to 720p/1080p medium quality
  /// Runs in isolate to avoid blocking UI
  Future<File> compressVideo(File videoFile) async {
    // Run compression in isolate to avoid blocking UI
    return await compressVideoInIsolate(videoFile);
  }

  /// Compress video in isolate (non-blocking)
  Future<File> compressVideoInIsolate(File videoFile) async {
    return await compute(_compressVideoInIsolate, videoFile.path);
  }

  /// Validate video file (format and size)
  Future<VideoValidationResult> validateVideo(File videoFile) async {
    return await VideoUtils.validateVideoFile(videoFile);
  }

  /// Extract video metadata (duration, resolution, codec, bitrate)
  /// 
  /// Uses video_player to get video info (alternative approach)
  Future<Map<String, dynamic>?> extractVideoMetadata(File videoFile) async {
    try {
      // Note: v_video_compressor might not have getVideoInfo
      // We'll use video_player to get basic info, or file stats
      final stat = await videoFile.stat();
      
      // For now, return basic metadata from file system
      // Full metadata extraction can be added later with video_player
      return {
        'filesize': stat.size,
        // Duration, width, height, bitrate will be extracted later
        // when video_player is integrated in UI layer
      };
    } catch (e) {
      // Return null if metadata extraction fails
      return null;
    }
  }
}

/// Static function for isolate compression (must be top-level)
/// 
/// This function is used with compute() to run compression in isolate
Future<File> _compressVideoInIsolate(String videoPath) async {
  try {
    final compressor = VVideoCompressor();
    final result = await compressor.compressVideo(
      videoPath,
      const VVideoCompressionConfig.medium(), // Medium quality
    );

    if (result == null || result.compressedFilePath.isEmpty) {
      throw Exception('Video compression failed: no output path');
    }

    return File(result.compressedFilePath);
  } catch (e) {
    throw Exception('Video compression failed: $e');
  }
}

/// Video processing result with progress tracking
class VideoProcessingResult {
  final VideoMetadata? video;
  final double progress; // 0.0 - 1.0
  final bool isComplete;
  final String? error;

  VideoProcessingResult({
    this.video,
    required this.progress,
    required this.isComplete,
    this.error,
  });
}
