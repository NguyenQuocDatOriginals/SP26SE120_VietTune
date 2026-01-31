import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/constants.dart';
import '../../../domain/entities/song.dart';

/// Large hero card with cinematic image, red gradient overlay, and dynamic waveform
class HeroHeritageCard extends StatefulWidget {
  final Song song;
  final String? imageUrl;
  final String? artistName;
  final VoidCallback? onTap;

  const HeroHeritageCard({
    super.key,
    required this.song,
    this.imageUrl,
    this.artistName,
    this.onTap,
  });

  @override
  State<HeroHeritageCard> createState() => _HeroHeritageCardState();
}

class _HeroHeritageCardState extends State<HeroHeritageCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _waveformController;

  @override
  void initState() {
    super.initState();
    _waveformController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _waveformController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap ?? () => context.push('${AppRoutes.discoverSongPath}/${widget.song.id}'),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        height: 320,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.2),
              blurRadius: 24,
              offset: const Offset(0, 8),
              spreadRadius: 0,
            ),
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: Stack(
            fit: StackFit.expand,
            children: [
              // Background image
              _buildBackground(),
              // Golden dynamic waveform overlay
              AnimatedBuilder(
                animation: _waveformController,
                builder: (context, child) {
                  return CustomPaint(
                    painter: DynamicWaveformPainter(
                      animationValue: _waveformController.value,
                      color: AppColors.gold.withValues(alpha: 0.6),
                    ),
                    child: const SizedBox.expand(),
                  );
                },
              ),
              // Gradient overlay for text readability
              _buildGradientOverlay(),
              // Glassmorphism info panel
              _buildGlassmorphismPanel(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBackground() {
    if (widget.imageUrl != null) {
      return Image.network(
        widget.imageUrl!,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => _buildGradientBackground(),
      );
    }
    return _buildGradientBackground();
  }

  Widget _buildGradientBackground() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primaryDark,
            AppColors.primary,
            AppColors.primary,
          ],
        ),
      ),
      child: Center(
        child: Icon(
          Icons.music_note,
          size: 80,
          color: AppColors.textOnPrimary.withValues(alpha: 0.3),
        ),
      ),
    );
  }

  /// Red gradient only (no black) so text is readable without a dark strip.
  Widget _buildGradientOverlay() {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      height: 160,
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.transparent,
              AppColors.primaryDark.withValues(alpha: 0.5),
              AppColors.primaryDark.withValues(alpha: 0.85),
            ],
            stops: const [0.0, 0.5, 1.0],
          ),
        ),
      ),
    );
  }

  /// Content panel: no blur, no black; sits on red gradient.
  Widget _buildGlassmorphismPanel(BuildContext context) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Title
            Text(
                  widget.song.title,
                  style: AppTypography.heading4(
                    color: AppColors.textOnPrimary,
                  ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            // Artist/Instrument info
            if (widget.artistName != null)
              Row(
                children: [
                  Icon(
                    Icons.person_outline_rounded,
                    size: 16,
                    color: AppColors.gold,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    widget.artistName!,
                    style: AppTypography.bodyMedium(
                      color: AppColors.gold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            const SizedBox(height: 8),
            // Heritage badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.gold.withValues(alpha: 0.25),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.gold.withValues(alpha: 0.5),
                  width: 1,
                ),
              ),
              child: Text(
                'Di sản nổi bật',
                style: AppTypography.labelSmall(
                  color: AppColors.gold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Custom painter for animated golden waveform
class DynamicWaveformPainter extends CustomPainter {
  final double animationValue;
  final Color color;

  DynamicWaveformPainter({
    required this.animationValue,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;

    final centerY = size.height * 0.78;
    final waveCount = 60;
    final waveWidth = size.width / waveCount;

    // Draw animated waveform
    final path = Path();
    for (int i = 0; i < waveCount; i++) {
      final x = i * waveWidth;
      // Create dynamic waveform with animation
      final phase = (animationValue * 2 * math.pi) + (i * 0.1);
      final amplitude = 18 + (math.sin(i * 0.2) * 10);
      final y = centerY + (math.sin(phase) * amplitude);

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    canvas.drawPath(path, paint);

    // Draw secondary layer for depth
    final paint2 = paint..color = color.withValues(alpha: 0.35);
    final path2 = Path();
    for (int i = 0; i < waveCount; i++) {
      final x = i * waveWidth;
      final phase = (animationValue * 2 * math.pi * 1.5) + (i * 0.15);
      final amplitude = 14 + (math.cos(i * 0.25) * 8);
      final y = centerY + (math.cos(phase) * amplitude);

      if (i == 0) {
        path2.moveTo(x, y);
      } else {
        path2.lineTo(x, y);
      }
    }

    canvas.drawPath(path2, paint2);
  }

  @override
  bool shouldRepaint(covariant DynamicWaveformPainter oldDelegate) =>
      oldDelegate.animationValue != animationValue;
}
