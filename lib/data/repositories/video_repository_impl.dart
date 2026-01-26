import 'dart:io';
import 'package:image_picker/image_picker.dart';
import '../../core/services/video_upload_service.dart';
import '../../core/services/video_storage_service.dart';
import 'video_repository.dart';

/// Implementation of VideoRepository
/// 
/// Wraps VideoUploadService and VideoStorageService
/// Handles error mapping and provides clean interface for UI layer
class VideoRepositoryImpl implements VideoRepository {
  final VideoUploadService _uploadService;
  final VideoStorageService _storageService;

  VideoRepositoryImpl({
    required VideoUploadService uploadService,
    required VideoStorageService storageService,
  })  : _uploadService = uploadService,
        _storageService = storageService;

  @override
  Stream<VideoProcessingResult> pickAndProcessVideos({
    required int maxVideos,
    ImageSource? source,
  }) {
    try {
      if (source != null) {
        // Single video pick with specific source (camera or gallery)
        return _pickSingleVideo(source);
      } else {
        // Multiple videos pick (always uses gallery)
        return _uploadService.pickAndProcessMultipleVideos(
          maxVideos: maxVideos,
        );
      }
    } catch (e) {
      return Stream.value(
        VideoProcessingResult(
          video: null,
          progress: 1.0,
          isComplete: true,
          error: 'Failed to pick videos: $e',
        ),
      );
    }
  }

  /// Helper to convert single video pick to stream
  Stream<VideoProcessingResult> _pickSingleVideo(ImageSource source) async* {
    try {
      final video = await _uploadService.pickAndProcessVideo(source: source);
      yield VideoProcessingResult(
        video: video,
        progress: 1.0,
        isComplete: true,
        error: video == null ? 'Video selection cancelled' : null,
      );
    } catch (e) {
      yield VideoProcessingResult(
        video: null,
        progress: 1.0,
        isComplete: true,
        error: 'Failed to pick video: $e',
      );
    }
  }

  @override
  Future<File?> getVideoFile(String relativePath) async {
    try {
      return await _storageService.getFileFromRelativePath(relativePath);
    } catch (e) {
      return null;
    }
  }

  @override
  Future<File?> getThumbnailFile(String thumbnailRelativePath) async {
    try {
      return await _storageService.getThumbnailFileFromRelativePath(
        thumbnailRelativePath,
      );
    } catch (e) {
      return null;
    }
  }

  @override
  Future<bool> deleteVideo(String relativePath) async {
    try {
      return await _storageService.deleteVideo(relativePath);
    } catch (e) {
      return false;
    }
  }

  @override
  Future<bool> deleteThumbnail(String thumbnailRelativePath) async {
    try {
      return await _storageService.deleteThumbnail(thumbnailRelativePath);
    } catch (e) {
      return false;
    }
  }

  @override
  Future<bool> deleteVideoAndThumbnail({
    required String videoRelativePath,
    String? thumbnailRelativePath,
  }) async {
    try {
      return await _storageService.deleteVideoAndThumbnail(
        videoRelativePath: videoRelativePath,
        thumbnailRelativePath: thumbnailRelativePath,
      );
    } catch (e) {
      return false;
    }
  }

  @override
  Future<int> cleanupOrphanFiles(List<String> activeRelativePaths) async {
    try {
      return await _storageService.cleanupOrphanFiles(activeRelativePaths);
    } catch (e) {
      return 0;
    }
  }

  @override
  Future<int> getDraftVideosStorageSize() async {
    try {
      return await _storageService.getDraftVideosStorageSize();
    } catch (e) {
      return 0;
    }
  }
}
