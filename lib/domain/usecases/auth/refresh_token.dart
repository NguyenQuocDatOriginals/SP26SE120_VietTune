import 'package:dartz/dartz.dart';
import '../../failures/failure.dart';
import '../../repositories/auth_repository.dart';

/// Refresh token use case
class RefreshToken {
  final AuthRepository _repository;

  RefreshToken(this._repository);

  Future<Either<Failure, AuthResponse>> call(String refreshToken) =>
      _repository.refreshToken(refreshToken);
}
