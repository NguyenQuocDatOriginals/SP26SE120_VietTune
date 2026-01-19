import 'package:flutter/material.dart';
import '../../../domain/entities/enums.dart';
import '../../../core/theme/app_theme.dart';

/// Status badge widget for verification status
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
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color, width: 1),
      ),
      child: Text(
        text,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
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
