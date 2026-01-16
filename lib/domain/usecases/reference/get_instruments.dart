import 'package:dartz/dartz.dart';
import '../../entities/instrument.dart';
import '../../entities/enums.dart';
import '../../failures/failure.dart';
import '../../repositories/base_repository.dart';
import '../../repositories/instrument_repository.dart';

/// Use case for browsing instruments catalog
class GetInstruments {
  final InstrumentRepository repository;

  GetInstruments(this.repository);

  /// Get all instruments with optional pagination
  Future<Either<Failure, PaginatedResponse<Instrument>>> call({
    QueryParams? params,
  }) async {
    return await repository.getAll(params ?? const QueryParams());
  }

  /// Get instruments by type
  Future<Either<Failure, List<Instrument>>> byType(InstrumentType type) async {
    return await repository.getInstrumentsByType(type);
  }

  /// Get instruments by ethnic group
  Future<Either<Failure, List<Instrument>>> byEthnicGroup(
    String ethnicGroupId,
  ) async {
    if (ethnicGroupId.isEmpty) {
      return Left(
        Failure.validation(message: 'Ethnic group ID is required'),
      );
    }
    return await repository.getInstrumentsByEthnicGroup(ethnicGroupId);
  }

  /// Search instruments by name
  Future<Either<Failure, List<Instrument>>> search(String query) async {
    if (query.isEmpty) {
      return Left(
        Failure.validation(message: 'Search query is required'),
      );
    }
    return await repository.searchInstruments(query);
  }
}
