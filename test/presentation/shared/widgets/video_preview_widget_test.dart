import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:viettune_archive/domain/entities/video_metadata.dart';
import 'package:viettune_archive/presentation/shared/widgets/video_preview_widget.dart';
import 'package:viettune_archive/core/services/video_storage_service.dart';
import 'package:viettune_archive/core/di/injection.dart';

// Simple mock VideoStorageService
class MockVideoStorageService implements VideoStorageService {
  final File? thumbnailFileToReturn;
  final bool shouldThrow;
  final Map<String, File?> thumbnailMap = {};

  MockVideoStorageService({
    this.thumbnailFileToReturn,
    this.shouldThrow = false,
  });

  void setThumbnailForPath(String path, File? file) {
    thumbnailMap[path] = file;
  }

  @override
  Future<File?> getThumbnailFileFromRelativePath(String thumbnailRelativePath) async {
    if (shouldThrow) {
      throw Exception('Test error');
    }
    return thumbnailMap[thumbnailRelativePath] ?? thumbnailFileToReturn;
  }

  @override
  Future<Directory> getDraftVideosDirectory() async {
    throw UnimplementedError();
  }

  @override
  Future<Directory> getThumbnailsDirectory() async {
    throw UnimplementedError();
  }

  @override
  Future<String> copyToDraftStorage(File sourceFile) async {
    throw UnimplementedError();
  }

  @override
  Future<String> copyThumbnailToDraftStorage(File thumbnailFile) async {
    throw UnimplementedError();
  }

  @override
  Future<File?> getFileFromRelativePath(String relativePath) async {
    throw UnimplementedError();
  }

  @override
  Future<bool> deleteVideo(String relativePath) async {
    throw UnimplementedError();
  }

  @override
  Future<bool> deleteThumbnail(String thumbnailRelativePath) async {
    throw UnimplementedError();
  }

  @override
  Future<bool> deleteVideoAndThumbnail({
    required String videoRelativePath,
    String? thumbnailRelativePath,
  }) async {
    throw UnimplementedError();
  }

  @override
  Future<int> cleanupOrphanFiles(List<String> activeRelativePaths) async {
    throw UnimplementedError();
  }

  @override
  Future<int> getDraftVideosStorageSize() async {
    throw UnimplementedError();
  }
}

