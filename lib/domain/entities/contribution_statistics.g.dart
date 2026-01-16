// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'contribution_statistics.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ContributionStatisticsImpl _$$ContributionStatisticsImplFromJson(
        Map<String, dynamic> json) =>
    _$ContributionStatisticsImpl(
      total: (json['total'] as num).toInt(),
      pending: (json['pending'] as num).toInt(),
      verified: (json['verified'] as num).toInt(),
      rejected: (json['rejected'] as num).toInt(),
    );

Map<String, dynamic> _$$ContributionStatisticsImplToJson(
        _$ContributionStatisticsImpl instance) =>
    <String, dynamic>{
      'total': instance.total,
      'pending': instance.pending,
      'verified': instance.verified,
      'rejected': instance.rejected,
    };
