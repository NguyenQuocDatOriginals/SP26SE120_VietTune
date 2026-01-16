import 'package:flutter/material.dart';
import '../../../domain/entities/enums.dart';

class RoleBadge extends StatelessWidget {
  final UserRole role;

  const RoleBadge({super.key, required this.role});

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(role.displayName),
      backgroundColor: _getColor(role, context),
    );
  }

  Color _getColor(UserRole role, BuildContext context) {
    switch (role) {
      case UserRole.researcher:
        return Colors.blue.shade100;
      case UserRole.contributor:
        return Colors.green.shade100;
      case UserRole.expert:
        return Colors.orange.shade100;
      case UserRole.admin:
        return Colors.red.shade100;
    }
  }
}
