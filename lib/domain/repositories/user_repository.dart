import 'package:dartz/dartz.dart';
import '../entities/user.dart';
import '../entities/enums.dart';
import '../entities/contribution_statistics.dart';
import '../failures/failure.dart';
import 'base_repository.dart';

/// Repository interface for user management
abstract class UserRepository {
  Future<Either<Failure, User>> getUserById(String id);

  Future<Either<Failure, ContributionStatistics>> getUserStats(String userId);

  Future<Either<Failure, PaginatedResponse<User>>> searchUsers({
    String? query,
    UserRole? role,
    QueryParams? params,
  });

  Future<Either<Failure, User>> promoteToContributor(String userId);

  Future<Either<Failure, User>> promoteToExpert({
    required String userId,
    required List<String> specializations,
  });
}
