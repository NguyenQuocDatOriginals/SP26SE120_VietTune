import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/services/recording_service.dart';
import '../../../../core/services/haptic_service.dart';
import '../../../../core/theme/app_theme.dart';

/// Recording dialog widget
class RecordingDialog extends StatefulWidget {
  final RecordingService recordingService;
  final ValueChanged<String?> onRecordingComplete;

  const RecordingDialog({
    super.key,
    required this.recordingService,
    required this.onRecordingComplete,
  });

  @override
  State<RecordingDialog> createState() => _RecordingDialogState();
}

class _RecordingDialogState extends State<RecordingDialog> {
  Duration _duration = Duration.zero;
  StreamSubscription<Duration>? _durationSubscription;
  String? _recordingPath;

  @override
  void initState() {
    super.initState();
    _startRecording();
  }

  @override
  void dispose() {
    _durationSubscription?.cancel();
    super.dispose();
  }

  Future<void> _startRecording() async {
    final path = await widget.recordingService.startRecording();
    if (path != null) {
      setState(() {
        _recordingPath = path;
      });
      
      // Listen to duration updates
      _durationSubscription = widget.recordingService.durationStream.listen(
        (duration) {
          if (mounted) {
            setState(() {
              _duration = duration;
            });
          }
        },
      );
    } else {
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Không thể bắt đầu ghi âm. Vui lòng kiểm tra quyền truy cập microphone.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _stopRecording() async {
    HapticService.onButtonTap();
    final path = await widget.recordingService.stopRecording();
    if (mounted) {
      widget.onRecordingComplete(path);
    }
  }

  Future<void> _cancelRecording() async {
    HapticService.onValidationError();
    await widget.recordingService.cancelRecording();
    if (mounted) {
      Navigator.pop(context);
    }
  }

  Future<void> _togglePause() async {
    if (widget.recordingService.isPaused) {
      await widget.recordingService.resumeRecording();
    } else {
      await widget.recordingService.pauseRecording();
    }
    if (mounted) {
      setState(() {});
    }
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes.toString().padLeft(2, '0');
    final seconds = duration.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final isRecording = widget.recordingService.isRecording;
    final isPaused = widget.recordingService.isPaused;

    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Title
            Text(
              'Đang ghi âm',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),
            
            // Recording indicator
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isRecording && !isPaused
                    ? Colors.red.withOpacity(0.2)
                    : Colors.grey.withOpacity(0.2),
              ),
              child: Icon(
                Icons.mic,
                size: 40,
                color: isRecording && !isPaused ? Colors.red : Colors.grey,
              ),
            ),
            const SizedBox(height: 24),
            
            // Duration
            Text(
              _formatDuration(_duration),
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              isPaused ? 'Đã tạm dừng' : 'Đang ghi âm...',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 32),
            
            // Controls
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                // Cancel button
                IconButton(
                  onPressed: _cancelRecording,
                  icon: const Icon(Icons.close),
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.grey[200],
                    padding: const EdgeInsets.all(12),
                  ),
                  tooltip: 'Hủy',
                ),
                
                // Pause/Resume button
                if (isRecording)
                  IconButton(
                    onPressed: _togglePause,
                    icon: Icon(isPaused ? Icons.play_arrow : Icons.pause),
                    style: IconButton.styleFrom(
                      backgroundColor: AppColors.primary.withOpacity(0.1),
                      padding: const EdgeInsets.all(12),
                    ),
                    tooltip: isPaused ? 'Tiếp tục' : 'Tạm dừng',
                  ),
                
                // Stop button
                IconButton(
                  onPressed: isRecording ? _stopRecording : null,
                  icon: const Icon(Icons.stop),
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: AppColors.textOnPrimary,
                    padding: const EdgeInsets.all(12),
                  ),
                  tooltip: 'Dừng và lưu',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
