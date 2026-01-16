import 'package:dartz/dartz.dart';
import '../../failures/failure.dart';
import '../../repositories/ethnic_group_repository.dart';

/// Use case for getting Vietnamese regions list
class GetRegions {
  final EthnicGroupRepository repository;

  GetRegions(this.repository);

  Future<Either<Failure, List<String>>> call() async {
    return await repository.getRegions();
  }
}
