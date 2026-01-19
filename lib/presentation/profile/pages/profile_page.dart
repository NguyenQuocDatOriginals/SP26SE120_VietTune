import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../../auth/widgets/role_badge.dart';
import '../../../domain/entities/enums.dart';
import '../../../core/theme/app_theme.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Cá nhân'),
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.textOnGradient,
      ),
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: AppTheme.gradientBackground,
        child: SafeArea(
          child: user == null
              ? const Center(
                  child: CircularProgressIndicator(
                    color: AppColors.textOnGradient,
                  ),
                )
              : SingleChildScrollView(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Card(
                          elevation: 6,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          color: AppColors.surface.withValues(alpha: 0.95),
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 32,
                                  backgroundColor: AppColors.primaryRed,
                                  child: Text(
                                    user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
                                    style: const TextStyle(
                                      color: AppColors.textOnGradient,
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        user.name,
                                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.textOnGradient,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        user.email,
                                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                RoleBadge(role: user.role),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        if (user.role == UserRole.researcher)
                          SizedBox(
                            width: double.infinity,
                            height: 52,
                            child: ElevatedButton(
                              onPressed: () => _requestContributor(context, ref, user.id),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primaryRed,
                                foregroundColor: AppColors.textOnGradient,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: const Text('Đăng ký làm Người đóng góp'),
                            ),
                          ),
                        if (user.role == UserRole.researcher)
                          const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          height: 52,
                          child: OutlinedButton(
                            onPressed: () => _logout(context, ref),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.textOnGradient,
                              side: const BorderSide(
                                color: AppColors.textOnGradient,
                                width: 1.5,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text('Đăng xuất'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
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
