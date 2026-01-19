import 'package:flutter/material.dart';
import '../../../domain/entities/enums.dart';
import '../../../core/theme/app_theme.dart';

class RoleBadge extends StatelessWidget {
  final UserRole role;

  const RoleBadge({super.key, required this.role});

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(role.displayName),
      backgroundColor: _getColor(role),
    );
  }

  Color _getColor(UserRole role) {
    switch (role) {
      case UserRole.researcher:
        return AppColors.accentBlue.withValues(alpha: 0.2);
      case UserRole.contributor:
        return AppColors.success.withValues(alpha: 0.2);
      case UserRole.expert:
        return AppColors.warning.withValues(alpha: 0.2);
      case UserRole.admin:
        return AppColors.error.withValues(alpha: 0.2);
    }
  }
}
