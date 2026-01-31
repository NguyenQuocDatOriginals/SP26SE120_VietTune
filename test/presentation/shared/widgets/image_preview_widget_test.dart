import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:viettune_archive/domain/entities/image_metadata.dart';
import 'package:viettune_archive/presentation/shared/widgets/image_preview_widget.dart';
import 'package:viettune_archive/core/services/image_storage_service.dart';
import 'package:viettune_archive/core/di/injection.dart';

// Simple mock ImageStorageService
class MockImageStorageService implements ImageStorageService {
  final File? fileToReturn;
  final bool shouldThrow;
  final Map<String, File?> fileMap = {};

  MockImageStorageService({
    this.fileToReturn,
    this.shouldThrow = false,
  });

  void setFileForPath(String path, File? file) {
    fileMap[path] = file;
  }

  @override
  Future<File?> getFileFromRelativePath(String relativePath) async {
    if (shouldThrow) {
      throw Exception('Test error');
    }
    return fileMap[relativePath] ?? fileToReturn;
  }

  @override
  Future<Directory> getDraftImagesDirectory() async {
    throw UnimplementedError();
  }

  @override
  Future<String> copyToDraftStorage(File sourceFile) async {
    throw UnimplementedError();
  }

  @override
  Future<bool> deleteImage(String relativePath) async {
    throw UnimplementedError();
  }

  @override
  Future<int> deleteImages(List<String> relativePaths) async {
    throw UnimplementedError();
  }

  @override
  Future<int> cleanupOrphanFiles(List<String> activeRelativePaths) async {
    throw UnimplementedError();
  }

  @override
  Future<int> getDraftImagesStorageSize() async {
    throw UnimplementedError();
  }
}

