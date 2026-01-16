// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cultural_context.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CulturalContextImpl _$$CulturalContextImplFromJson(
        Map<String, dynamic> json) =>
    _$CulturalContextImpl(
      type: $enumDecode(_$ContextTypeEnumMap, json['type']),
      season: json['season'] as String?,
      occasion: json['occasion'] as String?,
      significance: json['significance'] as String?,
      performanceDetails: json['performanceDetails'] as String?,
      historicalBackground: json['historicalBackground'] as String?,
    );

Map<String, dynamic> _$$CulturalContextImplToJson(
        _$CulturalContextImpl instance) =>
    <String, dynamic>{
      'type': _$ContextTypeEnumMap[instance.type]!,
      'season': instance.season,
      'occasion': instance.occasion,
      'significance': instance.significance,
      'performanceDetails': instance.performanceDetails,
      'historicalBackground': instance.historicalBackground,
    };

const _$ContextTypeEnumMap = {
  ContextType.wedding: 'wedding',
  ContextType.funeral: 'funeral',
  ContextType.festival: 'festival',
  ContextType.religious: 'religious',
  ContextType.entertainment: 'entertainment',
  ContextType.work: 'work',
  ContextType.lullaby: 'lullaby',
};
