import 'package:dartz/dartz.dart';
import '../../failures/failure.dart';
import '../../repositories/auth_repository.dart';

/// Logout use case
class Logout {
  final AuthRepository _repository;

  Logout(this._repository);

  Future<Either<Failure, void>> call() => _repository.logout();
}
