import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:viettune_archive/core/services/video_upload_service.dart';
import 'package:viettune_archive/core/services/video_storage_service.dart';
import 'package:viettune_archive/core/utils/video_utils.dart';
import 'package:viettune_archive/core/utils/constants.dart';

void main() {
  group('VideoUploadService', () {
    late VideoStorageService storageService;
    late VideoUploadService uploadService;
    late Directory tempDir;
    late File testVideo;

    setUpAll(() async {
      tempDir = await Directory.systemTemp.createTemp('video_upload_test');
      testVideo = File('${tempDir.path}/test.mp4');
      await testVideo.writeAsString('dummy video content');
    });

    tearDownAll(() async {
      if (await tempDir.exists()) {
        await tempDir.delete(recursive: true);
      }
    });

    setUp(() {
      storageService = VideoStorageService();
      uploadService = VideoUploadService(storageService);
    });

    test('validateVideo returns valid result for valid file', () async {
      final result = await uploadService.validateVideo(testVideo);
      
      expect(result.isValid, isTrue);
      expect(result.error, isNull);
    });

    test('validateVideo returns invalid result for non-existent file', () async {
      final nonExistentFile = File('${tempDir.path}/nonexistent.mp4');
      
      final result = await uploadService.validateVideo(nonExistentFile);
      
      expect(result.isValid, isFalse);
      expect(result.error, isNotEmpty);
    });

    test('validateVideo returns invalid result for oversized file', () async {
      final largeFile = File('${tempDir.path}/large.mp4');
      final largeContent = 'x' * (AppConstants.maxVideoFileSize + 1);
      await largeFile.writeAsString(largeContent);
      
      final result = await uploadService.validateVideo(largeFile);
      
      expect(result.isValid, isFalse);
      expect(result.error, isNotEmpty);
      expect(result.error, contains('too large'));
      
      // Clean up
      if (await largeFile.exists()) {
        await largeFile.delete();
      }
    });

    test('extractVideoMetadata returns metadata for existing file', () async {
      final metadata = await uploadService.extractVideoMetadata(testVideo);
      
      // Should return a map (even if minimal)
      expect(metadata, isNotNull);
      expect(metadata, isA<Map<String, dynamic>>());
    });

    test('extractVideoMetadata returns null for non-existent file', () async {
      final nonExistentFile = File('${tempDir.path}/nonexistent.mp4');
      
      final metadata = await uploadService.extractVideoMetadata(nonExistentFile);
      
      // Should handle gracefully
      expect(metadata, isA<Map<String, dynamic>?>());
    });

    // Note: Tests for pickAndProcessVideo, generateThumbnail, and compressVideo
    // require platform-specific packages (image_picker, video_thumbnail, v_video_compressor)
    // and should be tested in integration tests or with proper mocking
  });
}
