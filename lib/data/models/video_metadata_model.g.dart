// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'video_metadata_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VideoMetadataModel _$VideoMetadataModelFromJson(Map<String, dynamic> json) =>
    VideoMetadataModel(
      relativePath: json['relative_path'] as String,
      thumbnailRelativePath: json['thumbnail_relative_path'] as String?,
      caption: json['caption'] as String?,
      recordedDate: json['recorded_date'] as String?,
      durationInSeconds: (json['duration_in_seconds'] as num?)?.toInt(),
      fileSizeBytes: (json['file_size_bytes'] as num?)?.toInt(),
      mimeType: json['mime_type'] as String?,
      width: (json['width'] as num?)?.toInt(),
      height: (json['height'] as num?)?.toInt(),
      bitrate: (json['bitrate'] as num?)?.toInt(),
      codec: json['codec'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$VideoMetadataModelToJson(VideoMetadataModel instance) =>
    <String, dynamic>{
      'relative_path': instance.relativePath,
      'thumbnail_relative_path': instance.thumbnailRelativePath,
      'caption': instance.caption,
      'recorded_date': instance.recordedDate,
      'duration_in_seconds': instance.durationInSeconds,
      'file_size_bytes': instance.fileSizeBytes,
      'mime_type': instance.mimeType,
      'width': instance.width,
      'height': instance.height,
      'bitrate': instance.bitrate,
      'codec': instance.codec,
      'metadata': instance.metadata,
    };
