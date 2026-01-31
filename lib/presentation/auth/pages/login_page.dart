import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../../core/utils/constants.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../../../domain/failures/failure.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                  // Logo/Title
                  Text(
                    'VietTune Archive',
                    textAlign: TextAlign.center,
                    style: AppTypography.heading4(color: AppColors.textOnGradient).copyWith(letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Đăng nhập để tiếp tục',
                    textAlign: TextAlign.center,
                    style: AppTypography.bodyLarge(color: AppColors.textSecondaryOnGradient).copyWith(letterSpacing: 0.3),
                  ),
                  const SizedBox(height: 48),
                  // Login Form Card
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
                            textInputAction: TextInputAction.done,
                            onSubmitted: (_) => _handleLogin(),
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
                          const SizedBox(height: 32),
                          SizedBox(
                            height: 52,
                            child: ElevatedButton(
                              onPressed: _isLoading ? null : _handleLogin,
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
                                      'Đăng nhập',
                                      style: AppTypography.button(color: AppColors.textOnGradient).copyWith(letterSpacing: 0.5),
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Register Link
                  TextButton(
                    onPressed: () => context.go(AppRoutes.authRegister),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.textOnGradient,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: Text(
                      'Chưa có tài khoản? Đăng ký',
                      style: AppTypography.bodyMedium(color: AppColors.textOnGradient).copyWith(
                        decoration: TextDecoration.underline,
                        decorationColor: AppColors.textOnGradient,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  // Demo Accounts Card
                  _buildSampleAccounts(context),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSampleAccounts(BuildContext context) {
    return Card(
      elevation: 6,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      color: AppColors.surface.withValues(alpha: 0.9),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                PhosphorIcon(
                  PhosphorIconsLight.info,
                  size: 20,
                  color: AppColors.info,
                ),
                const SizedBox(width: 8),
                Text(
                  'Tài khoản demo',
                  style: AppTypography.heading5(color: AppColors.textPrimary),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildDemoAccountRow(
              'Researcher',
              'researcher@viettune.vn',
              context,
              onTap: () => _fillDemoCredentials('researcher@viettune.vn'),
            ),
            const SizedBox(height: 8),
            _buildDemoAccountRow(
              'Contributor',
              'contributor@viettune.vn',
              context,
              onTap: () => _fillDemoCredentials('contributor@viettune.vn'),
            ),
            const SizedBox(height: 8),
            _buildDemoAccountRow(
              'Expert',
              'expert@viettune.vn',
              context,
              onTap: () => _fillDemoCredentials('expert@viettune.vn'),
            ),
            const SizedBox(height: 12),
            Divider(color: AppColors.divider),
            const SizedBox(height: 12),
            Row(
              children: [
                PhosphorIcon(
                  PhosphorIconsLight.lock,
                  size: 16,
                  color: AppColors.textSecondary,
                ),
                const SizedBox(width: 8),
                Text(
                  'Mật khẩu: ',
                  style: AppTypography.bodyMedium(color: AppColors.textSecondary),
                ),
                Text(
                  'password123',
                  style: AppTypography.labelLarge(color: AppColors.textPrimary),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDemoAccountRow(
    String role,
    String email,
    BuildContext context, {
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
        child: Row(
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: AppColors.primaryRed,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                '$role: ',
                style: AppTypography.labelMedium(color: AppColors.textSecondary),
              ),
            ),
            Expanded(
              flex: 2,
              child: Text(
                email,
                style: AppTypography.bodySmall(color: AppColors.textPrimary),
              ),
            ),
            if (onTap != null) ...[
              const SizedBox(width: 8),
              PhosphorIcon(
                PhosphorIconsLight.handPointing,
                size: 16,
                color: AppColors.primary.withValues(alpha: 0.6),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _fillDemoCredentials(String email) {
    _emailController.text = email;
    _passwordController.text = 'password123';
  }

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();
    if (email.isEmpty || password.isEmpty) {
      _showError('Vui lòng nhập email và mật khẩu');
      return;
    }

    setState(() => _isLoading = true);
    final result = await ref.read(authProvider.notifier).login(
          email: email,
          password: password,
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
