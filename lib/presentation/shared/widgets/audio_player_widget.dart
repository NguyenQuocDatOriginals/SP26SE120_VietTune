import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/extensions.dart';

/// Reusable audio player widget
class AudioPlayerWidget extends StatefulWidget {
  final String audioUrl;
  final String? title;
  final Duration? duration;

  const AudioPlayerWidget({
    super.key,
    required this.audioUrl,
    this.title,
    this.duration,
  });

  @override
  State<AudioPlayerWidget> createState() => _AudioPlayerWidgetState();
}

class _AudioPlayerWidgetState extends State<AudioPlayerWidget> {
  late AudioPlayer _audioPlayer;
  bool _isPlaying = false;
  bool _isLoading = false;
  Duration _position = Duration.zero;
  Duration _duration = Duration.zero;
  double _playbackSpeed = 1.0;
  bool _isLooping = false;

  @override
  void initState() {
    super.initState();
    _audioPlayer = AudioPlayer();
    _initAudio();
  }

  Future<void> _initAudio() async {
    try {
      setState(() => _isLoading = true);
      await _audioPlayer.setUrl(widget.audioUrl);
      _duration = widget.duration ?? _audioPlayer.duration ?? Duration.zero;
      
      _audioPlayer.positionStream.listen((position) {
        if (mounted) {
          setState(() => _position = position);
        }
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
        if (mounted && duration != null) {
          setState(() => _duration = duration);
        }
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading audio: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
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

  Future<void> _setPlaybackSpeed(double speed) async {
    await _audioPlayer.setSpeed(speed);
    setState(() => _playbackSpeed = speed);
  }

  Future<void> _toggleLoop() async {
    final loopMode = _isLooping ? LoopMode.off : LoopMode.one;
    await _audioPlayer.setLoopMode(loopMode);
    setState(() => _isLooping = !_isLooping);
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AudioPlayerTheme.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (widget.title != null) ...[
            Text(
              widget.title!,
              style: Theme.of(context).textTheme.titleMedium,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),
          ],
          // Progress bar
          Row(
            children: [
              Text(
                _position.toMMSS(),
                style: Theme.of(context).textTheme.bodySmall,
              ),
              Expanded(
                child: Slider(
                  value: _position.inMilliseconds.toDouble().clamp(
                        0.0,
                        _duration.inMilliseconds.toDouble(),
                      ),
                  min: 0.0,
                  max: _duration.inMilliseconds.toDouble(),
                  onChanged: _isLoading
                      ? null
                      : (value) => _seek(Duration(milliseconds: value.toInt())),
                ),
              ),
              Text(
                _duration.toMMSS(),
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Controls
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Loop button
              IconButton(
                icon: Icon(
                  _isLooping ? Icons.repeat_one : Icons.repeat,
                  color: _isLooping
                      ? AudioPlayerTheme.primary
                      : AudioPlayerTheme.textSecondary,
                ),
                onPressed: _toggleLoop,
                tooltip: 'Loop',
              ),
              const SizedBox(width: 8),
              // Play/Pause button
              IconButton(
                iconSize: 48,
                icon: _isLoading
                    ? const SizedBox(
                        width: 48,
                        height: 48,
                        child: CircularProgressIndicator(strokeWidth: 3),
                      )
                    : Icon(
                        _isPlaying ? Icons.pause_circle_filled : Icons.play_circle_filled,
                        size: 48,
                        color: AudioPlayerTheme.primary,
                      ),
                onPressed: _isLoading ? null : _togglePlayPause,
              ),
              const SizedBox(width: 8),
              // Speed control
              PopupMenuButton<double>(
                icon: Text(
                  '${_playbackSpeed}x',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AudioPlayerTheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                itemBuilder: (context) => [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
                    .map((speed) => PopupMenuItem(
                          value: speed,
                          child: Text('${speed}x'),
                        ))
                    .toList(),
                onSelected: _setPlaybackSpeed,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
