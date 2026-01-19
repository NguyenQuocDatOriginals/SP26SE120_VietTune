import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/providers/auth_provider.dart';

class SplashPage extends ConsumerStatefulWidget {
  const SplashPage({super.key});

  @override
  ConsumerState<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends ConsumerState<SplashPage> {
  @override
  void initState() {
    super.initState();
    _navigateToHome();
  }

  Future<void> _navigateToHome() async {
    // Wait for auth restoration attempt (but don't block guest access)
    await Future.delayed(const Duration(seconds: 2));
    
    // Navigate to home regardless of auth state (guest mode supported)
    if (mounted) {
      context.go(AppRoutes.home);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Watch auth provider to trigger restoration
    ref.watch(authProvider);
    return Scaffold(
      body: Container(
        decoration: AppTheme.gradientBackground,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.surface.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.music_note,
                  size: 80,
                  color: AppColors.textOnGradient,
                ),
              ),
              const SizedBox(height: 32),
              Text(
                'VietTune Archive',
                style: Theme.of(context).textTheme.displayMedium?.copyWith(
                  color: AppColors.textOnGradient,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Preserving Vietnamese Traditional Music',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: AppColors.textSecondaryOnGradient,
                  letterSpacing: 0.3,
                ),
              ),
              const SizedBox(height: 48),
              CircularProgressIndicator(
                color: AppColors.textOnGradient,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
