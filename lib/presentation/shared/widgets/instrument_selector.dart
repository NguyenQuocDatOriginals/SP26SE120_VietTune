import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../domain/entities/instrument.dart';
import '../../../domain/entities/enums.dart';
import '../../../domain/repositories/base_repository.dart';
import '../../../domain/usecases/reference/get_instruments.dart';
import '../../../core/di/injection.dart';
import '../../../core/theme/app_theme.dart';

/// Provider for instruments list
final instrumentsProvider = FutureProvider<List<Instrument>>((ref) async {
  final useCase = getIt<GetInstruments>();
  final result = await useCase(params: const QueryParams());
  return result.fold(
    (failure) => [],
    (response) => response.items,
  );
});

/// Instrument multi-selector widget with categories
class InstrumentSelector extends ConsumerStatefulWidget {
  final List<String> selectedIds;
  final ValueChanged<List<String>>? onSelectionChanged;

  const InstrumentSelector({
    super.key,
    this.selectedIds = const [],
    this.onSelectionChanged,
  });

  @override
  ConsumerState<InstrumentSelector> createState() => _InstrumentSelectorState();
}

class _InstrumentSelectorState extends ConsumerState<InstrumentSelector> {
  late List<String> _selectedIds;

  @override
  void initState() {
    super.initState();
    _selectedIds = List.from(widget.selectedIds);
  }

  void _toggleSelection(String instrumentId) {
    setState(() {
      if (_selectedIds.contains(instrumentId)) {
        _selectedIds.remove(instrumentId);
      } else {
        _selectedIds.add(instrumentId);
      }
    });
    widget.onSelectionChanged?.call(_selectedIds);
  }

  String _getEthnicGroupDisplayName(String? ethnicGroupId) {
    if (ethnicGroupId == null || ethnicGroupId.isEmpty) return '';
    // Convert 'ethnic_ba_na' -> 'Ba Na'
    final parts = ethnicGroupId.replaceFirst('ethnic_', '').split('_');
    return parts.map((part) => part[0].toUpperCase() + part.substring(1)).join(' ');
  }

  String _formatInstrumentName(Instrument instrument) {
    final ethnicGroups = instrument.associatedEthnicGroups;
    if (ethnicGroups != null && ethnicGroups.isNotEmpty) {
      final firstGroupName = _getEthnicGroupDisplayName(ethnicGroups.first);
      return '${instrument.name} ($firstGroupName)';
    }
    return instrument.name;
  }

  void _showInstrumentPicker() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.8,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => _InstrumentPickerBottomSheet(
          scrollController: scrollController,
          selectedIds: _selectedIds,
          onSelectionChanged: (selectedIds) {
            setState(() {
              _selectedIds = selectedIds;
            });
            widget.onSelectionChanged?.call(_selectedIds);
          },
          formatInstrumentName: _formatInstrumentName,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final instrumentsAsync = ref.watch(instrumentsProvider);

    return instrumentsAsync.when(
      data: (instruments) {
        // Get selected instruments
        final selectedInstruments = instruments
            .where((i) => _selectedIds.contains(i.id))
            .toList();

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  Text(
                    'Nhạc cụ sử dụng',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '*',
                    style: TextStyle(color: AppColors.error, fontSize: 16),
                  ),
                ],
              ),
            ),
            // Input field (search bar)
            InkWell(
              onTap: _showInstrumentPicker,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.divider),
                ),
                child: Text(
                  'Tìm và chọn nhạc cụ...',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
              ),
            ),
            // Tags below the input field
            if (selectedInstruments.isNotEmpty) ...[
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: selectedInstruments.map((instrument) {
                  return InputChip(
                    onDeleted: () => _toggleSelection(instrument.id),
                    deleteIcon: Icon(
                      Icons.close,
                      size: 16,
                      color: AppColors.textOnGradient,
                    ),
                    label: Text(_formatInstrumentName(instrument)),
                    backgroundColor: AppColors.success,
                    labelStyle: TextStyle(color: AppColors.textOnGradient),
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                  );
                }).toList(),
              ),
            ],
            const SizedBox(height: 8),
            // Hint text
            Text(
              'Chọn một hoặc nhiều nhạc cụ',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondary,
                  ),
            ),
          ],
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(
        child: Text('Error loading instruments: $error'),
      ),
    );
  }
}

/// Bottom sheet for selecting instruments
class _InstrumentPickerBottomSheet extends ConsumerStatefulWidget {
  final ScrollController scrollController;
  final List<String> selectedIds;
  final ValueChanged<List<String>> onSelectionChanged;
  final String Function(Instrument) formatInstrumentName;

  const _InstrumentPickerBottomSheet({
    required this.scrollController,
    required this.selectedIds,
    required this.onSelectionChanged,
    required this.formatInstrumentName,
  });

  @override
  ConsumerState<_InstrumentPickerBottomSheet> createState() =>
      _InstrumentPickerBottomSheetState();
}

class _InstrumentPickerBottomSheetState
    extends ConsumerState<_InstrumentPickerBottomSheet> {
  late List<String> _selectedIds;
  late TextEditingController _searchController;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _selectedIds = List.from(widget.selectedIds);
    _searchController = TextEditingController();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _toggleSelection(String instrumentId) {
    setState(() {
      if (_selectedIds.contains(instrumentId)) {
        _selectedIds.remove(instrumentId);
      } else {
        _selectedIds.add(instrumentId);
      }
    });
    widget.onSelectionChanged(_selectedIds);
  }

  List<Instrument> _filterInstruments(List<Instrument> instruments) {
    if (_searchQuery.isEmpty) return instruments;
    
    final query = _searchQuery.toLowerCase();
    return instruments.where((instrument) {
      final nameLower = instrument.name.toLowerCase();
      final formattedName = widget.formatInstrumentName(instrument).toLowerCase();
      return nameLower.contains(query) || formattedName.contains(query);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final instrumentsAsync = ref.watch(instrumentsProvider);

    return Column(
      children: [
        // Header
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  'Chọn nhạc cụ',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
        ),
        // Search bar
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Tìm kiếm nhạc cụ...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    )
                  : null,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 12,
              ),
            ),
            onChanged: (value) {
              setState(() => _searchQuery = value);
            },
          ),
        ),
        const SizedBox(height: 16),
        // Instruments list
        Expanded(
          child: instrumentsAsync.when(
            data: (instruments) {
              final filtered = _filterInstruments(instruments);
              return filtered.isEmpty
                  ? Center(
                      child: Text(
                        'Không tìm thấy nhạc cụ phù hợp',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: AppColors.textSecondary,
                            ),
                      ),
                    )
                  : ListView.builder(
                      controller: widget.scrollController,
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        final instrument = filtered[index];
                        final isSelected = _selectedIds.contains(instrument.id);

                        return CheckboxListTile(
                          dense: true,
                          title: Text(
                            widget.formatInstrumentName(instrument),
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          value: isSelected,
                          onChanged: (_) => _toggleSelection(instrument.id),
                        );
                      },
                    );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, stack) => Center(
              child: Text('Error loading instruments: $error'),
            ),
          ),
        ),
      ],
    );
  }
}
