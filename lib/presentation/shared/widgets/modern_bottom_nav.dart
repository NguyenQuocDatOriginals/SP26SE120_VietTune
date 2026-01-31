import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../../core/theme/app_theme.dart';
import 'dong_son_drum_icon.dart';

/// Modern BottomAppBar with notched FloatingActionButton
class ModernBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onNavTap;
  final VoidCallback onContributeTap;
  final bool isGuest;

  const ModernBottomNav({
    super.key,
    required this.currentIndex,
    required this.onNavTap,
    required this.onContributeTap,
    this.isGuest = false,
  });

  @override
  Widget build(BuildContext context) {
    return BottomAppBar(
      height: 70,
      color: AppColors.background,
      elevation: 8,
      shape: const CircularNotchedRectangle(),
      notchMargin: 8,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(
            icon: PhosphorIconsLight.house,
            label: 'Trang chủ',
            index: 0,
            isActive: currentIndex == 0,
          ),
          _buildNavItem(
            icon: PhosphorIconsLight.chatCircle,
            label: 'Hỏi AI',
            index: 1,
            isActive: currentIndex == 1,
          ),
          // Spacer for FAB
          const SizedBox(width: 40),
          _buildNavItem(
            icon: PhosphorIconsLight.treeStructure,
            label: 'Mạng lưới',
            index: 2,
            isActive: currentIndex == 2,
          ),
          _buildNavItem(
            icon: PhosphorIconsLight.user,
            label: isGuest ? 'Đăng nhập' : 'Cá nhân',
            index: 3,
            isActive: currentIndex == 3,
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required String label,
    required int index,
    required bool isActive,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: () => onNavTap(index),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            PhosphorIcon(
              icon,
              color: isActive ? AppColors.primary : AppColors.textSecondary,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: AppTypography.labelSmall(
                color: isActive ? AppColors.primary : AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

/// Notched FloatingActionButton for Contribute
class ContributeNotchedFAB extends StatelessWidget {
  final VoidCallback onTap;
  final bool isGuest;

  const ContributeNotchedFAB({
    super.key,
    required this.onTap,
    this.isGuest = false,
  });

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      heroTag: 'contribute-notched-fab',
      onPressed: onTap,
      backgroundColor: Colors.transparent,
      elevation: 8,
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.primary,
              AppColors.primaryDark,
            ],
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.4),
              blurRadius: 16,
              offset: const Offset(0, 4),
              spreadRadius: 2,
            ),
          ],
        ),
        child: const DongSonDrumIcon(
          size: 56,
          primaryColor: AppColors.primary,
          accentColor: AppColors.gold,
        ),
      ),
    );
  }
}
