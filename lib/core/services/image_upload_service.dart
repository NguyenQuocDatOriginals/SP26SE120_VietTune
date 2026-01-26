import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import '../../domain/entities/image_metadata.dart';
import '../utils/image_utils.dart';
import 'image_storage_service.dart';

/// Service for picking and processing images
/// 
/// Handles:
/// - Image picking from gallery/camera
/// - Compression in isolates (non-blocking)
/// - Exif data extraction
/// - Image validation
/// - Coordination with ImageStorageService
class ImageUploadService {
  final ImagePicker _picker = ImagePicker();
  final ImageStorageService _storageService;

  ImageUploadService(this._storageService);

  /// Pick and process a single image
  /// 
  /// Returns ImageMetadata with relative path, or null if cancelled/error
  Future<ImageMetadata?> pickAndProcessImage({
    ImageSource source = ImageSource.gallery,
    bool compress = true,
    bool preserveExif = true,
  }) async {
    try {
      // Pick image
      final XFile? pickedFile = await _picker.pickImage(
        source: source,
        imageQuality: compress ? 85 : 100,
      );

      if (pickedFile == null) {
        return null; // User cancelled
      }

      final file = File(pickedFile.path);

      // Validate image
      final validation = await ImageUtils.validateImageFile(file);
      if (!validation.isValid) {
        throw Exception(validation.error ?? 'Invalid image');
      }

      // Compress in isolate if needed
      File processedFile = file;
      if (compress) {
        processedFile = await compressImageInIsolate(file);
      }

      // Extract Exif data if needed
      Map<String, dynamic>? exifData;
      DateTime? capturedDate;
      if (preserveExif) {
        // Note: Exif extraction would require exif package
        // For now, we'll use file modification time as fallback
        final stat = await processedFile.stat();
        capturedDate = stat.modified;
      }

      // Get file size
      final fileSize = await ImageUtils.getImageFileSize(processedFile);
      final mimeType = ImageUtils.getMimeTypeFromPath(processedFile.path);

      // Copy to draft storage (returns relative path)
      final relativePath = await _storageService.copyToDraftStorage(processedFile);

      // Create ImageMetadata
      return ImageMetadata(
        relativePath: relativePath,
        capturedDate: capturedDate,
        fileSizeBytes: fileSize,
        mimeType: mimeType,
        exifData: exifData,
        isMainImage: false,
      );
    } catch (e) {
      throw Exception('Failed to pick and process image: $e');
    }
  }

  /// Pick and process multiple images
  /// 
  /// Returns stream of ImageProcessingResult with progress tracking
  Stream<ImageProcessingResult> pickAndProcessMultipleImages({
    required int maxImages,
    bool compress = true,
  }) async* {
    try {
      // Pick multiple images
      final List<XFile> pickedFiles = await _picker.pickMultiImage(
        imageQuality: compress ? 85 : 100,
      );

      if (pickedFiles.isEmpty) {
        yield ImageProcessingResult(
          image: null,
          progress: 1.0,
          isComplete: true,
          error: null,
        );
        return;
      }

      // Limit to maxImages
      final filesToProcess = pickedFiles.take(maxImages).toList();
      final total = filesToProcess.length;

      for (int i = 0; i < filesToProcess.length; i++) {
        try {
          final pickedFile = filesToProcess[i];
          final file = File(pickedFile.path);

          // Validate
          final validation = await ImageUtils.validateImageFile(file);
          if (!validation.isValid) {
            yield ImageProcessingResult(
              image: null,
              progress: (i + 1) / total,
              isComplete: false,
              error: validation.error,
            );
            continue;
          }

          // Compress in isolate
          File processedFile = file;
          if (compress) {
            processedFile = await compressImageInIsolate(file);
          }

          // Get metadata
          final fileSize = await ImageUtils.getImageFileSize(processedFile);
          final mimeType = ImageUtils.getMimeTypeFromPath(processedFile.path);
          final stat = await processedFile.stat();
          final capturedDate = stat.modified;

          // Copy to draft storage
          final relativePath = await _storageService.copyToDraftStorage(processedFile);

          // Create ImageMetadata
          final imageMetadata = ImageMetadata(
            relativePath: relativePath,
            capturedDate: capturedDate,
            fileSizeBytes: fileSize,
            mimeType: mimeType,
            isMainImage: false,
          );

          yield ImageProcessingResult(
            image: imageMetadata,
            progress: (i + 1) / total,
            isComplete: i == filesToProcess.length - 1,
            error: null,
          );
        } catch (e) {
          yield ImageProcessingResult(
            image: null,
            progress: (i + 1) / total,
            isComplete: i == filesToProcess.length - 1,
            error: 'Failed to process image: $e',
          );
        }
      }
    } catch (e) {
      yield ImageProcessingResult(
        image: null,
        progress: 1.0,
        isComplete: true,
        error: 'Failed to pick images: $e',
      );
    }
  }

  /// Compress image in isolate (non-blocking)
  /// 
  /// Uses compute() to run compression in separate isolate
  /// This prevents blocking the main UI thread
  Future<File> compressImageInIsolate(File imageFile) async {
    return await compute(_compressImage, imageFile.path);
  }

  /// Static function for isolate compression
  /// 
  /// This must be a top-level or static function to work with compute()
  static Future<File> _compressImage(String imagePath) async {
    final file = File(imagePath);
    final targetPath = '${imagePath}_compressed.jpg';

    // Compress using flutter_image_compress (native, fast)
    final result = await FlutterImageCompress.compressAndGetFile(
      file.absolute.path,
      targetPath,
      quality: 85,
      minWidth: 1920,
      minHeight: 1080,
    );

    if (result == null) {
      throw Exception('Compression failed');
    }

    return File(result.path);
  }

  /// Extract Exif data from image file
  /// 
  /// Note: This requires exif package. For now, returns file metadata.
  Future<Map<String, dynamic>?> extractExifData(File imageFile) async {
    try {
      final stat = await imageFile.stat();
      return {
        'modified': stat.modified.toIso8601String(),
        'size': stat.size,
        // Add more Exif extraction when exif package is added
      };
    } catch (e) {
      return null;
    }
  }

  /// Validate image file
  Future<ImageValidationResult> validateImage(File imageFile) async {
    return await ImageUtils.validateImageFile(imageFile);
  }
}

/// Result with progress tracking for image processing
class ImageProcessingResult {
  final ImageMetadata? image;
  final double progress; // 0.0 - 1.0
  final bool isComplete;
  final String? error;

  ImageProcessingResult({
    required this.image,
    required this.progress,
    required this.isComplete,
    this.error,
  });
}
