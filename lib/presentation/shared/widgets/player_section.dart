import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/extensions.dart';
import 'dong_son_drum_icon.dart';

/// Reusable player UI with audio logic. Used by [FullScreenPlayer] (full layout)
/// and [UnifiedSongPage] (compact layout with [maxHeight]).
class PlayerSection extends StatefulWidget {
  final String audioUrl;
  final String title;
  final String? artist;
  final String? imageUrl;
  final Duration? duration;
  final List<String> metadataChipLabels;
  final VoidCallback? onClose;

  /// When set, use compact layout to fit in this height (e.g. 40% of screen).
  final double? maxHeight;

  const PlayerSection({
    super.key,
    required this.audioUrl,
    required this.title,
    this.artist,
    this.imageUrl,
    this.duration,
    this.metadataChipLabels = const [],
    this.onClose,
    this.maxHeight,
  });

  @override
  State<PlayerSection> createState() => _PlayerSectionState();
}

class _PlayerSectionState extends State<PlayerSection> {
  late AudioPlayer _audioPlayer;
  bool _isPlaying = false;
  bool _isLoading = false;
  Duration _position = Duration.zero;
  Duration _duration = Duration.zero;
  bool _isLooping = false;

  @override
  void initState() {
    super.initState();
    _audioPlayer = AudioPlayer();
    _initAudio();
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }

