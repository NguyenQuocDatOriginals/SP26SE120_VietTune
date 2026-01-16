import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../discovery/pages/discover_home_page.dart';
import '../../contribution/pages/new_contribution_page.dart';
import '../../profile/pages/profile_page.dart';
import '../../review/pages/review_queue_page.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../domain/entities/enums.dart';

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
    final role = user?.role ?? UserRole.researcher;

    final pages = <Widget>[
      const DiscoverHomePage(),
      if (role.canSubmitContributions) const NewContributionPage(),
      if (role.canReviewContributions) const ReviewQueuePage(),
      const ProfilePage(),
    ];

    final items = <BottomNavigationBarItem>[
      const BottomNavigationBarItem(
        icon: Icon(Icons.explore),
        label: 'Khám phá',
      ),
      if (role.canSubmitContributions)
        const BottomNavigationBarItem(
          icon: Icon(Icons.add_circle_outline),
          label: 'Đóng góp',
        ),
      if (role.canReviewContributions)
        const BottomNavigationBarItem(
          icon: Icon(Icons.rate_review_outlined),
          label: 'Thẩm định',
        ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.person_outline),
        label: 'Cá nhân',
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
      body: IndexedStack(
        index: safeIndex,
        children: pages,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: safeIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: items,
      ),
    );
  }
}
