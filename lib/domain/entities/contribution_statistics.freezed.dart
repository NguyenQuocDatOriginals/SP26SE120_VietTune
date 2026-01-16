// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'contribution_statistics.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

ContributionStatistics _$ContributionStatisticsFromJson(
    Map<String, dynamic> json) {
  return _ContributionStatistics.fromJson(json);
}

/// @nodoc
mixin _$ContributionStatistics {
  int get total => throw _privateConstructorUsedError;
  int get pending => throw _privateConstructorUsedError;
  int get verified => throw _privateConstructorUsedError;
  int get rejected => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $ContributionStatisticsCopyWith<ContributionStatistics> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ContributionStatisticsCopyWith<$Res> {
  factory $ContributionStatisticsCopyWith(ContributionStatistics value,
          $Res Function(ContributionStatistics) then) =
      _$ContributionStatisticsCopyWithImpl<$Res, ContributionStatistics>;
  @useResult
  $Res call({int total, int pending, int verified, int rejected});
}

/// @nodoc
class _$ContributionStatisticsCopyWithImpl<$Res,
        $Val extends ContributionStatistics>
    implements $ContributionStatisticsCopyWith<$Res> {
  _$ContributionStatisticsCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? total = null,
    Object? pending = null,
    Object? verified = null,
    Object? rejected = null,
  }) {
    return _then(_value.copyWith(
      total: null == total
          ? _value.total
          : total // ignore: cast_nullable_to_non_nullable
              as int,
      pending: null == pending
          ? _value.pending
          : pending // ignore: cast_nullable_to_non_nullable
              as int,
      verified: null == verified
          ? _value.verified
          : verified // ignore: cast_nullable_to_non_nullable
              as int,
      rejected: null == rejected
          ? _value.rejected
          : rejected // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ContributionStatisticsImplCopyWith<$Res>
    implements $ContributionStatisticsCopyWith<$Res> {
  factory _$$ContributionStatisticsImplCopyWith(
          _$ContributionStatisticsImpl value,
          $Res Function(_$ContributionStatisticsImpl) then) =
      __$$ContributionStatisticsImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int total, int pending, int verified, int rejected});
}

/// @nodoc
class __$$ContributionStatisticsImplCopyWithImpl<$Res>
    extends _$ContributionStatisticsCopyWithImpl<$Res,
        _$ContributionStatisticsImpl>
    implements _$$ContributionStatisticsImplCopyWith<$Res> {
  __$$ContributionStatisticsImplCopyWithImpl(
      _$ContributionStatisticsImpl _value,
      $Res Function(_$ContributionStatisticsImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? total = null,
    Object? pending = null,
    Object? verified = null,
    Object? rejected = null,
  }) {
    return _then(_$ContributionStatisticsImpl(
      total: null == total
          ? _value.total
          : total // ignore: cast_nullable_to_non_nullable
              as int,
      pending: null == pending
          ? _value.pending
          : pending // ignore: cast_nullable_to_non_nullable
              as int,
      verified: null == verified
          ? _value.verified
          : verified // ignore: cast_nullable_to_non_nullable
              as int,
      rejected: null == rejected
          ? _value.rejected
          : rejected // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ContributionStatisticsImpl implements _ContributionStatistics {
  const _$ContributionStatisticsImpl(
      {required this.total,
      required this.pending,
      required this.verified,
      required this.rejected});

  factory _$ContributionStatisticsImpl.fromJson(Map<String, dynamic> json) =>
      _$$ContributionStatisticsImplFromJson(json);

  @override
  final int total;
  @override
  final int pending;
  @override
  final int verified;
  @override
  final int rejected;

  @override
  String toString() {
    return 'ContributionStatistics(total: $total, pending: $pending, verified: $verified, rejected: $rejected)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ContributionStatisticsImpl &&
            (identical(other.total, total) || other.total == total) &&
            (identical(other.pending, pending) || other.pending == pending) &&
            (identical(other.verified, verified) ||
                other.verified == verified) &&
            (identical(other.rejected, rejected) ||
                other.rejected == rejected));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode =>
      Object.hash(runtimeType, total, pending, verified, rejected);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$ContributionStatisticsImplCopyWith<_$ContributionStatisticsImpl>
      get copyWith => __$$ContributionStatisticsImplCopyWithImpl<
          _$ContributionStatisticsImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ContributionStatisticsImplToJson(
      this,
    );
  }
}

abstract class _ContributionStatistics implements ContributionStatistics {
  const factory _ContributionStatistics(
      {required final int total,
      required final int pending,
      required final int verified,
      required final int rejected}) = _$ContributionStatisticsImpl;

  factory _ContributionStatistics.fromJson(Map<String, dynamic> json) =
      _$ContributionStatisticsImpl.fromJson;

  @override
  int get total;
  @override
  int get pending;
  @override
  int get verified;
  @override
  int get rejected;
  @override
  @JsonKey(ignore: true)
  _$$ContributionStatisticsImplCopyWith<_$ContributionStatisticsImpl>
      get copyWith => throw _privateConstructorUsedError;
}
