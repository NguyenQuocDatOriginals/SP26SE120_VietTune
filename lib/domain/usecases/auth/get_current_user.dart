import 'package:dartz/dartz.dart';
import '../../entities/user.dart';
import '../../failures/failure.dart';
import '../../repositories/auth_repository.dart';

/// Get current user use case
class GetCurrentUser {
  final AuthRepository _repository;

  GetCurrentUser(this._repository);

  Future<Either<Failure, User>> call() => _repository.getCurrentUser();
}
