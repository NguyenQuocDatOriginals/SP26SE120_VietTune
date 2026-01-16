import 'package:dartz/dartz.dart';
import '../entities/ethnic_group.dart';
import '../failures/failure.dart';
import 'base_repository.dart';

/// Repository interface for ethnic group-related operations
abstract class EthnicGroupRepository extends BaseRepository<EthnicGroup> {
  /// Get ethnic groups by region
  Future<Either<Failure, List<EthnicGroup>>> getEthnicGroupsByRegion(
    String region,
  );

  /// Search ethnic groups by name
  Future<Either<Failure, List<EthnicGroup>>> searchEthnicGroups(String query);

  /// Get all regions
  Future<Either<Failure, List<String>>> getRegions();
}
