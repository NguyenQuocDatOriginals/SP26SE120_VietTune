import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/contribution_providers.dart';
import '../../../../domain/entities/enums.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../shared/widgets/instrument_selector.dart';

/// Step 4: Performance Details & Instruments
class PerformanceDetailsStep extends ConsumerWidget {
  const PerformanceDetailsStep({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final formState = ref.watch(contributionFormProvider);
    final formNotifier = ref.read(contributionFormProvider.notifier);
    final song = formState.songData;
    final audioMetadata = song?.audioMetadata;

    return SingleChildScrollView(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 8, bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bước 4: Chi tiết biểu diễn',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
              fontSize: 22,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Loại hình biểu diễn *',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: AppColors.textSecondaryOnGradient,
            ),
          ),
          const SizedBox(height: 8),
          Column(
            children: PerformanceType.values.map((type) {
              final isSelected = song?.performanceType == type;
              return RadioListTile<PerformanceType>(
                value: type,
                groupValue: song?.performanceType,
                title: Text(
                  _getPerformanceTypeText(type),
                  style: TextStyle(
                    fontSize: 16,
                    color: isSelected
                        ? AppColors.textPrimary
                        : AppColors.textSecondary,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  ),
                ),
                activeColor: AppColors.primary,
                onChanged: (value) {
                  if (value != null) {
                    formNotifier.updatePerformanceType(value);
                  }
                },
              );
            }).toList(),
          ),
          // Instrument selector - conditional based on performance type
          if (song?.performanceType == PerformanceType.instrumental ||
              song?.performanceType == PerformanceType.vocalWithAccompaniment) ...[
            const SizedBox(height: 16),
            Row(
              children: [
                Text(
                  'Nhạc cụ *',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '(Bắt buộc)',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.error,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 200,
              child: InstrumentSelector(
                selectedIds: audioMetadata?.instrumentIds ?? [],
                onSelectionChanged: (ids) => formNotifier.updateInstruments(ids),
              ),
            ),
            if ((audioMetadata?.instrumentIds?.isEmpty ?? true))
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  'Vui lòng chọn ít nhất một nhạc cụ',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.error,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
          ] else if (song?.performanceType == PerformanceType.aCappella) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue[200]!),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, size: 20, color: Colors.blue[700]),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Loại hình này không yêu cầu nhạc cụ. Bạn có thể tùy chọn upload lời bài hát ở bước tiếp theo.',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.blue[900],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _getPerformanceTypeText(PerformanceType type) {
    switch (type) {
      case PerformanceType.instrumental:
        return 'Chỉ nhạc cụ';
      case PerformanceType.aCappella:
        return 'Chỉ giọng hát không đệm';
      case PerformanceType.vocalWithAccompaniment:
        return 'Giọng hát có nhạc đệm';
    }
  }
}
