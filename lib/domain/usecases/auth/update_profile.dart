import 'package:dartz/dartz.dart';
import '../../entities/user.dart';
import '../../failures/failure.dart';
import '../../repositories/auth_repository.dart';

/// Update profile use case
class UpdateProfile {
  final AuthRepository _repository;

  UpdateProfile(this._repository);

  Future<Either<Failure, User>> call({
    required String userId,
    String? name,
    String? bio,
    String? avatar,
  }) =>
      _repository.updateProfile(
        userId: userId,
        name: name,
        bio: bio,
        avatar: avatar,
      );
}
