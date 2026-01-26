import 'dart:io';
import 'package:path/path.dart' as path;
import 'package:path_provider/path_provider.dart';
import '../utils/constants.dart';

/// Image utility functions
class ImageUtils {
  /// Check if file format is supported
  static bool isValidImageFormat(String filePath) {
    final extension = path.extension(filePath).toLowerCase().replaceFirst('.', '');
    return AppConstants.supportedImageFormats.contains(extension);
  }

  /// Check if image file size is valid
  static bool isValidImageSize(File file) {
    final size = file.lengthSync();
    return size <= AppConstants.maxImageFileSize;
  }

  /// Get file size in bytes
  static Future<int> getImageFileSize(File file) async {
    return await file.length();
  }

  /// Format file size to human-readable string
  static String formatFileSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  /// Get supported image formats
  static List<String> getSupportedImageFormats() {
    return AppConstants.supportedImageFormats;
  }

  /// Extract relative path from absolute path
  /// 
  /// Example: "/data/user/0/.../draft_images/abc123.jpg" -> "draft_images/abc123.jpg"
  /// 
  /// Note: This is a simple extraction. For accurate results, use async version
  /// that gets documents directory.
  static String? getRelativePathFromAbsolute(String absolutePath) {
    try {
      // Check if path contains 'draft_images'
      if (absolutePath.contains('draft_images')) {
        final parts = absolutePath.split('draft_images');
        if (parts.length > 1) {
          return 'draft_images${parts[1]}';
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Extract relative path from absolute path (async version)
  /// 
  /// More accurate as it uses actual documents directory path
  static Future<String?> getRelativePathFromAbsoluteAsync(
    String absolutePath,
  ) async {
    try {
      final documentsDir = await getApplicationDocumentsDirectory();
      if (absolutePath.startsWith(documentsDir.path)) {
        return path.relative(absolutePath, from: documentsDir.path);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Combine relative path with documents directory
  /// 
  /// Example: "draft_images/abc123.jpg" -> "/data/user/0/.../draft_images/abc123.jpg"
  static Future<String> combinePathWithDocumentsDir(String relativePath) async {
    final documentsDir = await getApplicationDocumentsDirectory();
    return path.join(documentsDir.path, relativePath);
  }

  /// Get MIME type from file extension
  static String? getMimeTypeFromPath(String filePath) {
    final extension = path.extension(filePath).toLowerCase();
    switch (extension) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      default:
        return null;
    }
  }

  /// Validate image file (format and size)
  static Future<ImageValidationResult> validateImageFile(File file) async {
    if (!await file.exists()) {
      return ImageValidationResult(
        isValid: false,
        error: 'File does not exist',
      );
    }

    if (!isValidImageFormat(file.path)) {
      return ImageValidationResult(
        isValid: false,
        error: 'Unsupported image format. Supported: ${getSupportedImageFormats().join(", ")}',
      );
    }

    if (!isValidImageSize(file)) {
      final size = await getImageFileSize(file);
      return ImageValidationResult(
        isValid: false,
        error: 'Image too large: ${formatFileSize(size)}. Maximum: ${formatFileSize(AppConstants.maxImageFileSize)}',
      );
    }

    return ImageValidationResult(isValid: true);
  }
}

/// Image validation result
class ImageValidationResult {
  final bool isValid;
  final String? error;

  ImageValidationResult({
    required this.isValid,
    this.error,
  });
}
