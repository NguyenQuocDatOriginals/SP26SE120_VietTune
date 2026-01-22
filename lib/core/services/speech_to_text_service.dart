import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../../core/services/haptic_service.dart';

/// Service for speech-to-text conversion
/// 
/// Handles speech recognition with permissions and text transcription.
class SpeechToTextService {
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _isListening = false;
  bool _isAvailable = false;
  String _lastWords = '';
  
  /// Whether speech recognition is available
  bool get isAvailable => _isAvailable;
  
  /// Whether currently listening
  bool get isListening => _isListening;
  
  /// Last recognized words
  String get lastWords => _lastWords;
  
  /// Initialize speech recognition
  Future<bool> initialize() async {
    try {
      _isAvailable = await _speech.initialize(
        onError: (error) {
          _isListening = false;
        },
        onStatus: (status) {
          if (status == 'done' || status == 'notListening') {
            _isListening = false;
          }
        },
      );
      return _isAvailable;
    } catch (e) {
      _isAvailable = false;
      return false;
    }
  }
  
  /// Start listening for speech
  /// Returns true if started successfully
  Future<bool> startListening({
    required Function(String text) onResult,
    String localeId = 'vi_VN',
  }) async {
    if (!_isAvailable) {
      final initialized = await initialize();
      if (!initialized) {
        return false;
      }
    }
    
    if (_isListening) {
      return false;
    }
    
    try {
      _lastWords = '';
      _isListening = true;
      HapticService.onStepComplete();
      
      await _speech.listen(
        onResult: (result) {
          _lastWords = result.recognizedWords;
          if (result.finalResult) {
            onResult(result.recognizedWords);
            _isListening = false;
          }
        },
        localeId: localeId,
        listenMode: stt.ListenMode.confirmation,
        listenOptions: stt.SpeechListenOptions(
          cancelOnError: true,
        ),
        partialResults: true,
      );
      
      return true;
    } catch (e) {
      _isListening = false;
      return false;
    }
  }
  
  /// Stop listening
  Future<void> stopListening() async {
    if (_isListening) {
      await _speech.stop();
      _isListening = false;
      HapticService.onButtonTap();
    }
  }
  
  /// Cancel listening
  Future<void> cancelListening() async {
    if (_isListening) {
      await _speech.cancel();
      _isListening = false;
      _lastWords = '';
      HapticService.onValidationError();
    }
  }
  
  /// Check if speech recognition is available
  Future<bool> checkAvailability() async {
    if (!_isAvailable) {
      return await initialize();
    }
    return _isAvailable;
  }
  
  /// Dispose resources
  void dispose() {
    if (_isListening) {
      _speech.cancel();
    }
    _isListening = false;
    _lastWords = '';
  }
}
