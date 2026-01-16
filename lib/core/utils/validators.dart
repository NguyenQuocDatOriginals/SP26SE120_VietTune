/// Form validation utilities
class Validators {
  /// Validate required field
  static String? required(String? value, {String? fieldName}) {
    if (value == null || value.trim().isEmpty) {
      return '${fieldName ?? 'Trường này'} không được để trống';
    }
    return null;
  }

  /// Validate email
  static String? email(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email không được để trống';
    }
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
      return 'Email không hợp lệ';
    }
    return null;
  }

  /// Validate phone number
  static String? phone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Số điện thoại không được để trống';
    }
    if (!RegExp(r'^(0|\+84)[1-9][0-9]{8,9}$').hasMatch(value)) {
      return 'Số điện thoại không hợp lệ';
    }
    return null;
  }

  /// Validate minimum length
  static String? minLength(String? value, int minLength, {String? fieldName}) {
    if (value == null || value.length < minLength) {
      return '${fieldName ?? 'Trường này'} phải có ít nhất $minLength ký tự';
    }
    return null;
  }

  /// Validate maximum length
  static String? maxLength(String? value, int maxLength, {String? fieldName}) {
    if (value != null && value.length > maxLength) {
      return '${fieldName ?? 'Trường này'} không được vượt quá $maxLength ký tự';
    }
    return null;
  }

  /// Validate URL
  static String? url(String? value) {
    if (value == null || value.isEmpty) {
      return 'URL không được để trống';
    }
    try {
      Uri.parse(value);
      return null;
    } catch (e) {
      return 'URL không hợp lệ';
    }
  }

  /// Validate positive number
  static String? positiveNumber(String? value, {String? fieldName}) {
    if (value == null || value.isEmpty) {
      return '${fieldName ?? 'Trường này'} không được để trống';
    }
    final number = num.tryParse(value);
    if (number == null) {
      return '${fieldName ?? 'Trường này'} phải là số';
    }
    if (number <= 0) {
      return '${fieldName ?? 'Trường này'} phải lớn hơn 0';
    }
    return null;
  }

  /// Validate date
  static String? date(String? value, {String? fieldName}) {
    if (value == null || value.isEmpty) {
      return '${fieldName ?? 'Ngày'} không được để trống';
    }
    try {
      DateTime.parse(value);
      return null;
    } catch (e) {
      return '${fieldName ?? 'Ngày'} không hợp lệ';
    }
  }

  /// Validate file extension
  static String? fileExtension(
    String? fileName,
    List<String> allowedExtensions,
  ) {
    if (fileName == null || fileName.isEmpty) {
      return 'Tên file không được để trống';
    }
    final extension = fileName.split('.').last.toLowerCase();
    if (!allowedExtensions.contains(extension)) {
      return 'Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${allowedExtensions.join(', ')}';
    }
    return null;
  }

  /// Combine multiple validators
  static String? combine(List<String? Function()> validators) {
    for (final validator in validators) {
      final result = validator();
      if (result != null) return result;
    }
    return null;
  }
}