void main() {
  late MockImageStorageService mockStorageService;
  late File testImageFile;

  setUp(() {
    mockStorageService = MockImageStorageService();
    
    // Create a temporary test file
    testImageFile = File('test_image.jpg');
    testImageFile.writeAsStringSync('fake image data');
    
    // Register mock in GetIt
    if (getIt.isRegistered<ImageStorageService>()) {
      getIt.unregister<ImageStorageService>();
    }
    getIt.registerSingleton<ImageStorageService>(mockStorageService);
  });

  tearDown(() {
    // Clean up test file
    if (testImageFile.existsSync()) {
      testImageFile.deleteSync();
    }
    
    // Clean up GetIt
    if (getIt.isRegistered<ImageStorageService>()) {
      getIt.unregister<ImageStorageService>();
    }
  });

  group('ImagePreviewWidget', () {
    testWidgets('renders loading placeholder when file is loading', (tester) async {
      // Arrange
      final image = ImageMetadata(
        relativePath: 'test/draft_images/test.jpg',
      );
      
      mockStorageService.setFileForPath(
        'test/draft_images/test.jpg',
        testImageFile,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ImagePreviewWidget(
              image: image,
            ),
          ),
        ),
      );

      // Assert - should show loading indicator
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('renders image when file is loaded successfully', (tester) async {
      // Arrange
      final image = ImageMetadata(
        relativePath: 'test/draft_images/test.jpg',
      );
      
      mockStorageService.setFileForPath(
        'test/draft_images/test.jpg',
        testImageFile,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ImagePreviewWidget(
              image: image,
            ),
          ),
        ),
      );

      // Wait for FutureBuilder to complete
      await tester.pumpAndSettle();

      // Assert - should show Image.file widget
      expect(find.byType(Image), findsOneWidget);
    });

    testWidgets('renders error placeholder when file loading fails', (tester) async {
      // Arrange
      final image = ImageMetadata(
        relativePath: 'test/draft_images/test.jpg',
      );
      
      mockStorageService.setFileForPath(
        'test/draft_images/test.jpg',
        null,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ImagePreviewWidget(
              image: image,
            ),
          ),
        ),
      );

      // Wait for FutureBuilder to complete
      await tester.pumpAndSettle();

      // Assert - should show error placeholder
      expect(find.byIcon(Icons.broken_image), findsOneWidget);
      expect(find.text('Không thể tải ảnh'), findsOneWidget);
    });

    testWidgets('shows main image badge when isMainImage is true', (tester) async {
      // Arrange
      final image = ImageMetadata(
        relativePath: 'test/draft_images/test.jpg',
        isMainImage: true,
      );
      
      mockStorageService.setFileForPath(
        'test/draft_images/test.jpg',
        testImageFile,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ImagePreviewWidget(
              image: image,
            ),
          ),
        ),
      );

      // Wait for FutureBuilder to complete
      await tester.pumpAndSettle();

      // Assert - should show main image badge
      expect(find.text('Ảnh chính'), findsOneWidget);
      expect(find.byIcon(Icons.star), findsOneWidget);
    });

    testWidgets('does not show main image badge when isMainImage is false', (tester) async {
      // Arrange
      final image = ImageMetadata(
        relativePath: 'test/draft_images/test.jpg',
        isMainImage: false,
      );
      
      mockStorageService.setFileForPath(
        'test/draft_images/test.jpg',
        testImageFile,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ImagePreviewWidget(
              image: image,
            ),
          ),
        ),
      );

      // Wait for FutureBuilder to complete
      await tester.pumpAndSettle();

      // Assert - should not show main image badge
      expect(find.text('Ảnh chính'), findsNothing);
    });

    testWidgets('shows remove button when onRemove callback is provided', (tester) async {
      // Arrange
      final image = ImageMetadata(
        relativePath: 'test/draft_images/test.jpg',
      );
      bool removeCalled = false;
      
      mockStorageService.setFileForPath(
        'test/draft_images/test.jpg',
        testImageFile,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ImagePreviewWidget(
              image: image,
              onRemove: () => removeCalled = true,
            ),
          ),
        ),
      );

      // Wait for FutureBuilder to complete
      await tester.pumpAndSettle();

      // Assert - should show remove button
      expect(find.byIcon(Icons.close), findsOneWidget);
      
      // Tap remove button
      await tester.tap(find.byIcon(Icons.close));
      await tester.pumpAndSettle();
      
      // Assert - callback should be called
      expect(removeCalled, isTrue);
    });

    testWidgets('does not show remove button when onRemove is null', (tester) async {
      // Arrange
      final image = ImageMetadata(
        relativePath: 'test/draft_images/test.jpg',
      );
      
      mockStorageService.setFileForPath(
        'test/draft_images/test.jpg',
        testImageFile,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ImagePreviewWidget(
              image: image,
              onRemove: null,
            ),
          ),
        ),
      );

      // Wait for FutureBuilder to complete
      await tester.pumpAndSettle();

      // Assert - should not show remove button
      expect(find.byIcon(Icons.close), findsNothing);
    });

    testWidgets('calls onTap when image is tapped', (tester) async {
      // Arrange
      final image = ImageMetadata(
        relativePath: 'test/draft_images/test.jpg',
      );
      bool tapCalled = false;
      
      mockStorageService.setFileForPath(
        'test/draft_images/test.jpg',
        testImageFile,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ImagePreviewWidget(
              image: image,
              onTap: () => tapCalled = true,
            ),
          ),
        ),
      );

      // Wait for FutureBuilder to complete
      await tester.pumpAndSettle();

      // Tap on image
      await tester.tap(find.byType(Image));
      await tester.pumpAndSettle();
      
      // Assert - callback should be called
      expect(tapCalled, isTrue);
    });

    testWidgets('respects showRemoveButton parameter', (tester) async {
      // Arrange
      final image = ImageMetadata(
        relativePath: 'test/draft_images/test.jpg',
      );
      
      mockStorageService.setFileForPath(
        'test/draft_images/test.jpg',
        testImageFile,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ImagePreviewWidget(
              image: image,
              onRemove: () {},
              showRemoveButton: false,
            ),
          ),
        ),
      );

      // Wait for FutureBuilder to complete
      await tester.pumpAndSettle();

      // Assert - should not show remove button even if onRemove is provided
      expect(find.byIcon(Icons.close), findsNothing);
    });

    testWidgets('applies custom width and height', (tester) async {
      // Arrange
      final image = ImageMetadata(
        relativePath: 'test/draft_images/test.jpg',
      );
      
      mockStorageService.setFileForPath(
        'test/draft_images/test.jpg',
        testImageFile,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ImagePreviewWidget(
              image: image,
              width: 100,
              height: 100,
            ),
          ),
        ),
      );

      // Wait for FutureBuilder to complete
      await tester.pumpAndSettle();

      // Assert - Image should have specified dimensions
      final imageWidget = tester.widget<Image>(find.byType(Image));
      expect(imageWidget.width, 100);
      expect(imageWidget.height, 100);
    });
  });
}
