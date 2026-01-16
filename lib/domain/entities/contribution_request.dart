import 'package:freezed_annotation/freezed_annotation.dart';
import 'enums.dart';
import 'song.dart';

part 'contribution_request.freezed.dart';
part 'contribution_request.g.dart';

/// User contribution submission with review workflow
@freezed
class ContributionRequest with _$ContributionRequest {
  const factory ContributionRequest({
    required String id,
    required String userId,
    required ContributionType type,
    required VerificationStatus status,
    Song? songData,
    String? notes,
    String? reviewComments,
    DateTime? submittedAt,
    DateTime? reviewedAt,
    String? reviewedBy,
  }) = _ContributionRequest;

  factory ContributionRequest.fromJson(Map<String, dynamic> json) =>
      _$ContributionRequestFromJson(json);
}
