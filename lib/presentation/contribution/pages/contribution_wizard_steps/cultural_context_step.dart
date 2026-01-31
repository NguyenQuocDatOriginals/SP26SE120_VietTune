import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/contribution_providers.dart';
import '../../../../domain/entities/enums.dart';
import '../../../../domain/entities/cultural_context.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../shared/widgets/ethnic_group_selector.dart';
import '../../../shared/widgets/location_field.dart';

/// Step 3: Cultural Context
class CulturalContextStep extends ConsumerStatefulWidget {
  const CulturalContextStep({super.key});

  @override
  ConsumerState<CulturalContextStep> createState() => _CulturalContextStepState();
}

class _CulturalContextStepState extends ConsumerState<CulturalContextStep> {
  ContextType? _selectedContextType;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        final song = ref.read(contributionFormProvider).songData;
        if (song?.culturalContext != null) {
          final ctx = song!.culturalContext!;
          setState(() => _selectedContextType = ctx.type);
        }
      }
    });
  }

  void _updateCulturalContext() {
    if (_selectedContextType != null) {
      final formNotifier = ref.read(contributionFormProvider.notifier);
      final song = ref.read(contributionFormProvider).songData;

      if (song != null) {
        final culturalContext = CulturalContext(
          type: _selectedContextType!,
        );

        final updatedSong = song.copyWith(
          culturalContext: culturalContext,
        );
        formNotifier.updateSongData(updatedSong);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final song = ref.watch(contributionFormProvider).songData;
    return SingleChildScrollView(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 8, bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bước 3: Bối cảnh văn hóa',
            style: AppTypography.heading4(color: AppColors.textPrimary).copyWith(
              fontWeight: FontWeight.bold,
              fontSize: 22,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Thông tin về dân tộc, vùng miền và bối cảnh biểu diễn',
            style: AppTypography.bodyMedium(color: AppColors.textSecondaryOnGradient),
          ),
          const SizedBox(height: 24),
          Text(
            'Dân tộc *',
            style: AppTypography.labelLarge(color: AppColors.textPrimary).copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          EthnicGroupSelector(
            selectedId: song?.ethnicGroupId,
            onSelected: (group) {
              if (group != null) {
                ref
                    .read(contributionFormProvider.notifier)
                    .updateEthnicGroup(group.id);
              }
            },
          ),
          const SizedBox(height: 16),
          Text(
            'Địa điểm',
            style: AppTypography.labelLarge(color: AppColors.textPrimary).copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          LocationField(
            value: song?.audioMetadata?.recordingLocation,
            onChanged: (location) {
              ref
                  .read(contributionFormProvider.notifier)
                  .updateRecordingLocation(location);
            },
          ),
          const SizedBox(height: 16),
          // Context type
          Text(
            'Loại sự kiện',
            style: AppTypography.labelLarge(color: AppColors.textPrimary).copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<ContextType>(
            value: _selectedContextType,
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
            ),
            items: ContextType.values.map((type) {
              return DropdownMenuItem(
                value: type,
                child: Text(_getContextTypeText(type)),
              );
            }).toList(),
            onChanged: (value) {
              setState(() => _selectedContextType = value);
              _updateCulturalContext();
            },
          ),
        ],
      ),
    );
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
