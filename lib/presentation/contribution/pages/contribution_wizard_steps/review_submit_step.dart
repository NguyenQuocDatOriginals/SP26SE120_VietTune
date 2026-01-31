import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/contribution_providers.dart';
import '../../../../domain/entities/enums.dart';
import '../../../../domain/entities/contribution_request.dart';
import '../../../../domain/usecases/contribution/submit_contribution.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/contribution_draft_service.dart';
import '../../../../core/services/haptic_service.dart';
import '../../../../core/services/speech_to_text_service.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../../shared/widgets/progressive_disclosure_section.dart';
import '../../../shared/widgets/image_preview_widget.dart';
import '../../../shared/widgets/image_gallery_dialog.dart';
import '../../../shared/widgets/video_preview_widget.dart';
import '../../../shared/widgets/video_player_dialog.dart';
import '../../../../domain/entities/image_metadata.dart';
import '../../../../domain/entities/video_metadata.dart';
import '../../../../core/utils/video_utils.dart';

/// Step 5: Review and Submit
class ReviewSubmitStep extends ConsumerStatefulWidget {
  const ReviewSubmitStep({super.key});

  @override
  ConsumerState<ReviewSubmitStep> createState() => _ReviewSubmitStepState();
}

class _ReviewSubmitStepState extends ConsumerState<ReviewSubmitStep> {
  bool _isSubmitting = false;
  final _nativeScriptController = TextEditingController();
  final _vietnameseTranslationController = TextEditingController();
  final _copyrightController = TextEditingController();
  final _fieldNotesController = TextEditingController();
  bool _showNotesSection = false;
  final _speechService = getIt<SpeechToTextService>();
  bool _isListening = false;
  TextEditingController? _activeController;

  @override
  void initState() {
    super.initState();
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
            _showNotesSection = (song.lyricsNativeScript?.isNotEmpty ?? false) ||
                (song.lyricsVietnameseTranslation?.isNotEmpty ?? false) ||
                (song.copyrightInfo?.isNotEmpty ?? false) ||
                (song.fieldNotes?.isNotEmpty ?? false);
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
    _speechService.dispose();
    super.dispose();
  }
  
  Future<void> _startListening(TextEditingController controller) async {
    if (_isListening) {
      await _speechService.stopListening();
      setState(() {
        _isListening = false;
        _activeController = null;
      });
      return;
    }
    
    final available = await _speechService.checkAvailability();
    if (!available) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Speech recognition không khả dụng. Vui lòng kiểm tra quyền microphone.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
      return;
    }
    
    setState(() {
      _isListening = true;
      _activeController = controller;
    });
    
