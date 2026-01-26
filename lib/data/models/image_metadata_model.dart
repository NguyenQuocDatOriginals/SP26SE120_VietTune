import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/image_metadata.dart';

part 'image_metadata_model.g.dart';

/// Image metadata model DTO for JSON serialization
@JsonSerializable()
class ImageMetadataModel {
  @JsonKey(name: 'relative_path')
  final String relativePath;
  final String? caption;
  @JsonKey(name: 'captured_date')
  final String? capturedDate; // ISO 8601 string
  @JsonKey(name: 'file_size_bytes')
  final int? fileSizeBytes;
  @JsonKey(name: 'mime_type')
  final String? mimeType;
  @JsonKey(name: 'is_main_image', defaultValue: false)
  final bool isMainImage;
  @JsonKey(name: 'exif_data')
  final Map<String, dynamic>? exifData;

  const ImageMetadataModel({
    required this.relativePath,
    this.caption,
    this.capturedDate,
    this.fileSizeBytes,
    this.mimeType,
    this.isMainImage = false,
    this.exifData,
  });

  factory ImageMetadataModel.fromJson(Map<String, dynamic> json) =>
      _$ImageMetadataModelFromJson(json);

  Map<String, dynamic> toJson() => _$ImageMetadataModelToJson(this);

  /// Convert model to domain entity
  ImageMetadata toEntity() {
    return ImageMetadata(
      relativePath: relativePath,
      caption: caption,
      capturedDate: capturedDate != null ? DateTime.parse(capturedDate!) : null,
      fileSizeBytes: fileSizeBytes,
      mimeType: mimeType,
      isMainImage: isMainImage,
      exifData: exifData,
    );
  }

  /// Create model from domain entity
  factory ImageMetadataModel.fromEntity(ImageMetadata entity) {
    return ImageMetadataModel(
      relativePath: entity.relativePath,
      caption: entity.caption,
      capturedDate: entity.capturedDate?.toIso8601String(),
      fileSizeBytes: entity.fileSizeBytes,
      mimeType: entity.mimeType,
      isMainImage: entity.isMainImage,
      exifData: entity.exifData,
    );
  }
}
