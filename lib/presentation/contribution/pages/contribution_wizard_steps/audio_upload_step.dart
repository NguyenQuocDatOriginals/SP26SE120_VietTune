import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/contribution_providers.dart';
import '../../../../core/utils/audio_utils.dart';
import '../../../../core/utils/audio_metadata_extractor.dart';
import '../../../../core/utils/constants.dart';
import '../../../../domain/entities/audio_metadata.dart';

/// Step 1: Audio Upload
class AudioUploadStep extends ConsumerStatefulWidget {
  const AudioUploadStep({super.key});

  @override
  ConsumerState<AudioUploadStep> createState() => _AudioUploadStepState();
}

class _AudioUploadStepState extends ConsumerState<AudioUploadStep> {
  bool _isExtracting = false;
  String? _extractError;

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(contributionFormProvider);
    final formNotifier = ref.read(contributionFormProvider.notifier);
    final audioMetadata = formState.songData?.audioMetadata;
    final audioUrl = audioMetadata?.url;

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
          if (_isExtracting)
            const Row(
              children: [
                SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                SizedBox(width: 12),
                Text('Đang nhận diện thông tin file...'),
              ],
            ),
          if (_extractError != null) ...[
            const SizedBox(height: 8),
            Text(
              _extractError!,
              style: const TextStyle(color: Colors.red),
            ),
          ],
          if (audioMetadata != null &&
              (audioMetadata.format != null ||
                  audioMetadata.bitrate != null ||
                  audioMetadata.sampleRate != null))
            _buildMetadataCard(context, audioMetadata),
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
        type: FileType.custom,
        allowedExtensions: AppConstants.supportedAudioFormats,
        withData: true, // Get bytes for web compatibility
      );

      if (result == null || result.files.isEmpty) {
        return;
      }

      final pickedFile = result.files.single;
      final fileSize = pickedFile.size;
      
      // On web, path is unavailable - we must use bytes instead
      String? filePath;
      if (kIsWeb) {
        // On web, we can't access path - use bytes and skip metadata extraction
        if (pickedFile.bytes == null) {
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Không thể đọc file. Vui lòng thử lại.'),
              ),
            );
          }
          return;
        }
        
        // Use a placeholder path for web
        filePath = 'web://${pickedFile.name}';
        
        // Update URL but skip metadata extraction on web
        notifier.updateAudioUrl(filePath);
        
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('File đã được chọn. Trên web, việc nhận diện thông số file có thể bị hạn chế.'),
              duration: Duration(seconds: 3),
            ),
          );
        }
        return;
      } else {
        // On mobile/desktop, access path normally
        filePath = pickedFile.path;
        
        if (filePath == null) {
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Không thể truy cập đường dẫn file. Vui lòng thử lại.'),
              ),
            );
          }
          return;
        }
      }

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

      // In a real app, you would upload the file and get a URL.
      // For now, we'll just use the file path.
      notifier.updateAudioUrl(filePath);

      setState(() {
        _isExtracting = true;
        _extractError = null;
      });

      final metadata = await AudioMetadataExtractor.extractFromFile(
        filePath,
        fileSizeBytes: fileSize,
      );

      if (!mounted) return;

      if (metadata == null) {
        setState(() {
          _isExtracting = false;
          _extractError =
              'Không thể tự nhận diện thông tin file. Bạn có thể tiếp tục.';
        });
        return;
      }

      notifier.updateAudioMetadataExtracted(metadata);

      setState(() {
        _isExtracting = false;
        _extractError = null;
      });
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

  Widget _buildMetadataCard(BuildContext context, AudioMetadata audioMetadata) {
    final duration =
        _formatDuration(Duration(seconds: audioMetadata.durationInSeconds));
    final format = audioMetadata.format?.toUpperCase() ?? 'Không xác định';
    final bitrate = audioMetadata.bitrate != null && audioMetadata.bitrate! > 0
        ? '${audioMetadata.bitrate} kbps'
        : 'Không xác định';
    final sampleRate =
        audioMetadata.sampleRate != null && audioMetadata.sampleRate! > 0
            ? '${audioMetadata.sampleRate} Hz'
            : 'Không xác định';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.info_outline, color: Theme.of(context).primaryColor, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Thông tin ghi âm',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildMetadataRow('Định dạng file', format),
            _buildMetadataRow('Bitrate', bitrate),
            _buildMetadataRow('Sample rate', sampleRate),
            _buildMetadataRow('Thời lượng', duration),
          ],
        ),
      ),
    );
  }

  Widget _buildMetadataRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = duration.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }
}
