import 'package:dartz/dartz.dart';
import '../../domain/entities/contribution_request.dart';
import '../../domain/entities/enums.dart';
import '../../domain/failures/failure.dart';
import '../../domain/repositories/base_repository.dart';
import '../../domain/repositories/contribution_repository.dart';
import '../datasources/mock/mock_contribution_data_source.dart';
import '../models/contribution_request_model.dart';

/// Implementation of ContributionRepository using mock data source
class ContributionRepositoryImpl implements ContributionRepository {
  final MockContributionDataSource _dataSource;

  ContributionRepositoryImpl(this._dataSource);

  @override
  Future<Either<Failure, ContributionRequest>> getById(String id) async {
    try {
      final model = await _dataSource.getContributionById(id);
      if (model == null) {
        return Left(Failure.notFound(
          message: 'Contribution not found',
          resourceId: id,
        ));
      }
      return Right(model.toEntity());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, PaginatedResponse<ContributionRequest>>> getAll(
    QueryParams params,
  ) async {
    try {
      final allContributions = await _dataSource.getAllContributions();
      final startIndex = (params.page - 1) * params.limit;
      final endIndex = startIndex + params.limit;
      final paginatedContributions = allContributions.sublist(
        startIndex.clamp(0, allContributions.length),
        endIndex.clamp(0, allContributions.length),
      );

      return Right(PaginatedResponse<ContributionRequest>(
        items: paginatedContributions.map((m) => m.toEntity()).toList(),
        totalCount: allContributions.length,
        page: params.page,
        limit: params.limit,
      ));
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, ContributionRequest>> create(ContributionRequest entity) async {
    try {
      final model = ContributionRequestModel.fromEntity(entity);
      final created = await _dataSource.createContribution(model);
      return Right(created.toEntity());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, ContributionRequest>> update(
    String id,
    ContributionRequest entity,
  ) async {
    try {
      final model = ContributionRequestModel.fromEntity(entity);
      final updated = await _dataSource.updateContribution(id, model);
      return Right(updated.toEntity());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> delete(String id) async {
    try {
      await _dataSource.deleteContribution(id);
      return const Right(null);
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, ContributionRequest>> submitContribution(
    ContributionRequest contribution,
  ) async {
    try {
      final model = ContributionRequestModel.fromEntity(contribution);
      final submitted = await _dataSource.createContribution(model);
      return Right(submitted.toEntity());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, PaginatedResponse<ContributionRequest>>> getUserContributions(
    String userId, {
    VerificationStatus? statusFilter,
    QueryParams? params,
  }) async {
    try {
      final allContributions = await _dataSource.getUserContributions(userId);
      
      // Filter by status if provided
      final filtered = statusFilter != null
          ? allContributions.where((c) => c.status == statusFilter.name).toList()
          : allContributions;

      final queryParams = params ?? const QueryParams();
      final startIndex = (queryParams.page - 1) * queryParams.limit;
      final endIndex = startIndex + queryParams.limit;
      final paginatedContributions = filtered.sublist(
        startIndex.clamp(0, filtered.length),
        endIndex.clamp(0, filtered.length),
      );

      return Right(PaginatedResponse<ContributionRequest>(
        items: paginatedContributions.map((m) => m.toEntity()).toList(),
        totalCount: filtered.length,
        page: queryParams.page,
        limit: queryParams.limit,
      ));
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, ContributionRequest>> updateContribution(
    String id,
    ContributionRequest contribution,
  ) async {
    try {
      // Check if contribution is pending
      final existing = await _dataSource.getContributionById(id);
      if (existing == null) {
        return Left(Failure.notFound(
          message: 'Contribution not found',
          resourceId: id,
        ));
      }

      if (existing.status != 'pending') {
        return Left(Failure.validation(
          message: 'Only pending contributions can be updated',
        ));
      }

      final model = ContributionRequestModel.fromEntity(contribution);
      final updated = await _dataSource.updateContribution(id, model);
      return Right(updated.toEntity());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> withdrawContribution(String id) async {
    try {
      await _dataSource.deleteContribution(id);
      return const Right(null);
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, PaginatedResponse<ContributionRequest>>> getContributionsByStatus(
    VerificationStatus status,
    QueryParams params,
  ) async {
    try {
      final allContributions = await _dataSource.getAllContributions();
      final filtered = allContributions
          .where((c) => c.status == status.name)
          .toList();

      final startIndex = (params.page - 1) * params.limit;
      final endIndex = startIndex + params.limit;
      final paginatedContributions = filtered.sublist(
        startIndex.clamp(0, filtered.length),
        endIndex.clamp(0, filtered.length),
      );

      return Right(PaginatedResponse<ContributionRequest>(
        items: paginatedContributions.map((m) => m.toEntity()).toList(),
        totalCount: filtered.length,
        page: params.page,
        limit: params.limit,
      ));
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, PaginatedResponse<ContributionRequest>>> getContributions({
    required UserRole userRole,
    String? currentUserId,
    QueryParams? params,
  }) async {
    try {
      final queryParams = params ?? const QueryParams();
      if (userRole == UserRole.contributor) {
        if (currentUserId == null) {
          return Left(Failure.validation(message: 'Missing user id'));
        }
        return getUserContributions(
          currentUserId,
          params: queryParams,
        );
      }
      if (userRole == UserRole.researcher) {
        return Left(Failure.unauthorized(message: 'Access denied'));
      }

      final allContributions = await _dataSource.getAllContributions();
      final startIndex = (queryParams.page - 1) * queryParams.limit;
      final endIndex = startIndex + queryParams.limit;
      final paginated = allContributions.sublist(
        startIndex.clamp(0, allContributions.length),
        endIndex.clamp(0, allContributions.length),
      );

      return Right(PaginatedResponse<ContributionRequest>(
        items: paginated.map((m) => m.toEntity()).toList(),
        totalCount: allContributions.length,
        page: queryParams.page,
        limit: queryParams.limit,
      ));
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, ContributionRequest>> approveContribution({
    required String id,
    required String expertId,
    String? comments,
  }) async {
    try {
      final existing = await _dataSource.getContributionById(id);
      if (existing == null) {
        return Left(Failure.notFound(
          message: 'Contribution not found',
          resourceId: id,
        ));
      }
      final updated = ContributionRequestModel(
        id: existing.id,
        userId: existing.userId,
        type: existing.type,
        status: VerificationStatus.verified.name,
        songData: existing.songData,
        notes: existing.notes,
        reviewComments: comments,
        submittedAt: existing.submittedAt,
        reviewedAt: DateTime.now().toIso8601String(),
        reviewedBy: expertId,
      );
      final result = await _dataSource.updateContribution(id, updated);
      return Right(result.toEntity());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, ContributionRequest>> rejectContribution({
    required String id,
    required String expertId,
    required String reason,
  }) async {
    try {
      final existing = await _dataSource.getContributionById(id);
      if (existing == null) {
        return Left(Failure.notFound(
          message: 'Contribution not found',
          resourceId: id,
        ));
      }
      final updated = ContributionRequestModel(
        id: existing.id,
        userId: existing.userId,
        type: existing.type,
        status: VerificationStatus.rejected.name,
        songData: existing.songData,
        notes: existing.notes,
        reviewComments: reason,
        submittedAt: existing.submittedAt,
        reviewedAt: DateTime.now().toIso8601String(),
        reviewedBy: expertId,
      );
      final result = await _dataSource.updateContribution(id, updated);
      return Right(result.toEntity());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }
}
