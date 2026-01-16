import 'package:flutter_test/flutter_test.dart';
import 'package:viettune_archive/domain/entities/enums.dart';
import 'package:viettune_archive/domain/entities/song.dart';
import 'package:viettune_archive/domain/entities/user.dart';
import 'package:viettune_archive/domain/services/permission_guard.dart';

void main() {
  Song _song({
    required VerificationStatus status,
    String? contributorId,
  }) {
    return Song(
      id: 'song_1',
      title: 'Test Song',
      genre: MusicGenre.folk,
      ethnicGroupId: 'ethnic_kinh',
      verificationStatus: status,
      contributorId: contributorId,
    );
  }

  User _user(UserRole role, {String id = 'user_1'}) {
    return User(
      id: id,
      email: 'user@example.com',
      name: 'User',
      role: role,
    );
  }

  test('researcher can view verified only', () {
    final user = _user(UserRole.researcher);
    expect(PermissionGuard.canViewSong(_song(status: VerificationStatus.verified), user), true);
    expect(PermissionGuard.canViewSong(_song(status: VerificationStatus.pending), user), false);
  });

  test('contributor can view verified and own pending', () {
    final user = _user(UserRole.contributor, id: 'u1');
    expect(PermissionGuard.canViewSong(_song(status: VerificationStatus.verified), user), true);
    expect(
      PermissionGuard.canViewSong(
        _song(status: VerificationStatus.pending, contributorId: 'u1'),
        user,
      ),
      true,
    );
    expect(
      PermissionGuard.canViewSong(
        _song(status: VerificationStatus.pending, contributorId: 'u2'),
        user,
      ),
      false,
    );
  });

  test('expert can view and edit all', () {
    final user = _user(UserRole.expert);
    expect(PermissionGuard.canViewSong(_song(status: VerificationStatus.pending), user), true);
    expect(PermissionGuard.canEditSong(_song(status: VerificationStatus.pending), user), true);
  });

  test('review and submit permissions', () {
    expect(PermissionGuard.canSubmitContributions(_user(UserRole.contributor)), true);
    expect(PermissionGuard.canSubmitContributions(_user(UserRole.researcher)), false);
    expect(PermissionGuard.canReviewContributions(_user(UserRole.expert)), true);
    expect(PermissionGuard.canReviewContributions(_user(UserRole.contributor)), false);
  });
}
