import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../../auth/widgets/role_badge.dart';
import '../../../domain/entities/enums.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    if (user == null) {
      return const Scaffold(
        body: Center(child: Text('Đang tải thông tin người dùng...')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cá nhân'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  child: Text(user.name.isNotEmpty ? user.name[0] : '?'),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.name,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 4),
                      Text(user.email),
                    ],
                  ),
                ),
                RoleBadge(role: user.role),
              ],
            ),
            const SizedBox(height: 24),
            if (user.role == UserRole.researcher)
              ElevatedButton(
                onPressed: () => _requestContributor(context, ref, user.id),
                child: const Text('Đăng ký làm Người đóng góp'),
              ),
            const SizedBox(height: 16),
            OutlinedButton(
              onPressed: () => _logout(context, ref),
              child: const Text('Đăng xuất'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _requestContributor(
    BuildContext context,
    WidgetRef ref,
    String userId,
  ) async {
    final result = await ref.read(authProvider.notifier).requestContributorRole(
          userId: userId,
          reason: 'Yêu cầu nâng cấp quyền đóng góp',
        );
    if (!context.mounted) return;
    result.fold(
      (failure) => _showSnack(context, failure.toString()),
      (_) => _showSnack(context, 'Đã nâng cấp lên Người đóng góp'),
    );
  }

  Future<void> _logout(BuildContext context, WidgetRef ref) async {
    final result = await ref.read(authProvider.notifier).logout();
    if (!context.mounted) return;
    result.fold(
      (failure) => _showSnack(context, failure.toString()),
      (_) => _showSnack(context, 'Đã đăng xuất'),
    );
  }

  void _showSnack(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}
