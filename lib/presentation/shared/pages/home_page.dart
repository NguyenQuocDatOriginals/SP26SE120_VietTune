import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../discovery/pages/discover_home_page.dart';
import '../../ai/pages/ai_assistant_page.dart';
import '../../map/pages/map_explore_page.dart';
import '../../profile/pages/profile_page.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../domain/entities/enums.dart';
import '../../../core/theme/app_theme.dart';
import '../widgets/guest_auth_prompt_bottom_sheet.dart';
import '../widgets/viettune_bottom_nav.dart';
import '../widgets/dong_son_drum_icon.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  int _currentIndex = 0;

  void _handleContributeTap(BuildContext context, bool isGuest, UserRole role) {
    if (isGuest) {
      GuestAuthPromptBottomSheet.show(
        context,
        title: 'Chào mừng đến VietTune Archive',
        message: 'Đăng nhập để đóng góp và lưu trữ di sản âm nhạc',
      );
      return;
    }

    if (!role.canSubmitContributions) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Bạn không có quyền đóng góp'),
        ),
      );
      return;
    }

    // Navigate to contribution flow with error handling
    try {
      context.pushNamed('contribute-new');
    } catch (e) {
      // Handle navigation errors gracefully
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Không thể mở trang đóng góp: ${e.toString()}'),
            backgroundColor: AppColors.error,
            duration: const Duration(seconds: 4),
          ),
        );
      }
      // Log error for debugging (using debugPrint as it's available in Flutter)
      debugPrint('Error navigating to contribution page: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final isGuest = user == null;
    final role = user?.role ?? UserRole.researcher;

    final pages = <Widget>[
      const DiscoverHomePage(),
      const AIAssistantPage(),
      const MapExplorePage(),
      if (isGuest) const SizedBox.shrink() else const ProfilePage(),
    ];

    final safeIndex = _currentIndex.clamp(0, pages.length - 1);
    if (safeIndex != _currentIndex) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          setState(() {
            _currentIndex = safeIndex;
          });
        }
      });
    }

    return Scaffold(
      body: Container(
        decoration: AppTheme.gradientBackground,
        child: IndexedStack(
          index: safeIndex,
          children: pages,
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      floatingActionButton: FloatingActionButton(
        onPressed: () => _handleContributeTap(context, isGuest, role),
        backgroundColor: Colors.transparent,
        elevation: 8,
        mini: false,
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
                blurRadius: 12,
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
      ),
      bottomNavigationBar: VietTuneBottomNav(
        currentIndex: safeIndex,
        onTap: (index) {
          if (isGuest && index == 3) {
            GuestAuthPromptBottomSheet.show(
              context,
              title: 'Chào mừng đến VietTune Archive',
              message:
                  'Đăng nhập để lưu yêu thích, đóng góp và đồng bộ dữ liệu',
            );
            return;
          }

          setState(() {
            _currentIndex = index;
          });
        },
      ),
    );
  }
}
