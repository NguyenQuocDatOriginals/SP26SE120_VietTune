import 'package:dartz/dartz.dart';
import '../../entities/contribution_request.dart';
import '../../entities/enums.dart';
import '../../failures/failure.dart';
import '../../repositories/contribution_repository.dart';

/// Use case for updating a draft contribution
class UpdateContribution {
  final ContributionRepository repository;

  UpdateContribution(this.repository);

  Future<Either<Failure, ContributionRequest>> call({
    required String id,
    required ContributionRequest contribution,
  }) async {
    if (id.isEmpty) {
      return Left(
        Failure.validation(message: 'Contribution ID is required'),
      );
    }

    // Only pending contributions can be updated
    if (contribution.status != VerificationStatus.pending) {
      return Left(
        Failure.validation(
          message: 'Only pending contributions can be updated',
        ),
      );
    }

    return await repository.updateContribution(id, contribution);
  }
}
