import 'package:freezed_annotation/freezed_annotation.dart';
import 'user.dart';

part 'auth_state.freezed.dart';

/// Authentication state for the app session
@freezed
class AuthState with _$AuthState {
  const factory AuthState.authenticated({
    required User user,
    required String token,
    String? refreshToken,
  }) = Authenticated;

  const factory AuthState.unauthenticated() = Unauthenticated;

  const factory AuthState.loading() = AuthLoading;
}
