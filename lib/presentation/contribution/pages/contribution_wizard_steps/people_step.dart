import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/contribution_providers.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/haptic_service.dart';
import '../../../shared/widgets/ethnic_group_selector.dart';
import '../../../shared/widgets/field_progress_indicator.dart';
import '../../../shared/widgets/progressive_disclosure_section.dart';

/// Step 3: People - Who made it?
/// Required: Performers, Ethnic Group
/// Optional: Author
class PeopleStep extends ConsumerWidget {
  const PeopleStep({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final formState = ref.watch(contributionFormProvider);
    final formNotifier = ref.read(contributionFormProvider.notifier);
    final song = formState.songData;

    return SingleChildScrollView(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 8, bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bước 3: Thông tin người thực hiện',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
              fontSize: 22,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Thông tin về nghệ sĩ, dân tộc và tác giả',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 24),
          
          ProgressiveDisclosureSection(
            requiredFields: [
              // Performers
              Builder(
                builder: (context) {
                  final performerNames = song?.audioMetadata?.performerNames;
                  final hasPlaceholder = performerNames?.length == 1 && performerNames?.first == '';
                  final isEmpty = performerNames?.isEmpty ?? true;
                  final isUnknownChecked = isEmpty && !hasPlaceholder;
                  
                  final artistName = performerNames?.isNotEmpty == true 
                      ? performerNames!.first 
                      : '';
                  final hasError = !isUnknownChecked && artistName.isEmpty;
                  
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Nghệ sĩ/Người biểu diễn *',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textPrimary,
                                    height: 1.4,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                TextFormField(
                                  enabled: !isUnknownChecked,
                                  initialValue: artistName,
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: isUnknownChecked 
                                        ? AppColors.textSecondary 
                                        : AppColors.textPrimary,
                                    height: 1.5,
                                  ),
                                  decoration: InputDecoration(
                                    hintText: 'Nhập tên người biểu diễn',
                                    hintStyle: TextStyle(
                                      fontSize: 14,
                                      color: AppColors.textSecondary.withOpacity(0.7),
                                    ),
                                    filled: true,
                                    fillColor: isUnknownChecked 
                                        ? AppColors.backgroundDark 
                                        : AppColors.surface,
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(
                                        color: AppColors.divider,
                                        width: 1,
                                      ),
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(
                                        color: hasError 
                                            ? AppColors.error 
                                            : AppColors.divider,
                                        width: hasError ? 2 : 1,
                                      ),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(
                                        color: hasError 
                                            ? AppColors.error 
                                            : AppColors.primary,
                                        width: 2,
                                      ),
                                    ),
                                    errorBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(
                                        color: AppColors.error,
                                        width: 2,
                                      ),
                                    ),
                                    focusedErrorBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(
                                        color: AppColors.error,
                                        width: 2,
                                      ),
                                    ),
                                    errorText: hasError 
                                        ? 'Vui lòng nhập tên người biểu diễn'
                                        : null,
                                    errorStyle: const TextStyle(
                                      fontSize: 13,
                                      color: AppColors.error,
                                      fontWeight: FontWeight.w500,
                                      height: 1.4,
                                    ),
                                    contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 16,
                                    ),
                                  ),
                                  onChanged: (value) {
                                    if (value.trim().isNotEmpty) {
                                      formNotifier.updateArtist([value.trim()]);
                                    } else {
                                      formNotifier.updateArtist([]);
                                    }
                                  },
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          FieldProgressIndicator(
                            isValid: !isUnknownChecked && artistName.isNotEmpty,
                            isRequired: true,
                          ),
                        ],
                      ),
                      // Checkbox for unknown artist
                      CheckboxListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        title: Text(
                          'Không rõ',
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        value: isUnknownChecked,
                        activeColor: AppColors.primary,
                        checkColor: AppColors.textPrimary,
                        onChanged: (checked) {
                          if (checked == true) {
                            formNotifier.updateArtist([]);
                          } else {
                            formNotifier.updateArtist(['']);
                          }
                        },
                      ),
                    ],
                  );
                },
              ),
              const SizedBox(height: 16),
              
              // Ethnic Group
              Row(
                children: [
                  Text(
                    'Dân tộc *',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(width: 8),
                  FieldProgressIndicator(
                    isValid: (song?.ethnicGroupId ?? '').isNotEmpty,
                    isRequired: true,
                  ),
                ],
              ),
              const SizedBox(height: 8),
              EthnicGroupSelector(
                selectedId: song?.ethnicGroupId ?? '',
                province: song?.audioMetadata?.recordingLocation?.province,
                onSelected: (group) {
                  HapticService.onButtonTap();
                  formNotifier.updateEthnicGroup(group?.id ?? '');
                },
              ),
            ],
            optionalFields: [
              // Author/Musician
              Builder(
                builder: (context) {
                  final isFolkChecked = song?.author?.toLowerCase() == 'dân gian';
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Nhạc sĩ/Tác giả',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(width: 8),
                          FieldProgressIndicator(
                            isValid: song?.author != null && 
                                song!.author!.isNotEmpty && 
                                song.author!.toLowerCase() != 'dân gian',
                            isRequired: false,
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        enabled: !isFolkChecked,
                        initialValue: isFolkChecked ? '' : (song?.author ?? ''),
                        style: const TextStyle(
                          fontSize: 16,
                          color: AppColors.textPrimary,
                        ),
                        decoration: InputDecoration(
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
                              color: AppColors.primary,
                              width: 2,
                            ),
                          ),
                        ),
                        onTap: () => HapticService.onFieldFocus(),
                        onChanged: (value) => formNotifier.updateAuthor(value),
                      ),
                      // Checkbox for folk/unknown author
                      CheckboxListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        title: Text(
                          'Dân gian/Không rõ tác giả',
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        value: isFolkChecked,
                        activeColor: AppColors.primary,
                        checkColor: AppColors.textPrimary,
                        onChanged: (checked) {
                          if (checked == true) {
                            formNotifier.updateAuthor('Dân gian');
                          } else {
                            formNotifier.updateAuthor(null);
                          }
                        },
                      ),
                    ],
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
