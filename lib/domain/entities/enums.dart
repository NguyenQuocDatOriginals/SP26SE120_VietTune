/// Enums for VietTune Archive domain layer

/// Verification status for songs and contributions
enum VerificationStatus {
  pending,
  verified,
  rejected,
}

/// Types of traditional Vietnamese instruments
enum InstrumentType {
  string,
  wind,
  percussion,
  keyboard,
  other,
}

/// Vietnamese music genres
enum MusicGenre {
  folk,
  ceremonial,
  courtMusic,
  operatic,
  contemporary,
}

/// Cultural context types for performances
enum ContextType {
  wedding,
  funeral,
  festival,
  religious,
  entertainment,
  work,
  lullaby,
}

/// Types of contributions users can make
enum ContributionType {
  newSong,
  audioUpload,
  metadata,
  lyrics,
  correction,
}

/// Audio quality levels
enum AudioQuality {
  low,
  medium,
  high,
  professional,
}

/// Serialization: AudioQuality → string (use in data layer instead of .name).
String audioQualityToJsonValue(AudioQuality q) {
  switch (q) {
    case AudioQuality.low:
      return 'low';
    case AudioQuality.medium:
      return 'medium';
    case AudioQuality.high:
      return 'high';
    case AudioQuality.professional:
      return 'professional';
  }
}

/// Parse string → AudioQuality (use in data layer).
AudioQuality? audioQualityFromJsonValue(String? s) {
  if (s == null) return null;
  switch (s) {
    case 'low':
      return AudioQuality.low;
    case 'medium':
      return AudioQuality.medium;
    case 'high':
      return AudioQuality.high;
    case 'professional':
      return AudioQuality.professional;
    default:
      return null;
  }
}

extension AudioQualityExtension on AudioQuality {
  /// Display label for UI.
  String get displayName {
    switch (this) {
      case AudioQuality.low:
        return 'Thấp';
      case AudioQuality.medium:
        return 'Trung bình';
      case AudioQuality.high:
        return 'Cao';
      case AudioQuality.professional:
        return 'Chuyên nghiệp';
    }
  }
}

/// Performance types for contributions
enum PerformanceType {
  instrumental,           // Chỉ nhạc cụ
  aCappella,              // Chỉ giọng hát không đệm
  vocalWithAccompaniment, // Giọng hát có nhạc đệm
}

/// User roles for authentication/authorization
enum UserRole {
  researcher,
  contributor,
  expert,
  admin,
}

extension UserRoleExtension on UserRole {
  String get displayName {
    switch (this) {
      case UserRole.researcher:
        return 'Nhà nghiên cứu';
      case UserRole.contributor:
        return 'Người đóng góp';
      case UserRole.expert:
        return 'Chuyên gia';
      case UserRole.admin:
        return 'Quản trị viên';
    }
  }

  bool get canSubmitContributions =>
      this == UserRole.contributor || this == UserRole.expert;

  bool get canReviewContributions =>
      this == UserRole.expert || this == UserRole.admin;

  bool get canEditAnyContent =>
      this == UserRole.expert || this == UserRole.admin;
}