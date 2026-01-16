import 'package:flutter/foundation.dart';
import '../../domain/entities/auth_state.dart';

/// Global auth session for router redirection
class AuthSession {
  AuthSession._();

  static final AuthSession instance = AuthSession._();

  final ValueNotifier<AuthState> notifier =
      ValueNotifier<AuthState>(const AuthState.unauthenticated());

  AuthState get state => notifier.value;

  void setState(AuthState state) {
    notifier.value = state;
  }
}
