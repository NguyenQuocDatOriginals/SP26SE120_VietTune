import 'package:dartz/dartz.dart';
import '../../failures/failure.dart';
import '../../repositories/auth_repository.dart';

/// Register use case
class Register {
  final AuthRepository _repository;

  Register(this._repository);

  Future<Either<Failure, AuthResponse>> call({
    required String email,
    required String password,
    required String name,
    String? phoneNumber,
  }) =>
      _repository.register(
        email: email,
        password: password,
        name: name,
        phoneNumber: phoneNumber,
      );
}
