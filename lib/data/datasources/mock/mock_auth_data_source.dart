import '../../models/auth_response_model.dart';
import '../../models/user_model.dart';
import '../../../domain/entities/enums.dart';

/// Mock data source for authentication and users
abstract class MockAuthDataSource {
  Future<AuthResponseModel> login({
    required String email,
    required String password,
  });

  Future<AuthResponseModel> register({
    required String email,
    required String password,
    required String name,
    String? phoneNumber,
  });

  Future<void> logout();

  Future<UserModel> getCurrentUser();

  Future<AuthResponseModel> refreshToken(String refreshToken);

  Future<UserModel> updateProfile({
    required String userId,
    String? name,
    String? bio,
    String? avatar,
  });

  Future<void> changePassword({
    required String userId,
    required String currentPassword,
    required String newPassword,
  });

  Future<void> requestContributorRole({
    required String userId,
    required String reason,
  });

  Future<UserModel> getUserById(String id);

  Future<List<UserModel>> searchUsers({
    String? query,
    UserRole? role,
  });

  Future<UserModel> promoteToContributor(String userId);

  Future<UserModel> promoteToExpert({
    required String userId,
    required List<String> specializations,
  });
}

class MockAuthDataSourceImpl implements MockAuthDataSource {
  static final Map<String, UserModel> _users = {
    'researcher1': UserModel(
      id: 'researcher1',
      email: 'researcher@viettune.vn',
      name: 'Nguyễn Văn A',
      role: UserRole.researcher.name,
      passwordHash: 'password123',
      isActive: true,
      isEmailVerified: true,
    ),
    'contributor1': UserModel(
      id: 'contributor1',
      email: 'contributor@viettune.vn',
      name: 'Trần Thị B',
      role: UserRole.contributor.name,
      passwordHash: 'password123',
      isActive: true,
      isEmailVerified: true,
    ),
    'expert1': UserModel(
      id: 'expert1',
      email: 'expert@viettune.vn',
      name: 'PGS. TS. Lê Văn C',
      role: UserRole.expert.name,
      passwordHash: 'password123',
      isActive: true,
      isEmailVerified: true,
      specializations: const ['Kinh', 'Tày', 'Thái'],
      affiliation: 'Nhạc viện Hà Nội',
    ),
  };

  String? _currentUserId;

  @override
  Future<AuthResponseModel> login({
    required String email,
    required String password,
  }) async {
    await Future.delayed(const Duration(milliseconds: 400));
    final user = _users.values.firstWhere(
      (u) => u.email.toLowerCase() == email.toLowerCase(),
      orElse: () => throw Exception('User not found'),
    );

    if (user.passwordHash != password) {
      throw Exception('Invalid password');
    }

    _currentUserId = user.id;
    return AuthResponseModel(
      user: user,
      accessToken: _generateAccessToken(user.id),
      refreshToken: _generateRefreshToken(user.id),
    );
  }

  @override
  Future<AuthResponseModel> register({
    required String email,
    required String password,
    required String name,
    String? phoneNumber,
  }) async {
    await Future.delayed(const Duration(milliseconds: 450));

    final exists = _users.values.any(
      (u) => u.email.toLowerCase() == email.toLowerCase(),
    );
    if (exists) {
      throw Exception('Email already exists');
    }

    final id = 'user_${DateTime.now().millisecondsSinceEpoch}';
    final user = UserModel(
      id: id,
      email: email,
      name: name,
      role: UserRole.researcher.name,
      phoneNumber: phoneNumber,
      passwordHash: password,
      isActive: true,
      isEmailVerified: false,
      createdAt: DateTime.now().toIso8601String(),
    );
    _users[id] = user;
    _currentUserId = id;

    return AuthResponseModel(
      user: user,
      accessToken: _generateAccessToken(user.id),
      refreshToken: _generateRefreshToken(user.id),
    );
  }

  @override
  Future<void> logout() async {
    await Future.delayed(const Duration(milliseconds: 200));
    _currentUserId = null;
  }

  @override
  Future<UserModel> getCurrentUser() async {
    await Future.delayed(const Duration(milliseconds: 200));
    if (_currentUserId == null) {
      throw Exception('Not authenticated');
    }
    final user = _users[_currentUserId];
    if (user == null) {
      throw Exception('User not found');
    }
    return user;
  }

  @override
  Future<AuthResponseModel> refreshToken(String refreshToken) async {
    await Future.delayed(const Duration(milliseconds: 250));
    final userId = _extractUserId(refreshToken);
    final user = _users[userId];
    if (user == null) {
      throw Exception('Invalid refresh token');
    }
    _currentUserId = user.id;
    return AuthResponseModel(
      user: user,
      accessToken: _generateAccessToken(user.id),
      refreshToken: _generateRefreshToken(user.id),
    );
  }

