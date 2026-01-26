import 'dart:io';
import 'package:path/path.dart' as path;
import '../utils/constants.dart';

/// Video utility functions
class VideoUtils {
  /// Check if file format is supported
  static bool isValidVideoFormat(String filePath) {
    final extension = path.extension(filePath).toLowerCase().replaceFirst('.', '');
    return AppConstants.supportedVideoFormats.contains(extension);
  }

  /// Check if video file size is valid
  static bool isValidVideoSize(File file) {
    final size = file.lengthSync();
    return size <= AppConstants.maxVideoFileSize;
  }

  /// Get file size in bytes
  static Future<int> getVideoFileSize(File file) async {
    return await file.length();
  }

  /// Format file size to human-readable string
  static String formatFileSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    if (bytes < 1024 * 1024 * 1024) {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }

  /// Get supported video formats
  static List<String> getSupportedVideoFormats() {
    return AppConstants.supportedVideoFormats;
  }

  /// Get supported video formats as string (for display)
  static String getSupportedFormatsString() {
    return AppConstants.supportedVideoFormats.join(', ').toUpperCase();
  }

  /// Get MIME type from file extension
  static String? getMimeTypeFromPath(String filePath) {
    final extension = path.extension(filePath).toLowerCase();
    switch (extension) {
      case '.mp4':
        return 'video/mp4';
      case '.mov':
        return 'video/quicktime';
      case '.avi':
        return 'video/x-msvideo';
      case '.mkv':
        return 'video/x-matroska';
      case '.webm':
        return 'video/webm';
      default:
        return null;
    }
  }

  /// Validate video file (format and size)
  static Future<VideoValidationResult> validateVideoFile(File file) async {
    if (!await file.exists()) {
      return VideoValidationResult(
        isValid: false,
        error: 'File does not exist',
      );
    }

    if (!isValidVideoFormat(file.path)) {
      return VideoValidationResult(
        isValid: false,
        error: 'Unsupported video format. Supported: ${getSupportedFormatsString()}',
      );
    }

    if (!isValidVideoSize(file)) {
      final size = await getVideoFileSize(file);
      return VideoValidationResult(
        isValid: false,
        error: 'Video too large: ${formatFileSize(size)}. Maximum: ${formatFileSize(AppConstants.maxVideoFileSize)}',
      );
    }

    return VideoValidationResult(isValid: true);
  }
}

/// Video validation result
class VideoValidationResult {
  final bool isValid;
  final String? error;

  VideoValidationResult({
    required this.isValid,
    this.error,
  });
}
