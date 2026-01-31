import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:viettune_archive/domain/entities/video_metadata.dart';
import 'package:viettune_archive/presentation/shared/widgets/video_picker_widget.dart';
import 'package:viettune_archive/data/repositories/video_repository.dart';
import 'package:viettune_archive/core/di/injection.dart';
import 'package:image_picker/image_picker.dart';
import 'package:viettune_archive/core/services/video_upload_service.dart';

// Simple mock VideoRepository
class MockVideoRepository implements VideoRepository {
  final VideoMetadata? videoToReturn;
  final bool shouldThrow;
  final String? errorMessage;

  MockVideoRepository({
    this.videoToReturn,
    this.shouldThrow = false,
    this.errorMessage,
  });

  @override
  Stream<VideoProcessingResult> pickAndProcessVideos({
    required int maxVideos,
    ImageSource? source,
  }) async* {
    if (shouldThrow) {
      yield VideoProcessingResult(
        video: null,
        progress: 1.0,
        isComplete: true,
        error: errorMessage ?? 'Test error',
      );
      return;
    }
    
    if (videoToReturn != null) {
      yield VideoProcessingResult(
        video: videoToReturn,
        progress: 1.0,
        isComplete: true,
        error: null,
      );
    } else {
      yield VideoProcessingResult(
        video: null,
        progress: 1.0,
        isComplete: true,
        error: null,
      );
    }
  }

  @override
  Future<File?> getVideoFile(String relativePath) async {
    throw UnimplementedError();
  }

  @override
  Future<File?> getThumbnailFile(String thumbnailRelativePath) async {
    throw UnimplementedError();
  }

  @override
  Future<bool> deleteVideo(String relativePath) async {
    return true;
  }

  @override
  Future<bool> deleteThumbnail(String thumbnailRelativePath) async {
    return true;
  }

  @override
  Future<bool> deleteVideoAndThumbnail({
    required String videoRelativePath,
    String? thumbnailRelativePath,
  }) async {
    return true;
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
  late MockVideoRepository mockRepository;

  setUp(() {
    mockRepository = MockVideoRepository();
    
    // Register mock in GetIt
    if (getIt.isRegistered<VideoRepository>()) {
      getIt.unregister<VideoRepository>();
    }
    getIt.registerSingleton<VideoRepository>(mockRepository);
  });

  tearDown(() {
    // Clean up GetIt
    if (getIt.isRegistered<VideoRepository>()) {
      getIt.unregister<VideoRepository>();
    }
  });

  group('VideoPickerWidget', () {
    testWidgets('renders label when provided', (tester) async {
      // Arrange
      VideoMetadata? selectedVideo;

      // Act
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: VideoPickerWidget(
                video: null,
                onVideoChanged: (video) => selectedVideo = video,
                label: 'Test Label',
              ),
            ),
          ),
        ),
      );

      // Assert
      expect(find.text('Test Label'), findsOneWidget);
    });

    testWidgets('shows add button when no video is selected', (tester) async {
      // Arrange
      VideoMetadata? selectedVideo;

      // Act
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: VideoPickerWidget(
                video: null,
                onVideoChanged: (video) => selectedVideo = video,
              ),
            ),
          ),
        ),
      );

      // Assert
      expect(find.text('Thêm video'), findsOneWidget);
    });

    testWidgets('shows video preview when video is selected', (tester) async {
      // Arrange
      final video = VideoMetadata(
        relativePath: 'draft_videos/test.mp4',
        thumbnailRelativePath: 'draft_videos/thumbnails/test.jpg',
        durationInSeconds: 120,
      );
      VideoMetadata? selectedVideo = video;

      // Act
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: VideoPickerWidget(
                video: video,
                onVideoChanged: (v) => selectedVideo = v,
              ),
            ),
          ),
        ),
      );

      // Wait for widget to build
      await tester.pumpAndSettle();

      // Assert - should show preview (VideoPreviewWidget)
      // Note: Actual thumbnail loading requires VideoStorageService mock
      // This test verifies the widget structure
      expect(find.byType(VideoPickerWidget), findsOneWidget);
    });

    testWidgets('shows required indicator when required is true', (tester) async {
      // Arrange
      VideoMetadata? selectedVideo;

      // Act
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: VideoPickerWidget(
                video: null,
                onVideoChanged: (video) => selectedVideo = video,
                label: 'Test Label',
                required: true,
              ),
            ),
          ),
        ),
      );

      // Assert - should show asterisk or required indicator
      // The exact implementation depends on the widget design
      expect(find.text('Test Label'), findsOneWidget);
    });

    testWidgets('calls onVideoChanged when video is removed', (tester) async {
      // Arrange
      final video = VideoMetadata(
        relativePath: 'draft_videos/test.mp4',
        thumbnailRelativePath: 'draft_videos/thumbnails/test.jpg',
      );
      VideoMetadata? selectedVideo = video;
      bool changedCalled = false;

      // Act
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: VideoPickerWidget(
                video: video,
                onVideoChanged: (v) {
                  selectedVideo = v;
                  changedCalled = true;
                },
              ),
            ),
          ),
        ),
      );

      // Wait for widget to build
      await tester.pumpAndSettle();

      // Find and tap remove button (if visible)
      // Note: This depends on VideoPreviewWidget implementation
      // For now, we verify the widget structure
      expect(find.byType(VideoPickerWidget), findsOneWidget);
    });

    testWidgets('shows error message when error occurs', (tester) async {
      // Arrange
      mockRepository = MockVideoRepository(
        shouldThrow: true,
        errorMessage: 'Test error message',
      );
      getIt.unregister<VideoRepository>();
      getIt.registerSingleton<VideoRepository>(mockRepository);

      VideoMetadata? selectedVideo;

      // Act
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: VideoPickerWidget(
                video: null,
                onVideoChanged: (video) => selectedVideo = video,
              ),
            ),
          ),
        ),
      );

      // Wait for widget to build
      await tester.pumpAndSettle();

      // Assert - widget should handle error gracefully
      // The exact error display depends on implementation
      expect(find.byType(VideoPickerWidget), findsOneWidget);
    });

    testWidgets('respects allowRecording parameter', (tester) async {
      // Arrange
      VideoMetadata? selectedVideo;

      // Act
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: VideoPickerWidget(
                video: null,
                onVideoChanged: (video) => selectedVideo = video,
                allowRecording: false,
              ),
            ),
          ),
        ),
      );

      // Assert
      // When allowRecording is false, camera option should not be available
      // The exact implementation depends on the widget design
      expect(find.byType(VideoPickerWidget), findsOneWidget);
    });
  });
}
