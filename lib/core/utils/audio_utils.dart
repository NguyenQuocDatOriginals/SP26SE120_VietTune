import 'constants.dart';

/// Audio utility functions
class AudioUtils {
  /// Check if file extension is supported
  static bool isSupportedAudioFormat(String fileName) {
    final extension = fileName.split('.').last.toLowerCase();
    return AppConstants.supportedAudioFormats.contains(extension);
  }

  /// Get file extension from file name
  static String getFileExtension(String fileName) {
    return fileName.split('.').last.toLowerCase();
  }

  /// Validate audio file size
  static bool isValidAudioFileSize(int fileSizeInBytes) {
    return fileSizeInBytes <= AppConstants.maxAudioFileSize;
  }

  /// Format audio file size error message
  static String getAudioFileSizeErrorMessage() {
    final maxSizeMB = AppConstants.maxAudioFileSize / (1024 * 1024);
    return 'Kích thước file không được vượt quá ${maxSizeMB.toInt()}MB';
  }

  /// Get supported audio formats as string
  static String getSupportedFormatsString() {
    return AppConstants.supportedAudioFormats.join(', ').toUpperCase();
  }

  /// Estimate audio duration from file size (rough estimate)
  /// This is a very rough estimate and should not be relied upon
  static int estimateDurationFromFileSize(int fileSizeInBytes, int bitrate) {
    // Duration in seconds = (file size in bytes * 8) / (bitrate in bps)
    if (bitrate <= 0) return 0;
    return ((fileSizeInBytes * 8) / (bitrate * 1000)).round();
  }
}
