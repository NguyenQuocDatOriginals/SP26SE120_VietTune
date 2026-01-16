import 'package:dartz/dartz.dart';
import '../../entities/contribution_request.dart';
import '../../entities/enums.dart';
import '../../failures/failure.dart';
import '../../repositories/base_repository.dart';
import '../../repositories/contribution_repository.dart';

/// Use case for getting user's contribution history
class GetUserContributions {
  final ContributionRepository repository;

  GetUserContributions(this.repository);

  Future<Either<Failure, PaginatedResponse<ContributionRequest>>> call({
    required String userId,
    VerificationStatus? statusFilter,
    QueryParams? params,
  }) async {
    if (userId.isEmpty) {
      return Left(
        Failure.validation(message: 'User ID is required'),
      );
    }

    return await repository.getUserContributions(
      userId,
      statusFilter: statusFilter,
      params: params,
    );
  }
}
