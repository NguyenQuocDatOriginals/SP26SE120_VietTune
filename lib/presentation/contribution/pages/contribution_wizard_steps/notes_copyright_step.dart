import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/contribution_providers.dart';
import '../../../../domain/entities/enums.dart';
import '../../../../domain/entities/contribution_request.dart';
import '../../../../domain/usecases/contribution/submit_contribution.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/utils/constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/app_theme.dart' show AppColors;
import '../../../auth/providers/auth_provider.dart';

/// Step 5: Notes & Copyright
class NotesCopyrightStep extends ConsumerStatefulWidget {
  const NotesCopyrightStep({super.key});

  @override
  ConsumerState<NotesCopyrightStep> createState() =>
      _NotesCopyrightStepState();
}

class _NotesCopyrightStepState extends ConsumerState<NotesCopyrightStep> {
  final _nativeScriptController = TextEditingController();
  final _vietnameseTranslationController = TextEditingController();
  final _copyrightController = TextEditingController();
  final _fieldNotesController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    // Initialize from existing data after first build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        final song = ref.read(contributionFormProvider).songData;
        if (song != null) {
          setState(() {
            _nativeScriptController.text = song.lyricsNativeScript ?? '';
            _vietnameseTranslationController.text =
                song.lyricsVietnameseTranslation ?? '';
            _copyrightController.text = song.copyrightInfo ?? '';
            _fieldNotesController.text = song.fieldNotes ?? '';
          });
        }
      }
    });
  }

  @override
  void dispose() {
    _nativeScriptController.dispose();
    _vietnameseTranslationController.dispose();
    _copyrightController.dispose();
    _fieldNotesController.dispose();
    super.dispose();
  }

  void _updateNotes() {
    final notifier = ref.read(contributionFormProvider.notifier);
    notifier.updateLyrics(
      nativeScript: _nativeScriptController.text.isEmpty
          ? null
          : _nativeScriptController.text,
      vietnameseTranslation: _vietnameseTranslationController.text.isEmpty
          ? null
          : _vietnameseTranslationController.text,
    );
    notifier.updateCopyrightInfo(
      _copyrightController.text.isEmpty ? null : _copyrightController.text,
    );
    notifier.updateFieldNotes(
      _fieldNotesController.text.isEmpty ? null : _fieldNotesController.text,
    );
  }

  Future<void> _submitContribution() async {
    final formState = ref.read(contributionFormProvider);
    final formNotifier = ref.read(contributionFormProvider.notifier);
    final song = formState.songData;
    final user = ref.read(currentUserProvider);

    if (song == null || user == null) {
      _showError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final useCase = getIt<SubmitContribution>();
      final contribution = ContributionRequest(
        id: '',
        userId: user.id,
        type: ContributionType.newSong,
        status: VerificationStatus.pending,
        songData: song,
        submittedAt: DateTime.now(),
      );

      final result = await useCase(contribution);

      result.fold(
        (failure) {
          if (mounted) {
            _showError('Lỗi: ${failure.message}');
          }
        },
        (_) {
          formNotifier.reset();
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Đóng góp đã được gửi thành công!'),
                backgroundColor: AppColors.success,
                duration: Duration(seconds: 2),
              ),
            );
            // Navigate back to submissions page or home
            context.go(AppRoutes.home);
          }
        },
      );
    } catch (e) {
      _showError('Lỗi: $e');
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), backgroundColor: AppColors.error),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final song = ref.watch(contributionFormProvider).songData;
    if (song == null) {
      return const Center(child: Text('Không có dữ liệu để xem xét'));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 8, bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bước 5: Ghi chú & Bản quyền',
            style: AppTypography.heading4(color: AppColors.textPrimary).copyWith(
              fontWeight: FontWeight.bold,
              fontSize: 22,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Lời bài hát (ngôn ngữ gốc)',
            style: AppTypography.labelLarge(color: AppColors.textPrimary).copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _nativeScriptController,
            style: AppTypography.bodyLarge(color: AppColors.textPrimary),
            decoration: InputDecoration(
              filled: true,
              fillColor: AppColors.surface,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.divider),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.divider),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                  color: AppColors.primary,
                  width: 2,
                ),
              ),
            ),
            maxLines: 6,
            onChanged: (_) => _updateNotes(),
          ),
          const SizedBox(height: 16),
          Text(
            'Bản dịch tiếng Việt',
            style: AppTypography.labelLarge(color: AppColors.textPrimary).copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _vietnameseTranslationController,
            style: AppTypography.bodyLarge(color: AppColors.textPrimary),
            decoration: InputDecoration(
              filled: true,
              fillColor: AppColors.surface,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.divider),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.divider),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                  color: AppColors.primary,
                  width: 2,
                ),
              ),
            ),
            maxLines: 6,
            onChanged: (_) => _updateNotes(),
          ),
          const SizedBox(height: 16),
          Text(
            'Bản quyền/Tổ chức lưu trữ',
            style: AppTypography.labelLarge(color: AppColors.textPrimary).copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _copyrightController,
            style: AppTypography.bodyLarge(color: AppColors.textPrimary),
            decoration: InputDecoration(
              hintText: 'Thông tin bản quyền hoặc tổ chức lưu trữ',
              hintStyle: AppTypography.bodyMedium(color: AppColors.textSecondary),
              filled: true,
              fillColor: AppColors.surface,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.divider),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.divider),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                  color: AppColors.primary,
                  width: 2,
                ),
              ),
            ),
            maxLines: 3,
            onChanged: (_) => _updateNotes(),
          ),
          const SizedBox(height: 16),
          Text(
            'Ghi chú thực địa',
            style: AppTypography.labelLarge(color: AppColors.textPrimary).copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _fieldNotesController,
            style: AppTypography.bodyLarge(color: AppColors.textPrimary),
            decoration: InputDecoration(
              hintText: 'Ghi chú, quan sát khi thu âm',
              hintStyle: AppTypography.bodyMedium(color: AppColors.textSecondary),
              filled: true,
              fillColor: AppColors.surface,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.divider),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.divider),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                  color: AppColors.primary,
                  width: 2,
                ),
              ),
            ),
            maxLines: 4,
            onChanged: (_) => _updateNotes(),
          ),
          // Submit button removed - ReviewSubmitStep will handle submission
        ],
      ),
    );
  }

  Widget _buildReviewSection(
    BuildContext context,
    String label,
    String value,
    VoidCallback onEdit,
  ) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(label, style: AppTypography.titleSmall()),
        subtitle: Text(value),
        trailing: IconButton(
          icon: PhosphorIcon(PhosphorIconsLight.pencil),
          onPressed: onEdit,
        ),
      ),
    );
  }

  void _navigateToStep(int step) {
    ref.read(contributionFormProvider.notifier).updateStep(step);
  }
}
