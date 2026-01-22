import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class AIAssistantPage extends StatelessWidget {
  const AIAssistantPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'AI Assistant (Coming Soon)',
            style: AppTypography.heading4(),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
