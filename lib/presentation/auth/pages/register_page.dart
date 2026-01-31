import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../../core/utils/constants.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../../../domain/failures/failure.dart';

class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Đăng ký'),
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.textOnGradient,
      ),
      body: Container(
        decoration: AppTheme.gradientBackground,
        child: SafeArea(
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 40),
                  Text(
                    'Tạo tài khoản mới',
                    textAlign: TextAlign.center,
                    style: AppTypography.heading4(color: AppColors.textOnGradient).copyWith(letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Tham gia cộng đồng bảo tồn âm nhạc truyền thống',
                    textAlign: TextAlign.center,
                    style: AppTypography.bodyLarge(color: AppColors.textSecondaryOnGradient).copyWith(letterSpacing: 0.3),
                  ),
                  const SizedBox(height: 48),
                  Card(
                    elevation: 8,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    color: AppColors.surface.withValues(alpha: 0.95),
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          TextField(
                            controller: _nameController,
                            textInputAction: TextInputAction.next,
                            style: AppTypography.bodyLarge(color: AppColors.textPrimary),
                            decoration: InputDecoration(
                              labelText: 'Họ tên',
                              labelStyle: AppTypography.labelLarge(color: AppColors.textSecondary),
                              prefixIcon: PhosphorIcon(
                                PhosphorIconsLight.user,
                                color: AppColors.primary,
                              ),
                              filled: true,
                              fillColor: AppColors.secondaryLight,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: AppColors.divider,
                                ),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: AppColors.divider,
                                ),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: AppColors.primaryRed,
                                  width: 2,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),
                          TextField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            textInputAction: TextInputAction.next,
                            style: AppTypography.bodyLarge(color: AppColors.textPrimary),
                            decoration: InputDecoration(
                              labelText: 'Email',
                              labelStyle: AppTypography.labelLarge(color: AppColors.textSecondary),
                              prefixIcon: PhosphorIcon(
                                PhosphorIconsLight.envelope,
                                color: AppColors.primary,
                              ),
                              filled: true,
                              fillColor: AppColors.secondaryLight,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: AppColors.divider,
                                ),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: AppColors.divider,
                                ),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: AppColors.primaryRed,
                                  width: 2,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),
                          TextField(
                            controller: _passwordController,
                            obscureText: true,
                            textInputAction: TextInputAction.next,
                            style: AppTypography.bodyLarge(color: AppColors.textPrimary),
                            decoration: InputDecoration(
                              labelText: 'Mật khẩu',
                              labelStyle: AppTypography.labelLarge(color: AppColors.textSecondary),
                              prefixIcon: PhosphorIcon(
                                PhosphorIconsLight.lock,
                                color: AppColors.primary,
                              ),
                              filled: true,
                              fillColor: AppColors.secondaryLight,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: AppColors.divider,
                                ),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: AppColors.divider,
                                ),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: AppColors.primaryRed,
                                  width: 2,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),
                          TextField(
                            controller: _confirmController,
                            obscureText: true,
                            textInputAction: TextInputAction.done,
                            onSubmitted: (_) => _handleRegister(),
                            style: AppTypography.bodyLarge(color: AppColors.textPrimary),
                            decoration: InputDecoration(
                              labelText: 'Xác nhận mật khẩu',
                              labelStyle: AppTypography.labelLarge(color: AppColors.textSecondary),
                              prefixIcon: PhosphorIcon(
                                PhosphorIconsLight.lock,
                                color: AppColors.primary,
                              ),
                              filled: true,
                              fillColor: AppColors.secondaryLight,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: AppColors.divider,
                                ),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: AppColors.divider,
                                ),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: AppColors.primaryRed,
                                  width: 2,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 32),
                          SizedBox(
                            height: 52,
                            child: ElevatedButton(
                              onPressed: _isLoading ? null : _handleRegister,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primaryRed,
                                foregroundColor: AppColors.textOnGradient,
                                elevation: 4,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: _isLoading
                                  ? SizedBox(
                                      height: 24,
                                      width: 24,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2.5,
                                        valueColor: AlwaysStoppedAnimation<Color>(
                                          AppColors.textOnGradient,
                                        ),
                                      ),
                                    )
                                  : Text(
                                      'Tạo tài khoản',
                                      style: AppTypography.button(color: AppColors.textOnGradient).copyWith(letterSpacing: 0.5),
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  TextButton(
                    onPressed: () => context.go(AppRoutes.authLogin),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.textOnGradient,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: Text(
                      'Đã có tài khoản? Đăng nhập',
                      style: AppTypography.bodyMedium(color: AppColors.textOnGradient).copyWith(
                        decoration: TextDecoration.underline,
                        decorationColor: AppColors.textOnGradient,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _handleRegister() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();
    final confirm = _confirmController.text.trim();

    if (name.isEmpty || email.isEmpty || password.isEmpty) {
      _showError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (password != confirm) {
      _showError('Mật khẩu xác nhận không khớp');
      return;
    }

    setState(() => _isLoading = true);
    final result = await ref.read(authProvider.notifier).register(
          email: email,
          password: password,
          name: name,
        );
    if (!mounted) return;
    setState(() => _isLoading = false);

    result.fold(
      (failure) => _showError(_failureMessage(failure)),
      (_) => context.go(AppRoutes.home),
    );
  }

  String _failureMessage(Failure failure) {
    return failure.when(
      server: (message, _) => message,
      network: (message) => message,
      cache: (message) => message,
      validation: (message, _) => message,
      notFound: (message, _) => message,
      unauthorized: (message) => message,
    );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}
