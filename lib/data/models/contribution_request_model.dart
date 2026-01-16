import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/contribution_request.dart';
import '../../domain/entities/enums.dart';
import 'song_model.dart';

part 'contribution_request_model.g.dart';

/// Contribution request model DTO for JSON serialization
@JsonSerializable()
class ContributionRequestModel {
  final String id;
  @JsonKey(name: 'user_id')
  final String userId;
  final String type; // ContributionType enum as string
  final String status; // VerificationStatus enum as string
  @JsonKey(name: 'song_data')
  final SongModel? songData;
  final String? notes;
  @JsonKey(name: 'review_comments')
  final String? reviewComments;
  @JsonKey(name: 'submitted_at')
  final String? submittedAt; // ISO 8601 string
  @JsonKey(name: 'reviewed_at')
  final String? reviewedAt; // ISO 8601 string
  @JsonKey(name: 'reviewed_by')
  final String? reviewedBy;

  const ContributionRequestModel({
    required this.id,
    required this.userId,
    required this.type,
    required this.status,
    this.songData,
    this.notes,
    this.reviewComments,
    this.submittedAt,
    this.reviewedAt,
    this.reviewedBy,
  });

  factory ContributionRequestModel.fromJson(Map<String, dynamic> json) =>
      _$ContributionRequestModelFromJson(json);

  Map<String, dynamic> toJson() => _$ContributionRequestModelToJson(this);

  /// Convert model to domain entity
  ContributionRequest toEntity() {
    return ContributionRequest(
      id: id,
      userId: userId,
      type: ContributionType.values.firstWhere(
        (e) => e.name == type,
        orElse: () => ContributionType.newSong,
      ),
      status: VerificationStatus.values.firstWhere(
        (e) => e.name == status,
        orElse: () => VerificationStatus.pending,
      ),
      songData: songData?.toEntity(),
      notes: notes,
      reviewComments: reviewComments,
      submittedAt: submittedAt != null ? DateTime.parse(submittedAt!) : null,
      reviewedAt: reviewedAt != null ? DateTime.parse(reviewedAt!) : null,
      reviewedBy: reviewedBy,
    );
  }

  /// Create model from domain entity
  factory ContributionRequestModel.fromEntity(ContributionRequest entity) {
    return ContributionRequestModel(
      id: entity.id,
      userId: entity.userId,
      type: entity.type.name,
      status: entity.status.name,
      songData: entity.songData != null
          ? SongModel.fromEntity(entity.songData!)
          : null,
      notes: entity.notes,
      reviewComments: entity.reviewComments,
      submittedAt: entity.submittedAt?.toIso8601String(),
      reviewedAt: entity.reviewedAt?.toIso8601String(),
      reviewedBy: entity.reviewedBy,
    );
  }
}
