import 'package:dartz/dartz.dart';
import '../../failures/failure.dart';
import '../../repositories/auth_repository.dart';

/// Login use case
class Login {
  final AuthRepository _repository;

  Login(this._repository);

  Future<Either<Failure, AuthResponse>> call({
    required String email,
    required String password,
  }) =>
      _repository.login(email: email, password: password);
}
