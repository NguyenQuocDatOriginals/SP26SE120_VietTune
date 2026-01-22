import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

/// Custom painter for Đông Sơn bronze drum icon
/// Features traditional Vietnamese bronze drum patterns
class DongSonDrumPainter extends CustomPainter {
  final Color primaryColor;
  final Color accentColor;

  DongSonDrumPainter({
    this.primaryColor = const Color(0xFFB22222), // Brocade Red
    this.accentColor = const Color(0xFFD4AF37), // Heritage Gold
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..color = primaryColor;

    final accentPaint = Paint()
      ..style = PaintingStyle.stroke
      ..color = accentColor
      ..strokeWidth = 2.5;

    final goldPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = accentColor;

    // Draw main circle (drum face)
    canvas.drawCircle(center, radius, paint);

    // Draw outer decorative ring
    canvas.drawCircle(center, radius * 0.95, accentPaint);

    // Draw central star/sun pattern (8-pointed star)
    final starPath = Path();
    final innerRadius = radius * 0.25;
    final outerRadius = radius * 0.4;
    
    for (int i = 0; i < 8; i++) {
      final angle = (i * 2 * math.pi) / 8 - math.pi / 2;
      final outerX = center.dx + outerRadius * math.cos(angle);
      final outerY = center.dy + outerRadius * math.sin(angle);
      final innerX = center.dx + innerRadius * math.cos(angle + math.pi / 8);
      final innerY = center.dy + innerRadius * math.sin(angle + math.pi / 8);
      
      if (i == 0) {
        starPath.moveTo(outerX, outerY);
      } else {
        starPath.lineTo(outerX, outerY);
      }
      starPath.lineTo(innerX, innerY);
    }
    starPath.close();
    canvas.drawPath(starPath, goldPaint);

    // Draw inner circle (drum center)
    canvas.drawCircle(center, radius * 0.2, accentPaint);

    // Draw decorative patterns around the rim (geometric motifs)
    final patternRadius = radius * 0.7;
    final patternCount = 12;
    
    for (int i = 0; i < patternCount; i++) {
      final angle = (i * 2 * math.pi) / patternCount;
      final x = center.dx + patternRadius * math.cos(angle);
      final y = center.dy + patternRadius * math.sin(angle);
      
      // Draw small decorative dots
      canvas.drawCircle(
        Offset(x, y),
        radius * 0.03,
        goldPaint,
      );
    }

    // Draw connecting lines between decorative dots
    final linePaint = Paint()
      ..style = PaintingStyle.stroke
      ..color = accentColor.withValues(alpha: 0.4)
      ..strokeWidth = 1.5;
    
    for (int i = 0; i < patternCount; i += 2) {
      final angle1 = (i * 2 * math.pi) / patternCount;
      final angle2 = ((i + 2) * 2 * math.pi) / patternCount;
      final x1 = center.dx + patternRadius * math.cos(angle1);
      final y1 = center.dy + patternRadius * math.sin(angle1);
      final x2 = center.dx + patternRadius * math.cos(angle2);
      final y2 = center.dy + patternRadius * math.sin(angle2);
      
      canvas.drawLine(Offset(x1, y1), Offset(x2, y2), linePaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Đông Sơn bronze drum icon widget
/// Circular icon featuring traditional Vietnamese bronze drum design
class DongSonDrumIcon extends StatelessWidget {
  final double size;
  final Color? primaryColor;
  final Color? accentColor;

  const DongSonDrumIcon({
    super.key,
    this.size = 56,
    this.primaryColor,
    this.accentColor,
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: DongSonDrumPainter(
        primaryColor: primaryColor ?? AppColors.primary,
        accentColor: accentColor ?? AppColors.gold,
      ),
    );
  }
}
