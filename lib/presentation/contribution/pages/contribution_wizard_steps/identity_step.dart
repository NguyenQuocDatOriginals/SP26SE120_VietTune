import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../providers/contribution_providers.dart';
import '../../../../domain/entities/enums.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/haptic_service.dart';
import '../../../shared/widgets/animated_error_text.dart';
import '../../../shared/widgets/field_progress_indicator.dart';
import '../../../shared/widgets/progressive_disclosure_section.dart';
import '../../../shared/widgets/ethnic_group_selector.dart';
import '../../../shared/widgets/location_field.dart';

/// Step 2: Identity - What is it?
/// Required: Title, Genre, Language
/// Optional: Location, Date
class IdentityStep extends ConsumerWidget {
  const IdentityStep({super.key});

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
            'Bước 2: Thông tin định danh',
            style: AppTypography.heading4(color: AppColors.textPrimary).copyWith(
              fontWeight: FontWeight.bold,
              fontSize: 22,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Thông tin cơ bản về bản nhạc',
            style: AppTypography.bodyMedium(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 24),
          
          ProgressiveDisclosureSection(
            requiredFields: [
              // Title field
              _TitleField(
                initialValue: song?.title,
                onChanged: (value) => formNotifier.updateTitle(value),
              ),
              const SizedBox(height: 16),
              
              // Genre dropdown
              Row(
                children: [
                  Text(
                    'Thể loại/Loại hình *',
                    style: AppTypography.labelLarge(color: AppColors.textPrimary).copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(width: 8),
                  FieldProgressIndicator(
                    isValid: song?.genre != null,
                    isRequired: true,
                  ),
                ],
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<MusicGenre>(
                value: song?.genre ?? MusicGenre.folk,
                style: AppTypography.bodyLarge(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  hintText: 'Chọn thể loại',
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
                items: MusicGenre.values.map((genre) {
                  return DropdownMenuItem(
                    value: genre,
                    child: Text(_getGenreText(genre)),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) {
                    HapticService.onButtonTap();
                    formNotifier.updateGenre(value);
                  }
                },
              ),
              const SizedBox(height: 16),
              
              // Language selector
              _buildLanguageSelector(ref, formNotifier, song?.language),
            ],
            optionalFields: [
              Text(
                'Địa điểm ghi âm',
                style: AppTypography.labelLarge(color: AppColors.textPrimary).copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              LocationField(
                value: song?.audioMetadata?.recordingLocation,
                onChanged: (location) =>
                    formNotifier.updateRecordingLocation(location),
              ),
              const SizedBox(height: 16),
              
              // Recording date
              _buildRecordingDateSelector(
                context,
                formNotifier,
                song?.audioMetadata?.recordingDate,
                song?.isRecordingDateEstimated ?? false,
              ),
            ],
          ),
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
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'Ngôn ngữ *',
                  style: AppTypography.labelLarge(color: AppColors.textPrimary).copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(width: 8),
                FieldProgressIndicator(
                  isValid: currentLanguage != null && currentLanguage.isNotEmpty,
                  isRequired: true,
                ),
              ],
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: selected,
              style: AppTypography.bodyLarge(color: AppColors.textPrimary),
              decoration: InputDecoration(
                hintText: 'Chọn ngôn ngữ',
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
                  HapticService.onButtonTap();
                  formNotifier.updateLanguage(value);
                }
              },
            ),
          ],
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
        Row(
          children: [
            Text(
              'Ngày ghi âm',
              style: AppTypography.labelLarge(color: AppColors.textPrimary).copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(width: 8),
            FieldProgressIndicator(
              isValid: currentDate != null,
              isRequired: false,
            ),
          ],
        ),
        const SizedBox(height: 8),
        InkWell(
          onTap: () async {
            HapticService.onFieldFocus();
            final pickedDate = await showDatePicker(
              context: context,
              initialDate: currentDate ?? DateTime.now(),
              firstDate: DateTime(1900),
              lastDate: DateTime.now(),
              initialDatePickerMode: DatePickerMode.day,
              helpText: 'Chọn ngày ghi âm',
              cancelText: 'Hủy',
              confirmText: 'Chọn',
              builder: (context, child) {
                return Theme(
                  data: Theme.of(context).copyWith(
                    colorScheme: ColorScheme.light(
                      primary: AppColors.primary,
                      onPrimary: AppColors.textOnPrimary,
                      surface: AppColors.surface,
                      onSurface: AppColors.textPrimary,
                    ),
                    dialogBackgroundColor: AppColors.surface,
                  ),
                  child: child!,
                );
              },
            );
            if (pickedDate != null) {
              HapticService.onStepComplete();
              formNotifier.updateRecordingDate(pickedDate);
            }
          },
          child: InputDecorator(
            decoration: InputDecoration(
              hintText: 'Chọn ngày/tháng/năm',
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
              suffixIcon: PhosphorIcon(
                PhosphorIconsLight.calendar,
                color: AppColors.primary,
              ),
            ),
            child: Text(
              dateText,
              style: AppTypography.bodyLarge(
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
            style: AppTypography.bodyMedium(color: AppColors.textSecondary),
          ),
          value: isEstimated,
          activeColor: AppColors.primary,
          checkColor: AppColors.textPrimary,
          onChanged: (checked) {
            formNotifier.updateIsRecordingDateEstimated(checked ?? false);
          },
        ),
      ],
    );
  }
}

/// Title field with validation and haptic feedback
class _TitleField extends StatefulWidget {
  final String? initialValue;
  final ValueChanged<String> onChanged;

  const _TitleField({
    required this.initialValue,
    required this.onChanged,
  });

  @override
  State<_TitleField> createState() => _TitleFieldState();
}

class _TitleFieldState extends State<_TitleField> {
  late final TextEditingController _controller;
  String? _errorText;
  bool _hasInteracted = false;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialValue);
    _controller.addListener(_validate);
  }

  @override
  void dispose() {
    _controller.removeListener(_validate);
    _controller.dispose();
    super.dispose();
  }

  void _validate() {
    final value = _controller.text.trim();
    String? error;
    
    if (value.isEmpty) {
      error = 'Vui lòng nhập tên bản nhạc';
    }
    
    if (_hasInteracted && error != null && _errorText == null) {
      HapticService.onValidationError();
    }
    
    setState(() {
      _errorText = error;
    });
    
    widget.onChanged(value);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Tiêu đề/Tên bản nhạc *',
              style: AppTypography.labelLarge(color: AppColors.textPrimary).copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(width: 8),
            FieldProgressIndicator(
              isValid: _controller.text.trim().isNotEmpty,
              isRequired: true,
            ),
          ],
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _controller,
          style: AppTypography.bodyLarge(color: AppColors.textPrimary),
          decoration: InputDecoration(
            hintText: 'Nhập tên bản nhạc',
            hintStyle: AppTypography.bodyMedium(color: AppColors.textSecondary),
            filled: true,
            fillColor: AppColors.surface,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: _errorText != null ? AppColors.error : AppColors.divider,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: _errorText != null ? AppColors.error : AppColors.divider,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: AppColors.primary,
                width: 2,
              ),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: AppColors.error,
                width: 1,
              ),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: AppColors.error,
                width: 2,
              ),
            ),
          ),
          onTap: () {
            HapticService.onFieldFocus();
            setState(() => _hasInteracted = true);
          },
          onChanged: (value) {
            setState(() => _hasInteracted = true);
          },
        ),
        const SizedBox(height: 4),
        AnimatedErrorText(
          errorText: _hasInteracted ? _errorText : null,
          icon: PhosphorIconsLight.warning,
        ),
      ],
    );
  }
}