void main() {
  late MockVideoStorageService mockStorageService;
  late File testThumbnailFile;

  setUp(() {
    mockStorageService = MockVideoStorageService();
    
    // Create a temporary test file
    testThumbnailFile = File('test_thumbnail.jpg');
    testThumbnailFile.writeAsStringSync('fake thumbnail data');
    
    // Register mock in GetIt
    if (getIt.isRegistered<VideoStorageService>()) {
      getIt.unregister<VideoStorageService>();
    }
    getIt.registerSingleton<VideoStorageService>(mockStorageService);
  });

  tearDown(() {
    // Clean up test file
    if (testThumbnailFile.existsSync()) {
      testThumbnailFile.deleteSync();
    }
    
    // Clean up GetIt
    if (getIt.isRegistered<VideoStorageService>()) {
      getIt.unregister<VideoStorageService>();
    }
  });

  group('VideoPreviewWidget', () {
    testWidgets('renders loading placeholder when thumbnail is loading', (tester) async {
      // Arrange
      final video = VideoMetadata(
        relativePath: 'draft_videos/test.mp4',
        thumbnailRelativePath: 'draft_videos/thumbnails/test.jpg',
      );
      
      mockStorageService.setThumbnailForPath(
        'draft_videos/thumbnails/test.jpg',
        testThumbnailFile,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: VideoPreviewWidget(
              video: video,
            ),
          ),
        ),
      );

      // Assert - should show loading indicator
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('renders thumbnail when loaded successfully', (tester) async {
      // Arrange
      final video = VideoMetadata(
        relativePath: 'draft_videos/test.mp4',
        thumbnailRelativePath: 'draft_videos/thumbnails/test.jpg',
      );
      
      mockStorageService.setThumbnailForPath(
        'draft_videos/thumbnails/test.jpg',
        testThumbnailFile,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: VideoPreviewWidget(
              video: video,
            ),
          ),
        ),
      );

      // Wait for FutureBuilder to complete
      await tester.pumpAndSettle();

      // Assert - should show Image.file widget
      expect(find.byType(Image), findsOneWidget);
    });

    testWidgets('renders error placeholder when thumbnail loading fails', (tester) async {
      // Arrange
      final video = VideoMetadata(
        relativePath: 'draft_videos/test.mp4',
        thumbnailRelativePath: 'draft_videos/thumbnails/test.jpg',
      );
      
      mockStorageService.setThumbnailForPath(
        'draft_videos/thumbnails/test.jpg',
        null,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: VideoPreviewWidget(
              video: video,
            ),
          ),
        ),
      );

      // Wait for FutureBuilder to complete
      await tester.pumpAndSettle();

      // Assert - should show error placeholder
      expect(find.byIcon(Icons.videocam_off), findsOneWidget);
      expect(find.text('Không thể tải video'), findsOneWidget);
    });

    testWidgets('shows duration badge when durationInSeconds is provided', (tester) async {
      // Arrange
      final video = VideoMetadata(
        relativePath: 'draft_videos/test.mp4',
        thumbnailRelativePath: 'draft_videos/thumbnails/test.jpg',
        durationInSeconds: 120, // 2 minutes
      );
      
      mockStorageService.setThumbnailForPath(
        'draft_videos/thumbnails/test.jpg',
        testThumbnailFile,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: VideoPreviewWidget(
              video: video,
            ),
          ),
        ),
      );

      // Wait for FutureBuilder to complete
      await tester.pumpAndSettle();

      // Assert - should show duration badge
      expect(find.byIcon(Icons.access_time), findsOneWidget);
      expect(find.text('2:00'), findsOneWidget);
    });

    testWidgets('shows remove button when onRemove callback is provided', (tester) async {
      // Arrange
      final video = VideoMetadata(
        relativePath: 'draft_videos/test.mp4',
        thumbnailRelativePath: 'draft_videos/thumbnails/test.jpg',
      );
      bool removeCalled = false;
      
      mockStorageService.setThumbnailForPath(
        'draft_videos/thumbnails/test.jpg',
        testThumbnailFile,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: VideoPreviewWidget(
              video: video,
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
      final video = VideoMetadata(
        relativePath: 'draft_videos/test.mp4',
        thumbnailRelativePath: 'draft_videos/thumbnails/test.jpg',
      );
      
      mockStorageService.setThumbnailForPath(
        'draft_videos/thumbnails/test.jpg',
        testThumbnailFile,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: VideoPreviewWidget(
              video: video,
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

    testWidgets('respects showRemoveButton parameter', (tester) async {
      // Arrange
      final video = VideoMetadata(
        relativePath: 'draft_videos/test.mp4',
        thumbnailRelativePath: 'draft_videos/thumbnails/test.jpg',
      );
      
      mockStorageService.setThumbnailForPath(
        'draft_videos/thumbnails/test.jpg',
        testThumbnailFile,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: VideoPreviewWidget(
              video: video,
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
      final video = VideoMetadata(
        relativePath: 'draft_videos/test.mp4',
        thumbnailRelativePath: 'draft_videos/thumbnails/test.jpg',
      );
      
      mockStorageService.setThumbnailForPath(
        'draft_videos/thumbnails/test.jpg',
        testThumbnailFile,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: VideoPreviewWidget(
              video: video,
              width: 200,
              height: 150,
            ),
          ),
        ),
      );

      // Wait for FutureBuilder to complete
      await tester.pumpAndSettle();

      // Assert - Image should have specified dimensions
      final imageWidget = tester.widget<Image>(find.byType(Image));
      expect(imageWidget.width, 200);
      expect(imageWidget.height, 150);
    });

    testWidgets('shows play button overlay', (tester) async {
      // Arrange
      final video = VideoMetadata(
        relativePath: 'draft_videos/test.mp4',
        thumbnailRelativePath: 'draft_videos/thumbnails/test.jpg',
      );
      
      mockStorageService.setThumbnailForPath(
        'draft_videos/thumbnails/test.jpg',
        testThumbnailFile,
      );

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: VideoPreviewWidget(
              video: video,
            ),
          ),
        ),
      );

      // Wait for FutureBuilder to complete
      await tester.pumpAndSettle();

      // Assert - should show play button
      expect(find.byIcon(Icons.play_arrow), findsOneWidget);
    });
  });
}