    await _speechService.startListening(
      onResult: (text) {
        if (mounted && _activeController == controller) {
          final currentText = controller.text;
          final newText = currentText.isEmpty
              ? text
              : '$currentText $text';
          controller.text = newText;
          _updateNotes();
        }
      },
    );
  }
  
  Future<void> _stopListening() async {
    await _speechService.stopListening();
    if (mounted) {
      setState(() {
        _isListening = false;
        _activeController = null;
      });
    }
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
          _showError('Lỗi: ${failure.message}');
        },
        (contribution) async {
          // Clear draft on successful submission
          final draftService = getIt<ContributionDraftService>();
          await draftService.clearDraft();
          
          formNotifier.reset();
          if (mounted) {
            // Show success celebration
            await _showSuccessCelebration(context);
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
        SnackBar(content: Text(message), backgroundColor: AppColors.error),
      );
    }
  }

  Future<void> _showSuccessCelebration(BuildContext context) async {
    // Show success dialog with animation
    await showDialog(
      context: context,
      barrierDismissible: false,
      useSafeArea: false,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Success icon with animation
              TweenAnimationBuilder<double>(
                tween: Tween(begin: 0.0, end: 1.0),
                duration: const Duration(milliseconds: 500),
                builder: (context, value, child) {
                  return Transform.scale(
                    scale: value,
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: AppColors.success,
                        shape: BoxShape.circle,
                      ),
                      child: PhosphorIcon(
                        PhosphorIconsLight.checkCircle,
                        color: AppColors.textOnPrimary,
                        size: 50,
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 24),
              Text(
                'Đóng góp thành công!',
                style: AppTypography.heading5(color: AppColors.textPrimary).copyWith(
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Cảm ơn bạn đã đóng góp vào kho tàng âm nhạc dân tộc Việt Nam',
                style: AppTypography.bodyMedium(color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              AppTheme.createPillButton(
                onPressed: () => Navigator.of(context).pop(),
                isFullWidth: true,
                child: Text(
                  'Đóng',
                  style: AppTypography.button(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(contributionFormProvider);
    final song = formState.songData;

    if (song == null) {
      return const Center(child: Text('Không có dữ liệu để xem xét'));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 8, bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bước 6: Xem xét, Ghi chú & Gửi',
            style: AppTypography.heading4(color: AppColors.textPrimary).copyWith(
              fontWeight: FontWeight.bold,
              fontSize: 22,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Xem lại thông tin và thêm ghi chú trước khi gửi',
            style: AppTypography.bodyMedium(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 24),
          // Review sections with inline editing
          _buildReviewSection(
            context,
            'Tên bài hát',
            song.title,
            () => _navigateToStep(1),
          ),
          _buildReviewSection(
            context,
            'Thể loại',
            _getGenreText(song.genre),
            () => _navigateToStep(1),
          ),
          _buildReviewSection(
            context,
            'Dân tộc',
            song.ethnicGroupId,
            () => _navigateToStep(2),
          ),
          if (song.audioMetadata?.performerNames?.isNotEmpty == true)
            _buildReviewSection(
              context,
              'Nghệ sĩ/Người biểu diễn',
              song.audioMetadata!.performerNames!.join(', '),
              () => _navigateToStep(2),
            ),
          if (song.audioMetadata != null)
            _buildReviewSection(
              context,
              'File âm thanh',
              song.audioMetadata!.url,
              () => _navigateToStep(0),
            ),
          // Instrument images
          if (song.audioMetadata?.instrumentImages?.isNotEmpty == true)
            _buildImageReviewSection(
              context,
              'Ảnh nhạc cụ',
              song.audioMetadata!.instrumentImages!,
              () => _navigateToStep(4),
            ),
          // Performer images
          if (song.audioMetadata?.performerImages?.isNotEmpty == true)
            _buildImageReviewSection(
              context,
              'Ảnh nghệ sĩ',
              song.audioMetadata!.performerImages!,
              () => _navigateToStep(2),
            ),
          // Video
          if (song.audioMetadata?.video != null)
            _buildVideoReviewSection(
              context,
              'Video minh họa',
              song.audioMetadata!.video!,
              () => _navigateToStep(0),
            ),
          if (song.culturalContext != null)
            _buildReviewSection(
              context,
              'Bối cảnh văn hóa',
              _getContextTypeText(song.culturalContext!.type),
              () => _navigateToStep(3),
            ),
          // Lyrics (if exists)
          if (song.lyricsNativeScript != null ||
              song.lyricsVietnameseTranslation != null)
            _buildReviewSection(
              context,
              'Lời bài hát',
              song.lyricsNativeScript ?? song.lyricsVietnameseTranslation ?? '',
              () => _navigateToStep(4),
            ),
          const SizedBox(height: 24),
          
          // Notes & Copyright section (expandable)
          ProgressiveDisclosureSection(
            title: 'Ghi chú & Bản quyền (Tùy chọn)',
            requiredFields: [],
            optionalFields: [
              // Lyrics - Native script
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
                  suffixIcon: IconButton(
                    icon: PhosphorIcon(
                      _isListening && _activeController == _nativeScriptController
                          ? PhosphorIconsLight.microphone
                          : PhosphorIconsLight.microphoneSlash,
                      color: _isListening && _activeController == _nativeScriptController
                          ? AppColors.error
                          : AppColors.textSecondary,
                    ),
                    onPressed: () => _startListening(_nativeScriptController),
                    tooltip: 'Voice input',
                  ),
                ),
                maxLines: 6,
                onTap: () => HapticService.onFieldFocus(),
                onChanged: (_) => _updateNotes(),
              ),
              if (_isListening && _activeController == _nativeScriptController)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Row(
                    children: [
                      const SizedBox(
                        width: 12,
                        height: 12,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Đang nghe...',
                        style: AppTypography.bodySmall(color: AppColors.primary).copyWith(
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 16),
              
              // Lyrics - Vietnamese translation
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
                  suffixIcon: IconButton(
                    icon: PhosphorIcon(
                      _isListening && _activeController == _vietnameseTranslationController
                          ? PhosphorIconsLight.microphone
                          : PhosphorIconsLight.microphoneSlash,
                      color: _isListening && _activeController == _vietnameseTranslationController
                          ? AppColors.error
                          : AppColors.textSecondary,
                    ),
                    onPressed: () => _startListening(_vietnameseTranslationController),
                    tooltip: 'Voice input',
                  ),
                ),
                maxLines: 6,
                onTap: () => HapticService.onFieldFocus(),
                onChanged: (_) => _updateNotes(),
              ),
              if (_isListening && _activeController == _vietnameseTranslationController)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Row(
                    children: [
                      const SizedBox(
                        width: 12,
                        height: 12,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Đang nghe...',
                        style: AppTypography.bodySmall(color: AppColors.primary).copyWith(
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 16),
              
              // Copyright
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
                onTap: () => HapticService.onFieldFocus(),
                onChanged: (_) => _updateNotes(),
              ),
              const SizedBox(height: 16),
              
              // Field notes
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
                onTap: () => HapticService.onFieldFocus(),
                onChanged: (_) => _updateNotes(),
              ),
            ],
          ),
          const SizedBox(height: 32),
          // Submit button - Pill style with gradient
          _isSubmitting
              ? Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        AppColors.buttonGradientTop,
                        AppColors.buttonGradientBottom,
                      ],
                    ),
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.25),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                        spreadRadius: 0,
                      ),
                    ],
                  ),
                  child: const Center(
                    child: SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          AppColors.textPrimary,
                        ),
                      ),
                    ),
                  ),
                )
              : AppTheme.createPillButton(
                  onPressed: _submitContribution,
                  isFullWidth: true,
                  child: Text(
                    'Gửi đóng góp',
                    style: AppTypography.button(),
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
    return Semantics(
      label: '$label: $value',
      button: true,
      hint: 'Chạm để chỉnh sửa $label',
      child: Card(
        margin: const EdgeInsets.only(bottom: 16),
        child: ListTile(
          title: Text(
            label,
            style: AppTypography.titleSmall().copyWith(
              fontSize: 14 * MediaQuery.of(context).textScaleFactor.clamp(0.8, 1.3),
            ),
          ),
          subtitle: Text(
            value,
            style: AppTypography.bodyMedium().copyWith(
              fontSize: 14 * MediaQuery.of(context).textScaleFactor.clamp(0.8, 1.3),
            ),
          ),
          trailing: Semantics(
            label: 'Chỉnh sửa $label',
            button: true,
            child: IconButton(
              icon: PhosphorIcon(PhosphorIconsLight.pencil),
              onPressed: onEdit,
            ),
          ),
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

  Widget _buildImageReviewSection(
    BuildContext context,
    String label,
    List<ImageMetadata> images,
    VoidCallback onEdit,
  ) {
    final imageCount = images.length;
    final mainImage = images.firstWhere(
      (img) => img.isMainImage == true,
      orElse: () => images.first,
    );

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
            title: Text(
              label,
              style: AppTypography.titleSmall().copyWith(
                fontSize: 14 * MediaQuery.of(context).textScaleFactor.clamp(0.8, 1.3),
              ),
            ),
            subtitle: Text(
              '$imageCount ảnh',
              style: AppTypography.bodyMedium().copyWith(
                fontSize: 14 * MediaQuery.of(context).textScaleFactor.clamp(0.8, 1.3),
              ),
            ),
            trailing: IconButton(
              icon: PhosphorIcon(PhosphorIconsLight.pencil),
              onPressed: onEdit,
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                // Main image (larger)
                GestureDetector(
                  onTap: () {
                    ImageGalleryDialog.show(
                      context,
                      images: images,
                      initialIndex: images.indexOf(mainImage),
                    );
                  },
                  child: Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.primary,
                        width: 2,
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: ImagePreviewWidget(
                        image: mainImage,
                        showRemoveButton: false,
                        width: 120,
                        height: 120,
                      ),
                    ),
                  ),
                ),
                // Other images (smaller thumbnails)
                ...images.where((img) => img != mainImage).take(3).map((img) {
                  return GestureDetector(
                    onTap: () {
                      ImageGalleryDialog.show(
                        context,
                        images: images,
                        initialIndex: images.indexOf(img),
                      );
                    },
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: AppColors.divider,
                          width: 1,
                        ),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(7),
                        child: ImagePreviewWidget(
                          image: img,
                          showRemoveButton: false,
                          width: 80,
                          height: 80,
                        ),
                      ),
                    ),
                  );
                }),
                // Show "+X more" if there are more images
                if (images.length > 4)
                  GestureDetector(
                    onTap: () {
                      ImageGalleryDialog.show(
                        context,
                        images: images,
                        initialIndex: 0,
                      );
                    },
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: AppColors.divider,
                          width: 1,
                        ),
                        color: AppColors.backgroundDark,
                      ),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              '+${images.length - 4}',
                              style: AppTypography.heading5(color: AppColors.textSecondary).copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              'thêm',
                              style: AppTypography.labelSmall(color: AppColors.textSecondary),
                            ),
                          ],
                        ),
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

  Widget _buildVideoReviewSection(
    BuildContext context,
    String label,
    VideoMetadata video,
    VoidCallback onEdit,
  ) {
    final durationText = video.durationInSeconds != null
        ? _formatDuration(Duration(seconds: video.durationInSeconds!))
        : 'Không xác định';
    final sizeText = video.fileSizeBytes != null
        ? VideoUtils.formatFileSize(video.fileSizeBytes!)
        : 'Không xác định';

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
            title: Text(
              label,
              style: AppTypography.titleSmall().copyWith(
                fontSize: 14 * MediaQuery.of(context).textScaleFactor.clamp(0.8, 1.3),
              ),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Thời lượng: $durationText',
                  style: AppTypography.bodyMedium().copyWith(
                    fontSize: 14 * MediaQuery.of(context).textScaleFactor.clamp(0.8, 1.3),
                  ),
                ),
                Text(
                  'Kích thước: $sizeText',
                  style: AppTypography.bodyMedium().copyWith(
                    fontSize: 14 * MediaQuery.of(context).textScaleFactor.clamp(0.8, 1.3),
                  ),
                ),
              ],
            ),
            trailing: IconButton(
              icon: PhosphorIcon(PhosphorIconsLight.pencil),
              onPressed: onEdit,
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: GestureDetector(
              onTap: () {
                VideoPlayerDialog.show(context, video: video);
              },
              child: Container(
                width: double.infinity,
                height: 200,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppColors.primary,
                    width: 2,
                  ),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: VideoPreviewWidget(
                    video: video,
                    showRemoveButton: false,
                    width: double.infinity,
                    height: 200,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes.remainder(60).toString().padLeft(1, '0');
    final seconds = duration.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }
}
