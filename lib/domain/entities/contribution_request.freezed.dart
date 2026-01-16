// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'contribution_request.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

ContributionRequest _$ContributionRequestFromJson(Map<String, dynamic> json) {
  return _ContributionRequest.fromJson(json);
}

/// @nodoc
mixin _$ContributionRequest {
  String get id => throw _privateConstructorUsedError;
  String get userId => throw _privateConstructorUsedError;
  ContributionType get type => throw _privateConstructorUsedError;
  VerificationStatus get status => throw _privateConstructorUsedError;
  Song? get songData => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  String? get reviewComments => throw _privateConstructorUsedError;
  DateTime? get submittedAt => throw _privateConstructorUsedError;
  DateTime? get reviewedAt => throw _privateConstructorUsedError;
  String? get reviewedBy => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $ContributionRequestCopyWith<ContributionRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ContributionRequestCopyWith<$Res> {
  factory $ContributionRequestCopyWith(
          ContributionRequest value, $Res Function(ContributionRequest) then) =
      _$ContributionRequestCopyWithImpl<$Res, ContributionRequest>;
  @useResult
  $Res call(
      {String id,
      String userId,
      ContributionType type,
      VerificationStatus status,
      Song? songData,
      String? notes,
      String? reviewComments,
      DateTime? submittedAt,
      DateTime? reviewedAt,
      String? reviewedBy});

  $SongCopyWith<$Res>? get songData;
}

/// @nodoc
class _$ContributionRequestCopyWithImpl<$Res, $Val extends ContributionRequest>
    implements $ContributionRequestCopyWith<$Res> {
  _$ContributionRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? type = null,
    Object? status = null,
    Object? songData = freezed,
    Object? notes = freezed,
    Object? reviewComments = freezed,
    Object? submittedAt = freezed,
    Object? reviewedAt = freezed,
    Object? reviewedBy = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as ContributionType,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as VerificationStatus,
      songData: freezed == songData
          ? _value.songData
          : songData // ignore: cast_nullable_to_non_nullable
              as Song?,
      notes: freezed == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      reviewComments: freezed == reviewComments
          ? _value.reviewComments
          : reviewComments // ignore: cast_nullable_to_non_nullable
              as String?,
      submittedAt: freezed == submittedAt
          ? _value.submittedAt
          : submittedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      reviewedAt: freezed == reviewedAt
          ? _value.reviewedAt
          : reviewedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      reviewedBy: freezed == reviewedBy
          ? _value.reviewedBy
          : reviewedBy // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $SongCopyWith<$Res>? get songData {
    if (_value.songData == null) {
      return null;
    }

    return $SongCopyWith<$Res>(_value.songData!, (value) {
      return _then(_value.copyWith(songData: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$ContributionRequestImplCopyWith<$Res>
    implements $ContributionRequestCopyWith<$Res> {
  factory _$$ContributionRequestImplCopyWith(_$ContributionRequestImpl value,
          $Res Function(_$ContributionRequestImpl) then) =
      __$$ContributionRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String userId,
      ContributionType type,
      VerificationStatus status,
      Song? songData,
      String? notes,
      String? reviewComments,
      DateTime? submittedAt,
      DateTime? reviewedAt,
      String? reviewedBy});

  @override
  $SongCopyWith<$Res>? get songData;
}

/// @nodoc
class __$$ContributionRequestImplCopyWithImpl<$Res>
    extends _$ContributionRequestCopyWithImpl<$Res, _$ContributionRequestImpl>
    implements _$$ContributionRequestImplCopyWith<$Res> {
  __$$ContributionRequestImplCopyWithImpl(_$ContributionRequestImpl _value,
      $Res Function(_$ContributionRequestImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? type = null,
    Object? status = null,
    Object? songData = freezed,
    Object? notes = freezed,
    Object? reviewComments = freezed,
    Object? submittedAt = freezed,
    Object? reviewedAt = freezed,
    Object? reviewedBy = freezed,
  }) {
    return _then(_$ContributionRequestImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as ContributionType,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as VerificationStatus,
      songData: freezed == songData
          ? _value.songData
          : songData // ignore: cast_nullable_to_non_nullable
              as Song?,
      notes: freezed == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      reviewComments: freezed == reviewComments
          ? _value.reviewComments
          : reviewComments // ignore: cast_nullable_to_non_nullable
              as String?,
      submittedAt: freezed == submittedAt
          ? _value.submittedAt
          : submittedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      reviewedAt: freezed == reviewedAt
          ? _value.reviewedAt
          : reviewedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      reviewedBy: freezed == reviewedBy
          ? _value.reviewedBy
          : reviewedBy // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ContributionRequestImpl implements _ContributionRequest {
  const _$ContributionRequestImpl(
      {required this.id,
      required this.userId,
      required this.type,
      required this.status,
      this.songData,
      this.notes,
      this.reviewComments,
      this.submittedAt,
      this.reviewedAt,
      this.reviewedBy});

  factory _$ContributionRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$ContributionRequestImplFromJson(json);

  @override
  final String id;
  @override
  final String userId;
  @override
  final ContributionType type;
  @override
  final VerificationStatus status;
  @override
  final Song? songData;
  @override
  final String? notes;
  @override
  final String? reviewComments;
  @override
  final DateTime? submittedAt;
  @override
  final DateTime? reviewedAt;
  @override
  final String? reviewedBy;

  @override
  String toString() {
    return 'ContributionRequest(id: $id, userId: $userId, type: $type, status: $status, songData: $songData, notes: $notes, reviewComments: $reviewComments, submittedAt: $submittedAt, reviewedAt: $reviewedAt, reviewedBy: $reviewedBy)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ContributionRequestImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.songData, songData) ||
                other.songData == songData) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.reviewComments, reviewComments) ||
                other.reviewComments == reviewComments) &&
            (identical(other.submittedAt, submittedAt) ||
                other.submittedAt == submittedAt) &&
            (identical(other.reviewedAt, reviewedAt) ||
                other.reviewedAt == reviewedAt) &&
            (identical(other.reviewedBy, reviewedBy) ||
                other.reviewedBy == reviewedBy));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, id, userId, type, status,
      songData, notes, reviewComments, submittedAt, reviewedAt, reviewedBy);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$ContributionRequestImplCopyWith<_$ContributionRequestImpl> get copyWith =>
      __$$ContributionRequestImplCopyWithImpl<_$ContributionRequestImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ContributionRequestImplToJson(
      this,
    );
  }
}

abstract class _ContributionRequest implements ContributionRequest {
  const factory _ContributionRequest(
      {required final String id,
      required final String userId,
      required final ContributionType type,
      required final VerificationStatus status,
      final Song? songData,
      final String? notes,
      final String? reviewComments,
      final DateTime? submittedAt,
      final DateTime? reviewedAt,
      final String? reviewedBy}) = _$ContributionRequestImpl;

  factory _ContributionRequest.fromJson(Map<String, dynamic> json) =
      _$ContributionRequestImpl.fromJson;

  @override
  String get id;
  @override
  String get userId;
  @override
  ContributionType get type;
  @override
  VerificationStatus get status;
  @override
  Song? get songData;
  @override
  String? get notes;
  @override
  String? get reviewComments;
  @override
  DateTime? get submittedAt;
  @override
  DateTime? get reviewedAt;
  @override
  String? get reviewedBy;
  @override
  @JsonKey(ignore: true)
  _$$ContributionRequestImplCopyWith<_$ContributionRequestImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
