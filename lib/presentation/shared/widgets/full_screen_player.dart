import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import 'player_section.dart';

/// Full-screen audio player UI. Uses [PlayerSection] for content; this widget
/// provides the Scaffold and SafeArea. For embedded use (e.g. UnifiedSongPage),
/// use [PlayerSection] directly with [PlayerSection.maxHeight].
class FullScreenPlayer extends StatelessWidget {
  final String audioUrl;
  final String title;
  final String? artist;
  final String? imageUrl;
  final Duration? duration;
  final List<String> metadataChipLabels;
  final VoidCallback? onClose;

  const FullScreenPlayer({
    super.key,
    required this.audioUrl,
    required this.title,
    this.artist,
    this.imageUrl,
    this.duration,
    this.metadataChipLabels = const [],
    this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AudioPlayerTheme.fullScreenBackground,
      body: SafeArea(
        child: PlayerSection(
          audioUrl: audioUrl,
          title: title,
          artist: artist,
          imageUrl: imageUrl,
          duration: duration,
          metadataChipLabels: metadataChipLabels,
          onClose: onClose,
          maxHeight: null,
        ),
      ),
    );
  }
}
