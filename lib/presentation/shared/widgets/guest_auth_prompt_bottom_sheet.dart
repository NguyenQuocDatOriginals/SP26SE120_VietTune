import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/constants.dart';

/// Bottom sheet to prompt guest users to login or register
class GuestAuthPromptBottomSheet extends StatelessWidget {
  final String title;
  final String message;

  const GuestAuthPromptBottomSheet({
    super.key,
    required this.title,
    required this.message,
  });

  /// Show the guest auth prompt bottom sheet
  static Future<bool?> show(
    BuildContext context, {
    String title = 'Đăng nhập để tiếp tục',
    String message = 'Vui lòng đăng nhập để sử dụng tính năng này',
  }) {
    return showModalBottomSheet<bool>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => GuestAuthPromptBottomSheet(
        title: title,
        message: message,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          PhosphorIcon(
            PhosphorIconsLight.user,
            size: 64,
            color: Theme.of(context).colorScheme.primary,
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: AppTypography.titleLarge(),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: AppTypography.bodyMedium(),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                context.push(AppRoutes.authLogin);
              },
              child: const Text('Đăng nhập'),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {
                Navigator.pop(context);
                context.push(AppRoutes.authRegister);
              },
              child: const Text('Đăng ký tài khoản mới'),
            ),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Tiếp tục dưới dạng khách'),
          ),
        ],
      ),
    );
  }
}
