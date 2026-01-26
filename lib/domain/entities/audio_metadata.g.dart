// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'audio_metadata.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AudioMetadataImpl _$$AudioMetadataImplFromJson(Map<String, dynamic> json) =>
    _$AudioMetadataImpl(
      url: json['url'] as String,
      durationInSeconds: (json['durationInSeconds'] as num).toInt(),
      quality: $enumDecode(_$AudioQualityEnumMap, json['quality']),
      recordingDate: DateTime.parse(json['recordingDate'] as String),
      instrumentIds: (json['instrumentIds'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      recordingLocation: json['recordingLocation'] == null
          ? null
          : Location.fromJson(
              json['recordingLocation'] as Map<String, dynamic>),
      performerNames: (json['performerNames'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      recordingEquipment: json['recordingEquipment'] as String?,
      recordedBy: json['recordedBy'] as String?,
      bitrate: (json['bitrate'] as num?)?.toInt(),
      format: json['format'] as String?,
      sampleRate: (json['sampleRate'] as num?)?.toInt(),
      instrumentImages: (json['instrumentImages'] as List<dynamic>?)
          ?.map((e) => ImageMetadata.fromJson(e as Map<String, dynamic>))
          .toList(),
      performerImages: (json['performerImages'] as List<dynamic>?)
          ?.map((e) => ImageMetadata.fromJson(e as Map<String, dynamic>))
          .toList(),
      video: json['video'] == null
          ? null
          : VideoMetadata.fromJson(json['video'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$AudioMetadataImplToJson(_$AudioMetadataImpl instance) =>
    <String, dynamic>{
      'url': instance.url,
      'durationInSeconds': instance.durationInSeconds,
      'quality': _$AudioQualityEnumMap[instance.quality]!,
      'recordingDate': instance.recordingDate.toIso8601String(),
      'instrumentIds': instance.instrumentIds,
      'recordingLocation': instance.recordingLocation,
      'performerNames': instance.performerNames,
      'recordingEquipment': instance.recordingEquipment,
      'recordedBy': instance.recordedBy,
      'bitrate': instance.bitrate,
      'format': instance.format,
      'sampleRate': instance.sampleRate,
      'instrumentImages': instance.instrumentImages,
      'performerImages': instance.performerImages,
      'video': instance.video,
    };

const _$AudioQualityEnumMap = {
  AudioQuality.low: 'low',
  AudioQuality.medium: 'medium',
  AudioQuality.high: 'high',
  AudioQuality.professional: 'professional',
};
