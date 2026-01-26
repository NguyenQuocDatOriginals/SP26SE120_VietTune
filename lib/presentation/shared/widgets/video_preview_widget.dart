import 'dart:io';
import 'package:flutter/material.dart';
import '../../../domain/entities/video_metadata.dart';
import '../../../core/services/video_storage_service.dart';
import '../../../core/di/injection.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/haptic_service.dart';
import 'video_player_dialog.dart';

/// Widget for displaying a single video preview
/// 
/// ⚠️ CRITICAL PERFORMANCE:
/// - Uses thumbnail JPG image (NOT VideoPlayerController) for display
/// - Only loads VideoPlayerController when user taps Play button
/// - This ensures smooth UI even with multiple videos
class VideoPreviewWidget extends StatelessWidget {
  final VideoMetadata video;
  final VoidCallback? onRemove;
  final VoidCallback? onTap;
  final bool showRemoveButton;
  final double? width;
  final double? height;
  final BoxFit fit;

  const VideoPreviewWidget({
    super.key,
    required this.video,
    this.onRemove,
    this.onTap,
    this.showRemoveButton = true,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
  });

  @override
  Widget build(BuildContext context) {
    final storageService = getIt<VideoStorageService>();
    
    // ⚠️ CRITICAL: Load thumbnail (JPG image), NOT video file
    return FutureBuilder<File?>(
      future: video.thumbnailRelativePath != null
          ? storageService.getThumbnailFileFromRelativePath(video.thumbnailRelativePath!)
          : Future.value(null),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return _buildLoadingPlaceholder();
        }

        if (snapshot.hasError || snapshot.data == null) {
          return _buildErrorPlaceholder();
        }

        final thumbnailFile = snapshot.data!;
        
        return GestureDetector(
          onTap: onTap ?? () => _playVideo(context),
          child: Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.file(
                  thumbnailFile,
                  width: width,
                  height: height,
                  fit: fit,
                  errorBuilder: (context, error, stackTrace) {
                    return _buildErrorPlaceholder();
                  },
                ),
              ),
              // Play button overlay
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.play_arrow,
                        color: Colors.white,
                        size: 32,
                      ),
                    ),
                  ),
                ),
              ),
              // Duration badge
              if (video.durationInSeconds != null)
                Positioned(
                  bottom: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.black87,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.access_time,
                          size: 12,
                          color: Colors.white,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          _formatDuration(video.durationInSeconds!),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              // Remove button
              if (showRemoveButton && onRemove != null)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Material(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(20),
                    child: InkWell(
                      onTap: () {
                        HapticService.onButtonTap();
                        onRemove?.call();
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: const Padding(
                        padding: EdgeInsets.all(6),
                        child: Icon(
                          Icons.close,
                          size: 18,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  void _playVideo(BuildContext context) {
    HapticService.onButtonTap();
    VideoPlayerDialog.show(context, video: video);
  }

  String _formatDuration(int seconds) {
    final duration = Duration(seconds: seconds);
    final minutes = duration.inMinutes;
    final secs = duration.inSeconds % 60;
    return '${minutes.toString().padLeft(1, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  Widget _buildLoadingPlaceholder() {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.divider,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Center(
        child: SizedBox(
          width: 24,
          height: 24,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
      ),
    );
  }

  Widget _buildErrorPlaceholder() {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.divider,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.videocam_off,
            size: 32,
            color: AppColors.textSecondary,
          ),
          const SizedBox(height: 4),
          Text(
            'Không thể tải video',
            style: TextStyle(
              fontSize: 10,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
