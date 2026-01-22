import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/services.dart';

/// Service for providing haptic feedback on mobile devices
/// 
/// Provides different types of haptic feedback for various user interactions:
/// - Step completion
/// - Validation errors
/// - Field focus
/// - Button taps
/// - Draft saving
class HapticService {
  /// Rung nhẹ khi hoàn thành step
  static void onStepComplete() {
    if (!kIsWeb) {
      HapticFeedback.mediumImpact();
    }
  }
  
  /// Rung mạnh khi có lỗi validation
  static void onValidationError() {
    if (!kIsWeb) {
      HapticFeedback.heavyImpact();
    }
  }
  
  /// Click nhẹ khi chạm field
  static void onFieldFocus() {
    if (!kIsWeb) {
      HapticFeedback.selectionClick();
    }
  }
  
  /// Feedback khi nhấn nút
  static void onButtonTap() {
    if (!kIsWeb) {
      HapticFeedback.lightImpact();
    }
  }
  
  /// Xác nhận đã lưu draft
  static void onDraftSaved() {
    if (!kIsWeb) {
      HapticFeedback.selectionClick();
    }
  }
}
