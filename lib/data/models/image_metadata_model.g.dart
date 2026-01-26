// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'image_metadata_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ImageMetadataModel _$ImageMetadataModelFromJson(Map<String, dynamic> json) =>
    ImageMetadataModel(
      relativePath: json['relative_path'] as String,
      caption: json['caption'] as String?,
      capturedDate: json['captured_date'] as String?,
      fileSizeBytes: (json['file_size_bytes'] as num?)?.toInt(),
      mimeType: json['mime_type'] as String?,
      isMainImage: json['is_main_image'] as bool? ?? false,
      exifData: json['exif_data'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$ImageMetadataModelToJson(ImageMetadataModel instance) =>
    <String, dynamic>{
      'relative_path': instance.relativePath,
      'caption': instance.caption,
      'captured_date': instance.capturedDate,
      'file_size_bytes': instance.fileSizeBytes,
      'mime_type': instance.mimeType,
      'is_main_image': instance.isMainImage,
      'exif_data': instance.exifData,
    };
