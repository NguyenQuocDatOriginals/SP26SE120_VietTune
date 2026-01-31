import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:path_provider/path_provider.dart';
import 'package:viettune_archive/core/services/image_storage_service.dart';

void main() {
  group('ImageStorageService', () {
    late ImageStorageService service;
    late Directory tempDir;
    late File testImage;

    setUpAll(() async {
      // Create a temporary directory for testing
      tempDir = await Directory.systemTemp.createTemp('image_storage_test');
      // Create a dummy test image file
      testImage = File('${tempDir.path}/test.jpg');
      await testImage.writeAsString('dummy image content');
    });

    tearDownAll(() async {
      // Clean up
      if (await tempDir.exists()) {
        await tempDir.delete(recursive: true);
      }
    });

    setUp(() {
      service = ImageStorageService();
    });

    test('copyToDraftStorage copies file and returns relative path', () async {
      final relativePath = await service.copyToDraftStorage(testImage);
      
      expect(relativePath, isNotEmpty);
      expect(relativePath, startsWith('draft_images/'));
      expect(relativePath, endsWith('.jpg'));
      
      // Verify file exists
      final retrievedFile = await service.getFileFromRelativePath(relativePath);
      expect(retrievedFile, isNotNull);
      expect(await retrievedFile!.exists(), isTrue);
    });

    test('getFileFromRelativePath returns null for non-existent file', () async {
      final file = await service.getFileFromRelativePath('draft_images/nonexistent.jpg');
      expect(file, isNull);
    });

    test('deleteImage removes file successfully', () async {
      // First copy a file
      final relativePath = await service.copyToDraftStorage(testImage);
      
      // Verify it exists
      expect(await service.getFileFromRelativePath(relativePath), isNotNull);
      
      // Delete it
      final deleted = await service.deleteImage(relativePath);
      expect(deleted, isTrue);
      
      // Verify it's gone
      expect(await service.getFileFromRelativePath(relativePath), isNull);
    });

    test('deleteImage returns false for non-existent file', () async {
      final deleted = await service.deleteImage('draft_images/nonexistent.jpg');
      expect(deleted, isFalse);
    });
  });
}
