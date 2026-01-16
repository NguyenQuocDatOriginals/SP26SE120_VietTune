import 'package:dartz/dartz.dart';
import '../entities/contribution_request.dart';
import '../entities/enums.dart';
import '../failures/failure.dart';
import 'base_repository.dart';

/// Repository interface for contribution-related operations
abstract class ContributionRepository
    extends BaseRepository<ContributionRequest> {
  /// Submit a new contribution
  Future<Either<Failure, ContributionRequest>> submitContribution(
    ContributionRequest contribution,
  );

  /// Get user's contributions
  Future<Either<Failure, PaginatedResponse<ContributionRequest>>>
      getUserContributions(
    String userId, {
    VerificationStatus? statusFilter,
    QueryParams? params,
  });

  /// Update a contribution (only if status is pending)
  Future<Either<Failure, ContributionRequest>> updateContribution(
    String id,
    ContributionRequest contribution,
  );

  /// Withdraw a contribution
  Future<Either<Failure, void>> withdrawContribution(String id);

  /// Get contributions by status (for admin/moderator)
  Future<Either<Failure, PaginatedResponse<ContributionRequest>>>
      getContributionsByStatus(
    VerificationStatus status,
    QueryParams params,
  );

  /// Get contributions filtered by role
  Future<Either<Failure, PaginatedResponse<ContributionRequest>>> getContributions({
    required UserRole userRole,
    String? currentUserId,
    QueryParams? params,
  });

  /// Expert-only: Approve contribution
  Future<Either<Failure, ContributionRequest>> approveContribution({
    required String id,
    required String expertId,
    String? comments,
  });

  /// Expert-only: Reject contribution
  Future<Either<Failure, ContributionRequest>> rejectContribution({
    required String id,
    required String expertId,
    required String reason,
  });
}
