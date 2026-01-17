import 'package:just_audio/just_audio.dart';
import 'audio_utils.dart';

class AudioFileMetadata {
  final String format;
  final int bitrateKbps;
  final int sampleRateHz;
  final int durationInSeconds;

  const AudioFileMetadata({
    required this.format,
    required this.bitrateKbps,
    required this.sampleRateHz,
    required this.durationInSeconds,
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

      return AudioFileMetadata(
        format: format,
        bitrateKbps: bitrate,
        sampleRateHz: sampleRate,
        durationInSeconds: durationSeconds,
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
