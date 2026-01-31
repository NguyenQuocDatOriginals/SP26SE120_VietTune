import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../../core/theme/app_theme.dart';

/// Animated error text widget with slide-in and fade animations
class AnimatedErrorText extends StatelessWidget {
  final String? errorText;
  final Duration animationDuration;
  final IconData? icon;

  const AnimatedErrorText({
    super.key,
    this.errorText,
    this.animationDuration = const Duration(milliseconds: 300),
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    if (errorText == null || errorText!.isEmpty) {
      return const SizedBox.shrink();
    }

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: animationDuration,
      curve: Curves.easeOut,
      builder: (context, value, child) {
        return Opacity(
          opacity: value,
          child: Transform.translate(
            offset: Offset(0, 10 * (1 - value)),
            child: child,
          ),
        );
      },
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (icon != null) ...[
            PhosphorIcon(
              icon ?? PhosphorIconsLight.warning,
              size: 16,
              color: AppColors.error,
            ),
            const SizedBox(width: 4),
          ],
          Expanded(
            child: Text(
              errorText!,
              style: AppTypography.bodySmall(color: AppColors.error).copyWith(
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
