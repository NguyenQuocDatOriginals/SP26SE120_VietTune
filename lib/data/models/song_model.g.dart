// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'song_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SongModel _$SongModelFromJson(Map<String, dynamic> json) => SongModel(
      id: json['id'] as String,
      title: json['title'] as String,
      alternativeTitles: (json['alternative_titles'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      genre: json['genre'] as String,
      ethnicGroupId: json['ethnic_group_id'] as String,
      verificationStatus: json['verification_status'] as String,
      audioMetadata: json['audio_metadata'] == null
          ? null
          : AudioMetadataModel.fromJson(
              json['audio_metadata'] as Map<String, dynamic>),
      culturalContext: json['cultural_context'] == null
          ? null
          : CulturalContextModel.fromJson(
              json['cultural_context'] as Map<String, dynamic>),
      lyricsNativeScript: json['lyrics_native_script'] as String?,
      lyricsVietnameseTranslation:
          json['lyrics_vietnamese_translation'] as String?,
      language: json['language'] as String?,
      author: json['author'] as String?,
      performanceType: json['performance_type'] as String?,
      isRecordingDateEstimated: json['is_recording_date_estimated'] as bool?,
      copyrightInfo: json['copyright_info'] as String?,
      fieldNotes: json['field_notes'] as String?,
      description: json['description'] as String?,
      playCount: (json['play_count'] as num?)?.toInt(),
      favoriteCount: (json['favorite_count'] as num?)?.toInt(),
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
      contributorId: json['contributor_id'] as String?,
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList(),
    );

Map<String, dynamic> _$SongModelToJson(SongModel instance) => <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'alternative_titles': instance.alternativeTitles,
      'genre': instance.genre,
      'ethnic_group_id': instance.ethnicGroupId,
      'verification_status': instance.verificationStatus,
      'audio_metadata': instance.audioMetadata,
      'cultural_context': instance.culturalContext,
      'lyrics_native_script': instance.lyricsNativeScript,
      'lyrics_vietnamese_translation': instance.lyricsVietnameseTranslation,
      'language': instance.language,
      'author': instance.author,
      'performance_type': instance.performanceType,
      'is_recording_date_estimated': instance.isRecordingDateEstimated,
      'copyright_info': instance.copyrightInfo,
      'field_notes': instance.fieldNotes,
      'description': instance.description,
      'play_count': instance.playCount,
      'favorite_count': instance.favoriteCount,
      'created_at': instance.createdAt,
      'updated_at': instance.updatedAt,
      'contributor_id': instance.contributorId,
      'tags': instance.tags,
    };
