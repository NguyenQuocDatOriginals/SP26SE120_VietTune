import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../../core/theme/app_theme.dart';

/// Progress indicator for individual form fields
/// Shows a checkmark when field is valid/completed
class FieldProgressIndicator extends StatelessWidget {
  final bool isValid;
  final bool isRequired;
  final double size;

  const FieldProgressIndicator({
    super.key,
    required this.isValid,
    this.isRequired = true,
    this.size = 20,
  });

  @override
  Widget build(BuildContext context) {
    if (!isValid) {
      return SizedBox(
        width: size,
        height: size,
        child: isRequired
            ? Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: AppColors.divider,
                    width: 2,
                  ),
                ),
              )
            : const SizedBox.shrink(),
      );
    }

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: AppColors.success,
        boxShadow: [
          BoxShadow(
            color: AppColors.success.withValues(alpha: 0.3),
            blurRadius: 4,
            spreadRadius: 1,
          ),
        ],
      ),
      child: PhosphorIcon(
        PhosphorIconsLight.check,
        color: AppColors.textOnPrimary,
        size: 14,
      ),
    );
  }
}

/// Progress bar showing completion status of a step
class StepProgressBar extends StatelessWidget {
  final int completedFields;
  final int totalFields;
  final double height;

  const StepProgressBar({
    super.key,
    required this.completedFields,
    required this.totalFields,
    this.height = 4,
  });

  double get progress => totalFields > 0 ? completedFields / totalFields : 0.0;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Tiến độ',
              style: AppTypography.bodySmall(color: AppColors.textSecondary).copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              '$completedFields/$totalFields',
              style: AppTypography.bodySmall(color: AppColors.textSecondary).copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(height / 2),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: height,
            backgroundColor: AppColors.divider,
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
          ),
        ),
      ],
    );
  }
}
