// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'audio_metadata.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

AudioMetadata _$AudioMetadataFromJson(Map<String, dynamic> json) {
  return _AudioMetadata.fromJson(json);
}

/// @nodoc
mixin _$AudioMetadata {
  String get url => throw _privateConstructorUsedError;
  int get durationInSeconds => throw _privateConstructorUsedError;
  AudioQuality get quality => throw _privateConstructorUsedError;
  DateTime get recordingDate => throw _privateConstructorUsedError;
  List<String>? get instrumentIds => throw _privateConstructorUsedError;
  Location? get recordingLocation => throw _privateConstructorUsedError;
  List<String>? get performerNames => throw _privateConstructorUsedError;
  String? get recordingEquipment => throw _privateConstructorUsedError;
  String? get recordedBy => throw _privateConstructorUsedError;
  int? get bitrate => throw _privateConstructorUsedError;
  String? get format => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $AudioMetadataCopyWith<AudioMetadata> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AudioMetadataCopyWith<$Res> {
  factory $AudioMetadataCopyWith(
          AudioMetadata value, $Res Function(AudioMetadata) then) =
      _$AudioMetadataCopyWithImpl<$Res, AudioMetadata>;
  @useResult
  $Res call(
      {String url,
      int durationInSeconds,
      AudioQuality quality,
      DateTime recordingDate,
      List<String>? instrumentIds,
      Location? recordingLocation,
      List<String>? performerNames,
      String? recordingEquipment,
      String? recordedBy,
      int? bitrate,
      String? format});

  $LocationCopyWith<$Res>? get recordingLocation;
}

/// @nodoc
class _$AudioMetadataCopyWithImpl<$Res, $Val extends AudioMetadata>
    implements $AudioMetadataCopyWith<$Res> {
  _$AudioMetadataCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? url = null,
    Object? durationInSeconds = null,
    Object? quality = null,
    Object? recordingDate = null,
    Object? instrumentIds = freezed,
    Object? recordingLocation = freezed,
    Object? performerNames = freezed,
    Object? recordingEquipment = freezed,
    Object? recordedBy = freezed,
    Object? bitrate = freezed,
    Object? format = freezed,
  }) {
    return _then(_value.copyWith(
      url: null == url
          ? _value.url
          : url // ignore: cast_nullable_to_non_nullable
              as String,
      durationInSeconds: null == durationInSeconds
          ? _value.durationInSeconds
          : durationInSeconds // ignore: cast_nullable_to_non_nullable
              as int,
      quality: null == quality
          ? _value.quality
          : quality // ignore: cast_nullable_to_non_nullable
              as AudioQuality,
      recordingDate: null == recordingDate
          ? _value.recordingDate
          : recordingDate // ignore: cast_nullable_to_non_nullable
              as DateTime,
      instrumentIds: freezed == instrumentIds
          ? _value.instrumentIds
          : instrumentIds // ignore: cast_nullable_to_non_nullable
              as List<String>?,
      recordingLocation: freezed == recordingLocation
          ? _value.recordingLocation
          : recordingLocation // ignore: cast_nullable_to_non_nullable
              as Location?,
      performerNames: freezed == performerNames
          ? _value.performerNames
          : performerNames // ignore: cast_nullable_to_non_nullable
              as List<String>?,
      recordingEquipment: freezed == recordingEquipment
          ? _value.recordingEquipment
          : recordingEquipment // ignore: cast_nullable_to_non_nullable
              as String?,
      recordedBy: freezed == recordedBy
          ? _value.recordedBy
          : recordedBy // ignore: cast_nullable_to_non_nullable
              as String?,
      bitrate: freezed == bitrate
          ? _value.bitrate
          : bitrate // ignore: cast_nullable_to_non_nullable
              as int?,
      format: freezed == format
          ? _value.format
          : format // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $LocationCopyWith<$Res>? get recordingLocation {
    if (_value.recordingLocation == null) {
      return null;
    }

    return $LocationCopyWith<$Res>(_value.recordingLocation!, (value) {
      return _then(_value.copyWith(recordingLocation: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$AudioMetadataImplCopyWith<$Res>
    implements $AudioMetadataCopyWith<$Res> {
  factory _$$AudioMetadataImplCopyWith(
          _$AudioMetadataImpl value, $Res Function(_$AudioMetadataImpl) then) =
      __$$AudioMetadataImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String url,
      int durationInSeconds,
      AudioQuality quality,
      DateTime recordingDate,
      List<String>? instrumentIds,
      Location? recordingLocation,
      List<String>? performerNames,
      String? recordingEquipment,
      String? recordedBy,
      int? bitrate,
      String? format});

  @override
  $LocationCopyWith<$Res>? get recordingLocation;
}

/// @nodoc
class __$$AudioMetadataImplCopyWithImpl<$Res>
    extends _$AudioMetadataCopyWithImpl<$Res, _$AudioMetadataImpl>
    implements _$$AudioMetadataImplCopyWith<$Res> {
  __$$AudioMetadataImplCopyWithImpl(
      _$AudioMetadataImpl _value, $Res Function(_$AudioMetadataImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? url = null,
    Object? durationInSeconds = null,
    Object? quality = null,
    Object? recordingDate = null,
    Object? instrumentIds = freezed,
    Object? recordingLocation = freezed,
    Object? performerNames = freezed,
    Object? recordingEquipment = freezed,
    Object? recordedBy = freezed,
    Object? bitrate = freezed,
    Object? format = freezed,
  }) {
    return _then(_$AudioMetadataImpl(
      url: null == url
          ? _value.url
          : url // ignore: cast_nullable_to_non_nullable
              as String,
      durationInSeconds: null == durationInSeconds
          ? _value.durationInSeconds
          : durationInSeconds // ignore: cast_nullable_to_non_nullable
              as int,
      quality: null == quality
          ? _value.quality
          : quality // ignore: cast_nullable_to_non_nullable
              as AudioQuality,
      recordingDate: null == recordingDate
          ? _value.recordingDate
          : recordingDate // ignore: cast_nullable_to_non_nullable
              as DateTime,
      instrumentIds: freezed == instrumentIds
          ? _value._instrumentIds
          : instrumentIds // ignore: cast_nullable_to_non_nullable
              as List<String>?,
      recordingLocation: freezed == recordingLocation
          ? _value.recordingLocation
          : recordingLocation // ignore: cast_nullable_to_non_nullable
              as Location?,
      performerNames: freezed == performerNames
          ? _value._performerNames
          : performerNames // ignore: cast_nullable_to_non_nullable
              as List<String>?,
      recordingEquipment: freezed == recordingEquipment
          ? _value.recordingEquipment
          : recordingEquipment // ignore: cast_nullable_to_non_nullable
              as String?,
      recordedBy: freezed == recordedBy
          ? _value.recordedBy
          : recordedBy // ignore: cast_nullable_to_non_nullable
              as String?,
      bitrate: freezed == bitrate
          ? _value.bitrate
          : bitrate // ignore: cast_nullable_to_non_nullable
              as int?,
      format: freezed == format
          ? _value.format
          : format // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$AudioMetadataImpl implements _AudioMetadata {
  const _$AudioMetadataImpl(
      {required this.url,
      required this.durationInSeconds,
      required this.quality,
      required this.recordingDate,
      final List<String>? instrumentIds,
      this.recordingLocation,
      final List<String>? performerNames,
      this.recordingEquipment,
      this.recordedBy,
      this.bitrate,
      this.format})
      : _instrumentIds = instrumentIds,
        _performerNames = performerNames;

  factory _$AudioMetadataImpl.fromJson(Map<String, dynamic> json) =>
      _$$AudioMetadataImplFromJson(json);

  @override
  final String url;
  @override
  final int durationInSeconds;
  @override
  final AudioQuality quality;
  @override
  final DateTime recordingDate;
  final List<String>? _instrumentIds;
  @override
  List<String>? get instrumentIds {
    final value = _instrumentIds;
    if (value == null) return null;
    if (_instrumentIds is EqualUnmodifiableListView) return _instrumentIds;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final Location? recordingLocation;
  final List<String>? _performerNames;
  @override
  List<String>? get performerNames {
    final value = _performerNames;
    if (value == null) return null;
    if (_performerNames is EqualUnmodifiableListView) return _performerNames;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final String? recordingEquipment;
  @override
  final String? recordedBy;
  @override
  final int? bitrate;
  @override
  final String? format;

  @override
  String toString() {
    return 'AudioMetadata(url: $url, durationInSeconds: $durationInSeconds, quality: $quality, recordingDate: $recordingDate, instrumentIds: $instrumentIds, recordingLocation: $recordingLocation, performerNames: $performerNames, recordingEquipment: $recordingEquipment, recordedBy: $recordedBy, bitrate: $bitrate, format: $format)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AudioMetadataImpl &&
            (identical(other.url, url) || other.url == url) &&
            (identical(other.durationInSeconds, durationInSeconds) ||
                other.durationInSeconds == durationInSeconds) &&
            (identical(other.quality, quality) || other.quality == quality) &&
            (identical(other.recordingDate, recordingDate) ||
                other.recordingDate == recordingDate) &&
            const DeepCollectionEquality()
                .equals(other._instrumentIds, _instrumentIds) &&
            (identical(other.recordingLocation, recordingLocation) ||
                other.recordingLocation == recordingLocation) &&
            const DeepCollectionEquality()
                .equals(other._performerNames, _performerNames) &&
            (identical(other.recordingEquipment, recordingEquipment) ||
                other.recordingEquipment == recordingEquipment) &&
            (identical(other.recordedBy, recordedBy) ||
                other.recordedBy == recordedBy) &&
            (identical(other.bitrate, bitrate) || other.bitrate == bitrate) &&
            (identical(other.format, format) || other.format == format));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      url,
      durationInSeconds,
      quality,
      recordingDate,
      const DeepCollectionEquality().hash(_instrumentIds),
      recordingLocation,
      const DeepCollectionEquality().hash(_performerNames),
      recordingEquipment,
      recordedBy,
      bitrate,
      format);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$AudioMetadataImplCopyWith<_$AudioMetadataImpl> get copyWith =>
      __$$AudioMetadataImplCopyWithImpl<_$AudioMetadataImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AudioMetadataImplToJson(
      this,
    );
  }
}

abstract class _AudioMetadata implements AudioMetadata {
  const factory _AudioMetadata(
      {required final String url,
      required final int durationInSeconds,
      required final AudioQuality quality,
      required final DateTime recordingDate,
      final List<String>? instrumentIds,
      final Location? recordingLocation,
      final List<String>? performerNames,
      final String? recordingEquipment,
      final String? recordedBy,
      final int? bitrate,
      final String? format}) = _$AudioMetadataImpl;

  factory _AudioMetadata.fromJson(Map<String, dynamic> json) =
      _$AudioMetadataImpl.fromJson;

  @override
  String get url;
  @override
  int get durationInSeconds;
  @override
  AudioQuality get quality;
  @override
  DateTime get recordingDate;
  @override
  List<String>? get instrumentIds;
  @override
  Location? get recordingLocation;
  @override
  List<String>? get performerNames;
  @override
  String? get recordingEquipment;
  @override
  String? get recordedBy;
  @override
  int? get bitrate;
  @override
  String? get format;
  @override
  @JsonKey(ignore: true)
  _$$AudioMetadataImplCopyWith<_$AudioMetadataImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
