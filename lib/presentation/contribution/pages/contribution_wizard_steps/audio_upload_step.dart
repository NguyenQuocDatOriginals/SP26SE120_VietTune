import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/contribution_providers.dart';
import '../../../../core/utils/audio_utils.dart';
import '../../../../core/utils/constants.dart';

/// Step 1: Audio Upload
class AudioUploadStep extends ConsumerWidget {
  const AudioUploadStep({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final formState = ref.watch(contributionFormProvider);
    final formNotifier = ref.read(contributionFormProvider.notifier);
    final audioUrl = formState.songData?.audioMetadata?.url;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bước 1: Tải lên file âm thanh',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Chọn file âm thanh từ thiết bị hoặc ghi âm trực tiếp',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          // File picker button
          ElevatedButton.icon(
            onPressed: () => _pickAudioFile(context, formNotifier),
            icon: const Icon(Icons.upload_file),
            label: const Text('Chọn file từ thiết bị'),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 48),
            ),
          ),
          const SizedBox(height: 16),
          // Record button
          OutlinedButton.icon(
            onPressed: () => _showRecordDialog(context, formNotifier),
            icon: const Icon(Icons.mic),
            label: const Text('Ghi âm trực tiếp'),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(double.infinity, 48),
            ),
          ),
          const SizedBox(height: 24),
          // Selected file info
          if (audioUrl != null && audioUrl.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.green[50],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.green),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: Colors.green),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'File đã chọn',
                          style: Theme.of(context).textTheme.titleSmall,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          audioUrl,
                          style: Theme.of(context).textTheme.bodySmall,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => formNotifier.updateAudioUrl(null),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 16),
          // Supported formats info
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.blue[50],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, color: Colors.blue),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Định dạng hỗ trợ: ${AudioUtils.getSupportedFormatsString()}\n'
                    'Kích thước tối đa: ${(AppConstants.maxAudioFileSize / (1024 * 1024)).toInt()}MB',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickAudioFile(
    BuildContext context,
    ContributionFormNotifier notifier,
  ) async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.audio,
        allowedExtensions: AppConstants.supportedAudioFormats,
      );

      if (result != null && result.files.single.path != null) {
        final filePath = result.files.single.path!;
        final fileSize = result.files.single.size;

        if (!AudioUtils.isValidAudioFileSize(fileSize)) {
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(AudioUtils.getAudioFileSizeErrorMessage()),
              ),
            );
          }
          return;
        }

        // In a real app, you would upload the file and get a URL
        // For now, we'll just use the file path
        notifier.updateAudioUrl(filePath);
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error picking file: $e')),
        );
      }
    }
  }

  void _showRecordDialog(
    BuildContext context,
    ContributionFormNotifier notifier,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Ghi âm'),
        content: const Text('Tính năng ghi âm sẽ được triển khai sau'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }
}
