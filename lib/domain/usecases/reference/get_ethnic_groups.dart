import 'package:dartz/dartz.dart';
import '../../entities/ethnic_group.dart';
import '../../failures/failure.dart';
import '../../repositories/base_repository.dart';
import '../../repositories/ethnic_group_repository.dart';

/// Use case for browsing ethnic groups
class GetEthnicGroups {
  final EthnicGroupRepository repository;

  GetEthnicGroups(this.repository);

  /// Get all ethnic groups with optional pagination
  Future<Either<Failure, PaginatedResponse<EthnicGroup>>> call({
    QueryParams? params,
  }) async {
    return await repository.getAll(params ?? const QueryParams());
  }

  /// Get ethnic groups by region
  Future<Either<Failure, List<EthnicGroup>>> byRegion(String region) async {
    if (region.isEmpty) {
      return Left(
        Failure.validation(message: 'Region is required'),
      );
    }
    return await repository.getEthnicGroupsByRegion(region);
  }

  /// Search ethnic groups by name
  Future<Either<Failure, List<EthnicGroup>>> search(String query) async {
    if (query.isEmpty) {
      return Left(
        Failure.validation(message: 'Search query is required'),
      );
    }
    return await repository.searchEthnicGroups(query);
  }
}
