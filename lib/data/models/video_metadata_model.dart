import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/video_metadata.dart';

part 'video_metadata_model.g.dart';

/// Video metadata model DTO for JSON serialization
@JsonSerializable()
class VideoMetadataModel {
  @JsonKey(name: 'relative_path')
  final String relativePath;
  
  @JsonKey(name: 'thumbnail_relative_path')
  final String? thumbnailRelativePath;
  
  final String? caption;
  
  @JsonKey(name: 'recorded_date')
  final String? recordedDate; // ISO 8601 string
  
  @JsonKey(name: 'duration_in_seconds')
  final int? durationInSeconds;
  
  @JsonKey(name: 'file_size_bytes')
  final int? fileSizeBytes;
  
  @JsonKey(name: 'mime_type')
  final String? mimeType;
  
  final int? width;
  final int? height;
  final int? bitrate;
  final String? codec;
  final Map<String, dynamic>? metadata;

  const VideoMetadataModel({
    required this.relativePath,
    this.thumbnailRelativePath,
    this.caption,
    this.recordedDate,
    this.durationInSeconds,
    this.fileSizeBytes,
    this.mimeType,
    this.width,
    this.height,
    this.bitrate,
    this.codec,
    this.metadata,
  });

  factory VideoMetadataModel.fromJson(Map<String, dynamic> json) =>
      _$VideoMetadataModelFromJson(json);

  Map<String, dynamic> toJson() => _$VideoMetadataModelToJson(this);

  /// Convert model to domain entity
  VideoMetadata toEntity() {
    return VideoMetadata(
      relativePath: relativePath,
      thumbnailRelativePath: thumbnailRelativePath,
      caption: caption,
      recordedDate: recordedDate != null ? DateTime.parse(recordedDate!) : null,
      durationInSeconds: durationInSeconds,
      fileSizeBytes: fileSizeBytes,
      mimeType: mimeType,
      width: width,
      height: height,
      bitrate: bitrate,
      codec: codec,
      metadata: metadata,
    );
  }

  /// Create model from domain entity
  factory VideoMetadataModel.fromEntity(VideoMetadata entity) {
    return VideoMetadataModel(
      relativePath: entity.relativePath,
      thumbnailRelativePath: entity.thumbnailRelativePath,
      caption: entity.caption,
      recordedDate: entity.recordedDate?.toIso8601String(),
      durationInSeconds: entity.durationInSeconds,
      fileSizeBytes: entity.fileSizeBytes,
      mimeType: entity.mimeType,
      width: entity.width,
      height: entity.height,
      bitrate: entity.bitrate,
      codec: entity.codec,
      metadata: entity.metadata,
    );
  }
}
