import 'package:dartz/dartz.dart';
import '../../domain/entities/ethnic_group.dart';
import '../../domain/failures/failure.dart';
import '../../domain/repositories/base_repository.dart';
import '../../domain/repositories/ethnic_group_repository.dart';
import '../datasources/mock/mock_ethnic_group_data_source.dart';

/// Implementation of EthnicGroupRepository using mock data source
class EthnicGroupRepositoryImpl implements EthnicGroupRepository {
  final MockEthnicGroupDataSource _dataSource;

  EthnicGroupRepositoryImpl(this._dataSource);

  @override
  Future<Either<Failure, EthnicGroup>> getById(String id) async {
    try {
      final model = await _dataSource.getEthnicGroupById(id);
      if (model == null) {
        return Left(Failure.notFound(
          message: 'Ethnic group not found',
          resourceId: id,
        ));
      }
      return Right(model.toEntity());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, PaginatedResponse<EthnicGroup>>> getAll(QueryParams params) async {
    try {
      final allGroups = await _dataSource.getAllEthnicGroups();
      final startIndex = (params.page - 1) * params.limit;
      final endIndex = startIndex + params.limit;
      final paginatedGroups = allGroups.sublist(
        startIndex.clamp(0, allGroups.length),
        endIndex.clamp(0, allGroups.length),
      );

      return Right(PaginatedResponse<EthnicGroup>(
        items: paginatedGroups.map((m) => m.toEntity()).toList(),
        totalCount: allGroups.length,
        page: params.page,
        limit: params.limit,
      ));
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, EthnicGroup>> create(EthnicGroup entity) async {
    try {
      // In a real implementation, this would create a new ethnic group
      return Right(entity);
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, EthnicGroup>> update(String id, EthnicGroup entity) async {
    try {
      // In a real implementation, this would update the ethnic group
      return Right(entity);
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> delete(String id) async {
    try {
      // In a real implementation, this would delete the ethnic group
      return const Right(null);
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<EthnicGroup>>> getEthnicGroupsByRegion(String region) async {
    try {
      final groups = await _dataSource.getEthnicGroupsByRegion(region);
      return Right(groups.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<EthnicGroup>>> searchEthnicGroups(String query) async {
    try {
      final groups = await _dataSource.searchEthnicGroups(query);
      return Right(groups.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<String>>> getRegions() async {
    try {
      final regions = await _dataSource.getRegions();
      return Right(regions);
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }
}
