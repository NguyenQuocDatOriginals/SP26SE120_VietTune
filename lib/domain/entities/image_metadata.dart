import 'package:freezed_annotation/freezed_annotation.dart';

part 'image_metadata.freezed.dart';
part 'image_metadata.g.dart';

/// Image metadata entity for contribution images
/// 
/// ⚠️ CRITICAL: Only stores relative paths (e.g., "draft_images/abc123.jpg")
/// Never store absolute paths. Combine with path_provider at runtime.
@freezed
class ImageMetadata with _$ImageMetadata {
  const factory ImageMetadata({
    /// Relative path only (e.g., "draft_images/abc123.jpg")
    /// Never store absolute paths!
    required String relativePath,
    
    /// Optional caption for the image
    String? caption,
    
    /// Date when image was captured (from Exif data)
    DateTime? capturedDate,
    
    /// File size in bytes
    int? fileSizeBytes,
    
    /// MIME type (e.g., "image/jpeg")
    String? mimeType,
    
    /// Whether this is the main/primary image
    @Default(false) bool isMainImage,
    
    /// Preserved Exif metadata
    Map<String, dynamic>? exifData,
  }) = _ImageMetadata;

  factory ImageMetadata.fromJson(Map<String, dynamic> json) =>
      _$ImageMetadataFromJson(json);
}
