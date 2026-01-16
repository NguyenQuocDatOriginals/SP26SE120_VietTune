import 'package:dartz/dartz.dart';
import '../../failures/failure.dart';
import '../../repositories/auth_repository.dart';

/// Request contributor role use case
class RequestContributorRole {
  final AuthRepository _repository;

  RequestContributorRole(this._repository);

  Future<Either<Failure, void>> call({
    required String userId,
    required String reason,
  }) =>
      _repository.requestContributorRole(userId: userId, reason: reason);
}
