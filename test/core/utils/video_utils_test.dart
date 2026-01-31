import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:viettune_archive/core/utils/video_utils.dart';
import 'package:viettune_archive/core/utils/constants.dart';

void main() {
  group('VideoUtils', () {
    test('isValidVideoFormat returns true for supported formats', () {
      expect(VideoUtils.isValidVideoFormat('test.mp4'), isTrue);
      expect(VideoUtils.isValidVideoFormat('test.mov'), isTrue);
      expect(VideoUtils.isValidVideoFormat('test.avi'), isTrue);
      expect(VideoUtils.isValidVideoFormat('test.mkv'), isTrue);
      expect(VideoUtils.isValidVideoFormat('test.webm'), isTrue);
      expect(VideoUtils.isValidVideoFormat('test.MP4'), isTrue); // Case insensitive
    });

    test('isValidVideoFormat returns false for unsupported formats', () {
      expect(VideoUtils.isValidVideoFormat('test.jpg'), isFalse);
      expect(VideoUtils.isValidVideoFormat('test.pdf'), isFalse);
      expect(VideoUtils.isValidVideoFormat('test.txt'), isFalse);
    });

    test('formatFileSize formats bytes correctly', () {
      expect(VideoUtils.formatFileSize(0), '0 B');
      expect(VideoUtils.formatFileSize(1024), '1.0 KB');
      expect(VideoUtils.formatFileSize(1024 * 1024), '1.0 MB');
      expect(VideoUtils.formatFileSize(1024 * 1024 * 1024), '1.0 GB');
      expect(VideoUtils.formatFileSize(1536), '1.5 KB');
    });

    test('getSupportedVideoFormats returns list of formats', () {
      final formats = VideoUtils.getSupportedVideoFormats();
      expect(formats, isNotEmpty);
      expect(formats.contains('mp4'), isTrue);
      expect(formats.contains('mov'), isTrue);
      expect(formats.contains('avi'), isTrue);
    });

    test('getSupportedFormatsString returns uppercase string', () {
      final formatsString = VideoUtils.getSupportedFormatsString();
      expect(formatsString, isNotEmpty);
      expect(formatsString, equals(formatsString.toUpperCase()));
    });

    test('getMimeTypeFromPath returns correct MIME types', () {
      expect(VideoUtils.getMimeTypeFromPath('test.mp4'), 'video/mp4');
      expect(VideoUtils.getMimeTypeFromPath('test.mov'), 'video/quicktime');
      expect(VideoUtils.getMimeTypeFromPath('test.avi'), 'video/x-msvideo');
      expect(VideoUtils.getMimeTypeFromPath('test.mkv'), 'video/x-matroska');
      expect(VideoUtils.getMimeTypeFromPath('test.webm'), 'video/webm');
      expect(VideoUtils.getMimeTypeFromPath('test.unknown'), isNull);
    });

    test('isValidVideoSize returns true for files under max size', () {
      // Create a temporary file with small size
      final tempFile = File('test_video.mp4');
      tempFile.writeAsStringSync('small video content');
      
      expect(VideoUtils.isValidVideoSize(tempFile), isTrue);
      
      // Clean up
      if (tempFile.existsSync()) {
        tempFile.deleteSync();
      }
    });

    test('isValidVideoSize returns false for files over max size', () {
      // Create a temporary file larger than max size
      final tempFile = File('test_large_video.mp4');
      try {
        // Write in chunks to avoid memory issues
        final file = tempFile.openWrite();
        final chunkSize = 1024 * 1024; // 1MB chunks
        final totalSize = AppConstants.maxVideoFileSize + 1;
        for (int i = 0; i < totalSize; i += chunkSize) {
          final remaining = (totalSize - i).clamp(0, chunkSize);
          file.write('x' * remaining);
        }
        file.close();
        
        expect(VideoUtils.isValidVideoSize(tempFile), isFalse);
      } finally {
        // Clean up
        if (tempFile.existsSync()) {
          tempFile.deleteSync();
        }
      }
    });

    test('validateVideoFile returns valid result for valid file', () async {
      final tempFile = File('test_valid.mp4');
      tempFile.writeAsStringSync('valid video content');
      
      final result = await VideoUtils.validateVideoFile(tempFile);
      
      expect(result.isValid, isTrue);
      expect(result.error, isNull);
      
      // Clean up
      if (tempFile.existsSync()) {
        tempFile.deleteSync();
      }
    });

    test('validateVideoFile returns invalid result for non-existent file', () async {
      final nonExistentFile = File('nonexistent.mp4');
      
      final result = await VideoUtils.validateVideoFile(nonExistentFile);
      
      expect(result.isValid, isFalse);
      expect(result.error, isNotEmpty);
      expect(result.error, contains('does not exist'));
    });

    test('validateVideoFile returns invalid result for unsupported format', () async {
      final tempFile = File('test.txt');
      tempFile.writeAsStringSync('not a video');
      
      final result = await VideoUtils.validateVideoFile(tempFile);
      
      expect(result.isValid, isFalse);
      expect(result.error, isNotEmpty);
      expect(result.error, contains('Unsupported video format'));
      
      // Clean up
      if (tempFile.existsSync()) {
        tempFile.deleteSync();
      }
    });

    test('validateVideoFile returns invalid result for oversized file', () async {
      final tempFile = File('test_large.mp4');
      try {
        // Write in chunks to avoid memory issues
        final file = tempFile.openWrite();
        final chunkSize = 1024 * 1024; // 1MB chunks
        final totalSize = AppConstants.maxVideoFileSize + 1;
        for (int i = 0; i < totalSize; i += chunkSize) {
          final remaining = (totalSize - i).clamp(0, chunkSize);
          file.write('x' * remaining);
        }
        file.close();
        
        final result = await VideoUtils.validateVideoFile(tempFile);
        
        expect(result.isValid, isFalse);
        expect(result.error, isNotEmpty);
        expect(result.error, contains('too large'));
      } finally {
        // Clean up
        if (tempFile.existsSync()) {
          tempFile.deleteSync();
        }
      }
    });

    test('getVideoFileSize returns correct file size', () async {
      final tempFile = File('test_size.mp4');
      final content = 'video content';
      tempFile.writeAsStringSync(content);
      
      final size = await VideoUtils.getVideoFileSize(tempFile);
      
      expect(size, equals(content.length));
      
      // Clean up
      if (tempFile.existsSync()) {
        tempFile.deleteSync();
      }
    });
  });
}
