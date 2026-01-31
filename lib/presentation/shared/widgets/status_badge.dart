import 'package:flutter/material.dart';
import '../../../domain/entities/enums.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_size_tokens.dart';

/// Status badge widget for verification status. Uses shared tag tokens for
/// uniform height and padding with [GenreTag] / music tags.
class StatusBadge extends StatelessWidget {
  final VerificationStatus status;

  const StatusBadge({
    super.key,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    final (color, text) = _getStatusInfo(status);

    return Container(
      constraints: const BoxConstraints(minHeight: AppSizeTokens.tagMinHeight),
      padding: AppSizeTokens.tagPadding,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(AppSizeTokens.tagBorderRadius),
        border: Border.all(color: color.withValues(alpha: 0.45), width: 1),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.06),
            blurRadius: 2,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      alignment: Alignment.center,
      child: Text(
        text,
        style: AppTypography.labelSmall(color: color).copyWith(
          fontWeight: FontWeight.w500,
          fontSize: 12,
        ),
      ),
    );
  }

  (Color, String) _getStatusInfo(VerificationStatus status) {
    switch (status) {
      case VerificationStatus.pending:
        return (AppColors.warning, 'Chờ duyệt');
      case VerificationStatus.verified:
        return (AppColors.success, 'Đã xác minh');
      case VerificationStatus.rejected:
        return (AppColors.error, 'Đã từ chối');
    }
  }
}
