import 'package:intl/intl.dart';

/// DateTime extensions
extension DateTimeExtensions on DateTime {
  /// Format date as Vietnamese format: dd/MM/yyyy
  String toVietnameseDate() {
    return DateFormat('dd/MM/yyyy').format(this);
  }

  /// Format date and time as Vietnamese format: dd/MM/yyyy HH:mm
  String toVietnameseDateTime() {
    return DateFormat('dd/MM/yyyy HH:mm').format(this);
  }

  /// Format as relative time (e.g., "2 hours ago")
  String toRelativeTime() {
    final now = DateTime.now();
    final difference = now.difference(this);

    if (difference.inDays > 365) {
      final years = (difference.inDays / 365).floor();
      return '$years ${years == 1 ? 'năm' : 'năm'} trước';
    } else if (difference.inDays > 30) {
      final months = (difference.inDays / 30).floor();
      return '$months ${months == 1 ? 'tháng' : 'tháng'} trước';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} ${difference.inDays == 1 ? 'ngày' : 'ngày'} trước';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} ${difference.inHours == 1 ? 'giờ' : 'giờ'} trước';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} ${difference.inMinutes == 1 ? 'phút' : 'phút'} trước';
    } else {
      return 'Vừa xong';
    }
  }
}

/// Duration extensions
extension DurationExtensions on Duration {
  /// Format duration as MM:SS
  String toMMSS() {
    final minutes = inMinutes;
    final seconds = inSeconds.remainder(60);
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  /// Format duration as HH:MM:SS
  String toHHMMSS() {
    final hours = inHours;
    final minutes = inMinutes.remainder(60);
    final seconds = inSeconds.remainder(60);
    return '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  /// Format duration in Vietnamese (e.g., "3 phút 45 giây")
  String toVietnameseDuration() {
    final hours = inHours;
    final minutes = inMinutes.remainder(60);
    final seconds = inSeconds.remainder(60);

    final parts = <String>[];
    if (hours > 0) {
      parts.add('$hours ${hours == 1 ? 'giờ' : 'giờ'}');
    }
    if (minutes > 0) {
      parts.add('$minutes ${minutes == 1 ? 'phút' : 'phút'}');
    }
    if (seconds > 0 || parts.isEmpty) {
      parts.add('$seconds ${seconds == 1 ? 'giây' : 'giây'}');
    }

    return parts.join(' ');
  }
}

/// String extensions
extension StringExtensions on String {
  /// Capitalize first letter
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }

  /// Capitalize first letter of each word
  String capitalizeWords() {
    if (isEmpty) return this;
    return split(' ').map((word) => word.capitalize()).join(' ');
  }

  /// Truncate string with ellipsis
  String truncate(int maxLength, {String ellipsis = '...'}) {
    if (length <= maxLength) return this;
    return '${substring(0, maxLength)}$ellipsis';
  }

  /// Check if string is a valid email
  bool isValidEmail() {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(this);
  }

  /// Check if string is a valid Vietnamese phone number
  bool isValidVietnamesePhone() {
    return RegExp(r'^(0|\+84)[1-9][0-9]{8,9}$').hasMatch(this);
  }
}

/// Number extensions
extension NumberExtensions on num {
  /// Format number with Vietnamese locale
  String toVietnameseNumber() {
    return NumberFormat('#,##0', 'vi_VN').format(this);
  }

  /// Format file size (bytes to KB, MB, GB)
  String toFileSize() {
    if (this < 1024) {
      return '${toStringAsFixed(0)} B';
    } else if (this < 1024 * 1024) {
      return '${(this / 1024).toStringAsFixed(1)} KB';
    } else if (this < 1024 * 1024 * 1024) {
      return '${(this / (1024 * 1024)).toStringAsFixed(1)} MB';
    } else {
      return '${(this / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
    }
  }
}
