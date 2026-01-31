import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../domain/entities/ethnic_group.dart';

/// Horizontal list of ethnic categories with Brocade pattern borders
class EthnicCategoriesList extends StatelessWidget {
  final List<EthnicGroup> ethnicGroups;
  final VoidCallback? onSeeAll;

  const EthnicCategoriesList({
    super.key,
    required this.ethnicGroups,
    this.onSeeAll,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Khám phá theo Dân tộc',
                style: AppTypography.heading4(),
              ),
              if (onSeeAll != null)
                GestureDetector(
                  onTap: onSeeAll,
                  child: Text(
                    'Xem tất cả',
                    style: AppTypography.labelMedium(
                      color: AppColors.primary,
                    ),
                  ),
                ),
            ],
          ),
        ),
        SizedBox(
          height: 112,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: ethnicGroups.length,
            itemBuilder: (context, index) {
              final group = ethnicGroups[index];
              return _CategoryItem(
                ethnicGroup: group,
                onTap: () => context.push('/discover/ethnic-group/${group.id}'),
              );
            },
          ),
        ),
      ],
    );
  }
}

/// Individual category item with Brocade pattern border
class _CategoryItem extends StatelessWidget {
  final EthnicGroup ethnicGroup;
  final VoidCallback onTap;

  const _CategoryItem({
    required this.ethnicGroup,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 88,
        margin: const EdgeInsets.only(right: 12),
        child: Column(
          children: [
            // CircleAvatar with Brocade pattern border
            SizedBox(
              width: 72,
              height: 72,
              child: CustomPaint(
                painter: BrocadePatternPainter(),
                child: Container(
                  margin: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.primary,
                  ),
                  child: Center(
                    child: PhosphorIcon(
                      PhosphorIconsLight.users,
                      size: 30,
                      color: AppColors.textOnPrimary.withValues(alpha: 0.9),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            // Label
            Text(
              ethnicGroup.name,
              style: AppTypography.labelMedium(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

/// Custom painter for Brocade geometric pattern border
class BrocadePatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // Draw outer circle border
    final borderPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..shader = LinearGradient(
        colors: [
          AppColors.primary,
          AppColors.gold,
          AppColors.primary,
        ],
        stops: const [0.0, 0.5, 1.0],
      ).createShader(Rect.fromCircle(center: center, radius: radius));

    canvas.drawCircle(center, radius - 1.5, borderPaint);

    // Draw geometric Brocade pattern
    final patternPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..color = AppColors.gold.withValues(alpha: 0.4);

    // Draw 8-pointed star pattern
    for (int i = 0; i < 8; i++) {
      final angle = (i * 45) * math.pi / 180;
      final outerX = center.dx + (radius - 8) * math.cos(angle);
      final outerY = center.dy + (radius - 8) * math.sin(angle);
      final innerX = center.dx + (radius - 20) * math.cos(angle);
      final innerY = center.dy + (radius - 20) * math.sin(angle);

      canvas.drawLine(
        Offset(outerX, outerY),
        Offset(innerX, innerY),
        patternPaint,
      );
    }

    // Draw inner diamond pattern
    final diamondPath = Path();
    final diamondSize = radius * 0.4;
    diamondPath.moveTo(center.dx, center.dy - diamondSize);
    diamondPath.lineTo(center.dx + diamondSize, center.dy);
    diamondPath.lineTo(center.dx, center.dy + diamondSize);
    diamondPath.lineTo(center.dx - diamondSize, center.dy);
    diamondPath.close();

    canvas.drawPath(diamondPath, patternPaint);
  }


  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
