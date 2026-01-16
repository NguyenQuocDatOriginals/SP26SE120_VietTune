import 'package:dartz/dartz.dart';
import '../../entities/contribution_request.dart';
import '../../failures/failure.dart';
import '../../repositories/contribution_repository.dart';

/// Use case for getting a specific contribution by ID
class GetContributionById {
  final ContributionRepository repository;

  GetContributionById(this.repository);

  Future<Either<Failure, ContributionRequest>> call(String id) async {
    if (id.isEmpty) {
      return Left(
        Failure.validation(message: 'Contribution ID is required'),
      );
    }

    return await repository.getById(id);
  }
}
