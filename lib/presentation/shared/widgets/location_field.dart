import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/theme/app_theme.dart';
import '../../../domain/entities/location.dart';
import 'location_picker_sheet.dart';

/// Form field that displays selected address (Tỉnh / Huyện / Xã) and opens
/// [showLocationPickerSheet] on tap. Use for metadata forms.
class LocationField extends StatelessWidget {
  final Location? value;
  final ValueChanged<Location?>? onChanged;
  final String? errorText;

  const LocationField({
    super.key,
    this.value,
    this.onChanged,
    this.errorText,
  });

  /// Display string for [value] (e.g. "Hà Nội, Ba Đình, Phường Điện Biên").
  static String displayString(Location? location) {
    if (location == null) return '';
    final parts = <String>[];
    if (location.province != null && location.province!.isNotEmpty) {
      parts.add(location.province!);
    }
    if (location.district != null && location.district!.isNotEmpty) {
      parts.add(location.district!);
    }
    if (location.commune != null && location.commune!.isNotEmpty) {
      parts.add(location.commune!);
    }
    return parts.join(', ');
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final display = displayString(value);
    final isEmpty = display.isEmpty;

    return Semantics(
      label: isEmpty
          ? 'Địa điểm, nhấn để chọn Tỉnh Huyện Xã'
          : 'Địa điểm: $display, nhấn để đổi hoặc xóa',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () async {
              final result = await showLocationPickerSheet(context);
              if (result != null) onChanged?.call(result);
            },
            child: InputDecorator(
              isEmpty: isEmpty,
              decoration: InputDecoration(
                hintText: 'Chọn Tỉnh / Huyện / Xã',
                hintStyle: AppTypography.bodyLarge(color: AppColors.textSecondary),
                filled: true,
                fillColor: AppColors.surface,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 12,
                ),
                suffixIcon: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (!isEmpty)
                      IconButton(
                        icon: PhosphorIcon(PhosphorIconsLight.x, size: 20),
                        onPressed: () => onChanged?.call(null),
                        style: IconButton.styleFrom(
                          foregroundColor: AppColors.textSecondary,
                          padding: const EdgeInsets.all(4),
                          minimumSize: const Size(40, 40),
                        ),
                      ),
                    PhosphorIcon(PhosphorIconsLight.caretDown, color: AppColors.textSecondary),
                  ],
                ),
                errorText: errorText,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.divider),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.divider),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                  color: AppColors.primary,
                  width: 2,
                ),
              ),
            ),
            child: Text(
              isEmpty ? 'Chọn Tỉnh / Huyện / Xã' : display,
              style: AppTypography.bodyLarge(
                color: isEmpty ? AppColors.textSecondary : AppColors.textPrimary,
              ),
            ),
          ),
        ),
        ],
      ),
    );
  }
}
