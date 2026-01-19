import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../discovery/pages/discover_home_page.dart';
import '../../contribution/pages/new_contribution_page.dart';
import '../../profile/pages/profile_page.dart';
import '../../review/pages/review_queue_page.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../domain/entities/enums.dart';
import '../../../core/theme/app_theme.dart';
import '../widgets/guest_auth_prompt_bottom_sheet.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final isGuest = user == null;
    final role = user?.role ?? UserRole.researcher;

    final pages = <Widget>[
      const DiscoverHomePage(),
      if (!isGuest && role.canSubmitContributions) const NewContributionPage(),
      if (!isGuest && role.canReviewContributions) const ReviewQueuePage(),
      // Guest sees profile tab but it triggers bottom sheet
      if (isGuest)
        const SizedBox.shrink() // Placeholder
      else
        const ProfilePage(),
    ];

    final items = <BottomNavigationBarItem>[
      const BottomNavigationBarItem(
        icon: Icon(Icons.explore),
        label: 'Khám phá',
      ),
      if (!isGuest && role.canSubmitContributions)
        const BottomNavigationBarItem(
          icon: Icon(Icons.add_circle_outline),
          label: 'Đóng góp',
        ),
      if (!isGuest && role.canReviewContributions)
        const BottomNavigationBarItem(
          icon: Icon(Icons.rate_review_outlined),
          label: 'Thẩm định',
        ),
      BottomNavigationBarItem(
        icon: const Icon(Icons.person_outline),
        label: isGuest ? 'Đăng nhập' : 'Cá nhân',
      ),
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
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: safeIndex,
        onTap: (index) {
          // Guest clicks on Profile tab (last tab)
          if (isGuest && index == items.length - 1) {
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
        items: items,
      ),
    );
  }
}
