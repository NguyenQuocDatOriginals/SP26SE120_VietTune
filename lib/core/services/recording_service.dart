import 'dart:async';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import '../../core/services/haptic_service.dart';
// Import File for file operations (only used when !kIsWeb)
import 'dart:io' show File;

/// Service for audio recording
/// 
/// Handles recording audio with permissions, start/stop/pause,
/// and saving to file.
class RecordingService {
  final AudioRecorder _recorder = AudioRecorder();
  bool _isRecording = false;
  bool _isPaused = false;
  Timer? _timer;
  Duration _duration = Duration.zero;
  final _durationController = StreamController<Duration>.broadcast();
  
  /// Stream of recording duration
  Stream<Duration> get durationStream => _durationController.stream;
  
  /// Current recording duration
  Duration get duration => _duration;
  
  /// Whether currently recording
  bool get isRecording => _isRecording;
  
  /// Whether currently paused
  bool get isPaused => _isPaused;
  
  /// Check if recording permission is granted
  Future<bool> hasPermission() async {
    try {
      return await _recorder.hasPermission();
    } catch (e) {
      return false;
    }
  }
  
  /// Request recording permission
  Future<bool> requestPermission() async {
    try {
      return await _recorder.hasPermission();
    } catch (e) {
      return false;
    }
  }
  
  /// Start recording
  /// Returns the file path if successful, null otherwise
  Future<String?> startRecording() async {
    if (_isRecording) {
      return null;
    }
    
    // Check permission
    final hasPermission = await this.hasPermission();
    if (!hasPermission) {
      final granted = await requestPermission();
      if (!granted) {
        return null;
      }
    }
    
    try {
      // Get temporary directory
      final directory = await getTemporaryDirectory();
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final filePath = '${directory.path}/recording_$timestamp.m4a';
      
      // Start recording
      await _recorder.start(
        const RecordConfig(
          encoder: AudioEncoder.aacLc,
          bitRate: 128000,
          sampleRate: 44100,
        ),
        path: filePath,
      );
      
      _isRecording = true;
      _isPaused = false;
      _duration = Duration.zero;
      _startTimer();
      HapticService.onStepComplete();
      
      return filePath;
    } catch (e) {
      _isRecording = false;
      return null;
    }
  }
  
  /// Stop recording
  /// Returns the file path if successful, null otherwise
  Future<String?> stopRecording() async {
    if (!_isRecording) {
      return null;
    }
    
    try {
      final path = await _recorder.stop();
      _isRecording = false;
      _isPaused = false;
      _stopTimer();
      HapticService.onButtonTap();
      return path;
    } catch (e) {
      _isRecording = false;
      _stopTimer();
      return null;
    }
  }
  
  /// Pause recording
  Future<bool> pauseRecording() async {
    if (!_isRecording || _isPaused) {
      return false;
    }
    
    try {
      await _recorder.pause();
      _isPaused = true;
      _stopTimer();
      HapticService.onButtonTap();
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /// Resume recording
  Future<bool> resumeRecording() async {
    if (!_isRecording || !_isPaused) {
      return false;
    }
    
    try {
      await _recorder.resume();
      _isPaused = false;
      _startTimer();
      HapticService.onButtonTap();
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /// Cancel recording (delete file)
  Future<void> cancelRecording() async {
    if (_isRecording) {
      try {
        final path = await _recorder.stop();
        if (path != null && !kIsWeb) {
          // Use File from dart:io (only available on non-web platforms)
          // Note: File is conditionally imported, so it's only available on mobile/desktop
          try {
            final file = File(path);
            if (await file.exists()) {
              await file.delete();
            }
          } catch (_) {
            // File operations may fail, ignore
          }
        }
      } catch (e) {
        // Ignore errors when canceling
      }
    }
    _isRecording = false;
    _isPaused = false;
    _stopTimer();
  }
  
  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _duration = Duration(seconds: _duration.inSeconds + 1);
      _durationController.add(_duration);
    });
  }
  
  void _stopTimer() {
    _timer?.cancel();
    _timer = null;
  }
  
  /// Dispose resources
  Future<void> dispose() async {
    await cancelRecording();
    _stopTimer();
    _durationController.close();
    await _recorder.dispose();
  }
}
