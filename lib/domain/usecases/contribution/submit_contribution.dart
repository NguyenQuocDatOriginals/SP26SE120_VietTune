import 'package:dartz/dartz.dart';
import '../../entities/contribution_request.dart';
import '../../failures/failure.dart';
import '../../repositories/contribution_repository.dart';

/// Use case for submitting a new contribution
class SubmitContribution {
  final ContributionRepository repository;

  SubmitContribution(this.repository);

  Future<Either<Failure, ContributionRequest>> call(
    ContributionRequest contribution,
  ) async {
    // Validate contribution before submission
    final validationError = _validateContribution(contribution);
    if (validationError != null) {
      return Left(Failure.validation(message: validationError));
    }

    return await repository.submitContribution(contribution);
  }

  String? _validateContribution(ContributionRequest contribution) {
    if (contribution.userId.isEmpty) {
      return 'User ID is required';
    }

    if (contribution.songData == null) {
      return 'Song data is required';
    }

    final song = contribution.songData!;
    if (song.title.isEmpty) {
      return 'Song title is required';
    }

    if (song.ethnicGroupId.isEmpty) {
      return 'Ethnic group is required';
    }

    return null;
  }
}
