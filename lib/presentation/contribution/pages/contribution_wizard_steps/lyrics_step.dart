import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/contribution_providers.dart';
import '../../../../core/theme/app_theme.dart';

/// Step 4: Lyrics (Optional)
class LyricsStep extends ConsumerStatefulWidget {
  const LyricsStep({super.key});

  @override
  ConsumerState<LyricsStep> createState() => _LyricsStepState();
}

class _LyricsStepState extends ConsumerState<LyricsStep> {
  final _nativeScriptController = TextEditingController();
  final _vietnameseTranslationController = TextEditingController();

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
            _vietnameseTranslationController.text = song.lyricsVietnameseTranslation ?? '';
          });
        }
      }
    });
  }

  @override
  void dispose() {
    _nativeScriptController.dispose();
    _vietnameseTranslationController.dispose();
    super.dispose();
  }

  void _updateLyrics() {
    final formNotifier = ref.read(contributionFormProvider.notifier);
    formNotifier.updateLyrics(
      nativeScript: _nativeScriptController.text.isEmpty
          ? null
          : _nativeScriptController.text,
      vietnameseTranslation: _vietnameseTranslationController.text.isEmpty
          ? null
          : _vietnameseTranslationController.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 8, bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bước 4: Lời bài hát (Tùy chọn)',
            style: AppTypography.heading4(color: AppColors.textPrimary).copyWith(
              fontWeight: FontWeight.bold,
              fontSize: 22,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Nhập lời bài hát bằng ngôn ngữ gốc và bản dịch tiếng Việt',
            style: AppTypography.bodyMedium(),
          ),
          const SizedBox(height: 24),
          // Native script
          TextFormField(
            controller: _nativeScriptController,
            decoration: const InputDecoration(
              labelText: 'Lời bài hát (ngôn ngữ gốc)',
              border: OutlineInputBorder(),
              hintText: 'Nhập lời bài hát bằng ngôn ngữ gốc',
            ),
            maxLines: 10,
            onChanged: (_) => _updateLyrics(),
          ),
          const SizedBox(height: 16),
          // Vietnamese translation
          TextFormField(
            controller: _vietnameseTranslationController,
            decoration: const InputDecoration(
              labelText: 'Bản dịch tiếng Việt',
              border: OutlineInputBorder(),
              hintText: 'Nhập bản dịch tiếng Việt',
            ),
            maxLines: 10,
            onChanged: (_) => _updateLyrics(),
          ),
        ],
      ),
    );
  }
}
