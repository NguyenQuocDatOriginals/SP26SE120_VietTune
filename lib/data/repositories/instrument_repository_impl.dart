import 'package:dartz/dartz.dart';
import '../../domain/entities/instrument.dart';
import '../../domain/entities/enums.dart';
import '../../domain/failures/failure.dart';
import '../../domain/repositories/base_repository.dart';
import '../../domain/repositories/instrument_repository.dart';
import '../datasources/mock/mock_instrument_data_source.dart';

/// Implementation of InstrumentRepository using mock data source
class InstrumentRepositoryImpl implements InstrumentRepository {
  final MockInstrumentDataSource _dataSource;

  InstrumentRepositoryImpl(this._dataSource);

  @override
  Future<Either<Failure, Instrument>> getById(String id) async {
    try {
      final model = await _dataSource.getInstrumentById(id);
      if (model == null) {
        return Left(Failure.notFound(
          message: 'Instrument not found',
          resourceId: id,
        ));
      }
      return Right(model.toEntity());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, PaginatedResponse<Instrument>>> getAll(QueryParams params) async {
    try {
      final allInstruments = await _dataSource.getAllInstruments();
      final startIndex = (params.page - 1) * params.limit;
      final endIndex = startIndex + params.limit;
      final paginatedInstruments = allInstruments.sublist(
        startIndex.clamp(0, allInstruments.length),
        endIndex.clamp(0, allInstruments.length),
      );

      return Right(PaginatedResponse<Instrument>(
        items: paginatedInstruments.map((m) => m.toEntity()).toList(),
        totalCount: allInstruments.length,
        page: params.page,
        limit: params.limit,
      ));
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, Instrument>> create(Instrument entity) async {
    try {
      // In a real implementation, this would create a new instrument
      return Right(entity);
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, Instrument>> update(String id, Instrument entity) async {
    try {
      // In a real implementation, this would update the instrument
      return Right(entity);
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> delete(String id) async {
    try {
      // In a real implementation, this would delete the instrument
      return const Right(null);
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<Instrument>>> getInstrumentsByType(InstrumentType type) async {
    try {
      final instruments = await _dataSource.getInstrumentsByType(type.name);
      return Right(instruments.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<Instrument>>> getInstrumentsByEthnicGroup(
    String ethnicGroupId,
  ) async {
    try {
      final instruments = await _dataSource.getInstrumentsByEthnicGroup(ethnicGroupId);
      return Right(instruments.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<Instrument>>> searchInstruments(String query) async {
    try {
      final instruments = await _dataSource.searchInstruments(query);
      return Right(instruments.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }
}
