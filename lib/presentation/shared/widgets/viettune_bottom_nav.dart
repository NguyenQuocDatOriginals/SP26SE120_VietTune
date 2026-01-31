import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../../core/theme/app_theme.dart';

/// VietTune BottomAppBar with centered FAB notch and dot indicator.
/// Uses Phosphor Icons (Light) per PLAN-phosphor-icons-modern-ethnic.
/// Colors from AppColors per UI consistency audit.
class VietTuneBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const VietTuneBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  static const Color _activeColor = AppColors.primary;
  static const Color _inactiveColor = AppColors.textSecondary;

  @override
  Widget build(BuildContext context) {
    return BottomAppBar(
      height: 70,
      color: AppColors.surface,
      elevation: 8,
      shape: const CircularNotchedRectangle(),
      notchMargin: 8,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _NavItem(
            icon: PhosphorIconsLight.compass,
            label: 'Explore',
            isActive: currentIndex == 0,
            onTap: () => _handleTap(0),
          ),
          _NavItem(
            icon: PhosphorIconsLight.robot,
            label: 'AI Assistant',
            isActive: currentIndex == 1,
            onTap: () => _handleTap(1),
          ),
          const SizedBox(width: 40),
          _NavItem(
            icon: PhosphorIconsLight.mapTrifold,
            label: 'Network',
            isActive: currentIndex == 2,
            onTap: () => _handleTap(2),
          ),
          _NavItem(
            icon: PhosphorIconsLight.userCircle,
            label: 'Library',
            isActive: currentIndex == 3,
            onTap: () => _handleTap(3),
          ),
        ],
      ),
    );
  }

  void _handleTap(int index) {
    HapticFeedback.selectionClick();
    onTap(index);
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = isActive
        ? VietTuneBottomNav._activeColor
        : VietTuneBottomNav._inactiveColor;
    return Expanded(
      child: Semantics(
        label: label,
        button: true,
        child: GestureDetector(
          onTap: onTap,
          behavior: HitTestBehavior.opaque,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              PhosphorIcon(
                icon,
                color: color,
                size: 22,
              ),
            const SizedBox(height: 1),
            Flexible(
              child: Text(
                label,
                style: AppTypography.labelSmall(
                  color: isActive
                      ? VietTuneBottomNav._activeColor
                      : VietTuneBottomNav._inactiveColor,
                ).copyWith(
                  fontSize: 9,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                  height: 1.1,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 1),
            Container(
              width: 2.5,
              height: 2.5,
              decoration: BoxDecoration(
                color: isActive
                    ? VietTuneBottomNav._activeColor
                    : Colors.transparent,
                shape: BoxShape.circle,
              ),
            ),
          ],
        ),
        ),
      ),
    );
  }
}
