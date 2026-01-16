// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'instrument.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Instrument _$InstrumentFromJson(Map<String, dynamic> json) {
  return _Instrument.fromJson(json);
}

/// @nodoc
mixin _$Instrument {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  InstrumentType get type => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  List<String>? get materials => throw _privateConstructorUsedError;
  String? get playingTechnique => throw _privateConstructorUsedError;
  String? get imageUrl => throw _privateConstructorUsedError;
  String? get audioSampleUrl => throw _privateConstructorUsedError;
  List<String>? get associatedEthnicGroups =>
      throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $InstrumentCopyWith<Instrument> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $InstrumentCopyWith<$Res> {
  factory $InstrumentCopyWith(
          Instrument value, $Res Function(Instrument) then) =
      _$InstrumentCopyWithImpl<$Res, Instrument>;
  @useResult
  $Res call(
      {String id,
      String name,
      InstrumentType type,
      String description,
      List<String>? materials,
      String? playingTechnique,
      String? imageUrl,
      String? audioSampleUrl,
      List<String>? associatedEthnicGroups});
}

/// @nodoc
class _$InstrumentCopyWithImpl<$Res, $Val extends Instrument>
    implements $InstrumentCopyWith<$Res> {
  _$InstrumentCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? type = null,
    Object? description = null,
    Object? materials = freezed,
    Object? playingTechnique = freezed,
    Object? imageUrl = freezed,
    Object? audioSampleUrl = freezed,
    Object? associatedEthnicGroups = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as InstrumentType,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      materials: freezed == materials
          ? _value.materials
          : materials // ignore: cast_nullable_to_non_nullable
              as List<String>?,
      playingTechnique: freezed == playingTechnique
          ? _value.playingTechnique
          : playingTechnique // ignore: cast_nullable_to_non_nullable
              as String?,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      audioSampleUrl: freezed == audioSampleUrl
          ? _value.audioSampleUrl
          : audioSampleUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      associatedEthnicGroups: freezed == associatedEthnicGroups
          ? _value.associatedEthnicGroups
          : associatedEthnicGroups // ignore: cast_nullable_to_non_nullable
              as List<String>?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$InstrumentImplCopyWith<$Res>
    implements $InstrumentCopyWith<$Res> {
  factory _$$InstrumentImplCopyWith(
          _$InstrumentImpl value, $Res Function(_$InstrumentImpl) then) =
      __$$InstrumentImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      InstrumentType type,
      String description,
      List<String>? materials,
      String? playingTechnique,
      String? imageUrl,
      String? audioSampleUrl,
      List<String>? associatedEthnicGroups});
}

/// @nodoc
class __$$InstrumentImplCopyWithImpl<$Res>
    extends _$InstrumentCopyWithImpl<$Res, _$InstrumentImpl>
    implements _$$InstrumentImplCopyWith<$Res> {
  __$$InstrumentImplCopyWithImpl(
      _$InstrumentImpl _value, $Res Function(_$InstrumentImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? type = null,
    Object? description = null,
    Object? materials = freezed,
    Object? playingTechnique = freezed,
    Object? imageUrl = freezed,
    Object? audioSampleUrl = freezed,
    Object? associatedEthnicGroups = freezed,
  }) {
    return _then(_$InstrumentImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as InstrumentType,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      materials: freezed == materials
          ? _value._materials
          : materials // ignore: cast_nullable_to_non_nullable
              as List<String>?,
      playingTechnique: freezed == playingTechnique
          ? _value.playingTechnique
          : playingTechnique // ignore: cast_nullable_to_non_nullable
              as String?,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      audioSampleUrl: freezed == audioSampleUrl
          ? _value.audioSampleUrl
          : audioSampleUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      associatedEthnicGroups: freezed == associatedEthnicGroups
          ? _value._associatedEthnicGroups
          : associatedEthnicGroups // ignore: cast_nullable_to_non_nullable
              as List<String>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$InstrumentImpl implements _Instrument {
  const _$InstrumentImpl(
      {required this.id,
      required this.name,
      required this.type,
      required this.description,
      final List<String>? materials,
      this.playingTechnique,
      this.imageUrl,
      this.audioSampleUrl,
      final List<String>? associatedEthnicGroups})
      : _materials = materials,
        _associatedEthnicGroups = associatedEthnicGroups;

  factory _$InstrumentImpl.fromJson(Map<String, dynamic> json) =>
      _$$InstrumentImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final InstrumentType type;
  @override
  final String description;
  final List<String>? _materials;
  @override
  List<String>? get materials {
    final value = _materials;
    if (value == null) return null;
    if (_materials is EqualUnmodifiableListView) return _materials;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final String? playingTechnique;
  @override
  final String? imageUrl;
  @override
  final String? audioSampleUrl;
  final List<String>? _associatedEthnicGroups;
  @override
  List<String>? get associatedEthnicGroups {
    final value = _associatedEthnicGroups;
    if (value == null) return null;
    if (_associatedEthnicGroups is EqualUnmodifiableListView)
      return _associatedEthnicGroups;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  String toString() {
    return 'Instrument(id: $id, name: $name, type: $type, description: $description, materials: $materials, playingTechnique: $playingTechnique, imageUrl: $imageUrl, audioSampleUrl: $audioSampleUrl, associatedEthnicGroups: $associatedEthnicGroups)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$InstrumentImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.description, description) ||
                other.description == description) &&
            const DeepCollectionEquality()
                .equals(other._materials, _materials) &&
            (identical(other.playingTechnique, playingTechnique) ||
                other.playingTechnique == playingTechnique) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.audioSampleUrl, audioSampleUrl) ||
                other.audioSampleUrl == audioSampleUrl) &&
            const DeepCollectionEquality().equals(
                other._associatedEthnicGroups, _associatedEthnicGroups));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      type,
      description,
      const DeepCollectionEquality().hash(_materials),
      playingTechnique,
      imageUrl,
      audioSampleUrl,
      const DeepCollectionEquality().hash(_associatedEthnicGroups));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$InstrumentImplCopyWith<_$InstrumentImpl> get copyWith =>
      __$$InstrumentImplCopyWithImpl<_$InstrumentImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$InstrumentImplToJson(
      this,
    );
  }
}

abstract class _Instrument implements Instrument {
  const factory _Instrument(
      {required final String id,
      required final String name,
      required final InstrumentType type,
      required final String description,
      final List<String>? materials,
      final String? playingTechnique,
      final String? imageUrl,
      final String? audioSampleUrl,
      final List<String>? associatedEthnicGroups}) = _$InstrumentImpl;

  factory _Instrument.fromJson(Map<String, dynamic> json) =
      _$InstrumentImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  InstrumentType get type;
  @override
  String get description;
  @override
  List<String>? get materials;
  @override
  String? get playingTechnique;
  @override
  String? get imageUrl;
  @override
  String? get audioSampleUrl;
  @override
  List<String>? get associatedEthnicGroups;
  @override
  @JsonKey(ignore: true)
  _$$InstrumentImplCopyWith<_$InstrumentImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
