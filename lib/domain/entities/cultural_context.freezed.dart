// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'cultural_context.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

CulturalContext _$CulturalContextFromJson(Map<String, dynamic> json) {
  return _CulturalContext.fromJson(json);
}

/// @nodoc
mixin _$CulturalContext {
  ContextType get type => throw _privateConstructorUsedError;
  String? get season => throw _privateConstructorUsedError;
  String? get occasion => throw _privateConstructorUsedError;
  String? get significance => throw _privateConstructorUsedError;
  String? get performanceDetails => throw _privateConstructorUsedError;
  String? get historicalBackground => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $CulturalContextCopyWith<CulturalContext> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CulturalContextCopyWith<$Res> {
  factory $CulturalContextCopyWith(
          CulturalContext value, $Res Function(CulturalContext) then) =
      _$CulturalContextCopyWithImpl<$Res, CulturalContext>;
  @useResult
  $Res call(
      {ContextType type,
      String? season,
      String? occasion,
      String? significance,
      String? performanceDetails,
      String? historicalBackground});
}

/// @nodoc
class _$CulturalContextCopyWithImpl<$Res, $Val extends CulturalContext>
    implements $CulturalContextCopyWith<$Res> {
  _$CulturalContextCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? type = null,
    Object? season = freezed,
    Object? occasion = freezed,
    Object? significance = freezed,
    Object? performanceDetails = freezed,
    Object? historicalBackground = freezed,
  }) {
    return _then(_value.copyWith(
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as ContextType,
      season: freezed == season
          ? _value.season
          : season // ignore: cast_nullable_to_non_nullable
              as String?,
      occasion: freezed == occasion
          ? _value.occasion
          : occasion // ignore: cast_nullable_to_non_nullable
              as String?,
      significance: freezed == significance
          ? _value.significance
          : significance // ignore: cast_nullable_to_non_nullable
              as String?,
      performanceDetails: freezed == performanceDetails
          ? _value.performanceDetails
          : performanceDetails // ignore: cast_nullable_to_non_nullable
              as String?,
      historicalBackground: freezed == historicalBackground
          ? _value.historicalBackground
          : historicalBackground // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$CulturalContextImplCopyWith<$Res>
    implements $CulturalContextCopyWith<$Res> {
  factory _$$CulturalContextImplCopyWith(_$CulturalContextImpl value,
          $Res Function(_$CulturalContextImpl) then) =
      __$$CulturalContextImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {ContextType type,
      String? season,
      String? occasion,
      String? significance,
      String? performanceDetails,
      String? historicalBackground});
}

/// @nodoc
class __$$CulturalContextImplCopyWithImpl<$Res>
    extends _$CulturalContextCopyWithImpl<$Res, _$CulturalContextImpl>
    implements _$$CulturalContextImplCopyWith<$Res> {
  __$$CulturalContextImplCopyWithImpl(
      _$CulturalContextImpl _value, $Res Function(_$CulturalContextImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? type = null,
    Object? season = freezed,
    Object? occasion = freezed,
    Object? significance = freezed,
    Object? performanceDetails = freezed,
    Object? historicalBackground = freezed,
  }) {
    return _then(_$CulturalContextImpl(
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as ContextType,
      season: freezed == season
          ? _value.season
          : season // ignore: cast_nullable_to_non_nullable
              as String?,
      occasion: freezed == occasion
          ? _value.occasion
          : occasion // ignore: cast_nullable_to_non_nullable
              as String?,
      significance: freezed == significance
          ? _value.significance
          : significance // ignore: cast_nullable_to_non_nullable
              as String?,
      performanceDetails: freezed == performanceDetails
          ? _value.performanceDetails
          : performanceDetails // ignore: cast_nullable_to_non_nullable
              as String?,
      historicalBackground: freezed == historicalBackground
          ? _value.historicalBackground
          : historicalBackground // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$CulturalContextImpl implements _CulturalContext {
  const _$CulturalContextImpl(
      {required this.type,
      this.season,
      this.occasion,
      this.significance,
      this.performanceDetails,
      this.historicalBackground});

  factory _$CulturalContextImpl.fromJson(Map<String, dynamic> json) =>
      _$$CulturalContextImplFromJson(json);

  @override
  final ContextType type;
  @override
  final String? season;
  @override
  final String? occasion;
  @override
  final String? significance;
  @override
  final String? performanceDetails;
  @override
  final String? historicalBackground;

  @override
  String toString() {
    return 'CulturalContext(type: $type, season: $season, occasion: $occasion, significance: $significance, performanceDetails: $performanceDetails, historicalBackground: $historicalBackground)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CulturalContextImpl &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.season, season) || other.season == season) &&
            (identical(other.occasion, occasion) ||
                other.occasion == occasion) &&
            (identical(other.significance, significance) ||
                other.significance == significance) &&
            (identical(other.performanceDetails, performanceDetails) ||
                other.performanceDetails == performanceDetails) &&
            (identical(other.historicalBackground, historicalBackground) ||
                other.historicalBackground == historicalBackground));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, type, season, occasion,
      significance, performanceDetails, historicalBackground);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$CulturalContextImplCopyWith<_$CulturalContextImpl> get copyWith =>
      __$$CulturalContextImplCopyWithImpl<_$CulturalContextImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CulturalContextImplToJson(
      this,
    );
  }
}

abstract class _CulturalContext implements CulturalContext {
  const factory _CulturalContext(
      {required final ContextType type,
      final String? season,
      final String? occasion,
      final String? significance,
      final String? performanceDetails,
      final String? historicalBackground}) = _$CulturalContextImpl;

  factory _CulturalContext.fromJson(Map<String, dynamic> json) =
      _$CulturalContextImpl.fromJson;

  @override
  ContextType get type;
  @override
  String? get season;
  @override
  String? get occasion;
  @override
  String? get significance;
  @override
  String? get performanceDetails;
  @override
  String? get historicalBackground;
  @override
  @JsonKey(ignore: true)
  _$$CulturalContextImplCopyWith<_$CulturalContextImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
