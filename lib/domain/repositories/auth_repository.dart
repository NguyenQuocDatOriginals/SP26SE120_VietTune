import 'package:dartz/dartz.dart';
import '../entities/user.dart';
import '../failures/failure.dart';

/// Response payload for authentication actions
class AuthResponse {
  final User user;
  final String accessToken;
  final String refreshToken;

  const AuthResponse({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
  });
}

/// Repository interface for authentication operations
abstract class AuthRepository {
  Future<Either<Failure, AuthResponse>> login({
    required String email,
    required String password,
  });

  Future<Either<Failure, AuthResponse>> register({
    required String email,
    required String password,
    required String name,
    String? phoneNumber,
  });

  Future<Either<Failure, void>> requestContributorRole({
    required String userId,
    required String reason,
  });

  Future<Either<Failure, void>> logout();

  Future<Either<Failure, User>> getCurrentUser();

  Future<Either<Failure, AuthResponse>> refreshToken(String refreshToken);

  Future<Either<Failure, User>> updateProfile({
    required String userId,
    String? name,
    String? bio,
    String? avatar,
  });

  Future<Either<Failure, void>> changePassword({
    required String currentPassword,
    required String newPassword,
  });
}
