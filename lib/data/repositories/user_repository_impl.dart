import 'package:dartz/dartz.dart';
import '../../domain/entities/contribution_statistics.dart';
import '../../domain/entities/enums.dart';
import '../../domain/entities/user.dart';
import '../../domain/failures/failure.dart';
import '../../domain/repositories/base_repository.dart';
import '../../domain/repositories/user_repository.dart';
import '../datasources/mock/mock_auth_data_source.dart';

/// User repository implementation using mock auth data source
class UserRepositoryImpl implements UserRepository {
  final MockAuthDataSource _dataSource;

  UserRepositoryImpl(this._dataSource);

  @override
  Future<Either<Failure, User>> getUserById(String id) async {
    try {
      final user = await _dataSource.getUserById(id);
      return Right(user.toEntity());
    } catch (e) {
      return Left(Failure.notFound(message: e.toString(), resourceId: id));
    }
  }

  @override
  Future<Either<Failure, ContributionStatistics>> getUserStats(
    String userId,
  ) async {
    try {
      // Mocked statistics for now
      return const Right(
        ContributionStatistics(
          total: 0,
          pending: 0,
          verified: 0,
          rejected: 0,
        ),
      );
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, PaginatedResponse<User>>> searchUsers({
    String? query,
    UserRole? role,
    QueryParams? params,
  }) async {
    try {
      final results = await _dataSource.searchUsers(query: query, role: role);
      final queryParams = params ?? const QueryParams();
      final startIndex = (queryParams.page - 1) * queryParams.limit;
      final endIndex = startIndex + queryParams.limit;
      final paginated = results.sublist(
        startIndex.clamp(0, results.length),
        endIndex.clamp(0, results.length),
      );
      return Right(PaginatedResponse<User>(
        items: paginated.map((u) => u.toEntity()).toList(),
        totalCount: results.length,
        page: queryParams.page,
        limit: queryParams.limit,
      ));
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, User>> promoteToContributor(String userId) async {
    try {
      final user = await _dataSource.promoteToContributor(userId);
      return Right(user.toEntity());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, User>> promoteToExpert({
    required String userId,
    required List<String> specializations,
  }) async {
    try {
      final user = await _dataSource.promoteToExpert(
        userId: userId,
        specializations: specializations,
      );
      return Right(user.toEntity());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }
}
