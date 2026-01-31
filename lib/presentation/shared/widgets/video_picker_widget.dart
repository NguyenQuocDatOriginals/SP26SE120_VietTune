import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../../domain/entities/video_metadata.dart';
import '../../../data/repositories/video_repository.dart';
import '../../../core/di/injection.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/haptic_service.dart';
import 'video_preview_widget.dart';

/// Provider for video upload progress (global state)
final videoUploadProgressProvider = StateNotifierProvider<
    VideoUploadProgressNotifier,
    Map<String, double>>((ref) {
  return VideoUploadProgressNotifier();
});

class VideoUploadProgressNotifier extends StateNotifier<Map<String, double>> {
  VideoUploadProgressNotifier() : super({});

  void updateProgress(String videoId, double progress) {
    state = {...state, videoId: progress};
  }

  void clearProgress(String videoId) {
    final newState = {...state};
    newState.remove(videoId);
    state = newState;
  }

  void clearAll() {
    state = {};
  }
}

/// Provider for video upload errors (global state)
final videoUploadErrorProvider = StateNotifierProvider<
    VideoUploadErrorNotifier,
    Map<String, String?>>((ref) {
  return VideoUploadErrorNotifier();
});

class VideoUploadErrorNotifier extends StateNotifier<Map<String, String?>> {
  VideoUploadErrorNotifier() : super({});

  void setError(String videoId, String? error) {
    state = {...state, videoId: error};
  }

  void clearError(String videoId) {
    final newState = {...state};
    newState.remove(videoId);
    state = newState;
  }

  void clearAll() {
    state = {};
  }
}

/// Video picker widget with state management
/// 
/// Features:
/// - Pick video from gallery/camera
/// - Show upload progress
/// - Display video preview with thumbnail
/// - Error handling with retry
/// - Video duration display
class VideoPickerWidget extends ConsumerStatefulWidget {
  final VideoMetadata? video;
  final ValueChanged<VideoMetadata?> onVideoChanged;
  final String? label;
  final bool required;
  final bool allowRecording;

  const VideoPickerWidget({
    super.key,
    this.video,
    required this.onVideoChanged,
    this.label,
    this.required = false,
    this.allowRecording = true,
  });

  @override
  ConsumerState<VideoPickerWidget> createState() => _VideoPickerWidgetState();
}

