import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class FavoritesPage extends StatelessWidget {
  const FavoritesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Yêu thích'),
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.textOnGradient,
      ),
      body: Container(
        decoration: AppTheme.gradientBackground,
        child: SafeArea(
          child: Center(
            child: Text(
              'Favorites Page - Coming Soon',
              style: AppTypography.bodyLarge(color: AppColors.textOnGradient),
            ),
          ),
        ),
      ),
    );
  }
}
