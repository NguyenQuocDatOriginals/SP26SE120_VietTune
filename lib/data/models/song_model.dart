import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/song.dart';
import '../../domain/entities/enums.dart';
import 'audio_metadata_model.dart';
import 'cultural_context_model.dart';

part 'song_model.g.dart';

/// Song model DTO for JSON serialization
@JsonSerializable()
class SongModel {
  final String id;
  final String title;
  @JsonKey(name: 'alternative_titles')
  final List<String>? alternativeTitles;
  final String genre; // MusicGenre enum as string
  @JsonKey(name: 'ethnic_group_id')
  final String ethnicGroupId;
  @JsonKey(name: 'verification_status')
  final String verificationStatus; // VerificationStatus enum as string
  @JsonKey(name: 'audio_metadata')
  final AudioMetadataModel? audioMetadata;
  @JsonKey(name: 'cultural_context')
  final CulturalContextModel? culturalContext;
  @JsonKey(name: 'lyrics_native_script')
  final String? lyricsNativeScript;
  @JsonKey(name: 'lyrics_vietnamese_translation')
  final String? lyricsVietnameseTranslation;
  final String? description;
  @JsonKey(name: 'play_count')
  final int? playCount;
  @JsonKey(name: 'favorite_count')
  final int? favoriteCount;
  @JsonKey(name: 'created_at')
  final String? createdAt; // ISO 8601 string
  @JsonKey(name: 'updated_at')
  final String? updatedAt; // ISO 8601 string
  @JsonKey(name: 'contributor_id')
  final String? contributorId;
  final List<String>? tags;

  const SongModel({
    required this.id,
    required this.title,
    this.alternativeTitles,
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
    this.tags,
  });

  factory SongModel.fromJson(Map<String, dynamic> json) =>
      _$SongModelFromJson(json);

  Map<String, dynamic> toJson() => _$SongModelToJson(this);

  /// Convert model to domain entity
  Song toEntity() {
    return Song(
      id: id,
      title: title,
      alternativeTitles: alternativeTitles,
      genre: MusicGenre.values.firstWhere(
        (e) => e.name == genre,
        orElse: () => MusicGenre.folk,
      ),
      ethnicGroupId: ethnicGroupId,
      verificationStatus: VerificationStatus.values.firstWhere(
        (e) => e.name == verificationStatus,
        orElse: () => VerificationStatus.pending,
      ),
      audioMetadata: audioMetadata?.toEntity(),
      culturalContext: culturalContext?.toEntity(),
      lyricsNativeScript: lyricsNativeScript,
      lyricsVietnameseTranslation: lyricsVietnameseTranslation,
      description: description,
      playCount: playCount,
      favoriteCount: favoriteCount,
      createdAt: createdAt != null ? DateTime.parse(createdAt!) : null,
      updatedAt: updatedAt != null ? DateTime.parse(updatedAt!) : null,
      contributorId: contributorId,
      tags: tags,
    );
  }

  /// Create model from domain entity
  factory SongModel.fromEntity(Song entity) {
    return SongModel(
      id: entity.id,
      title: entity.title,
      alternativeTitles: entity.alternativeTitles,
      genre: entity.genre.name,
      ethnicGroupId: entity.ethnicGroupId,
      verificationStatus: entity.verificationStatus.name,
      audioMetadata: entity.audioMetadata != null
          ? AudioMetadataModel.fromEntity(entity.audioMetadata!)
          : null,
      culturalContext: entity.culturalContext != null
          ? CulturalContextModel.fromEntity(entity.culturalContext!)
          : null,
      lyricsNativeScript: entity.lyricsNativeScript,
      lyricsVietnameseTranslation: entity.lyricsVietnameseTranslation,
      description: entity.description,
      playCount: entity.playCount,
      favoriteCount: entity.favoriteCount,
      createdAt: entity.createdAt?.toIso8601String(),
      updatedAt: entity.updatedAt?.toIso8601String(),
      contributorId: entity.contributorId,
      tags: entity.tags,
    );
  }
}
