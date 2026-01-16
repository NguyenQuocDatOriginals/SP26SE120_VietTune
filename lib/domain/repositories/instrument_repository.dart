import 'package:dartz/dartz.dart';
import '../entities/instrument.dart';
import '../entities/enums.dart';
import '../failures/failure.dart';
import 'base_repository.dart';

/// Repository interface for instrument-related operations
abstract class InstrumentRepository extends BaseRepository<Instrument> {
  /// Get instruments by type
  Future<Either<Failure, List<Instrument>>> getInstrumentsByType(
    InstrumentType type,
  );

  /// Get instruments associated with an ethnic group
  Future<Either<Failure, List<Instrument>>> getInstrumentsByEthnicGroup(
    String ethnicGroupId,
  );

  /// Search instruments by name
  Future<Either<Failure, List<Instrument>>> searchInstruments(String query);
}
