import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../contribution/providers/contribution_providers.dart';
import 'contribution_wizard_steps/audio_upload_step.dart';
import 'contribution_wizard_steps/identity_step.dart';
import 'contribution_wizard_steps/people_step.dart';
import 'contribution_wizard_steps/cultural_context_step.dart';
import 'contribution_wizard_steps/performance_details_step.dart';
import 'contribution_wizard_steps/review_submit_step.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/contribution_draft_service.dart';
import '../../../core/services/haptic_service.dart';
import '../../../core/di/injection.dart';
import '../../shared/widgets/step_navigator.dart';

class NewContributionPage extends ConsumerStatefulWidget {
  const NewContributionPage({super.key});

  @override
  ConsumerState<NewContributionPage> createState() => _NewContributionPageState();
}

class _NewContributionPageState extends ConsumerState<NewContributionPage> {
  final ContributionDraftService _draftService = getIt<ContributionDraftService>();
  bool _hasCheckedDraft = false;
  int _previousStep = 0;
  
  // Create step widgets once to ensure stable references for AnimatedSwitcher
  late final List<Widget> _steps = [
    const AudioUploadStep(),
    const IdentityStep(),
    const PeopleStep(),
    const CulturalContextStep(),
    const PerformanceDetailsStep(),
    const ReviewSubmitStep(), // Merged: Notes + Copyright + Review
  ];
  
  static const List<String> _stepTitles = [
    'Tải lên & Tự nhận diện',
    'Thông tin định danh',
    'Thông tin người thực hiện',
    'Bối cảnh văn hóa',
    'Chi tiết biểu diễn',
    'Xem lại & Gửi',
  ];
  
