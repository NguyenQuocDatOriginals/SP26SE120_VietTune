import 'package:freezed_annotation/freezed_annotation.dart';

part 'video_metadata.freezed.dart';
part 'video_metadata.g.dart';

/// Video metadata entity for contribution videos
/// 
/// ⚠️ CRITICAL: Only stores relative paths (e.g., "draft_videos/abc123.mp4")
/// Never store absolute paths. Combine with path_provider at runtime.
@freezed
class VideoMetadata with _$VideoMetadata {
  const factory VideoMetadata({
    /// Relative path only (e.g., "draft_videos/abc123.mp4")
    /// Never store absolute paths!
    required String relativePath,
    
    /// ⚠️ CRITICAL: Thumbnail relative path (JPG image)
    /// Generated immediately after pick/record to avoid performance issues
    /// Never load VideoPlayerController just to show thumbnail!
    /// Example: "draft_videos/thumbnails/abc123.jpg"
    String? thumbnailRelativePath,
    
    /// Optional caption for the video
    String? caption,
    
    /// Date when video was recorded (from metadata or file system)
    DateTime? recordedDate,
    
    /// Video duration in seconds
    int? durationInSeconds,
    
    /// File size in bytes
    int? fileSizeBytes,
    
    /// MIME type (e.g., "video/mp4", "video/mov")
    String? mimeType,
    
    /// Video width in pixels
    int? width,
    
    /// Video height in pixels
    int? height,
    
    /// Video bitrate (bits per second)
    int? bitrate,
    
    /// Video codec (e.g., "h264", "hevc")
    String? codec,
    
    /// Additional video metadata
    Map<String, dynamic>? metadata,
  }) = _VideoMetadata;

  factory VideoMetadata.fromJson(Map<String, dynamic> json) =>
      _$VideoMetadataFromJson(json);
}
