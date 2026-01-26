// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'image_metadata.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

ImageMetadata _$ImageMetadataFromJson(Map<String, dynamic> json) {
  return _ImageMetadata.fromJson(json);
}

/// @nodoc
mixin _$ImageMetadata {
  /// Relative path only (e.g., "draft_images/abc123.jpg")
  /// Never store absolute paths!
  String get relativePath => throw _privateConstructorUsedError;

  /// Optional caption for the image
  String? get caption => throw _privateConstructorUsedError;

  /// Date when image was captured (from Exif data)
  DateTime? get capturedDate => throw _privateConstructorUsedError;

  /// File size in bytes
  int? get fileSizeBytes => throw _privateConstructorUsedError;

  /// MIME type (e.g., "image/jpeg")
  String? get mimeType => throw _privateConstructorUsedError;

  /// Whether this is the main/primary image
  bool get isMainImage => throw _privateConstructorUsedError;

  /// Preserved Exif metadata
  Map<String, dynamic>? get exifData => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $ImageMetadataCopyWith<ImageMetadata> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ImageMetadataCopyWith<$Res> {
  factory $ImageMetadataCopyWith(
          ImageMetadata value, $Res Function(ImageMetadata) then) =
      _$ImageMetadataCopyWithImpl<$Res, ImageMetadata>;
  @useResult
  $Res call(
      {String relativePath,
      String? caption,
      DateTime? capturedDate,
      int? fileSizeBytes,
      String? mimeType,
      bool isMainImage,
      Map<String, dynamic>? exifData});
}

/// @nodoc
class _$ImageMetadataCopyWithImpl<$Res, $Val extends ImageMetadata>
    implements $ImageMetadataCopyWith<$Res> {
  _$ImageMetadataCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? relativePath = null,
    Object? caption = freezed,
    Object? capturedDate = freezed,
    Object? fileSizeBytes = freezed,
    Object? mimeType = freezed,
    Object? isMainImage = null,
    Object? exifData = freezed,
  }) {
    return _then(_value.copyWith(
      relativePath: null == relativePath
          ? _value.relativePath
          : relativePath // ignore: cast_nullable_to_non_nullable
              as String,
      caption: freezed == caption
          ? _value.caption
          : caption // ignore: cast_nullable_to_non_nullable
              as String?,
      capturedDate: freezed == capturedDate
          ? _value.capturedDate
          : capturedDate // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      fileSizeBytes: freezed == fileSizeBytes
          ? _value.fileSizeBytes
          : fileSizeBytes // ignore: cast_nullable_to_non_nullable
              as int?,
      mimeType: freezed == mimeType
          ? _value.mimeType
          : mimeType // ignore: cast_nullable_to_non_nullable
              as String?,
      isMainImage: null == isMainImage
          ? _value.isMainImage
          : isMainImage // ignore: cast_nullable_to_non_nullable
              as bool,
      exifData: freezed == exifData
          ? _value.exifData
          : exifData // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ImageMetadataImplCopyWith<$Res>
    implements $ImageMetadataCopyWith<$Res> {
  factory _$$ImageMetadataImplCopyWith(
          _$ImageMetadataImpl value, $Res Function(_$ImageMetadataImpl) then) =
      __$$ImageMetadataImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String relativePath,
      String? caption,
      DateTime? capturedDate,
      int? fileSizeBytes,
      String? mimeType,
      bool isMainImage,
      Map<String, dynamic>? exifData});
}

/// @nodoc
class __$$ImageMetadataImplCopyWithImpl<$Res>
    extends _$ImageMetadataCopyWithImpl<$Res, _$ImageMetadataImpl>
    implements _$$ImageMetadataImplCopyWith<$Res> {
  __$$ImageMetadataImplCopyWithImpl(
      _$ImageMetadataImpl _value, $Res Function(_$ImageMetadataImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? relativePath = null,
    Object? caption = freezed,
    Object? capturedDate = freezed,
    Object? fileSizeBytes = freezed,
    Object? mimeType = freezed,
    Object? isMainImage = null,
    Object? exifData = freezed,
  }) {
    return _then(_$ImageMetadataImpl(
      relativePath: null == relativePath
          ? _value.relativePath
          : relativePath // ignore: cast_nullable_to_non_nullable
              as String,
      caption: freezed == caption
          ? _value.caption
          : caption // ignore: cast_nullable_to_non_nullable
              as String?,
      capturedDate: freezed == capturedDate
          ? _value.capturedDate
          : capturedDate // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      fileSizeBytes: freezed == fileSizeBytes
          ? _value.fileSizeBytes
          : fileSizeBytes // ignore: cast_nullable_to_non_nullable
              as int?,
      mimeType: freezed == mimeType
          ? _value.mimeType
          : mimeType // ignore: cast_nullable_to_non_nullable
              as String?,
      isMainImage: null == isMainImage
          ? _value.isMainImage
          : isMainImage // ignore: cast_nullable_to_non_nullable
              as bool,
      exifData: freezed == exifData
          ? _value._exifData
          : exifData // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ImageMetadataImpl implements _ImageMetadata {
  const _$ImageMetadataImpl(
      {required this.relativePath,
      this.caption,
      this.capturedDate,
      this.fileSizeBytes,
      this.mimeType,
      this.isMainImage = false,
      final Map<String, dynamic>? exifData})
      : _exifData = exifData;

  factory _$ImageMetadataImpl.fromJson(Map<String, dynamic> json) =>
      _$$ImageMetadataImplFromJson(json);

  /// Relative path only (e.g., "draft_images/abc123.jpg")
  /// Never store absolute paths!
  @override
  final String relativePath;

  /// Optional caption for the image
  @override
  final String? caption;

  /// Date when image was captured (from Exif data)
  @override
  final DateTime? capturedDate;

  /// File size in bytes
  @override
  final int? fileSizeBytes;

  /// MIME type (e.g., "image/jpeg")
  @override
  final String? mimeType;

  /// Whether this is the main/primary image
  @override
  @JsonKey()
  final bool isMainImage;

  /// Preserved Exif metadata
  final Map<String, dynamic>? _exifData;

  /// Preserved Exif metadata
  @override
  Map<String, dynamic>? get exifData {
    final value = _exifData;
    if (value == null) return null;
    if (_exifData is EqualUnmodifiableMapView) return _exifData;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  String toString() {
    return 'ImageMetadata(relativePath: $relativePath, caption: $caption, capturedDate: $capturedDate, fileSizeBytes: $fileSizeBytes, mimeType: $mimeType, isMainImage: $isMainImage, exifData: $exifData)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ImageMetadataImpl &&
            (identical(other.relativePath, relativePath) ||
                other.relativePath == relativePath) &&
            (identical(other.caption, caption) || other.caption == caption) &&
            (identical(other.capturedDate, capturedDate) ||
                other.capturedDate == capturedDate) &&
            (identical(other.fileSizeBytes, fileSizeBytes) ||
                other.fileSizeBytes == fileSizeBytes) &&
            (identical(other.mimeType, mimeType) ||
                other.mimeType == mimeType) &&
            (identical(other.isMainImage, isMainImage) ||
                other.isMainImage == isMainImage) &&
            const DeepCollectionEquality().equals(other._exifData, _exifData));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      relativePath,
      caption,
      capturedDate,
      fileSizeBytes,
      mimeType,
      isMainImage,
      const DeepCollectionEquality().hash(_exifData));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$ImageMetadataImplCopyWith<_$ImageMetadataImpl> get copyWith =>
      __$$ImageMetadataImplCopyWithImpl<_$ImageMetadataImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ImageMetadataImplToJson(
      this,
    );
  }
}

abstract class _ImageMetadata implements ImageMetadata {
  const factory _ImageMetadata(
      {required final String relativePath,
      final String? caption,
      final DateTime? capturedDate,
      final int? fileSizeBytes,
      final String? mimeType,
      final bool isMainImage,
      final Map<String, dynamic>? exifData}) = _$ImageMetadataImpl;

  factory _ImageMetadata.fromJson(Map<String, dynamic> json) =
      _$ImageMetadataImpl.fromJson;

  @override

  /// Relative path only (e.g., "draft_images/abc123.jpg")
  /// Never store absolute paths!
  String get relativePath;
  @override

  /// Optional caption for the image
  String? get caption;
  @override

  /// Date when image was captured (from Exif data)
  DateTime? get capturedDate;
  @override

  /// File size in bytes
  int? get fileSizeBytes;
  @override

  /// MIME type (e.g., "image/jpeg")
  String? get mimeType;
  @override

  /// Whether this is the main/primary image
  bool get isMainImage;
  @override

  /// Preserved Exif metadata
  Map<String, dynamic>? get exifData;
  @override
  @JsonKey(ignore: true)
  _$$ImageMetadataImplCopyWith<_$ImageMetadataImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
