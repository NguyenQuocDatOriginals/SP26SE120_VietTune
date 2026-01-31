import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_size_tokens.dart';

/// Genre/category tag with same dimensions as [StatusBadge] for uniform
/// music tags. Uses neutral theme colors (surface, border, text).
class GenreTag extends StatelessWidget {
  final String label;

  const GenreTag({super.key, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: AppSizeTokens.tagMinHeight),
      padding: AppSizeTokens.tagPadding,
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSizeTokens.tagBorderRadius),
        border: Border.all(color: AppColors.border, width: 1),
        boxShadow: [
          BoxShadow(
            color: AppColors.textPrimary.withValues(alpha: 0.05),
            blurRadius: 2,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      alignment: Alignment.center,
      child: Text(
        label,
        style: AppTypography.labelSmall(color: AppColors.textSecondary).copyWith(
          fontWeight: FontWeight.w500,
          fontSize: 12,
        ),
      ),
    );
  }
}
