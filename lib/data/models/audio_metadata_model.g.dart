// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'audio_metadata_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AudioMetadataModel _$AudioMetadataModelFromJson(Map<String, dynamic> json) =>
    AudioMetadataModel(
      url: json['url'] as String,
      durationInSeconds: (json['duration_in_seconds'] as num).toInt(),
      quality: json['quality'] as String,
      recordingDate: json['recording_date'] as String,
      instrumentIds: (json['instrument_ids'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      recordingLocation: json['recording_location'] == null
          ? null
          : LocationModel.fromJson(
              json['recording_location'] as Map<String, dynamic>),
      performerNames: (json['performer_names'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      recordingEquipment: json['recording_equipment'] as String?,
      recordedBy: json['recorded_by'] as String?,
      bitrate: (json['bitrate'] as num?)?.toInt(),
      format: json['format'] as String?,
      sampleRate: (json['sample_rate'] as num?)?.toInt(),
      instrumentImages: (json['instrument_images'] as List<dynamic>?)
          ?.map((e) => ImageMetadataModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      performerImages: (json['performer_images'] as List<dynamic>?)
          ?.map((e) => ImageMetadataModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      video: json['video'] == null
          ? null
          : VideoMetadataModel.fromJson(json['video'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$AudioMetadataModelToJson(AudioMetadataModel instance) =>
    <String, dynamic>{
      'url': instance.url,
      'duration_in_seconds': instance.durationInSeconds,
      'quality': instance.quality,
      'recording_date': instance.recordingDate,
      'instrument_ids': instance.instrumentIds,
      'recording_location': instance.recordingLocation,
      'performer_names': instance.performerNames,
      'recording_equipment': instance.recordingEquipment,
      'recorded_by': instance.recordedBy,
      'bitrate': instance.bitrate,
      'format': instance.format,
      'sample_rate': instance.sampleRate,
      'instrument_images': instance.instrumentImages,
      'performer_images': instance.performerImages,
      'video': instance.video,
    };
