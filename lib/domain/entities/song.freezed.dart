// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'song.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Song _$SongFromJson(Map<String, dynamic> json) {
  return _Song.fromJson(json);
}

/// @nodoc
mixin _$Song {
  String get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  List<String>? get alternativeTitles => throw _privateConstructorUsedError;
  MusicGenre get genre => throw _privateConstructorUsedError;
  String get ethnicGroupId => throw _privateConstructorUsedError;
  VerificationStatus get verificationStatus =>
      throw _privateConstructorUsedError;
  AudioMetadata? get audioMetadata => throw _privateConstructorUsedError;
  CulturalContext? get culturalContext => throw _privateConstructorUsedError;
  String? get lyricsNativeScript => throw _privateConstructorUsedError;
  String? get lyricsVietnameseTranslation => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  int? get playCount => throw _privateConstructorUsedError;
  int? get favoriteCount => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  DateTime? get updatedAt => throw _privateConstructorUsedError;
  String? get contributorId => throw _privateConstructorUsedError;
  List<String>? get tags => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $SongCopyWith<Song> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SongCopyWith<$Res> {
  factory $SongCopyWith(Song value, $Res Function(Song) then) =
      _$SongCopyWithImpl<$Res, Song>;
  @useResult
  $Res call(
      {String id,
      String title,
      List<String>? alternativeTitles,
      MusicGenre genre,
      String ethnicGroupId,
      VerificationStatus verificationStatus,
      AudioMetadata? audioMetadata,
      CulturalContext? culturalContext,
      String? lyricsNativeScript,
      String? lyricsVietnameseTranslation,
      String? description,
      int? playCount,
      int? favoriteCount,
      DateTime? createdAt,
      DateTime? updatedAt,
      String? contributorId,
      List<String>? tags});

  $AudioMetadataCopyWith<$Res>? get audioMetadata;
  $CulturalContextCopyWith<$Res>? get culturalContext;
}

/// @nodoc
class _$SongCopyWithImpl<$Res, $Val extends Song>
    implements $SongCopyWith<$Res> {
  _$SongCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? alternativeTitles = freezed,
    Object? genre = null,
    Object? ethnicGroupId = null,
    Object? verificationStatus = null,
    Object? audioMetadata = freezed,
    Object? culturalContext = freezed,
    Object? lyricsNativeScript = freezed,
    Object? lyricsVietnameseTranslation = freezed,
    Object? description = freezed,
    Object? playCount = freezed,
    Object? favoriteCount = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? contributorId = freezed,
    Object? tags = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      alternativeTitles: freezed == alternativeTitles
          ? _value.alternativeTitles
          : alternativeTitles // ignore: cast_nullable_to_non_nullable
              as List<String>?,
      genre: null == genre
          ? _value.genre
          : genre // ignore: cast_nullable_to_non_nullable
              as MusicGenre,
      ethnicGroupId: null == ethnicGroupId
          ? _value.ethnicGroupId
          : ethnicGroupId // ignore: cast_nullable_to_non_nullable
              as String,
      verificationStatus: null == verificationStatus
          ? _value.verificationStatus
          : verificationStatus // ignore: cast_nullable_to_non_nullable
              as VerificationStatus,
      audioMetadata: freezed == audioMetadata
          ? _value.audioMetadata
          : audioMetadata // ignore: cast_nullable_to_non_nullable
              as AudioMetadata?,
      culturalContext: freezed == culturalContext
          ? _value.culturalContext
          : culturalContext // ignore: cast_nullable_to_non_nullable
              as CulturalContext?,
      lyricsNativeScript: freezed == lyricsNativeScript
          ? _value.lyricsNativeScript
          : lyricsNativeScript // ignore: cast_nullable_to_non_nullable
              as String?,
      lyricsVietnameseTranslation: freezed == lyricsVietnameseTranslation
          ? _value.lyricsVietnameseTranslation
          : lyricsVietnameseTranslation // ignore: cast_nullable_to_non_nullable
              as String?,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      playCount: freezed == playCount
          ? _value.playCount
          : playCount // ignore: cast_nullable_to_non_nullable
              as int?,
      favoriteCount: freezed == favoriteCount
          ? _value.favoriteCount
          : favoriteCount // ignore: cast_nullable_to_non_nullable
              as int?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      contributorId: freezed == contributorId
          ? _value.contributorId
          : contributorId // ignore: cast_nullable_to_non_nullable
              as String?,
      tags: freezed == tags
          ? _value.tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>?,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $AudioMetadataCopyWith<$Res>? get audioMetadata {
    if (_value.audioMetadata == null) {
      return null;
    }

    return $AudioMetadataCopyWith<$Res>(_value.audioMetadata!, (value) {
      return _then(_value.copyWith(audioMetadata: value) as $Val);
    });
  }

  @override
  @pragma('vm:prefer-inline')
  $CulturalContextCopyWith<$Res>? get culturalContext {
    if (_value.culturalContext == null) {
      return null;
    }

    return $CulturalContextCopyWith<$Res>(_value.culturalContext!, (value) {
      return _then(_value.copyWith(culturalContext: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$SongImplCopyWith<$Res> implements $SongCopyWith<$Res> {
  factory _$$SongImplCopyWith(
          _$SongImpl value, $Res Function(_$SongImpl) then) =
      __$$SongImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String title,
      List<String>? alternativeTitles,
      MusicGenre genre,
      String ethnicGroupId,
      VerificationStatus verificationStatus,
      AudioMetadata? audioMetadata,
      CulturalContext? culturalContext,
      String? lyricsNativeScript,
      String? lyricsVietnameseTranslation,
      String? description,
      int? playCount,
      int? favoriteCount,
      DateTime? createdAt,
      DateTime? updatedAt,
      String? contributorId,
      List<String>? tags});

  @override
  $AudioMetadataCopyWith<$Res>? get audioMetadata;
  @override
  $CulturalContextCopyWith<$Res>? get culturalContext;
}

/// @nodoc
class __$$SongImplCopyWithImpl<$Res>
    extends _$SongCopyWithImpl<$Res, _$SongImpl>
    implements _$$SongImplCopyWith<$Res> {
  __$$SongImplCopyWithImpl(_$SongImpl _value, $Res Function(_$SongImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? alternativeTitles = freezed,
    Object? genre = null,
    Object? ethnicGroupId = null,
    Object? verificationStatus = null,
    Object? audioMetadata = freezed,
    Object? culturalContext = freezed,
    Object? lyricsNativeScript = freezed,
    Object? lyricsVietnameseTranslation = freezed,
    Object? description = freezed,
    Object? playCount = freezed,
    Object? favoriteCount = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? contributorId = freezed,
    Object? tags = freezed,
  }) {
    return _then(_$SongImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      alternativeTitles: freezed == alternativeTitles
          ? _value._alternativeTitles
          : alternativeTitles // ignore: cast_nullable_to_non_nullable
              as List<String>?,
      genre: null == genre
          ? _value.genre
          : genre // ignore: cast_nullable_to_non_nullable
              as MusicGenre,
      ethnicGroupId: null == ethnicGroupId
          ? _value.ethnicGroupId
          : ethnicGroupId // ignore: cast_nullable_to_non_nullable
              as String,
      verificationStatus: null == verificationStatus
          ? _value.verificationStatus
          : verificationStatus // ignore: cast_nullable_to_non_nullable
              as VerificationStatus,
      audioMetadata: freezed == audioMetadata
          ? _value.audioMetadata
          : audioMetadata // ignore: cast_nullable_to_non_nullable
              as AudioMetadata?,
      culturalContext: freezed == culturalContext
          ? _value.culturalContext
          : culturalContext // ignore: cast_nullable_to_non_nullable
              as CulturalContext?,
      lyricsNativeScript: freezed == lyricsNativeScript
          ? _value.lyricsNativeScript
          : lyricsNativeScript // ignore: cast_nullable_to_non_nullable
              as String?,
      lyricsVietnameseTranslation: freezed == lyricsVietnameseTranslation
          ? _value.lyricsVietnameseTranslation
          : lyricsVietnameseTranslation // ignore: cast_nullable_to_non_nullable
              as String?,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      playCount: freezed == playCount
          ? _value.playCount
          : playCount // ignore: cast_nullable_to_non_nullable
              as int?,
      favoriteCount: freezed == favoriteCount
          ? _value.favoriteCount
          : favoriteCount // ignore: cast_nullable_to_non_nullable
              as int?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      contributorId: freezed == contributorId
          ? _value.contributorId
          : contributorId // ignore: cast_nullable_to_non_nullable
              as String?,
      tags: freezed == tags
          ? _value._tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$SongImpl implements _Song {
  const _$SongImpl(
      {required this.id,
      required this.title,
      final List<String>? alternativeTitles,
      required this.genre,
      required this.ethnicGroupId,
      required this.verificationStatus,
      this.audioMetadata,
      this.culturalContext,
      this.lyricsNativeScript,
      this.lyricsVietnameseTranslation,
      this.description,
      this.playCount,
      this.favoriteCount,
      this.createdAt,
      this.updatedAt,
      this.contributorId,
      final List<String>? tags})
      : _alternativeTitles = alternativeTitles,
        _tags = tags;

  factory _$SongImpl.fromJson(Map<String, dynamic> json) =>
      _$$SongImplFromJson(json);

  @override
  final String id;
  @override
  final String title;
  final List<String>? _alternativeTitles;
  @override
  List<String>? get alternativeTitles {
    final value = _alternativeTitles;
    if (value == null) return null;
    if (_alternativeTitles is EqualUnmodifiableListView)
      return _alternativeTitles;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final MusicGenre genre;
  @override
  final String ethnicGroupId;
  @override
  final VerificationStatus verificationStatus;
  @override
  final AudioMetadata? audioMetadata;
  @override
  final CulturalContext? culturalContext;
  @override
  final String? lyricsNativeScript;
  @override
  final String? lyricsVietnameseTranslation;
  @override
  final String? description;
  @override
  final int? playCount;
  @override
  final int? favoriteCount;
  @override
  final DateTime? createdAt;
  @override
  final DateTime? updatedAt;
  @override
  final String? contributorId;
  final List<String>? _tags;
  @override
  List<String>? get tags {
    final value = _tags;
    if (value == null) return null;
    if (_tags is EqualUnmodifiableListView) return _tags;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  String toString() {
    return 'Song(id: $id, title: $title, alternativeTitles: $alternativeTitles, genre: $genre, ethnicGroupId: $ethnicGroupId, verificationStatus: $verificationStatus, audioMetadata: $audioMetadata, culturalContext: $culturalContext, lyricsNativeScript: $lyricsNativeScript, lyricsVietnameseTranslation: $lyricsVietnameseTranslation, description: $description, playCount: $playCount, favoriteCount: $favoriteCount, createdAt: $createdAt, updatedAt: $updatedAt, contributorId: $contributorId, tags: $tags)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SongImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            const DeepCollectionEquality()
                .equals(other._alternativeTitles, _alternativeTitles) &&
            (identical(other.genre, genre) || other.genre == genre) &&
            (identical(other.ethnicGroupId, ethnicGroupId) ||
                other.ethnicGroupId == ethnicGroupId) &&
            (identical(other.verificationStatus, verificationStatus) ||
                other.verificationStatus == verificationStatus) &&
            (identical(other.audioMetadata, audioMetadata) ||
                other.audioMetadata == audioMetadata) &&
            (identical(other.culturalContext, culturalContext) ||
                other.culturalContext == culturalContext) &&
            (identical(other.lyricsNativeScript, lyricsNativeScript) ||
                other.lyricsNativeScript == lyricsNativeScript) &&
            (identical(other.lyricsVietnameseTranslation,
                    lyricsVietnameseTranslation) ||
                other.lyricsVietnameseTranslation ==
                    lyricsVietnameseTranslation) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.playCount, playCount) ||
                other.playCount == playCount) &&
            (identical(other.favoriteCount, favoriteCount) ||
                other.favoriteCount == favoriteCount) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.contributorId, contributorId) ||
                other.contributorId == contributorId) &&
            const DeepCollectionEquality().equals(other._tags, _tags));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      title,
      const DeepCollectionEquality().hash(_alternativeTitles),
      genre,
      ethnicGroupId,
      verificationStatus,
      audioMetadata,
      culturalContext,
      lyricsNativeScript,
      lyricsVietnameseTranslation,
      description,
      playCount,
      favoriteCount,
      createdAt,
      updatedAt,
      contributorId,
      const DeepCollectionEquality().hash(_tags));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$SongImplCopyWith<_$SongImpl> get copyWith =>
      __$$SongImplCopyWithImpl<_$SongImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SongImplToJson(
      this,
    );
  }
}

abstract class _Song implements Song {
  const factory _Song(
      {required final String id,
      required final String title,
      final List<String>? alternativeTitles,
      required final MusicGenre genre,
      required final String ethnicGroupId,
      required final VerificationStatus verificationStatus,
      final AudioMetadata? audioMetadata,
      final CulturalContext? culturalContext,
      final String? lyricsNativeScript,
      final String? lyricsVietnameseTranslation,
      final String? description,
      final int? playCount,
      final int? favoriteCount,
      final DateTime? createdAt,
      final DateTime? updatedAt,
      final String? contributorId,
      final List<String>? tags}) = _$SongImpl;

  factory _Song.fromJson(Map<String, dynamic> json) = _$SongImpl.fromJson;

  @override
  String get id;
  @override
  String get title;
  @override
  List<String>? get alternativeTitles;
  @override
  MusicGenre get genre;
  @override
  String get ethnicGroupId;
  @override
  VerificationStatus get verificationStatus;
  @override
  AudioMetadata? get audioMetadata;
  @override
  CulturalContext? get culturalContext;
  @override
  String? get lyricsNativeScript;
  @override
  String? get lyricsVietnameseTranslation;
  @override
  String? get description;
  @override
  int? get playCount;
  @override
  int? get favoriteCount;
  @override
  DateTime? get createdAt;
  @override
  DateTime? get updatedAt;
  @override
  String? get contributorId;
  @override
  List<String>? get tags;
  @override
  @JsonKey(ignore: true)
  _$$SongImplCopyWith<_$SongImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
