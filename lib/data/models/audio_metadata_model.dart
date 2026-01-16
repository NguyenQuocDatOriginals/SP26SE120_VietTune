import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/audio_metadata.dart';
import '../../domain/entities/enums.dart';
import 'location_model.dart';

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
  });

  factory AudioMetadataModel.fromJson(Map<String, dynamic> json) =>
      _$AudioMetadataModelFromJson(json);

  Map<String, dynamic> toJson() => _$AudioMetadataModelToJson(this);

  /// Convert model to domain entity
  AudioMetadata toEntity() {
    return AudioMetadata(
      url: url,
      durationInSeconds: durationInSeconds,
      quality: AudioQuality.values.firstWhere(
        (e) => e.name == quality,
        orElse: () => AudioQuality.medium,
      ),
      recordingDate: DateTime.parse(recordingDate),
      instrumentIds: instrumentIds,
      recordingLocation: recordingLocation?.toEntity(),
      performerNames: performerNames,
      recordingEquipment: recordingEquipment,
      recordedBy: recordedBy,
      bitrate: bitrate,
      format: format,
    );
  }

  /// Create model from domain entity
  factory AudioMetadataModel.fromEntity(AudioMetadata entity) {
    return AudioMetadataModel(
      url: entity.url,
      durationInSeconds: entity.durationInSeconds,
      quality: entity.quality.name,
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
    );
  }
}
