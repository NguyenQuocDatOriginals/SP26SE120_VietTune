import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/contribution_providers.dart';
import '../../../../domain/entities/enums.dart';
import '../../../../domain/entities/contribution_request.dart';
import '../../../../domain/usecases/contribution/submit_contribution.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/utils/constants.dart';
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
    final song = ref.read(contributionFormProvider).songData;
    if (song != null) {
      _nativeScriptController.text = song.lyricsNativeScript ?? '';
      _vietnameseTranslationController.text =
          song.lyricsVietnameseTranslation ?? '';
      _copyrightController.text = song.copyrightInfo ?? '';
      _fieldNotesController.text = song.fieldNotes ?? '';
    }
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
                backgroundColor: Colors.green,
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
        SnackBar(content: Text(message), backgroundColor: Colors.red),
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
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bước 5: Ghi chú & Bản quyền',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _nativeScriptController,
            decoration: const InputDecoration(
              labelText: 'Lời bài hát (ngôn ngữ gốc)',
              border: OutlineInputBorder(),
            ),
            maxLines: 6,
            onChanged: (_) => _updateNotes(),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _vietnameseTranslationController,
            decoration: const InputDecoration(
              labelText: 'Bản dịch tiếng Việt',
              border: OutlineInputBorder(),
            ),
            maxLines: 6,
            onChanged: (_) => _updateNotes(),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _copyrightController,
            decoration: const InputDecoration(
              labelText: 'Bản quyền/Tổ chức lưu trữ',
              border: OutlineInputBorder(),
              hintText: 'Thông tin bản quyền hoặc tổ chức lưu trữ',
            ),
            maxLines: 3,
            onChanged: (_) => _updateNotes(),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _fieldNotesController,
            decoration: const InputDecoration(
              labelText: 'Ghi chú thực địa',
              border: OutlineInputBorder(),
              hintText: 'Ghi chú, quan sát khi thu âm',
            ),
            maxLines: 4,
            onChanged: (_) => _updateNotes(),
          ),
          const SizedBox(height: 24),
          _buildReviewSection(
            context,
            'Tóm tắt',
            'Bài hát: ${song.title}',
            () => _navigateToStep(1),
          ),
          if (song.audioMetadata != null)
            _buildReviewSection(
              context,
              'File âm thanh',
              song.audioMetadata!.url,
              () => _navigateToStep(0),
            ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : _submitContribution,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Gửi đóng góp'),
            ),
          ),
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
        title: Text(label, style: Theme.of(context).textTheme.titleSmall),
        subtitle: Text(value),
        trailing: IconButton(
          icon: const Icon(Icons.edit),
          onPressed: onEdit,
        ),
      ),
    );
  }

  void _navigateToStep(int step) {
    ref.read(contributionFormProvider.notifier).updateStep(step);
  }
}
