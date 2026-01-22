import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// VietTune BottomAppBar with centered FAB notch and dot indicator
class VietTuneBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const VietTuneBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  static const Color _activeColor = Color(0xFFB22222);
  static const Color _inactiveColor = Color(0xFF8D8D8D);

  @override
  Widget build(BuildContext context) {
    return BottomAppBar(
      height: 70,
      color: const Color(0xFFFFFFFF),
      elevation: 8,
      shape: const CircularNotchedRectangle(),
      notchMargin: 8,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _NavItem(
            icon: Icons.grid_view_rounded,
            label: 'Explore',
            isActive: currentIndex == 0,
            onTap: () => _handleTap(0),
          ),
          _NavItem(
            icon: Icons.auto_awesome_outlined,
            label: 'AI Assistant',
            isActive: currentIndex == 1,
            onTap: () => _handleTap(1),
          ),
          const SizedBox(width: 40),
          _NavItem(
            icon: Icons.hub_outlined,
            label: 'Network',
            isActive: currentIndex == 2,
            onTap: () => _handleTap(2),
          ),
          _NavItem(
            icon: Icons.person_outline_rounded,
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
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isActive
                  ? VietTuneBottomNav._activeColor
                  : VietTuneBottomNav._inactiveColor,
              size: 22,
            ),
            const SizedBox(height: 1),
            Flexible(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                  color: isActive
                      ? VietTuneBottomNav._activeColor
                      : VietTuneBottomNav._inactiveColor,
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
    );
  }
}
