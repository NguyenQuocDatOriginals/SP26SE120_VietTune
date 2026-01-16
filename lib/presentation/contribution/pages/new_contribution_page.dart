import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../contribution/providers/contribution_providers.dart';
import 'contribution_wizard_steps/audio_upload_step.dart';
import 'contribution_wizard_steps/basic_info_step.dart';
import 'contribution_wizard_steps/cultural_context_step.dart';
import 'contribution_wizard_steps/lyrics_step.dart';
import 'contribution_wizard_steps/review_submit_step.dart';

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
      const LyricsStep(),
      const ReviewSubmitStep(),
    ];

    final stepTitles = [
      'Tải lên',
      'Thông tin',
      'Bối cảnh',
      'Lời bài hát',
      'Xem xét',
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
                Expanded(
                  child: ElevatedButton(
                    onPressed: formNotifier.canProceedToNextStep() &&
                            formState.currentStep < steps.length - 1
                        ? () => formNotifier.updateStep(
                              formState.currentStep + 1,
                            )
                        : null,
                    child: Text(
                      formState.currentStep < steps.length - 1
                          ? 'Tiếp theo'
                          : 'Hoàn tất',
                    ),
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
