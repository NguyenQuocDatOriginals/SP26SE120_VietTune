import 'package:just_audio/just_audio.dart';
import 'audio_utils.dart';

class AudioFileMetadata {
  final String format;
  final int bitrateKbps;
  final int sampleRateHz;
  final int durationInSeconds;
  final String? title;
  final String? artist;
  final String? album;
  final String? genre;

  const AudioFileMetadata({
    required this.format,
    required this.bitrateKbps,
    required this.sampleRateHz,
    required this.durationInSeconds,
    this.title,
    this.artist,
    this.album,
    this.genre,
  });
}

class AudioMetadataExtractor {
  static Future<AudioFileMetadata?> extractFromFile(
    String filePath, {
    int? fileSizeBytes,
  }) async {
    final player = AudioPlayer();
    try {
      final duration = await player.setFilePath(filePath);
      if (duration == null) {
        return null;
      }

      final format = AudioUtils.getFileExtension(filePath);
      final durationSeconds = duration.inSeconds;
      final bitrate = _estimateBitrateKbps(
        fileSizeBytes: fileSizeBytes,
        durationSeconds: durationSeconds,
      );
      final sampleRate = _guessSampleRate(format);

      // Try to extract metadata from filename
      // Note: ID3 tag parsing is disabled due to package API compatibility
      // Can be re-enabled when a compatible ID3 package is found
      String? title;
      String? artist;
      String? album;
      String? genre;
      
      // Extract from filename as fallback
      try {
        final fileName = filePath.split('/').last.split('\\').last;
        final nameWithoutExt = fileName.replaceAll(RegExp(r'\.[^.]+$'), '');
        if (nameWithoutExt.contains(' - ')) {
          final parts = nameWithoutExt.split(' - ');
          if (parts.length >= 2) {
            artist = parts[0].trim();
            title = parts[1].trim();
          } else {
            title = nameWithoutExt;
          }
        } else {
          title = nameWithoutExt;
        }
      } catch (_) {
        // Filename parsing failed
      }

      return AudioFileMetadata(
        format: format,
        bitrateKbps: bitrate,
        sampleRateHz: sampleRate,
        durationInSeconds: durationSeconds,
        title: title,
        artist: artist,
        album: album,
        genre: genre,
      );
    } catch (_) {
      return null;
    } finally {
      await player.dispose();
    }
  }

  static int _estimateBitrateKbps({
    int? fileSizeBytes,
    required int durationSeconds,
  }) {
    if (fileSizeBytes == null || durationSeconds <= 0) {
      return 0;
    }
    return ((fileSizeBytes * 8) / (durationSeconds * 1000)).round();
  }

  static int _guessSampleRate(String format) {
    switch (format.toLowerCase()) {
      case 'wav':
      case 'flac':
        return 48000;
      default:
        return 44100;
    }
  }
}
