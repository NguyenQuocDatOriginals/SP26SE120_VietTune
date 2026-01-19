import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/contribution_providers.dart';
import '../../../../domain/entities/enums.dart';
import '../../../../domain/entities/contribution_request.dart';
import '../../../../domain/usecases/contribution/submit_contribution.dart';
import '../../../../core/di/injection.dart';
import '../../../auth/providers/auth_provider.dart';

/// Step 5: Review and Submit
class ReviewSubmitStep extends ConsumerStatefulWidget {
  const ReviewSubmitStep({super.key});

  @override
  ConsumerState<ReviewSubmitStep> createState() => _ReviewSubmitStepState();
}

class _ReviewSubmitStepState extends ConsumerState<ReviewSubmitStep> {
  bool _isSubmitting = false;

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
          _showError('Lỗi: ${failure.message}');
        },
        (contribution) {
          formNotifier.reset();
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Đóng góp đã được gửi thành công!'),
                backgroundColor: Colors.green,
              ),
            );
            Navigator.of(context).pop();
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
    final formState = ref.watch(contributionFormProvider);
    final song = formState.songData;

    if (song == null) {
      return const Center(child: Text('Không có dữ liệu để xem xét'));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bước 5: Xem xét và gửi',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 24),
          // Song title
          _buildReviewSection(
            context,
            'Tên bài hát',
            song.title,
            () => _navigateToStep(1),
          ),
          // Genre
          _buildReviewSection(
            context,
            'Thể loại',
            _getGenreText(song.genre),
            () => _navigateToStep(1),
          ),
          // Ethnic group
          _buildReviewSection(
            context,
            'Dân tộc',
            song.ethnicGroupId,
            () => _navigateToStep(1),
          ),
          // Audio
          if (song.audioMetadata != null)
            _buildReviewSection(
              context,
              'File âm thanh',
              song.audioMetadata!.url,
              () => _navigateToStep(0),
            ),
          // Cultural context
          if (song.culturalContext != null)
            _buildReviewSection(
              context,
              'Bối cảnh văn hóa',
              _getContextTypeText(song.culturalContext!.type),
              () => _navigateToStep(2),
            ),
          // Lyrics
          if (song.lyricsNativeScript != null ||
              song.lyricsVietnameseTranslation != null)
            _buildReviewSection(
              context,
              'Lời bài hát',
              song.lyricsNativeScript ?? song.lyricsVietnameseTranslation ?? '',
              () => _navigateToStep(3),
            ),
          const SizedBox(height: 32),
          // Submit button
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
      margin: const EdgeInsets.only(bottom: 16),
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

  String _getGenreText(MusicGenre genre) {
    switch (genre) {
      case MusicGenre.folk:
        return 'Dân ca';
      case MusicGenre.ceremonial:
        return 'Nghi lễ';
      case MusicGenre.courtMusic:
        return 'Nhã nhạc';
      case MusicGenre.operatic:
        return 'Tuồng';
      case MusicGenre.contemporary:
        return 'Đương đại';
    }
  }

  String _getContextTypeText(ContextType type) {
    switch (type) {
      case ContextType.wedding:
        return 'Đám cưới';
      case ContextType.funeral:
        return 'Đám tang';
      case ContextType.festival:
        return 'Lễ hội';
      case ContextType.religious:
        return 'Tôn giáo';
      case ContextType.entertainment:
        return 'Giải trí';
      case ContextType.work:
        return 'Lao động';
      case ContextType.lullaby:
        return 'Ru con';
    }
  }
}
