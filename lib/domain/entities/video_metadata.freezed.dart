// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'video_metadata.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

VideoMetadata _$VideoMetadataFromJson(Map<String, dynamic> json) {
  return _VideoMetadata.fromJson(json);
}

/// @nodoc
mixin _$VideoMetadata {
  /// Relative path only (e.g., "draft_videos/abc123.mp4")
  /// Never store absolute paths!
  String get relativePath => throw _privateConstructorUsedError;

  /// ⚠️ CRITICAL: Thumbnail relative path (JPG image)
  /// Generated immediately after pick/record to avoid performance issues
  /// Never load VideoPlayerController just to show thumbnail!
  /// Example: "draft_videos/thumbnails/abc123.jpg"
  String? get thumbnailRelativePath => throw _privateConstructorUsedError;

  /// Optional caption for the video
  String? get caption => throw _privateConstructorUsedError;

  /// Date when video was recorded (from metadata or file system)
  DateTime? get recordedDate => throw _privateConstructorUsedError;

  /// Video duration in seconds
  int? get durationInSeconds => throw _privateConstructorUsedError;

  /// File size in bytes
  int? get fileSizeBytes => throw _privateConstructorUsedError;

  /// MIME type (e.g., "video/mp4", "video/mov")
  String? get mimeType => throw _privateConstructorUsedError;

  /// Video width in pixels
  int? get width => throw _privateConstructorUsedError;

  /// Video height in pixels
  int? get height => throw _privateConstructorUsedError;

  /// Video bitrate (bits per second)
  int? get bitrate => throw _privateConstructorUsedError;

  /// Video codec (e.g., "h264", "hevc")
  String? get codec => throw _privateConstructorUsedError;

  /// Additional video metadata
  Map<String, dynamic>? get metadata => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $VideoMetadataCopyWith<VideoMetadata> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $VideoMetadataCopyWith<$Res> {
  factory $VideoMetadataCopyWith(
          VideoMetadata value, $Res Function(VideoMetadata) then) =
      _$VideoMetadataCopyWithImpl<$Res, VideoMetadata>;
  @useResult
  $Res call(
      {String relativePath,
      String? thumbnailRelativePath,
      String? caption,
      DateTime? recordedDate,
      int? durationInSeconds,
      int? fileSizeBytes,
      String? mimeType,
      int? width,
      int? height,
      int? bitrate,
      String? codec,
      Map<String, dynamic>? metadata});
}

/// @nodoc
class _$VideoMetadataCopyWithImpl<$Res, $Val extends VideoMetadata>
    implements $VideoMetadataCopyWith<$Res> {
  _$VideoMetadataCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? relativePath = null,
    Object? thumbnailRelativePath = freezed,
    Object? caption = freezed,
    Object? recordedDate = freezed,
    Object? durationInSeconds = freezed,
    Object? fileSizeBytes = freezed,
    Object? mimeType = freezed,
    Object? width = freezed,
    Object? height = freezed,
    Object? bitrate = freezed,
    Object? codec = freezed,
    Object? metadata = freezed,
  }) {
    return _then(_value.copyWith(
      relativePath: null == relativePath
          ? _value.relativePath
          : relativePath // ignore: cast_nullable_to_non_nullable
              as String,
      thumbnailRelativePath: freezed == thumbnailRelativePath
          ? _value.thumbnailRelativePath
          : thumbnailRelativePath // ignore: cast_nullable_to_non_nullable
              as String?,
      caption: freezed == caption
          ? _value.caption
          : caption // ignore: cast_nullable_to_non_nullable
              as String?,
      recordedDate: freezed == recordedDate
          ? _value.recordedDate
          : recordedDate // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      durationInSeconds: freezed == durationInSeconds
          ? _value.durationInSeconds
          : durationInSeconds // ignore: cast_nullable_to_non_nullable
              as int?,
      fileSizeBytes: freezed == fileSizeBytes
          ? _value.fileSizeBytes
          : fileSizeBytes // ignore: cast_nullable_to_non_nullable
              as int?,
      mimeType: freezed == mimeType
          ? _value.mimeType
          : mimeType // ignore: cast_nullable_to_non_nullable
              as String?,
      width: freezed == width
          ? _value.width
          : width // ignore: cast_nullable_to_non_nullable
              as int?,
      height: freezed == height
          ? _value.height
          : height // ignore: cast_nullable_to_non_nullable
              as int?,
      bitrate: freezed == bitrate
          ? _value.bitrate
          : bitrate // ignore: cast_nullable_to_non_nullable
              as int?,
      codec: freezed == codec
          ? _value.codec
          : codec // ignore: cast_nullable_to_non_nullable
              as String?,
      metadata: freezed == metadata
          ? _value.metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$VideoMetadataImplCopyWith<$Res>
    implements $VideoMetadataCopyWith<$Res> {
  factory _$$VideoMetadataImplCopyWith(
          _$VideoMetadataImpl value, $Res Function(_$VideoMetadataImpl) then) =
      __$$VideoMetadataImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String relativePath,
      String? thumbnailRelativePath,
      String? caption,
      DateTime? recordedDate,
      int? durationInSeconds,
      int? fileSizeBytes,
      String? mimeType,
      int? width,
      int? height,
      int? bitrate,
      String? codec,
      Map<String, dynamic>? metadata});
}

/// @nodoc
class __$$VideoMetadataImplCopyWithImpl<$Res>
    extends _$VideoMetadataCopyWithImpl<$Res, _$VideoMetadataImpl>
    implements _$$VideoMetadataImplCopyWith<$Res> {
  __$$VideoMetadataImplCopyWithImpl(
      _$VideoMetadataImpl _value, $Res Function(_$VideoMetadataImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? relativePath = null,
    Object? thumbnailRelativePath = freezed,
    Object? caption = freezed,
    Object? recordedDate = freezed,
    Object? durationInSeconds = freezed,
    Object? fileSizeBytes = freezed,
    Object? mimeType = freezed,
    Object? width = freezed,
    Object? height = freezed,
    Object? bitrate = freezed,
    Object? codec = freezed,
    Object? metadata = freezed,
  }) {
    return _then(_$VideoMetadataImpl(
      relativePath: null == relativePath
          ? _value.relativePath
          : relativePath // ignore: cast_nullable_to_non_nullable
              as String,
      thumbnailRelativePath: freezed == thumbnailRelativePath
          ? _value.thumbnailRelativePath
          : thumbnailRelativePath // ignore: cast_nullable_to_non_nullable
              as String?,
      caption: freezed == caption
          ? _value.caption
          : caption // ignore: cast_nullable_to_non_nullable
              as String?,
      recordedDate: freezed == recordedDate
          ? _value.recordedDate
          : recordedDate // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      durationInSeconds: freezed == durationInSeconds
          ? _value.durationInSeconds
          : durationInSeconds // ignore: cast_nullable_to_non_nullable
              as int?,
      fileSizeBytes: freezed == fileSizeBytes
          ? _value.fileSizeBytes
          : fileSizeBytes // ignore: cast_nullable_to_non_nullable
              as int?,
      mimeType: freezed == mimeType
          ? _value.mimeType
          : mimeType // ignore: cast_nullable_to_non_nullable
              as String?,
      width: freezed == width
          ? _value.width
          : width // ignore: cast_nullable_to_non_nullable
              as int?,
      height: freezed == height
          ? _value.height
          : height // ignore: cast_nullable_to_non_nullable
              as int?,
      bitrate: freezed == bitrate
          ? _value.bitrate
          : bitrate // ignore: cast_nullable_to_non_nullable
              as int?,
      codec: freezed == codec
          ? _value.codec
          : codec // ignore: cast_nullable_to_non_nullable
              as String?,
      metadata: freezed == metadata
          ? _value._metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$VideoMetadataImpl implements _VideoMetadata {
  const _$VideoMetadataImpl(
      {required this.relativePath,
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
      final Map<String, dynamic>? metadata})
      : _metadata = metadata;

  factory _$VideoMetadataImpl.fromJson(Map<String, dynamic> json) =>
      _$$VideoMetadataImplFromJson(json);

  /// Relative path only (e.g., "draft_videos/abc123.mp4")
  /// Never store absolute paths!
  @override
  final String relativePath;

  /// ⚠️ CRITICAL: Thumbnail relative path (JPG image)
  /// Generated immediately after pick/record to avoid performance issues
  /// Never load VideoPlayerController just to show thumbnail!
  /// Example: "draft_videos/thumbnails/abc123.jpg"
  @override
  final String? thumbnailRelativePath;

  /// Optional caption for the video
  @override
  final String? caption;

  /// Date when video was recorded (from metadata or file system)
  @override
  final DateTime? recordedDate;

  /// Video duration in seconds
  @override
  final int? durationInSeconds;

  /// File size in bytes
  @override
  final int? fileSizeBytes;

  /// MIME type (e.g., "video/mp4", "video/mov")
  @override
  final String? mimeType;

  /// Video width in pixels
  @override
  final int? width;

  /// Video height in pixels
  @override
  final int? height;

  /// Video bitrate (bits per second)
  @override
  final int? bitrate;

  /// Video codec (e.g., "h264", "hevc")
  @override
  final String? codec;

  /// Additional video metadata
  final Map<String, dynamic>? _metadata;

  /// Additional video metadata
  @override
  Map<String, dynamic>? get metadata {
    final value = _metadata;
    if (value == null) return null;
    if (_metadata is EqualUnmodifiableMapView) return _metadata;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  String toString() {
    return 'VideoMetadata(relativePath: $relativePath, thumbnailRelativePath: $thumbnailRelativePath, caption: $caption, recordedDate: $recordedDate, durationInSeconds: $durationInSeconds, fileSizeBytes: $fileSizeBytes, mimeType: $mimeType, width: $width, height: $height, bitrate: $bitrate, codec: $codec, metadata: $metadata)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$VideoMetadataImpl &&
            (identical(other.relativePath, relativePath) ||
                other.relativePath == relativePath) &&
            (identical(other.thumbnailRelativePath, thumbnailRelativePath) ||
                other.thumbnailRelativePath == thumbnailRelativePath) &&
            (identical(other.caption, caption) || other.caption == caption) &&
            (identical(other.recordedDate, recordedDate) ||
                other.recordedDate == recordedDate) &&
            (identical(other.durationInSeconds, durationInSeconds) ||
                other.durationInSeconds == durationInSeconds) &&
            (identical(other.fileSizeBytes, fileSizeBytes) ||
                other.fileSizeBytes == fileSizeBytes) &&
            (identical(other.mimeType, mimeType) ||
                other.mimeType == mimeType) &&
            (identical(other.width, width) || other.width == width) &&
            (identical(other.height, height) || other.height == height) &&
            (identical(other.bitrate, bitrate) || other.bitrate == bitrate) &&
            (identical(other.codec, codec) || other.codec == codec) &&
            const DeepCollectionEquality().equals(other._metadata, _metadata));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      relativePath,
      thumbnailRelativePath,
      caption,
      recordedDate,
      durationInSeconds,
      fileSizeBytes,
      mimeType,
      width,
      height,
      bitrate,
      codec,
      const DeepCollectionEquality().hash(_metadata));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$VideoMetadataImplCopyWith<_$VideoMetadataImpl> get copyWith =>
      __$$VideoMetadataImplCopyWithImpl<_$VideoMetadataImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$VideoMetadataImplToJson(
      this,
    );
  }
}

abstract class _VideoMetadata implements VideoMetadata {
  const factory _VideoMetadata(
      {required final String relativePath,
      final String? thumbnailRelativePath,
      final String? caption,
      final DateTime? recordedDate,
      final int? durationInSeconds,
      final int? fileSizeBytes,
      final String? mimeType,
      final int? width,
      final int? height,
      final int? bitrate,
      final String? codec,
      final Map<String, dynamic>? metadata}) = _$VideoMetadataImpl;

  factory _VideoMetadata.fromJson(Map<String, dynamic> json) =
      _$VideoMetadataImpl.fromJson;

  @override

  /// Relative path only (e.g., "draft_videos/abc123.mp4")
  /// Never store absolute paths!
  String get relativePath;
  @override

  /// ⚠️ CRITICAL: Thumbnail relative path (JPG image)
  /// Generated immediately after pick/record to avoid performance issues
  /// Never load VideoPlayerController just to show thumbnail!
  /// Example: "draft_videos/thumbnails/abc123.jpg"
  String? get thumbnailRelativePath;
  @override

  /// Optional caption for the video
  String? get caption;
  @override

  /// Date when video was recorded (from metadata or file system)
  DateTime? get recordedDate;
  @override

  /// Video duration in seconds
  int? get durationInSeconds;
  @override

  /// File size in bytes
  int? get fileSizeBytes;
  @override

  /// MIME type (e.g., "video/mp4", "video/mov")
  String? get mimeType;
  @override

  /// Video width in pixels
  int? get width;
  @override

  /// Video height in pixels
  int? get height;
  @override

  /// Video bitrate (bits per second)
  int? get bitrate;
  @override

  /// Video codec (e.g., "h264", "hevc")
  String? get codec;
  @override

  /// Additional video metadata
  Map<String, dynamic>? get metadata;
  @override
  @JsonKey(ignore: true)
  _$$VideoMetadataImplCopyWith<_$VideoMetadataImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
