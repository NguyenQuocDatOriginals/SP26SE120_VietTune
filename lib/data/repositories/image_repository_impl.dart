import 'dart:io';
import 'package:image_picker/image_picker.dart';
import '../../domain/entities/image_metadata.dart';
import '../../core/services/image_upload_service.dart';
import '../../core/services/image_storage_service.dart';
import 'image_repository.dart';

/// Implementation of ImageRepository
/// 
/// Wraps ImageUploadService and ImageStorageService
/// Handles error mapping and provides clean interface for UI layer
class ImageRepositoryImpl implements ImageRepository {
  final ImageUploadService _uploadService;
  final ImageStorageService _storageService;

  ImageRepositoryImpl({
    required ImageUploadService uploadService,
    required ImageStorageService storageService,
  })  : _uploadService = uploadService,
        _storageService = storageService;

  @override
  Stream<ImageProcessingResult> pickAndProcessImages({
    required int maxImages,
    ImageSource? source,
  }) {
    try {
      if (source != null) {
        // Single image pick with specific source (camera or gallery)
        return _pickSingleImage(source);
      } else {
        // Multiple images pick (always uses gallery - pickMultiImage doesn't support camera)
        return _uploadService.pickAndProcessMultipleImages(
          maxImages: maxImages,
        );
      }
    } catch (e) {
      return Stream.value(
        ImageProcessingResult(
          image: null,
          progress: 1.0,
          isComplete: true,
          error: 'Failed to pick images: $e',
        ),
      );
    }
  }

  /// Helper to convert single image pick to stream
  Stream<ImageProcessingResult> _pickSingleImage(ImageSource source) async* {
    try {
      final image = await _uploadService.pickAndProcessImage(source: source);
      yield ImageProcessingResult(
        image: image,
        progress: 1.0,
        isComplete: true,
        error: image == null ? 'Image selection cancelled' : null,
      );
    } catch (e) {
      yield ImageProcessingResult(
        image: null,
        progress: 1.0,
        isComplete: true,
        error: 'Failed to pick image: $e',
      );
    }
  }

  @override
  Future<File?> getImageFile(String relativePath) async {
    try {
      return await _storageService.getFileFromRelativePath(relativePath);
    } catch (e) {
      return null;
    }
  }

  @override
  Future<bool> deleteImage(String relativePath) async {
    try {
      return await _storageService.deleteImage(relativePath);
    } catch (e) {
      return false;
    }
  }

  @override
  Future<int> deleteImages(List<String> relativePaths) async {
    try {
      return await _storageService.deleteImages(relativePaths);
    } catch (e) {
      return 0;
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
  Future<int> getDraftImagesStorageSize() async {
    try {
      return await _storageService.getDraftImagesStorageSize();
    } catch (e) {
      return 0;
    }
  }
}
