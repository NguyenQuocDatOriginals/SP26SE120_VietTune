import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/contribution_providers.dart';
import '../../../../domain/entities/enums.dart';
import '../../../../domain/entities/cultural_context.dart';
import '../../../../domain/entities/location.dart';
import '../../../../core/utils/constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../shared/widgets/ethnic_group_selector.dart';

/// Step 3: Cultural Context
class CulturalContextStep extends ConsumerStatefulWidget {
  const CulturalContextStep({super.key});

  @override
  ConsumerState<CulturalContextStep> createState() => _CulturalContextStepState();
}

class _CulturalContextStepState extends ConsumerState<CulturalContextStep> {
  ContextType? _selectedContextType;
  String? _selectedProvince;
  final _specificLocationController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final song = ref.read(contributionFormProvider).songData;
    if (song?.culturalContext != null) {
      final context = song!.culturalContext!;
      _selectedContextType = context.type;
    }
    _selectedProvince = song?.audioMetadata?.recordingLocation?.province;
    _specificLocationController.text =
        song?.audioMetadata?.recordingLocation?.commune ?? '';
  }

  @override
  void dispose() {
    _specificLocationController.dispose();
    super.dispose();
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

  void _updateRecordingLocation() {
    final formNotifier = ref.read(contributionFormProvider.notifier);
    final song = ref.read(contributionFormProvider).songData;
    if (song == null) return;

    final location = Location(
      latitude: 0,
      longitude: 0,
      province: _selectedProvince,
      commune: _specificLocationController.text.isEmpty
          ? null
          : _specificLocationController.text,
    );
    final audioMetadata = song.audioMetadata;
    if (audioMetadata == null) return;

    final updatedMetadata = audioMetadata.copyWith(
      recordingLocation: location,
    );
    formNotifier.updateSongData(song.copyWith(audioMetadata: updatedMetadata));
  }

  @override
  Widget build(BuildContext context) {
    final song = ref.watch(contributionFormProvider).songData;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bước 3: Bối cảnh văn hóa',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: AppColors.textOnGradient,
              fontWeight: FontWeight.bold,
              fontSize: 22,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Thông tin về dân tộc, vùng miền và bối cảnh biểu diễn',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondaryOnGradient,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Dân tộc *',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: AppColors.textSecondaryOnGradient,
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
          DropdownButtonFormField<String>(
            value: _selectedProvince,
            style: const TextStyle(
              fontSize: 16,
              color: AppColors.textPrimary,
            ),
            decoration: InputDecoration(
              labelText: 'Tỉnh/Thành',
              labelStyle: const TextStyle(
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
            items: VietnameseProvinces.allProvinces
                .map(
                  (province) => DropdownMenuItem(
                    value: province,
                    child: Text(province),
                  ),
                )
                .toList(),
            onChanged: (value) {
              setState(() => _selectedProvince = value);
              _updateRecordingLocation();
            },
          ),
          const SizedBox(height: 16),
          // Context type
          DropdownButtonFormField<ContextType>(
            value: _selectedContextType,
            style: const TextStyle(
              fontSize: 16,
              color: AppColors.textPrimary,
            ),
            decoration: InputDecoration(
              labelText: 'Loại sự kiện',
              labelStyle: const TextStyle(
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
          const SizedBox(height: 16),
          // Specific location
          TextFormField(
            controller: _specificLocationController,
            style: const TextStyle(
              fontSize: 16,
              color: AppColors.textPrimary,
            ),
            decoration: InputDecoration(
              labelText: 'Địa điểm cụ thể',
              labelStyle: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
              hintText: 'Ví dụ: Xã, phường hoặc địa danh',
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
            onChanged: (_) => _updateRecordingLocation(),
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
