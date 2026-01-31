import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/audio_metadata.dart';
import '../../domain/entities/enums.dart';
import 'location_model.dart';
import 'image_metadata_model.dart';
import 'video_metadata_model.dart';

part 'audio_metadata_model.g.dart';

/// Audio metadata model DTO for JSON serialization
@JsonSerializable()
class AudioMetadataModel {
  final String url;
  @JsonKey(name: 'duration_in_seconds')
  final int durationInSeconds;
  final String quality; // AudioQuality enum as string
  @JsonKey(name: 'recording_date')
  final String recordingDate; // ISO 8601 string
  @JsonKey(name: 'instrument_ids')
  final List<String>? instrumentIds;
  @JsonKey(name: 'recording_location')
  final LocationModel? recordingLocation;
  @JsonKey(name: 'performer_names')
  final List<String>? performerNames;
  @JsonKey(name: 'recording_equipment')
  final String? recordingEquipment;
  @JsonKey(name: 'recorded_by')
  final String? recordedBy;
  final int? bitrate;
  final String? format;
  @JsonKey(name: 'sample_rate')
  final int? sampleRate;
  @JsonKey(name: 'instrument_images')
  final List<ImageMetadataModel>? instrumentImages;
  @JsonKey(name: 'performer_images')
  final List<ImageMetadataModel>? performerImages;
  
  final VideoMetadataModel? video;

  const AudioMetadataModel({
    required this.url,
    required this.durationInSeconds,
    required this.quality,
    required this.recordingDate,
    this.instrumentIds,
    this.recordingLocation,
    this.performerNames,
    this.recordingEquipment,
    this.recordedBy,
    this.bitrate,
    this.format,
    this.sampleRate,
    this.instrumentImages,
    this.performerImages,
    this.video,
  });

  factory AudioMetadataModel.fromJson(Map<String, dynamic> json) =>
      _$AudioMetadataModelFromJson(json);

  Map<String, dynamic> toJson() => _$AudioMetadataModelToJson(this);

  /// Convert model to domain entity
  AudioMetadata toEntity() {
    return AudioMetadata(
      url: url,
      durationInSeconds: durationInSeconds,
      quality: audioQualityFromJsonValue(quality) ?? AudioQuality.medium,
      recordingDate: DateTime.parse(recordingDate),
      instrumentIds: instrumentIds,
      recordingLocation: recordingLocation?.toEntity(),
      performerNames: performerNames,
      recordingEquipment: recordingEquipment,
      recordedBy: recordedBy,
      bitrate: bitrate,
      format: format,
      sampleRate: sampleRate,
      instrumentImages: instrumentImages?.map((img) => img.toEntity()).toList(),
      performerImages: performerImages?.map((img) => img.toEntity()).toList(),
      video: video?.toEntity(),
    );
  }

  /// Create model from domain entity
  factory AudioMetadataModel.fromEntity(AudioMetadata entity) {
    return AudioMetadataModel(
      url: entity.url,
      durationInSeconds: entity.durationInSeconds,
      quality: audioQualityToJsonValue(entity.quality),
      recordingDate: entity.recordingDate.toIso8601String(),
      instrumentIds: entity.instrumentIds,
      recordingLocation: entity.recordingLocation != null
          ? LocationModel.fromEntity(entity.recordingLocation!)
          : null,
      performerNames: entity.performerNames,
      recordingEquipment: entity.recordingEquipment,
      recordedBy: entity.recordedBy,
      bitrate: entity.bitrate,
      format: entity.format,
      sampleRate: entity.sampleRate,
      instrumentImages: entity.instrumentImages
          ?.map((img) => ImageMetadataModel.fromEntity(img))
          .toList(),
      performerImages: entity.performerImages
          ?.map((img) => ImageMetadataModel.fromEntity(img))
          .toList(),
      video: entity.video != null
          ? VideoMetadataModel.fromEntity(entity.video!)
          : null,
    );
  }
}
