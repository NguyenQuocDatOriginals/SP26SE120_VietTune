import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/contribution_providers.dart';
import '../../../../domain/entities/enums.dart';
import '../../../../domain/entities/song.dart';
import '../../../../domain/entities/cultural_context.dart';

/// Step 3: Cultural Context
class CulturalContextStep extends ConsumerStatefulWidget {
  const CulturalContextStep({super.key});

  @override
  ConsumerState<CulturalContextStep> createState() => _CulturalContextStepState();
}

class _CulturalContextStepState extends ConsumerState<CulturalContextStep> {
  ContextType? _selectedContextType;
  final _seasonController = TextEditingController();
  final _occasionController = TextEditingController();
  final _significanceController = TextEditingController();
  final _performanceDetailsController = TextEditingController();
  final _historicalBackgroundController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final song = ref.read(contributionFormProvider).songData;
    if (song?.culturalContext != null) {
      final context = song!.culturalContext!;
      _selectedContextType = context.type;
      _seasonController.text = context.season ?? '';
      _occasionController.text = context.occasion ?? '';
      _significanceController.text = context.significance ?? '';
      _performanceDetailsController.text = context.performanceDetails ?? '';
      _historicalBackgroundController.text = context.historicalBackground ?? '';
    }
  }

  @override
  void dispose() {
    _seasonController.dispose();
    _occasionController.dispose();
    _significanceController.dispose();
    _performanceDetailsController.dispose();
    _historicalBackgroundController.dispose();
    super.dispose();
  }

  void _updateCulturalContext() {
    if (_selectedContextType != null) {
      final formNotifier = ref.read(contributionFormProvider.notifier);
      final song = ref.read(contributionFormProvider).songData;
      
      if (song != null) {
        final culturalContext = CulturalContext(
          type: _selectedContextType!,
          season: _seasonController.text.isEmpty ? null : _seasonController.text,
          occasion: _occasionController.text.isEmpty ? null : _occasionController.text,
          significance: _significanceController.text.isEmpty ? null : _significanceController.text,
          performanceDetails: _performanceDetailsController.text.isEmpty ? null : _performanceDetailsController.text,
          historicalBackground: _historicalBackgroundController.text.isEmpty ? null : _historicalBackgroundController.text,
        );
        
        final updatedSong = song.copyWith(culturalContext: culturalContext);
        formNotifier.updateSongData(updatedSong);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bước 3: Bối cảnh văn hóa (Tùy chọn)',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Thông tin về bối cảnh biểu diễn và ý nghĩa văn hóa',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          // Context type
          DropdownButtonFormField<ContextType>(
            value: _selectedContextType,
            decoration: const InputDecoration(
              labelText: 'Loại bối cảnh',
              border: OutlineInputBorder(),
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
          // Season
          TextFormField(
            controller: _seasonController,
            decoration: const InputDecoration(
              labelText: 'Mùa',
              border: OutlineInputBorder(),
              hintText: 'Ví dụ: Mùa xuân, Mùa thu',
            ),
            onChanged: (_) => _updateCulturalContext(),
          ),
          const SizedBox(height: 16),
          // Occasion
          TextFormField(
            controller: _occasionController,
            decoration: const InputDecoration(
              labelText: 'Dịp',
              border: OutlineInputBorder(),
              hintText: 'Ví dụ: Tết Nguyên Đán, Lễ hội',
            ),
            onChanged: (_) => _updateCulturalContext(),
          ),
          const SizedBox(height: 16),
          // Significance
          TextFormField(
            controller: _significanceController,
            decoration: const InputDecoration(
              labelText: 'Ý nghĩa',
              border: OutlineInputBorder(),
              hintText: 'Ý nghĩa văn hóa của bài hát',
            ),
            maxLines: 3,
            onChanged: (_) => _updateCulturalContext(),
          ),
          const SizedBox(height: 16),
          // Performance details
          TextFormField(
            controller: _performanceDetailsController,
            decoration: const InputDecoration(
              labelText: 'Chi tiết biểu diễn',
              border: OutlineInputBorder(),
              hintText: 'Mô tả cách biểu diễn',
            ),
            maxLines: 3,
            onChanged: (_) => _updateCulturalContext(),
          ),
          const SizedBox(height: 16),
          // Historical background
          TextFormField(
            controller: _historicalBackgroundController,
            decoration: const InputDecoration(
              labelText: 'Bối cảnh lịch sử',
              border: OutlineInputBorder(),
              hintText: 'Thông tin lịch sử liên quan',
            ),
            maxLines: 4,
            onChanged: (_) => _updateCulturalContext(),
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
