import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/contribution_providers.dart';
import '../../../../domain/entities/enums.dart';
import '../../../../core/theme/app_theme.dart';
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
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: AppColors.textOnGradient,
              fontWeight: FontWeight.bold,
              fontSize: 22,
            ),
          ),
          const SizedBox(height: 24),
          // Song title
          TextFormField(
            initialValue: song?.title,
            style: const TextStyle(
              fontSize: 16,
              color: AppColors.textPrimary,
            ),
            decoration: InputDecoration(
              labelText: 'Tiêu đề/Tên bản nhạc *',
              labelStyle: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
              hintText: 'Nhập tên bản nhạc',
              hintStyle: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
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
                  color: AppColors.primaryRed,
                  width: 2,
                ),
              ),
            ),
            onChanged: (value) => formNotifier.updateTitle(value),
          ),
          const SizedBox(height: 16),
          // Author/Musician
          Builder(
            builder: (context) {
              final isFolkChecked = song?.author?.toLowerCase() == 'dân gian';
              return TextFormField(
                enabled: !isFolkChecked,
                initialValue: isFolkChecked ? '' : (song?.author ?? ''),
                style: const TextStyle(
                  fontSize: 16,
                  color: AppColors.textPrimary,
                ),
                decoration: InputDecoration(
                  labelText: 'Nhạc sĩ/Tác giả *',
                  labelStyle: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                  hintText: 'Tên người sáng tác',
                  hintStyle: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
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
                      color: AppColors.primaryRed,
                      width: 2,
                    ),
                  ),
                ),
                onChanged: (value) => formNotifier.updateAuthor(value),
              );
            },
          ),
          // Checkbox for folk/unknown author
          CheckboxListTile(
            dense: true,
            contentPadding: EdgeInsets.zero,
            title: Text(
              'Dân gian/Không rõ tác giả',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondaryOnGradient,
              ),
            ),
            value: song?.author?.toLowerCase() == 'dân gian',
            activeColor: AppColors.primaryRed,
            checkColor: AppColors.textOnGradient,
            onChanged: (checked) {
              if (checked == true) {
                formNotifier.updateAuthor('Dân gian');
              } else {
                formNotifier.updateAuthor(null);
              }
            },
          ),
          const SizedBox(height: 16),
          // Genre dropdown
          DropdownButtonFormField<MusicGenre>(
            value: song?.genre ?? MusicGenre.folk,
            style: const TextStyle(
              fontSize: 16,
              color: AppColors.textPrimary,
            ),
            decoration: InputDecoration(
              labelText: 'Thể loại/Loại hình *',
              labelStyle: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
              hintText: 'Chọn thể loại',
              hintStyle: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
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
                  color: AppColors.primaryRed,
                  width: 2,
                ),
              ),
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
          // Recording location
          TextFormField(
            initialValue: song?.audioMetadata?.recordingLocation?.commune,
            style: const TextStyle(
              fontSize: 16,
              color: AppColors.textPrimary,
            ),
            decoration: InputDecoration(
              labelText: 'Địa điểm ghi âm',
              labelStyle: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
              hintText: 'Nhập địa điểm cụ thể',
              hintStyle: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
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
                  color: AppColors.primaryRed,
                  width: 2,
                ),
              ),
            ),
            onChanged: (value) {
              // Update recording location commune
              final location = song?.audioMetadata?.recordingLocation;
              formNotifier.updateRecordingLocation(
                location?.province ?? '',
                value,
              );
            },
          ),
          // Example text for recording location
          Padding(
            padding: const EdgeInsets.only(top: 8, left: 4),
            child: Text(
              'Ví dụ: Đình làng X, Nhà văn hóa Y',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondaryOnGradient,
                    fontSize: 12,
                  ),
            ),
          ),
          const SizedBox(height: 16),
          // Artist/Performer
          Builder(
            builder: (context) {
              final performerNames = song?.audioMetadata?.performerNames;
              final hasPlaceholder = performerNames?.length == 1 && performerNames?.first == '';
              final isEmpty = performerNames?.isEmpty ?? true;
              final isUnknownChecked = isEmpty && !hasPlaceholder;
              
              // Filter out placeholder values for display
              final displayValue = performerNames
                  ?.where((name) => name.isNotEmpty)
                  .join(', ') ?? '';
              
              return TextFormField(
                enabled: !isUnknownChecked,
                initialValue: displayValue,
                style: const TextStyle(
                  fontSize: 16,
                  color: AppColors.textPrimary,
                ),
                decoration: InputDecoration(
                  labelText: 'Nghệ sĩ/Người biểu diễn *',
                  labelStyle: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                  hintText: 'Tên người hát hoặc chơi nhạc cụ',
                  hintStyle: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
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
                      color: AppColors.primaryRed,
                      width: 2,
                    ),
                  ),
                ),
                onChanged: (value) {
                  final performers = value
                      .split(',')
                      .map((e) => e.trim())
                      .where((e) => e.isNotEmpty)
                      .toList();
                  formNotifier.updateArtist(performers);
                },
              );
            },
          ),
          // Checkbox for unknown artist
          Builder(
            builder: (context) {
              final performerNames = song?.audioMetadata?.performerNames;
              // Check if the list is empty (which means "Không rõ" is checked)
              final isEmpty = performerNames?.isEmpty ?? true;
              // Also check if it's a special placeholder for unchecked state
              final hasPlaceholder = performerNames?.length == 1 && performerNames?.first == '';
              final isUnknownChecked = isEmpty && !hasPlaceholder;
              
              return CheckboxListTile(
                dense: true,
                contentPadding: EdgeInsets.zero,
                title: Text(
                  'Không rõ',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondaryOnGradient,
                  ),
                ),
                value: isUnknownChecked,
                activeColor: AppColors.primaryRed,
                checkColor: AppColors.textOnGradient,
                onChanged: (checked) {
                  if (checked == true) {
                    formNotifier.updateArtist([]);
                  } else {
                    // When uncheck, set placeholder so checkbox unchecks
                    // This placeholder will be cleared when user types
                    formNotifier.updateArtist(['']);
                  }
                },
              );
            },
          ),
          const SizedBox(height: 16),
          // Language selector
          _buildLanguageSelector(ref, formNotifier, song?.language),
          const SizedBox(height: 16),
          // Recording date
          _buildRecordingDateSelector(context, formNotifier, song?.audioMetadata?.recordingDate, song?.isRecordingDateEstimated ?? false),
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
          style: const TextStyle(
            fontSize: 16,
            color: AppColors.textPrimary,
          ),
          decoration: InputDecoration(
            labelText: 'Ngôn ngữ',
            labelStyle: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
            hintText: 'Chọn ngôn ngữ',
            hintStyle: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
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
                color: AppColors.primaryRed,
                width: 2,
              ),
            ),
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

  Widget _buildRecordingDateSelector(
    BuildContext context,
    ContributionFormNotifier formNotifier,
    DateTime? currentDate,
    bool isEstimated,
  ) {
    String dateText = 'Chọn ngày/tháng/năm';
    if (currentDate != null) {
      dateText = '${currentDate.day}/${currentDate.month}/${currentDate.year}';
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        InkWell(
          onTap: () async {
            final pickedDate = await showDatePicker(
              context: context,
              initialDate: currentDate ?? DateTime.now(),
              firstDate: DateTime(1900),
              lastDate: DateTime.now(),
            );
            if (pickedDate != null) {
              formNotifier.updateRecordingDate(pickedDate);
            }
          },
          child: InputDecorator(
            decoration: InputDecoration(
              labelText: 'Ngày ghi âm',
              labelStyle: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
              hintText: 'Chọn ngày/tháng/năm',
              hintStyle: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
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
                  color: AppColors.primaryRed,
                  width: 2,
                ),
              ),
              suffixIcon: const Icon(
                Icons.calendar_today,
                color: AppColors.primaryRed,
              ),
            ),
            child: Text(
              dateText,
              style: TextStyle(
                fontSize: 16,
                color: currentDate != null
                    ? AppColors.textPrimary
                    : AppColors.textSecondary,
              ),
            ),
          ),
        ),
        // Checkbox for estimated/inaccurate date
        CheckboxListTile(
          dense: true,
          contentPadding: EdgeInsets.zero,
          title: Text(
            'Ngày ước tính',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondaryOnGradient,
            ),
          ),
          value: isEstimated,
          activeColor: AppColors.primaryRed,
          checkColor: AppColors.textOnGradient,
          onChanged: (checked) {
            formNotifier.updateIsRecordingDateEstimated(checked ?? false);
          },
        ),
      ],
    );
  }
}
