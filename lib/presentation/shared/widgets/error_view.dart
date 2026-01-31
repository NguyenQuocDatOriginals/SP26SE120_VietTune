import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../../core/theme/app_theme.dart';

/// Error view widget with retry functionality.
/// Uses Phosphor Light (warning, arrowClockwise) per UI consistency audit — 100% đồng bộ.
class ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;
  final IconData? icon;

  const ErrorView({
    super.key,
    required this.message,
    this.onRetry,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            PhosphorIcon(
              icon ?? PhosphorIconsLight.warning,
              size: 64,
              color: AppColors.error,
            ),
            const SizedBox(height: 16),
            Text(
              message,
              style: AppTypography.bodyLarge(color: AppColors.textPrimary),
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: onRetry,
                icon: PhosphorIcon(PhosphorIconsLight.arrowClockwise, size: 20, color: AppColors.textOnPrimary),
                label: Text('Thử lại', style: AppTypography.button(color: AppColors.textOnPrimary)),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
