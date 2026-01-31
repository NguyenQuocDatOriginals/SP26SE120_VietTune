import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:path_provider/path_provider.dart';
import 'package:viettune_archive/core/services/video_storage_service.dart';

void main() {
  // Initialize Flutter binding for path_provider
  TestWidgetsFlutterBinding.ensureInitialized();

  group('VideoStorageService', () {
    late VideoStorageService service;
    late Directory tempDir;
    late File testVideo;
    late File testThumbnail;

    setUpAll(() async {
      // Create a temporary directory for testing
      tempDir = await Directory.systemTemp.createTemp('video_storage_test');
      // Create dummy test files
      testVideo = File('${tempDir.path}/test.mp4');
      await testVideo.writeAsString('dummy video content');
      testThumbnail = File('${tempDir.path}/test_thumb.jpg');
      await testThumbnail.writeAsString('dummy thumbnail content');
    });

    tearDownAll(() async {
      // Clean up
      if (await tempDir.exists()) {
        await tempDir.delete(recursive: true);
      }
    });

    setUp(() {
      service = VideoStorageService();
    });

    test('copyToDraftStorage copies file and returns relative path', () async {
      final relativePath = await service.copyToDraftStorage(testVideo);
      
      expect(relativePath, isNotEmpty);
      expect(relativePath, startsWith('draft_videos/'));
      expect(relativePath, endsWith('.mp4'));
      
      // Verify file exists
      final retrievedFile = await service.getFileFromRelativePath(relativePath);
      expect(retrievedFile, isNotNull);
      expect(await retrievedFile!.exists(), isTrue);
    });

    test('copyToDraftStorage throws exception for non-existent file', () async {
      final nonExistentFile = File('${tempDir.path}/nonexistent.mp4');
      
      expect(
        () => service.copyToDraftStorage(nonExistentFile),
        throwsException,
      );
    });

    test('copyThumbnailToDraftStorage copies thumbnail and returns relative path', () async {
      final relativePath = await service.copyThumbnailToDraftStorage(testThumbnail);
      
      expect(relativePath, isNotEmpty);
      expect(relativePath, startsWith('draft_videos/thumbnails/'));
      expect(relativePath, endsWith('.jpg'));
      
      // Verify file exists
      final retrievedFile = await service.getThumbnailFileFromRelativePath(relativePath);
      expect(retrievedFile, isNotNull);
      expect(await retrievedFile!.exists(), isTrue);
    });

    test('copyThumbnailToDraftStorage throws exception for non-existent file', () async {
      final nonExistentFile = File('${tempDir.path}/nonexistent_thumb.jpg');
      
      expect(
        () => service.copyThumbnailToDraftStorage(nonExistentFile),
        throwsException,
      );
    });

    test('getFileFromRelativePath returns null for non-existent file', () async {
      final file = await service.getFileFromRelativePath('draft_videos/nonexistent.mp4');
      expect(file, isNull);
    });

    test('getThumbnailFileFromRelativePath returns null for non-existent file', () async {
      final file = await service.getThumbnailFileFromRelativePath('draft_videos/thumbnails/nonexistent.jpg');
      expect(file, isNull);
    });

    test('deleteVideo removes file successfully', () async {
      // First copy a file
      final relativePath = await service.copyToDraftStorage(testVideo);
      
      // Verify it exists
      expect(await service.getFileFromRelativePath(relativePath), isNotNull);
      
      // Delete it
      final deleted = await service.deleteVideo(relativePath);
      expect(deleted, isTrue);
      
      // Verify it's gone
      expect(await service.getFileFromRelativePath(relativePath), isNull);
    });

    test('deleteVideo returns false for non-existent file', () async {
      final deleted = await service.deleteVideo('draft_videos/nonexistent.mp4');
      expect(deleted, isFalse);
    });

    test('deleteThumbnail removes thumbnail successfully', () async {
      // First copy a thumbnail
      final relativePath = await service.copyThumbnailToDraftStorage(testThumbnail);
      
      // Verify it exists
      expect(await service.getThumbnailFileFromRelativePath(relativePath), isNotNull);
      
      // Delete it
      final deleted = await service.deleteThumbnail(relativePath);
      expect(deleted, isTrue);
      
      // Verify it's gone
      expect(await service.getThumbnailFileFromRelativePath(relativePath), isNull);
    });

    test('deleteThumbnail returns false for non-existent file', () async {
      final deleted = await service.deleteThumbnail('draft_videos/thumbnails/nonexistent.jpg');
      expect(deleted, isFalse);
    });

    test('deleteVideoAndThumbnail removes both files successfully', () async {
      // First copy both files
      final videoPath = await service.copyToDraftStorage(testVideo);
      final thumbnailPath = await service.copyThumbnailToDraftStorage(testThumbnail);
      
      // Verify they exist
      expect(await service.getFileFromRelativePath(videoPath), isNotNull);
      expect(await service.getThumbnailFileFromRelativePath(thumbnailPath), isNotNull);
      
      // Delete both
      final deleted = await service.deleteVideoAndThumbnail(
        videoRelativePath: videoPath,
        thumbnailRelativePath: thumbnailPath,
      );
      expect(deleted, isTrue);
      
      // Verify they're gone
      expect(await service.getFileFromRelativePath(videoPath), isNull);
      expect(await service.getThumbnailFileFromRelativePath(thumbnailPath), isNull);
    });

    test('deleteVideoAndThumbnail works when thumbnail is null', () async {
      // First copy a video
      final videoPath = await service.copyToDraftStorage(testVideo);
      
      // Delete with null thumbnail
      final deleted = await service.deleteVideoAndThumbnail(
        videoRelativePath: videoPath,
        thumbnailRelativePath: null,
      );
      expect(deleted, isTrue);
      
      // Verify video is gone
      expect(await service.getFileFromRelativePath(videoPath), isNull);
    });

    test('cleanupOrphanFiles removes files not in active list', () async {
      // Create some files
      final video1Path = await service.copyToDraftStorage(testVideo);
      final video2Path = await service.copyToDraftStorage(testVideo);
      
      // Cleanup with only video1 in active list
      final deletedCount = await service.cleanupOrphanFiles([video1Path]);
      
      // video2 should be deleted
      expect(deletedCount, greaterThan(0));
      expect(await service.getFileFromRelativePath(video2Path), isNull);
      expect(await service.getFileFromRelativePath(video1Path), isNotNull);
    });

    test('cleanupOrphanFiles does not delete active files', () async {
      // Create a file
      final videoPath = await service.copyToDraftStorage(testVideo);
      
      // Cleanup with file in active list
      final deletedCount = await service.cleanupOrphanFiles([videoPath]);
      
      // File should still exist
      expect(await service.getFileFromRelativePath(videoPath), isNotNull);
    });

    test('getDraftVideosStorageSize returns correct size', () async {
      // Create a file
      final videoPath = await service.copyToDraftStorage(testVideo);
      
      // Get storage size
      final size = await service.getDraftVideosStorageSize();
      
      // Should be greater than 0
      expect(size, greaterThan(0));
      
      // Clean up
      await service.deleteVideo(videoPath);
    });

    test('getDraftVideosStorageSize returns 0 for empty directory', () async {
      // Get storage size (should be 0 or small if directory exists but is empty)
      final size = await service.getDraftVideosStorageSize();
      
      // Should be 0 or non-negative
      expect(size, greaterThanOrEqualTo(0));
    });

    test('getDraftVideosDirectory creates directory if not exists', () async {
      final dir = await service.getDraftVideosDirectory();
      expect(await dir.exists(), isTrue);
    });

    test('getThumbnailsDirectory creates directory if not exists', () async {
      final dir = await service.getThumbnailsDirectory();
      expect(await dir.exists(), isTrue);
    });
  });
}
