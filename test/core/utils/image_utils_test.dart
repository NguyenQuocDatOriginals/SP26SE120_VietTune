import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:viettune_archive/core/utils/image_utils.dart';
import 'package:viettune_archive/core/utils/constants.dart';

void main() {
  group('ImageUtils', () {
    test('isValidImageFormat returns true for supported formats', () {
      expect(ImageUtils.isValidImageFormat('test.jpg'), isTrue);
      expect(ImageUtils.isValidImageFormat('test.jpeg'), isTrue);
      expect(ImageUtils.isValidImageFormat('test.png'), isTrue);
      expect(ImageUtils.isValidImageFormat('test.JPG'), isTrue); // Case insensitive
    });

    test('isValidImageFormat returns false for unsupported formats', () {
      expect(ImageUtils.isValidImageFormat('test.gif'), isFalse);
      expect(ImageUtils.isValidImageFormat('test.bmp'), isFalse);
      expect(ImageUtils.isValidImageFormat('test.pdf'), isFalse);
    });

    test('formatFileSize formats bytes correctly', () {
      expect(ImageUtils.formatFileSize(0), '0 B');
      expect(ImageUtils.formatFileSize(1024), '1.0 KB');
      expect(ImageUtils.formatFileSize(1024 * 1024), '1.0 MB');
      expect(ImageUtils.formatFileSize(1024 * 1024 * 1024), '1.0 GB');
      expect(ImageUtils.formatFileSize(1536), '1.5 KB');
    });

    test('getSupportedImageFormats returns list of formats', () {
      final formats = ImageUtils.getSupportedImageFormats();
      expect(formats, isNotEmpty);
      expect(formats.contains('jpg'), isTrue);
      expect(formats.contains('jpeg'), isTrue);
      expect(formats.contains('png'), isTrue);
    });
  });
}
