// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'video_metadata.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$VideoMetadataImpl _$$VideoMetadataImplFromJson(Map<String, dynamic> json) =>
    _$VideoMetadataImpl(
      relativePath: json['relativePath'] as String,
      thumbnailRelativePath: json['thumbnailRelativePath'] as String?,
      caption: json['caption'] as String?,
      recordedDate: json['recordedDate'] == null
          ? null
          : DateTime.parse(json['recordedDate'] as String),
      durationInSeconds: (json['durationInSeconds'] as num?)?.toInt(),
      fileSizeBytes: (json['fileSizeBytes'] as num?)?.toInt(),
      mimeType: json['mimeType'] as String?,
      width: (json['width'] as num?)?.toInt(),
      height: (json['height'] as num?)?.toInt(),
      bitrate: (json['bitrate'] as num?)?.toInt(),
      codec: json['codec'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$VideoMetadataImplToJson(_$VideoMetadataImpl instance) =>
    <String, dynamic>{
      'relativePath': instance.relativePath,
      'thumbnailRelativePath': instance.thumbnailRelativePath,
      'caption': instance.caption,
      'recordedDate': instance.recordedDate?.toIso8601String(),
      'durationInSeconds': instance.durationInSeconds,
      'fileSizeBytes': instance.fileSizeBytes,
      'mimeType': instance.mimeType,
      'width': instance.width,
      'height': instance.height,
      'bitrate': instance.bitrate,
      'codec': instance.codec,
      'metadata': instance.metadata,
    };
