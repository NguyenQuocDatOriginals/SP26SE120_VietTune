import 'package:freezed_annotation/freezed_annotation.dart';
import 'enums.dart';
import 'location.dart';
import 'image_metadata.dart';
import 'video_metadata.dart';

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
    int? sampleRate,
    /// Images of instruments used in performance
    /// Uses ImageMetadata with relative paths only
    List<ImageMetadata>? instrumentImages,
    /// Images of performers/artists
    /// Uses ImageMetadata with relative paths only
    List<ImageMetadata>? performerImages,
    /// Optional video recording
    /// Uses VideoMetadata with relative paths only
    VideoMetadata? video,
  }) = _AudioMetadata;

  factory AudioMetadata.fromJson(Map<String, dynamic> json) =>
      _$AudioMetadataFromJson(json);
}