class _VideoPickerWidgetState extends ConsumerState<VideoPickerWidget> {
  final _repository = getIt<VideoRepository>();
  bool _isPicking = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Label
        if (widget.label != null) ...[
          Row(
            children: [
              Text(
                widget.label!,
                style: AppTypography.titleMedium().copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (widget.required) ...[
                const SizedBox(width: 4),
                Text(
                  '*',
                  style: AppTypography.bodyLarge(color: AppColors.error),
                ),
              ],
            ],
          ),
          const SizedBox(height: 12),
        ],
        // Video preview or add button
        if (widget.video != null)
          _buildVideoPreview()
        else
          _buildAddVideoButton(),
        // Error messages
        _buildErrorMessages(),
      ],
    );
  }

  Widget _buildVideoPreview() {
    final video = widget.video!;
    final progressMap = ref.watch(videoUploadProgressProvider);
    final errorMap = ref.watch(videoUploadErrorProvider);
    final progress = progressMap[video.relativePath];
    final error = errorMap[video.relativePath];

    return Stack(
      children: [
        // Video preview
        VideoPreviewWidget(
          video: video,
          onRemove: () => _removeVideo(),
          width: double.infinity,
          height: 200,
        ),
        // Progress overlay
        if (progress != null && progress < 1.0)
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.primaryDark.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(
                      width: 40,
                      height: 40,
                      child: CircularProgressIndicator(
                        value: progress,
                        strokeWidth: 3,
                        color: AppColors.primary,
                        backgroundColor: AppColors.textOnPrimary.withValues(alpha: 0.24),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${(progress * 100).toInt()}%',
                      style: AppTypography.labelMedium(color: AppColors.textOnPrimary).copyWith(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Đang xử lý...',
                      style: AppTypography.labelSmall(color: AppColors.textOnPrimary.withValues(alpha: 0.85)),
                    ),
                  ],
                ),
              ),
            ),
          ),
        // Error overlay
        if (error != null)
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  PhosphorIcon(
                    PhosphorIconsLight.warning,
                    color: AppColors.textOnPrimary,
                    size: 32,
                  ),
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Text(
                      error,
                      style: AppTypography.labelSmall(color: AppColors.textOnPrimary).copyWith(fontWeight: FontWeight.w500),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: () => _retryVideo(),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      side: BorderSide(color: AppColors.textOnPrimary),
                    ),
                    icon: PhosphorIcon(
                      PhosphorIconsLight.arrowClockwise,
                      size: 14,
                      color: AppColors.textOnPrimary,
                    ),
                    label: Text(
                      'Thử lại',
                      style: AppTypography.labelSmall(color: AppColors.textOnPrimary).copyWith(fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildAddVideoButton() {
    return OutlinedButton.icon(
      onPressed: _isPicking ? null : _showVideoSourceDialog,
      icon: _isPicking
          ? SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            )
          : PhosphorIcon(PhosphorIconsLight.videoCamera),
      label: Text(
        _isPicking ? 'Đang xử lý...' : 'Thêm video',
        style: AppTypography.button().copyWith(color: AppColors.primary),
      ),
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(double.infinity, 48),
        side: BorderSide(
          color: AppColors.primary,
          width: 1.5,
        ),
        foregroundColor: AppColors.primary,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  Widget _buildErrorMessages() {
    final errorMap = ref.watch(videoUploadErrorProvider);
    final error = widget.video != null
        ? errorMap[widget.video!.relativePath]
        : null;

    if (error == null) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.error.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.error),
        ),
        child: Row(
          children: [
            PhosphorIcon(
              PhosphorIconsLight.warning,
              size: 16,
              color: AppColors.error,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                error,
                style: AppTypography.bodySmall(color: AppColors.error),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showVideoSourceDialog() {
    HapticService.onButtonTap();
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (widget.allowRecording)
              ListTile(
                leading: PhosphorIcon(PhosphorIconsLight.videoCamera, color: AppColors.primary),
                title: const Text('Quay video'),
                onTap: () {
                  Navigator.pop(context);
                  _pickVideo(ImageSource.camera);
                },
              ),
            ListTile(
              leading: PhosphorIcon(PhosphorIconsLight.videoCamera, color: AppColors.primary),
              title: const Text('Chọn từ thư viện'),
              onTap: () {
                Navigator.pop(context);
                _pickVideo(ImageSource.gallery);
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Future<void> _pickVideo(ImageSource source) async {
    if (_isPicking) return;

    setState(() => _isPicking = true);

    try {
      // Pick and process video
      final stream = _repository.pickAndProcessVideos(
        maxVideos: 1,
        source: source,
      );

      await for (final result in stream) {
        if (!mounted) break;

        // Update progress
        final progressNotifier = ref.read(videoUploadProgressProvider.notifier);
        final errorNotifier = ref.read(videoUploadErrorProvider.notifier);

        if (result.video != null) {
          progressNotifier.updateProgress(
            result.video!.relativePath,
            result.progress,
          );
        }

        // Handle completion
        if (result.isComplete) {
          if (result.video != null && result.error == null) {
            // Success - set video
            widget.onVideoChanged(result.video);
            if (result.video != null) {
              progressNotifier.clearProgress(result.video!.relativePath);
            }
            HapticService.onStepComplete();
          } else if (result.error != null) {
            // Error
            if (result.video != null) {
              errorNotifier.setError(result.video!.relativePath, result.error);
            } else {
              // Show error snackbar
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(result.error ?? 'Có lỗi xảy ra'),
                    backgroundColor: AppColors.error,
                  ),
                );
              }
            }
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isPicking = false);
      }
    }
  }

  void _removeVideo() {
    HapticService.onButtonTap();
    if (widget.video != null) {
      // Delete video and thumbnail
      _repository.deleteVideoAndThumbnail(
        videoRelativePath: widget.video!.relativePath,
        thumbnailRelativePath: widget.video!.thumbnailRelativePath,
      );
      
      // Clear progress/error
      ref.read(videoUploadProgressProvider.notifier)
          .clearProgress(widget.video!.relativePath);
      ref.read(videoUploadErrorProvider.notifier)
          .clearError(widget.video!.relativePath);
    }
    
    widget.onVideoChanged(null);
  }

  void _retryVideo() {
    HapticService.onButtonTap();
    // Clear error and retry
    if (widget.video != null) {
      ref.read(videoUploadErrorProvider.notifier)
          .clearError(widget.video!.relativePath);
    }
    // Show source dialog again
    _showVideoSourceDialog();
  }
}
