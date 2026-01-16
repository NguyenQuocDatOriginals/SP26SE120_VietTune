import 'dart:convert';
import 'package:dartz/dartz.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/di/injection.dart';
import '../../../core/router/auth_session.dart';
import '../../../domain/entities/auth_state.dart';
import '../../../domain/entities/user.dart';
import '../../../domain/entities/enums.dart';
import '../../../domain/failures/failure.dart';
import '../../../domain/repositories/auth_repository.dart';
import '../../../data/models/user_model.dart';

const _tokenKey = 'auth_token';
const _refreshTokenKey = 'auth_refresh_token';
const _userKey = 'auth_user';

/// Auth state provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repository = getIt<AuthRepository>();
  final storage = getIt<FlutterSecureStorage>();
  return AuthNotifier(repository, storage);
});

/// Helper provider for current user
final currentUserProvider = Provider<User?>((ref) {
  final authState = ref.watch(authProvider);
  return authState.maybeWhen(
    authenticated: (user, _, __) => user,
    orElse: () => null,
  );
});

/// Helper provider for current user role
final currentUserRoleProvider = Provider<UserRole?>((ref) {
  final user = ref.watch(currentUserProvider);
  return user?.role;
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;
  final FlutterSecureStorage _storage;

  AuthNotifier(this._repository, this._storage)
      : super(const AuthState.loading()) {
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    try {
      final token = await _storage.read(key: _tokenKey);
      final refreshToken = await _storage.read(key: _refreshTokenKey);
      final userJson = await _storage.read(key: _userKey);
      if (refreshToken != null) {
        final refreshed = await _repository.refreshToken(refreshToken);
        final restored = await refreshed.fold(
          (_) async => null,
          (response) async {
            await _persistAuth(response);
            return response;
          },
        );
        if (restored != null) {
          _setState(AuthState.authenticated(
            user: restored.user,
            token: restored.accessToken,
            refreshToken: restored.refreshToken,
          ));
          return;
        }
      }
      if (token != null && userJson != null) {
        final userMap = jsonDecode(userJson) as Map<String, dynamic>;
        final userModel = UserModel.fromJson(userMap);
        final user = userModel.toEntity();
        _setState(AuthState.authenticated(
          user: user,
          token: token,
          refreshToken: refreshToken,
        ));
      } else {
        _setState(const AuthState.unauthenticated());
      }
    } catch (_) {
      _setState(const AuthState.unauthenticated());
    }
  }

  Future<Either<Failure, AuthResponse>> login({
    required String email,
    required String password,
  }) async {
    final result = await _repository.login(email: email, password: password);
    return result.fold(
      (failure) => Left(failure),
      (response) async {
        await _persistAuth(response);
        _setState(AuthState.authenticated(
          user: response.user,
          token: response.accessToken,
          refreshToken: response.refreshToken,
        ));
        return Right(response);
      },
    );
  }

  Future<Either<Failure, AuthResponse>> register({
    required String email,
    required String password,
    required String name,
    String? phoneNumber,
  }) async {
    final result = await _repository.register(
      email: email,
      password: password,
      name: name,
      phoneNumber: phoneNumber,
    );
    return result.fold(
      (failure) => Left(failure),
      (response) async {
        await _persistAuth(response);
        _setState(AuthState.authenticated(
          user: response.user,
          token: response.accessToken,
          refreshToken: response.refreshToken,
        ));
        return Right(response);
      },
    );
  }

  Future<Either<Failure, void>> logout() async {
    final result = await _repository.logout();
    return result.fold(
      (failure) => Left(failure),
      (_) async {
        await _clearAuth();
        _setState(const AuthState.unauthenticated());
        return const Right(null);
      },
    );
  }

  Future<Either<Failure, void>> requestContributorRole({
    required String userId,
    required String reason,
  }) async {
    final result = await _repository.requestContributorRole(
      userId: userId,
      reason: reason,
    );
    return result.fold(
      (failure) => Left(failure),
      (_) async {
        final userResult = await _repository.getCurrentUser();
        return userResult.fold(
          (failure) => Left(failure),
          (user) async {
            final authState = state;
            authState.maybeWhen(
              authenticated: (currentUser, token, refreshToken) {
                _setState(AuthState.authenticated(
                  user: user,
                  token: token,
                  refreshToken: refreshToken,
                ));
                final userModel = UserModel.fromEntity(user);
                _storage.write(
                  key: _userKey,
                  value: jsonEncode(userModel.toJson()),
                );
              },
              orElse: () {},
            );
            return const Right(null);
          },
        );
      },
    );
  }

  Future<void> _persistAuth(AuthResponse response) async {
    await _storage.write(key: _tokenKey, value: response.accessToken);
    await _storage.write(
      key: _refreshTokenKey,
      value: response.refreshToken,
    );
    final userModel = UserModel.fromEntity(response.user);
    await _storage.write(
      key: _userKey,
      value: jsonEncode(userModel.toJson()),
    );
  }

  Future<void> _clearAuth() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _refreshTokenKey);
    await _storage.delete(key: _userKey);
  }

  void _setState(AuthState next) {
    state = next;
    AuthSession.instance.setState(next);
  }
}
