import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Cài đặt'),
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.textOnGradient,
      ),
      body: Container(
        decoration: AppTheme.gradientBackground,
        child: SafeArea(
          child: Center(
            child: Text(
              'Settings Page - Coming Soon',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: AppColors.textOnGradient,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
