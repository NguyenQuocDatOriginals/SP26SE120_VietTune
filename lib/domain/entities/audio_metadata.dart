import 'package:freezed_annotation/freezed_annotation.dart';
import 'enums.dart';
import 'location.dart';

part 'audio_metadata.freezed.dart';
part 'audio_metadata.g.dart';

/// Audio recording metadata
@freezed
class AudioMetadata with _$AudioMetadata {
  const factory AudioMetadata({
    required String url,
    required int durationInSeconds,
    required AudioQuality quality,
    required DateTime recordingDate,
    List<String>? instrumentIds,
    Location? recordingLocation,
    List<String>? performerNames,
    String? recordingEquipment,
    String? recordedBy,
    int? bitrate,
    String? format,
  }) = _AudioMetadata;

  factory AudioMetadata.fromJson(Map<String, dynamic> json) =>
      _$AudioMetadataFromJson(json);
}
