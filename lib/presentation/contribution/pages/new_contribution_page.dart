import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../contribution/providers/contribution_providers.dart';
import 'contribution_wizard_steps/audio_upload_step.dart';
import 'contribution_wizard_steps/basic_info_step.dart';
import 'contribution_wizard_steps/cultural_context_step.dart';
import 'contribution_wizard_steps/performance_details_step.dart';
import 'contribution_wizard_steps/notes_copyright_step.dart';
import '../../../core/utils/constants.dart';

class NewContributionPage extends ConsumerWidget {
  const NewContributionPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final formState = ref.watch(contributionFormProvider);
    final formNotifier = ref.read(contributionFormProvider.notifier);

    final steps = [
      const AudioUploadStep(),
      const BasicInfoStep(),
      const CulturalContextStep(),
      const PerformanceDetailsStep(),
      const NotesCopyrightStep(),
    ];

    final stepTitles = [
      'Tải lên & Tự nhận diện',
      'Thông tin định danh',
      'Bối cảnh văn hóa',
      'Chi tiết biểu diễn',
      'Ghi chú & Bản quyền',
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Đóng góp mới'),
        actions: [
          if (formState.currentStep > 0)
            TextButton(
              onPressed: () => formNotifier.reset(),
              child: const Text('Hủy'),
            ),
        ],
      ),
      body: Column(
        children: [
          // Step indicator
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: List.generate(
                steps.length,
                (index) => Expanded(
                  child: Row(
                    children: [
                      Expanded(
                        child: Container(
                          height: 4,
                          decoration: BoxDecoration(
                            color: index <= formState.currentStep
                                ? Theme.of(context).colorScheme.primary
                                : Colors.grey[300],
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                      if (index < steps.length - 1) const SizedBox(width: 8),
                    ],
                  ),
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Bước ${formState.currentStep + 1}/${steps.length}',
                  style: Theme.of(context).textTheme.titleSmall,
                ),
                Text(
                  stepTitles[formState.currentStep],
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
          ),
          const Divider(),
          // Step content
          Expanded(
            child: steps[formState.currentStep],
          ),
          // Navigation buttons
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).scaffoldBackgroundColor,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 4,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                if (formState.currentStep > 0)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => formNotifier.updateStep(
                        formState.currentStep - 1,
                      ),
                      child: const Text('Quay lại'),
                    ),
                  ),
                if (formState.currentStep > 0) const SizedBox(width: 16),
                // Hide "Tiếp theo" button on last step (NotesCopyrightStep has its own submit button)
                if (formState.currentStep < steps.length - 1)
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        if (formNotifier.canProceedToNextStep()) {
                          formNotifier.updateStep(formState.currentStep + 1);
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: formNotifier.canProceedToNextStep()
                            ? null // Use default primary color
                            : Colors.grey,
                        foregroundColor: formNotifier.canProceedToNextStep()
                            ? null // Use default text color
                            : Colors.grey[600],
                      ),
                      child: const Text('Tiếp theo'),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