  @override
  Future<UserModel> updateProfile({
    required String userId,
    String? name,
    String? bio,
    String? avatar,
  }) async {
    await Future.delayed(const Duration(milliseconds: 350));
    final existing = _users[userId];
    if (existing == null) {
      throw Exception('User not found');
    }
    final updated = UserModel(
      id: existing.id,
      email: existing.email,
      name: name ?? existing.name,
      role: existing.role,
      phoneNumber: existing.phoneNumber,
      avatar: avatar ?? existing.avatar,
      bio: bio ?? existing.bio,
      affiliation: existing.affiliation,
      specializations: existing.specializations,
      createdAt: existing.createdAt,
      lastLoginAt: existing.lastLoginAt,
      isEmailVerified: existing.isEmailVerified,
      isActive: existing.isActive,
      passwordHash: existing.passwordHash,
    );
    _users[userId] = updated;
    return updated;
  }

  @override
  Future<void> changePassword({
    required String userId,
    required String currentPassword,
    required String newPassword,
  }) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final existing = _users[userId];
    if (existing == null) {
      throw Exception('User not found');
    }
    if (existing.passwordHash != currentPassword) {
      throw Exception('Invalid current password');
    }
    _users[userId] = UserModel(
      id: existing.id,
      email: existing.email,
      name: existing.name,
      role: existing.role,
      phoneNumber: existing.phoneNumber,
      avatar: existing.avatar,
      bio: existing.bio,
      affiliation: existing.affiliation,
      specializations: existing.specializations,
      createdAt: existing.createdAt,
      lastLoginAt: existing.lastLoginAt,
      isEmailVerified: existing.isEmailVerified,
      isActive: existing.isActive,
      passwordHash: newPassword,
    );
  }

  @override
  Future<void> requestContributorRole({
    required String userId,
    required String reason,
  }) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final existing = _users[userId];
    if (existing == null) {
      throw Exception('User not found');
    }
    _users[userId] = UserModel(
      id: existing.id,
      email: existing.email,
      name: existing.name,
      role: UserRole.contributor.name,
      phoneNumber: existing.phoneNumber,
      avatar: existing.avatar,
      bio: existing.bio,
      affiliation: existing.affiliation,
      specializations: existing.specializations,
      createdAt: existing.createdAt,
      lastLoginAt: existing.lastLoginAt,
      isEmailVerified: existing.isEmailVerified,
      isActive: existing.isActive,
      passwordHash: existing.passwordHash,
    );
  }

  @override
  Future<UserModel> getUserById(String id) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final user = _users[id];
    if (user == null) {
      throw Exception('User not found');
    }
    return user;
  }

  @override
  Future<List<UserModel>> searchUsers({String? query, UserRole? role}) async {
    await Future.delayed(const Duration(milliseconds: 250));
    var users = _users.values.toList();
    if (query != null && query.isNotEmpty) {
      final lower = query.toLowerCase();
      users = users.where((u) {
        return u.name.toLowerCase().contains(lower) ||
            u.email.toLowerCase().contains(lower);
      }).toList();
    }
    if (role != null) {
      users = users.where((u) => u.role == role.name).toList();
    }
    return users;
  }

  @override
  Future<UserModel> promoteToContributor(String userId) async {
    await Future.delayed(const Duration(milliseconds: 250));
    final existing = _users[userId];
    if (existing == null) {
      throw Exception('User not found');
    }
    final updated = UserModel(
      id: existing.id,
      email: existing.email,
      name: existing.name,
      role: UserRole.contributor.name,
      phoneNumber: existing.phoneNumber,
      avatar: existing.avatar,
      bio: existing.bio,
      affiliation: existing.affiliation,
      specializations: existing.specializations,
      createdAt: existing.createdAt,
      lastLoginAt: existing.lastLoginAt,
      isEmailVerified: existing.isEmailVerified,
      isActive: existing.isActive,
      passwordHash: existing.passwordHash,
    );
    _users[userId] = updated;
    return updated;
  }

  @override
  Future<UserModel> promoteToExpert({
    required String userId,
    required List<String> specializations,
  }) async {
    await Future.delayed(const Duration(milliseconds: 250));
    final existing = _users[userId];
    if (existing == null) {
      throw Exception('User not found');
    }
    final updated = UserModel(
      id: existing.id,
      email: existing.email,
      name: existing.name,
      role: UserRole.expert.name,
      phoneNumber: existing.phoneNumber,
      avatar: existing.avatar,
      bio: existing.bio,
      affiliation: existing.affiliation,
      specializations: specializations,
      createdAt: existing.createdAt,
      lastLoginAt: existing.lastLoginAt,
      isEmailVerified: existing.isEmailVerified,
      isActive: existing.isActive,
      passwordHash: existing.passwordHash,
    );
    _users[userId] = updated;
    return updated;
  }

  String _generateAccessToken(String userId) => 'mock_access_token_$userId';

  String _generateRefreshToken(String userId) => 'mock_refresh_token_$userId';

  String _extractUserId(String token) {
    const prefix = 'mock_refresh_token_';
    if (!token.startsWith(prefix)) {
      throw Exception('Invalid refresh token');
    }
    return token.substring(prefix.length);
  }
}
