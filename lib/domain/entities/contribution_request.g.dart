// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'contribution_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ContributionRequestImpl _$$ContributionRequestImplFromJson(
        Map<String, dynamic> json) =>
    _$ContributionRequestImpl(
      id: json['id'] as String,
      userId: json['userId'] as String,
      type: $enumDecode(_$ContributionTypeEnumMap, json['type']),
      status: $enumDecode(_$VerificationStatusEnumMap, json['status']),
      songData: json['songData'] == null
          ? null
          : Song.fromJson(json['songData'] as Map<String, dynamic>),
      notes: json['notes'] as String?,
      reviewComments: json['reviewComments'] as String?,
      submittedAt: json['submittedAt'] == null
          ? null
          : DateTime.parse(json['submittedAt'] as String),
      reviewedAt: json['reviewedAt'] == null
          ? null
          : DateTime.parse(json['reviewedAt'] as String),
      reviewedBy: json['reviewedBy'] as String?,
    );

Map<String, dynamic> _$$ContributionRequestImplToJson(
        _$ContributionRequestImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'type': _$ContributionTypeEnumMap[instance.type]!,
      'status': _$VerificationStatusEnumMap[instance.status]!,
      'songData': instance.songData,
      'notes': instance.notes,
      'reviewComments': instance.reviewComments,
      'submittedAt': instance.submittedAt?.toIso8601String(),
      'reviewedAt': instance.reviewedAt?.toIso8601String(),
      'reviewedBy': instance.reviewedBy,
    };

const _$ContributionTypeEnumMap = {
  ContributionType.newSong: 'newSong',
  ContributionType.audioUpload: 'audioUpload',
  ContributionType.metadata: 'metadata',
  ContributionType.lyrics: 'lyrics',
  ContributionType.correction: 'correction',
};

const _$VerificationStatusEnumMap = {
  VerificationStatus.pending: 'pending',
  VerificationStatus.verified: 'verified',
  VerificationStatus.rejected: 'rejected',
};
