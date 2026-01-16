import '../entities/enums.dart';
import '../entities/song.dart';
import '../entities/user.dart';

/// Permission helpers for role-based access control
class PermissionGuard {
  /// Check if user can view a song
  static bool canViewSong(Song song, User user) {
    switch (user.role) {
      case UserRole.researcher:
        return song.verificationStatus == VerificationStatus.verified;
      case UserRole.contributor:
        return song.verificationStatus == VerificationStatus.verified ||
            song.contributorId == user.id;
      case UserRole.expert:
      case UserRole.admin:
        return true;
    }
  }

  /// Check if user can edit a song
  static bool canEditSong(Song song, User user) {
    switch (user.role) {
      case UserRole.researcher:
        return false;
      case UserRole.contributor:
        return song.contributorId == user.id &&
            song.verificationStatus == VerificationStatus.pending;
      case UserRole.expert:
      case UserRole.admin:
        return true;
    }
  }

  /// Check if user can review contributions
  static bool canReviewContributions(User user) =>
      user.role == UserRole.expert || user.role == UserRole.admin;

  /// Check if user can submit contributions
  static bool canSubmitContributions(User user) =>
      user.role.canSubmitContributions;
}
