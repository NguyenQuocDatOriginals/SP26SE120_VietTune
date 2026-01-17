import 'package:freezed_annotation/freezed_annotation.dart';
import 'enums.dart';
import 'audio_metadata.dart';
import 'cultural_context.dart';

part 'song.freezed.dart';
part 'song.g.dart';

/// Complete song entity with lyrics, audio, and verification status
@freezed
class Song with _$Song {
  const factory Song({
    required String id,
    required String title,
    List<String>? alternativeTitles,
    required MusicGenre genre,
    required String ethnicGroupId,
    required VerificationStatus verificationStatus,
    AudioMetadata? audioMetadata,
    CulturalContext? culturalContext,
    String? lyricsNativeScript,
    String? lyricsVietnameseTranslation,
    String? language,
    String? author,
    PerformanceType? performanceType,
    bool? isRecordingDateEstimated,
    String? copyrightInfo,
    String? fieldNotes,
    String? description,
    int? playCount,
    int? favoriteCount,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? contributorId,
    List<String>? tags,
  }) = _Song;

  factory Song.fromJson(Map<String, dynamic> json) => _$SongFromJson(json);
}
