// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'image_metadata.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ImageMetadataImpl _$$ImageMetadataImplFromJson(Map<String, dynamic> json) =>
    _$ImageMetadataImpl(
      relativePath: json['relativePath'] as String,
      caption: json['caption'] as String?,
      capturedDate: json['capturedDate'] == null
          ? null
          : DateTime.parse(json['capturedDate'] as String),
      fileSizeBytes: (json['fileSizeBytes'] as num?)?.toInt(),
      mimeType: json['mimeType'] as String?,
      isMainImage: json['isMainImage'] as bool? ?? false,
      exifData: json['exifData'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$ImageMetadataImplToJson(_$ImageMetadataImpl instance) =>
    <String, dynamic>{
      'relativePath': instance.relativePath,
      'caption': instance.caption,
      'capturedDate': instance.capturedDate?.toIso8601String(),
      'fileSizeBytes': instance.fileSizeBytes,
      'mimeType': instance.mimeType,
      'isMainImage': instance.isMainImage,
      'exifData': instance.exifData,
    };