  static const List<IconData> _stepIcons = [
    Icons.upload_file,
    Icons.info_outline,
    Icons.people_outline,
    Icons.public,
    Icons.music_note,
    Icons.rate_review,
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkForDraft();
    });
  }

  Future<void> _checkForDraft() async {
    if (_hasCheckedDraft) return;
    _hasCheckedDraft = true;

    final hasDraft = await _draftService.hasDraft();
    if (!hasDraft || !mounted) return;

    final draft = await _draftService.loadDraft();
    if (draft == null || !mounted) return;

    final draftAge = await _draftService.getDraftAge();
    final ageText = draftAge != null
        ? _formatDraftAge(draftAge)
        : '';

    if (!mounted) return;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Tiếp tục bản nháp?'),
        content: Text(
          'Bạn có một bản nháp chưa hoàn thành$ageText.\n\nBạn muốn tiếp tục hay bắt đầu mới?',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _draftService.clearDraft();
            },
            child: const Text('Bắt đầu mới'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _resumeDraft(draft);
            },
            child: const Text('Tiếp tục'),
          ),
        ],
      ),
    );
  }

  String _formatDraftAge(Duration age) {
    if (age.inDays > 0) {
      return ' (${age.inDays} ngày trước)';
    } else if (age.inHours > 0) {
      return ' (${age.inHours} giờ trước)';
    } else if (age.inMinutes > 0) {
      return ' (${age.inMinutes} phút trước)';
    }
    return ' (vừa xong)';
  }

  void _resumeDraft(DraftData draft) {
    final notifier = ref.read(contributionFormProvider.notifier);
    notifier.loadDraft().then((_) {
      if (mounted) {
        // Navigate to the step where user left off
        notifier.updateStep(draft.currentStep);
      }
    });
  }

  Future<void> _showCancelConfirmation(
    BuildContext context,
    ContributionFormNotifier formNotifier,
  ) async {
    final result = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hủy đóng góp?'),
        content: const Text(
          'Bạn có muốn lưu bản nháp trước khi hủy không?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop('cancel'),
            child: const Text('Tiếp tục chỉnh sửa'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop('discard'),
            child: const Text(
              'Hủy không lưu',
              style: TextStyle(color: Colors.red),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop('save'),
            child: const Text('Lưu bản nháp'),
          ),
        ],
      ),
    );

    if (result == null || result == 'cancel') return;

    if (result == 'save') {
      // Draft is already auto-saving, just close
      if (mounted) {
        Navigator.of(context).pop();
      }
    } else if (result == 'discard') {
      // Clear draft and close
      await _draftService.clearDraft();
      formNotifier.reset();
      if (mounted) {
        Navigator.of(context).pop();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(contributionFormProvider);
    final formNotifier = ref.read(contributionFormProvider.notifier);

    // Calculate progress
    final progressPercentage = ((formState.currentStep + 1) / _steps.length * 100).round();
    final estimatedMinutes = (_steps.length - formState.currentStep - 1) * 2;
    
    // Update previous step for animation direction (only update if changed)
    final currentStep = formState.currentStep;
    if (currentStep != _previousStep) {
      // Use a post-frame callback to avoid updating during build
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted && currentStep != _previousStep) {
          setState(() {
            _previousStep = currentStep;
          });
        }
      });
    }

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Đóng góp mới'),
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.textPrimary,
        automaticallyImplyLeading: true,
        actions: [
          if (formState.currentStep > 0)
            Semantics(
              label: 'Hủy và quay lại',
              button: true,
              child: TextButton(
                onPressed: () => _showCancelConfirmation(context, formNotifier),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.textPrimary,
                ),
                child: const Text('Hủy'),
              ),
            ),
        ],
      ),
      body: Container(
        decoration: AppTheme.gradientBackground,
        child: SafeArea(
          child: Column(
        children: [
          // Step Navigator
          Semantics(
            label: 'Điều hướng các bước. Bước hiện tại: ${_stepTitles[formState.currentStep]}',
            hint: 'Chạm để chuyển đến bước khác',
            child: StepNavigator(
              currentStep: formState.currentStep,
              totalSteps: _steps.length,
              stepTitles: _stepTitles,
              stepIcons: _stepIcons,
              onStepTap: (index) {
                if (formNotifier.canJumpToStep(index)) {
                  formNotifier.updateStep(index);
                  // Announce step change for screen readers
                  if (mounted) {
                    try {
                      SemanticsService.announce(
                        'Đã chuyển đến ${_stepTitles[index]}',
                        TextDirection.ltr,
                      );
                    } catch (e) {
                      // SemanticsService might not be available on all platforms
                      debugPrint('Could not announce step change: $e');
                    }
                  }
                } else {
                  // Show message that step is not available
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        'Vui lòng hoàn thành các bước trước để tiếp tục',
                      ),
                      duration: const Duration(seconds: 2),
                    ),
                  );
                }
              },
              canJumpToStep: (step) => formNotifier.canJumpToStep(step),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Bước ${formState.currentStep + 1}/${_steps.length}',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      '$progressPercentage%',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _stepTitles[formState.currentStep],
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: AppColors.textSecondary,
                        fontSize: (14 * MediaQuery.of(context).textScaleFactor.clamp(0.8, 1.3)),
                      ),
                    ),
                    if (estimatedMinutes > 0)
                      Text(
                        '~$estimatedMinutes phút',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textTertiary,
                          fontSize: (12 * MediaQuery.of(context).textScaleFactor.clamp(0.8, 1.3)),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                // Progress bar
                            ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: (formState.currentStep + 1) / _steps.length,
                                backgroundColor: AppColors.divider,
                                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                                minHeight: 6,
                              ),
                            ),
              ],
            ),
          ),
          // Step content with animation
          Expanded(
            child: Semantics(
              label: 'Nội dung bước ${formState.currentStep + 1}: ${_stepTitles[formState.currentStep]}',
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                transitionBuilder: (child, animation) {
                  // Use _previousStep for animation direction to avoid accessing formState during animation
                  final isForward = formState.currentStep >= _previousStep;
                  return SlideTransition(
                    position: Tween<Offset>(
                      begin: Offset(isForward ? 1.0 : -1.0, 0),
                      end: Offset.zero,
                    ).animate(CurvedAnimation(
                      parent: animation,
                      curve: Curves.easeInOut,
                    )),
                    child: FadeTransition(
                      opacity: animation,
                      child: child,
                    ),
                  );
                },
                child: (formState.currentStep >= 0 && formState.currentStep < _steps.length)
                    ? _steps[formState.currentStep]
                    : const SizedBox.shrink(key: ValueKey('empty')),
              ),
            ),
          ),
          // Navigation buttons
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.backgroundDark.withValues(alpha: 0.9),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.2),
                  blurRadius: 8,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                if (formState.currentStep > 0)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        HapticService.onButtonTap();
                        formNotifier.updateStep(
                          formState.currentStep - 1,
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.textPrimary,
                        side: const BorderSide(
                          color: AppColors.textPrimary,
                          width: 1.5,
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        'Quay lại',
                        style: TextStyle(
                          fontSize: (16 * MediaQuery.of(context).textScaleFactor.clamp(0.8, 1.3)),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                            if (formState.currentStep > 0) const SizedBox(width: 16),
                            // Hide "Tiếp theo" button on last step (ReviewSubmitStep has its own submit button)
                            if (formState.currentStep < _steps.length - 1) ...[
                              // Skip button for optional steps (Cultural Context = 3)
                              if (formState.currentStep == 3)
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: TextButton(
                        onPressed: () {
                          HapticService.onButtonTap();
                          formNotifier.updateStep(formState.currentStep + 1);
                        },
                        style: TextButton.styleFrom(
                          foregroundColor: AppColors.textSecondary,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 16,
                          ),
                        ),
                        child: const Text(
                          'Bỏ qua',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  Expanded(
                    child: Builder(
                      builder: (context) {
                        final canProceed = formNotifier.canProceedToNextStep();
                        return canProceed
                            ? AppTheme.createPillButton(
                                onPressed: () {
                                  HapticService.onStepComplete();
                                  formNotifier.updateStep(formState.currentStep + 1);
                                },
                                isFullWidth: true,
                                child: const Text(
                                  'Tiếp theo',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              )
                            : Container(
                                decoration: BoxDecoration(
                                  color: AppColors.divider,
                                  borderRadius: BorderRadius.circular(28),
                                ),
                                child: ElevatedButton(
                                  onPressed: null,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.transparent,
                                    foregroundColor: AppColors.textSecondary,
                                    shadowColor: Colors.transparent,
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 32,
                                      vertical: 16,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(28),
                                    ),
                                    elevation: 0,
                                  ),
                                  child: const Text(
                                    'Tiếp theo',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              );
                      },
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
          ),
        ),
      ),
    );
  }
}
