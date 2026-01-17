import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/contribution_providers.dart';
import '../../../../domain/entities/enums.dart';
import '../../../shared/widgets/ethnic_group_selector.dart';

/// Step 2: Basic Information
class BasicInfoStep extends ConsumerWidget {
  const BasicInfoStep({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final formState = ref.watch(contributionFormProvider);
    final formNotifier = ref.read(contributionFormProvider.notifier);
    final song = formState.songData;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bước 2: Thông tin định danh',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 24),
          // Song title
          TextFormField(
            initialValue: song?.title,
            decoration: const InputDecoration(
              labelText: 'Tên bài hát *',
              border: OutlineInputBorder(),
              hintText: 'Nhập tên bài hát',
            ),
            onChanged: (value) => formNotifier.updateTitle(value),
          ),
          const SizedBox(height: 16),
          // Artist
          TextFormField(
            initialValue:
                song?.audioMetadata?.performerNames?.join(', ') ?? '',
            decoration: const InputDecoration(
              labelText: 'Nghệ sĩ *',
              border: OutlineInputBorder(),
              hintText: 'Tên nghệ sĩ, phân cách bằng dấu phẩy',
            ),
            onChanged: (value) {
              final performers = value
                  .split(',')
                  .map((e) => e.trim())
                  .where((e) => e.isNotEmpty)
                  .toList();
              formNotifier.updateArtist(performers);
            },
          ),
          const SizedBox(height: 16),
          // Author
          TextFormField(
            initialValue: song?.author ?? 'Dân gian',
            decoration: const InputDecoration(
              labelText: 'Tác giả',
              border: OutlineInputBorder(),
              hintText: 'Mặc định: Dân gian',
            ),
            onChanged: (value) => formNotifier.updateAuthor(value),
          ),
          const SizedBox(height: 16),
          // Genre dropdown
          DropdownButtonFormField<MusicGenre>(
            value: song?.genre ?? MusicGenre.folk,
            decoration: const InputDecoration(
              labelText: 'Thể loại *',
              border: OutlineInputBorder(),
            ),
            items: MusicGenre.values.map((genre) {
              return DropdownMenuItem(
                value: genre,
                child: Text(_getGenreText(genre)),
              );
            }).toList(),
            onChanged: (value) {
              if (value != null) {
                formNotifier.updateGenre(value);
              }
            },
          ),
          const SizedBox(height: 16),
          // Language selector
          _buildLanguageSelector(ref, formNotifier, song?.language),
        ],
      ),
    );
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

  Widget _buildLanguageSelector(
    WidgetRef ref,
    ContributionFormNotifier formNotifier,
    String? currentLanguage,
  ) {
    final groupsAsync = ref.watch(ethnicGroupsProvider);
    return groupsAsync.when(
      data: (groups) {
        final options = <String>[
          'Tiếng Việt',
          ...groups.map((group) => group.name),
        ];
        final selected =
            currentLanguage != null && options.contains(currentLanguage)
                ? currentLanguage
                : options.first;
        return DropdownButtonFormField<String>(
          value: selected,
          decoration: const InputDecoration(
            labelText: 'Ngôn ngữ *',
            border: OutlineInputBorder(),
          ),
          items: options
              .map(
                (value) => DropdownMenuItem(
                  value: value,
                  child: Text(value),
                ),
              )
              .toList(),
          onChanged: (value) {
            if (value != null) {
              formNotifier.updateLanguage(value);
            }
          },
        );
      },
      loading: () => const TextField(
        decoration: InputDecoration(
          labelText: 'Ngôn ngữ',
          border: OutlineInputBorder(),
          suffixIcon: SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        ),
        enabled: false,
      ),
      error: (error, stack) => const TextField(
        decoration: InputDecoration(
          labelText: 'Ngôn ngữ',
          border: OutlineInputBorder(),
          errorText: 'Không thể tải danh sách ngôn ngữ',
        ),
        enabled: false,
      ),
    );
  }
}