  Future<void> _initAudio() async {
    try {
      setState(() => _isLoading = true);
      await _audioPlayer.setUrl(widget.audioUrl);
      _duration = widget.duration ?? _audioPlayer.duration ?? Duration.zero;

      _audioPlayer.positionStream.listen((position) {
        if (mounted) setState(() => _position = position);
      });
      _audioPlayer.playerStateStream.listen((state) {
        if (mounted) {
          setState(() {
            _isPlaying = state.playing;
            _isLoading = state.processingState == ProcessingState.loading ||
                state.processingState == ProcessingState.buffering;
          });
        }
      });
      _audioPlayer.durationStream.listen((duration) {
        if (mounted && duration != null) setState(() => _duration = duration);
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi khi tải audio: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _togglePlayPause() async {
    if (_isPlaying) {
      await _audioPlayer.pause();
    } else {
      await _audioPlayer.play();
    }
  }

  Future<void> _seek(Duration position) async {
    await _audioPlayer.seek(position);
  }

  Future<void> _toggleLoop() async {
    final mode = _isLooping ? LoopMode.off : LoopMode.one;
    await _audioPlayer.setLoopMode(mode);
    if (mounted) setState(() => _isLooping = !_isLooping);
  }

  bool get _isCompact => widget.maxHeight != null;

  @override
  Widget build(BuildContext context) {
    if (_isCompact) {
      return _buildCompactLayout();
    }
    return _buildFullLayout();
  }

  Widget _buildCompactLayout() {
    final maxH = widget.maxHeight!;
    const artSize = 72.0;
    const spacing = 8.0;
    const waveformHeight = 28.0;
    const playButtonSize = 56.0;

    return Container(
      width: double.infinity,
      color: AudioPlayerTheme.fullScreenBackground,
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _CompactCircularArt(imageUrl: widget.imageUrl, size: artSize),
              SizedBox(height: spacing),
              Text(
                widget.title,
                style: AppTypography.titleSmall(
                  color: AudioPlayerTheme.fullScreenHeaderText,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
              ),
              if (widget.artist != null && widget.artist!.isNotEmpty) ...[
                SizedBox(height: spacing / 2),
                Text(
                  widget.artist!,
                  style: AppTypography.bodySmall(
                    color: AppColors.textSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
              ],
              if (widget.metadataChipLabels.isNotEmpty) ...[
                SizedBox(height: spacing),
                _CompactMetadataChips(labels: widget.metadataChipLabels),
              ],
              SizedBox(height: spacing),
              _CompactWaveform(
                progress: _duration.inMilliseconds > 0
                    ? _position.inMilliseconds / _duration.inMilliseconds
                    : 0.0,
                height: waveformHeight,
              ),
              SizedBox(height: spacing),
              _CompactProgressSection(
                position: _position,
                duration: _duration,
                isLoading: _isLoading,
                onSeek: _seek,
              ),
              SizedBox(height: spacing),
              _CompactControlRow(
                isPlaying: _isPlaying,
                isLoading: _isLoading,
                isLooping: _isLooping,
                playButtonSize: playButtonSize,
                onPlayPause: _togglePlayPause,
                onRepeat: _toggleLoop,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFullLayout() {
    return Column(
      children: [
        _PlayerHeader(onClose: widget.onClose),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              children: [
                const SizedBox(height: 16),
                _CircularArt(imageUrl: widget.imageUrl),
                const SizedBox(height: 20),
                Text(
                  widget.title,
                  style: AppTypography.heading3(
                    color: AudioPlayerTheme.fullScreenHeaderText,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Text(
                  widget.artist ?? 'VietTune Archive',
                  style: AppTypography.bodyMedium(
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 16),
                _MetadataChips(labels: widget.metadataChipLabels),
                const SizedBox(height: 24),
                _WaveformPlaceholder(
                  progress: _duration.inMilliseconds > 0
                      ? _position.inMilliseconds / _duration.inMilliseconds
                      : 0.0,
                ),
                const SizedBox(height: 16),
                _ProgressSection(
                  position: _position,
                  duration: _duration,
                  isLoading: _isLoading,
                  onSeek: _seek,
                ),
                const SizedBox(height: 24),
                _ControlRow(
                  isPlaying: _isPlaying,
                  isLoading: _isLoading,
                  isLooping: _isLooping,
                  onPlayPause: _togglePlayPause,
                  onRepeat: _toggleLoop,
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// --- Full layout components (same as FullScreenPlayer) ---

class _PlayerHeader extends StatelessWidget {
  final VoidCallback? onClose;

  const _PlayerHeader({this.onClose});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
      child: Row(
        children: [
          if (onClose != null)
            IconButton(
              icon: PhosphorIcon(
                PhosphorIconsLight.caretLeft,
                color: AudioPlayerTheme.fullScreenHeaderText,
                size: 24,
              ),
              onPressed: onClose,
              tooltip: 'Đóng',
            ),
          Expanded(
            child: Text(
              'VietTune Archive',
              style: AppTypography.labelLarge(
                color: AudioPlayerTheme.fullScreenHeaderText,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          if (onClose != null) const SizedBox(width: 48),
        ],
      ),
    );
  }
}

class _CircularArt extends StatelessWidget {
  final String? imageUrl;
  final double? size;

  const _CircularArt({this.imageUrl, this.size});

  @override
  Widget build(BuildContext context) {
    final size = this.size ?? MediaQuery.sizeOf(context).width * 0.65;
    return Center(
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: AudioPlayerTheme.fullScreenCircularBorderColor,
            width: 4,
          ),
          boxShadow: [
            BoxShadow(
              color: AudioPlayerTheme.fullScreenCircularBorderShadow
                  .withValues(alpha: 0.4),
              blurRadius: 16,
              offset: const Offset(0, 6),
              spreadRadius: 0,
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: imageUrl != null && imageUrl!.isNotEmpty
            ? Image.network(
                imageUrl!,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _placeholderContent(),
              )
            : _placeholderContent(),
      ),
    );
  }

  Widget _placeholderContent() {
    return Container(
      color: AppColors.backgroundDark,
      child: const Center(
        child: DongSonDrumIcon(size: 80),
      ),
    );
  }
}

class _CompactCircularArt extends StatelessWidget {
  final String? imageUrl;
  final double size;

  const _CompactCircularArt({this.imageUrl, required this.size});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: AudioPlayerTheme.fullScreenCircularBorderColor,
            width: 3,
          ),
          boxShadow: [
            BoxShadow(
              color: AudioPlayerTheme.fullScreenCircularBorderShadow
                  .withValues(alpha: 0.3),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: imageUrl != null && imageUrl!.isNotEmpty
            ? Image.network(
                imageUrl!,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _placeholderContent(),
              )
            : _placeholderContent(),
      ),
    );
  }

  Widget _placeholderContent() {
    return Container(
      color: AppColors.backgroundDark,
      child: const Center(
        child: DongSonDrumIcon(size: 36),
      ),
    );
  }
}

class _MetadataChips extends StatelessWidget {
  final List<String> labels;

  const _MetadataChips({this.labels = const []});

  @override
  Widget build(BuildContext context) {
    if (labels.isEmpty) return const SizedBox.shrink();
    return Wrap(
      alignment: WrapAlignment.center,
      spacing: 8,
      runSpacing: 8,
      children: labels
          .map(
            (label) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AudioPlayerTheme.fullScreenMetadataChipBackground,
                border: Border.all(
                  color: AudioPlayerTheme.fullScreenMetadataChipBorder,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                label,
                style: AppTypography.labelMedium(
                  color: AudioPlayerTheme.fullScreenMetadataChipText,
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _CompactMetadataChips extends StatelessWidget {
  final List<String> labels;

  const _CompactMetadataChips({this.labels = const []});

  @override
  Widget build(BuildContext context) {
    if (labels.isEmpty) return const SizedBox.shrink();
    return Wrap(
      alignment: WrapAlignment.center,
      spacing: 6,
      runSpacing: 6,
      children: labels.take(3).map((label) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: AudioPlayerTheme.fullScreenMetadataChipBackground,
            border: Border.all(
              color: AudioPlayerTheme.fullScreenMetadataChipBorder,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            label,
            style: AppTypography.labelSmall(
              color: AudioPlayerTheme.fullScreenMetadataChipText,
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _WaveformPlaceholder extends StatelessWidget {
  final double progress;

  const _WaveformPlaceholder({this.progress = 0.0});

  static const int _barCount = 32;
  static const List<double> _heights = [
    0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.45, 0.75,
    0.55, 0.85, 0.5, 0.7, 0.6, 0.9, 0.4, 0.8,
    0.65, 0.75, 0.5, 0.85, 0.55, 0.7, 0.45, 0.9,
    0.6, 0.8, 0.5, 0.65, 0.7, 0.85, 0.45, 0.75,
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: List.generate(_barCount, (i) {
          final isActive = (i / _barCount) <= progress;
          final h = _heights[i % _heights.length] * 32;
          return Container(
            width: 3,
            height: h,
            margin: const EdgeInsets.symmetric(horizontal: 2),
            decoration: BoxDecoration(
              color: isActive
                  ? AudioPlayerTheme.fullScreenWaveformActive
                  : AudioPlayerTheme.fullScreenWaveformInactive,
              borderRadius: BorderRadius.circular(2),
            ),
          );
        }),
      ),
    );
  }
}

class _CompactWaveform extends StatelessWidget {
  final double progress;
  final double height;

  const _CompactWaveform({this.progress = 0.0, this.height = 28});

  static const int _barCount = 24;
  static const List<double> _heights = [
    0.5, 0.8, 0.6, 0.9, 0.5, 0.7, 0.6, 0.85,
    0.5, 0.75, 0.6, 0.8, 0.5, 0.9, 0.6, 0.7,
    0.5, 0.85, 0.6, 0.75, 0.5, 0.8, 0.6, 0.9,
  ];

  @override
  Widget build(BuildContext context) {
    final barHeight = height - 4;
    return SizedBox(
      height: height,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: List.generate(_barCount, (i) {
          final isActive = (i / _barCount) <= progress;
          final h = _heights[i % _heights.length] * barHeight;
          return Container(
            width: 2,
            height: h,
            margin: const EdgeInsets.symmetric(horizontal: 1),
            decoration: BoxDecoration(
              color: isActive
                  ? AudioPlayerTheme.fullScreenWaveformActive
                  : AudioPlayerTheme.fullScreenWaveformInactive,
              borderRadius: BorderRadius.circular(1),
            ),
          );
        }),
      ),
    );
  }
}

class _ProgressSection extends StatelessWidget {
  final Duration position;
  final Duration duration;
  final bool isLoading;
  final ValueChanged<Duration> onSeek;

  const _ProgressSection({
    required this.position,
    required this.duration,
    required this.isLoading,
    required this.onSeek,
  });

  @override
  Widget build(BuildContext context) {
    final maxMs = duration.inMilliseconds.toDouble();
    final value = maxMs > 0
        ? position.inMilliseconds.toDouble().clamp(0.0, maxMs)
        : 0.0;

    return SliderTheme(
      data: SliderTheme.of(context).copyWith(
        activeTrackColor: AudioPlayerTheme.fullScreenProgressActive,
        inactiveTrackColor: AudioPlayerTheme.fullScreenProgressInactive,
        thumbColor: AudioPlayerTheme.fullScreenProgressThumb,
        overlayColor: AudioPlayerTheme.fullScreenProgressThumb
            .withValues(alpha: 0.2),
      ),
      child: Column(
        children: [
          Row(
            children: [
              SizedBox(
                width: 48,
                child: Text(
                  position.toMMSS(),
                  style: AppTypography.labelMedium(
                    color: AudioPlayerTheme.fullScreenHeaderText,
                  ),
                ),
              ),
              Expanded(
                child: Slider(
                  value: value,
                  min: 0.0,
                  max: maxMs > 0 ? maxMs : 1.0,
                  onChanged: isLoading
                      ? null
                      : (v) => onSeek(Duration(milliseconds: v.toInt())),
                ),
              ),
              SizedBox(
                width: 52,
                child: Text(
                  '/ ${duration.toMMSS()}',
                  style: AppTypography.labelMedium(
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CompactProgressSection extends StatelessWidget {
  final Duration position;
  final Duration duration;
  final bool isLoading;
  final ValueChanged<Duration> onSeek;

  const _CompactProgressSection({
    required this.position,
    required this.duration,
    required this.isLoading,
    required this.onSeek,
  });

  @override
  Widget build(BuildContext context) {
    final maxMs = duration.inMilliseconds.toDouble();
    final value = maxMs > 0
        ? position.inMilliseconds.toDouble().clamp(0.0, maxMs)
        : 0.0;

    return SliderTheme(
      data: SliderTheme.of(context).copyWith(
        activeTrackColor: AudioPlayerTheme.fullScreenProgressActive,
        inactiveTrackColor: AudioPlayerTheme.fullScreenProgressInactive,
        thumbColor: AudioPlayerTheme.fullScreenProgressThumb,
        overlayColor: AudioPlayerTheme.fullScreenProgressThumb
            .withValues(alpha: 0.2),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 40,
            child: Text(
              position.toMMSS(),
              style: AppTypography.labelSmall(
                color: AudioPlayerTheme.fullScreenHeaderText,
              ),
            ),
          ),
          Expanded(
            child: Slider(
              value: value,
              min: 0.0,
              max: maxMs > 0 ? maxMs : 1.0,
              onChanged: isLoading
                  ? null
                  : (v) => onSeek(Duration(milliseconds: v.toInt())),
            ),
          ),
          SizedBox(
            width: 40,
            child: Text(
              duration.toMMSS(),
              style: AppTypography.labelSmall(
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ControlRow extends StatelessWidget {
  final bool isPlaying;
  final bool isLoading;
  final bool isLooping;
  final VoidCallback onPlayPause;
  final VoidCallback onRepeat;

  const _ControlRow({
    required this.isPlaying,
    required this.isLoading,
    required this.isLooping,
    required this.onPlayPause,
    required this.onRepeat,
  });

  static const double _playButtonSize = 72;

  @override
  Widget build(BuildContext context) {
    final iconColor = AudioPlayerTheme.fullScreenControlIconColor;

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _iconButton(icon: PhosphorIconsLight.shuffle, color: iconColor, onPressed: null),
        const SizedBox(width: 16),
        _iconButton(icon: PhosphorIconsLight.skipBack, color: iconColor, onPressed: null),
        const SizedBox(width: 24),
        _playPauseButton(
          isLoading: isLoading,
          isPlaying: isPlaying,
          size: _playButtonSize,
          onPressed: onPlayPause,
        ),
        const SizedBox(width: 24),
        _iconButton(icon: PhosphorIconsLight.skipForward, color: iconColor, onPressed: null),
        const SizedBox(width: 16),
        _iconButton(
          icon: isLooping ? PhosphorIconsLight.repeatOnce : PhosphorIconsLight.repeat,
          color: isLooping ? AudioPlayerTheme.fullScreenPlayButtonGradientStart : iconColor,
          onPressed: onRepeat,
        ),
      ],
    );
  }

  Widget _iconButton({
    required IconData icon,
    required Color color,
    VoidCallback? onPressed,
  }) {
    return IconButton(
      icon: PhosphorIcon(icon, color: color, size: 28),
      onPressed: onPressed,
    );
  }

  Widget _playPauseButton({
    required bool isLoading,
    required bool isPlaying,
    required double size,
    required VoidCallback onPressed,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: isLoading ? null : onPressed,
        borderRadius: BorderRadius.circular(size / 2),
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AudioPlayerTheme.fullScreenPlayButtonGradientStart,
                AudioPlayerTheme.fullScreenPlayButtonGradientEnd,
              ],
            ),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AudioPlayerTheme.fullScreenPlayButtonGradientStart
                    .withValues(alpha: 0.4),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: isLoading
              ? const Center(
                  child: SizedBox(
                    width: 28,
                    height: 28,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        AppColors.textOnPrimary,
                      ),
                    ),
                  ),
                )
              : PhosphorIcon(
                  isPlaying ? PhosphorIconsLight.pause : PhosphorIconsLight.play,
                  color: AppColors.textOnPrimary,
                  size: 40,
                ),
        ),
      ),
    );
  }
}

class _CompactControlRow extends StatelessWidget {
  final bool isPlaying;
  final bool isLoading;
  final bool isLooping;
  final double playButtonSize;
  final VoidCallback onPlayPause;
  final VoidCallback onRepeat;

  const _CompactControlRow({
    required this.isPlaying,
    required this.isLoading,
    required this.isLooping,
    required this.playButtonSize,
    required this.onPlayPause,
    required this.onRepeat,
  });

  @override
  Widget build(BuildContext context) {
    final iconColor = AudioPlayerTheme.fullScreenControlIconColor;

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        IconButton(
          icon: PhosphorIcon(PhosphorIconsLight.skipBack, color: iconColor, size: 24),
          onPressed: null,
        ),
        const SizedBox(width: 16),
        _playPauseButton(
          isLoading: isLoading,
          isPlaying: isPlaying,
          size: playButtonSize,
          onPressed: onPlayPause,
        ),
        const SizedBox(width: 16),
        IconButton(
          icon: PhosphorIcon(
            isLooping ? PhosphorIconsLight.repeatOnce : PhosphorIconsLight.repeat,
            color: isLooping ? AudioPlayerTheme.fullScreenPlayButtonGradientStart : iconColor,
            size: 24,
          ),
          onPressed: onRepeat,
        ),
      ],
    );
  }

  Widget _playPauseButton({
    required bool isLoading,
    required bool isPlaying,
    required double size,
    required VoidCallback onPressed,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: isLoading ? null : onPressed,
        borderRadius: BorderRadius.circular(size / 2),
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AudioPlayerTheme.fullScreenPlayButtonGradientStart,
                AudioPlayerTheme.fullScreenPlayButtonGradientEnd,
              ],
            ),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AudioPlayerTheme.fullScreenPlayButtonGradientStart
                    .withValues(alpha: 0.4),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: isLoading
              ? const Center(
                  child: SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        AppColors.textOnPrimary,
                      ),
                    ),
                  ),
                )
              : PhosphorIcon(
                  isPlaying ? PhosphorIconsLight.pause : PhosphorIconsLight.play,
                  color: AppColors.textOnPrimary,
                  size: 32,
                ),
        ),
      ),
    );
  }
}
