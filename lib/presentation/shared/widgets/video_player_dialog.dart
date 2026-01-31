import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:video_player/video_player.dart';
import '../../../domain/entities/video_metadata.dart';
import '../../../core/services/video_storage_service.dart';
import '../../../core/di/injection.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/haptic_service.dart';

/// Full-screen video player dialog
/// 
/// ⚠️ CRITICAL: Only load VideoPlayerController when this dialog is shown
/// (not for thumbnails!)
class VideoPlayerDialog extends StatefulWidget {
  final VideoMetadata video;

  const VideoPlayerDialog({
    super.key,
    required this.video,
  });

  static void show(BuildContext context, {required VideoMetadata video}) {
    showDialog(
      context: context,
      barrierColor: AppColors.primaryDark.withValues(alpha: 0.9),
      builder: (context) => VideoPlayerDialog(video: video),
    );
  }

  @override
  State<VideoPlayerDialog> createState() => _VideoPlayerDialogState();
}

class _VideoPlayerDialogState extends State<VideoPlayerDialog> {
  VideoPlayerController? _controller;
  bool _isLoading = true;
  bool _hasError = false;
  String? _errorMessage;
  bool _isPlaying = false;
  Duration _position = Duration.zero;
  Duration _duration = Duration.zero;

  @override
  void initState() {
    super.initState();
    _initializeVideo();
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _initializeVideo() async {
    try {
      final storageService = getIt<VideoStorageService>();
      final videoFile = await storageService.getFileFromRelativePath(
        widget.video.relativePath,
      );

      if (videoFile == null || !await videoFile.exists()) {
        setState(() {
          _hasError = true;
          _errorMessage = 'Video file không tồn tại';
          _isLoading = false;
        });
        return;
      }

      _controller = VideoPlayerController.file(videoFile);
      await _controller!.initialize();

      _controller!.addListener(_videoListener);

      setState(() {
        _isLoading = false;
        _duration = _controller!.value.duration;
        _position = _controller!.value.position;
        _isPlaying = _controller!.value.isPlaying;
      });
    } catch (e) {
      setState(() {
        _hasError = true;
        _errorMessage = 'Lỗi khi tải video: $e';
        _isLoading = false;
      });
    }
  }

  void _videoListener() {
    if (!mounted) return;
    setState(() {
      _position = _controller!.value.position;
      _duration = _controller!.value.duration;
      _isPlaying = _controller!.value.isPlaying;
    });
  }

  Future<void> _togglePlayPause() async {
    if (_controller == null) return;

    HapticService.onButtonTap();
    if (_isPlaying) {
      await _controller!.pause();
    } else {
      await _controller!.play();
    }
  }

  Future<void> _seek(Duration position) async {
    if (_controller == null) return;
    await _controller!.seekTo(position);
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes;
    final seconds = duration.inSeconds % 60;
    return '${minutes.toString().padLeft(1, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: EdgeInsets.zero,
      child: Stack(
        children: [
          // Video player
          if (_controller != null && !_hasError)
            Center(
              child: AspectRatio(
                aspectRatio: _controller!.value.aspectRatio,
                child: VideoPlayer(_controller!),
              ),
            ),
          // Loading indicator
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(
                color: AppColors.textOnPrimary,
              ),
            ),
          // Error message — Phosphor Light, AppTypography
          if (_hasError)
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  PhosphorIcon(
                    PhosphorIconsLight.warning,
                    color: AppColors.textOnPrimary,
                    size: 48,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _errorMessage ?? 'Có lỗi xảy ra',
                    style: AppTypography.bodyLarge(color: AppColors.textOnPrimary),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          // Controls overlay
          if (!_isLoading && !_hasError && _controller != null)
            Positioned.fill(
              child: GestureDetector(
                onTap: _togglePlayPause,
                child: Container(
                  color: Colors.transparent,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Play/Pause button
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.primaryDark.withValues(alpha: 0.7),
                          shape: BoxShape.circle,
                        ),
                        child: PhosphorIcon(
                          _isPlaying ? PhosphorIconsLight.pause : PhosphorIconsLight.play,
                          color: AppColors.textOnPrimary,
                          size: 48,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          // Bottom controls bar
          if (!_isLoading && !_hasError && _controller != null)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      AppColors.primaryDark.withValues(alpha: 0.9),
                      Colors.transparent,
                    ],
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Seek bar
                    Row(
                      children: [
                        Text(
                          _formatDuration(_position),
                          style: AppTypography.labelMedium(color: AppColors.textOnPrimary),
                        ),
                        Expanded(
                          child: Slider(
                            value: _position.inMilliseconds.toDouble().clamp(
                                  0.0,
                                  _duration.inMilliseconds.toDouble(),
                                ),
                            min: 0.0,
                            max: _duration.inMilliseconds.toDouble(),
                            onChanged: (value) {
                              _seek(Duration(milliseconds: value.toInt()));
                            },
                            activeColor: AppColors.primary,
                            inactiveColor: AppColors.textOnPrimary.withValues(alpha: 0.3),
                          ),
                        ),
                        Text(
                          _formatDuration(_duration),
                          style: AppTypography.labelMedium(color: AppColors.textOnPrimary),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          // Close button
          Positioned(
            top: 16,
            right: 16,
            child: Material(
              color: AppColors.primaryDark.withValues(alpha: 0.7),
              borderRadius: BorderRadius.circular(20),
              child: InkWell(
                onTap: () {
                  HapticService.onButtonTap();
                  Navigator.of(context).pop();
                },
                borderRadius: BorderRadius.circular(20),
                child: Padding(
                  padding: const EdgeInsets.all(8),
                  child: PhosphorIcon(
                    PhosphorIconsLight.x,
                    color: AppColors.textOnPrimary,
                    size: 24,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
