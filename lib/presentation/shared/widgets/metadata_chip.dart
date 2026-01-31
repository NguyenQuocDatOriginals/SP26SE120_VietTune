import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

/// Metadata chip widget for displaying tags and metadata
class MetadataChip extends StatelessWidget {
  final String label;
  final IconData? icon;
  final VoidCallback? onTap;
  final Color? color;

  const MetadataChip({
    super.key,
    required this.label,
    this.icon,
    this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Chip(
        avatar: icon != null
            ? Icon(icon, size: 16, color: color)
            : null,
        label: Text(label),
        onDeleted: onTap != null ? () => onTap!() : null,
        deleteIcon: onTap != null
            ? PhosphorIcon(PhosphorIconsLight.caretRight, size: 12, color: color)
            : null,
      ),
    );
  }
}
