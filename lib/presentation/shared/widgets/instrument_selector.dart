import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../domain/entities/instrument.dart';
import '../../../domain/entities/enums.dart';
import '../../../domain/repositories/base_repository.dart';
import '../../../domain/usecases/reference/get_instruments.dart';
import '../../../core/di/injection.dart';

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
  InstrumentType? _selectedCategory;

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

  @override
  Widget build(BuildContext context) {
    final instrumentsAsync = ref.watch(instrumentsProvider);

    return instrumentsAsync.when(
      data: (instruments) {
        final categories = InstrumentType.values;
        final filteredInstruments = _selectedCategory == null
            ? instruments
            : instruments.where((i) => i.type == _selectedCategory).toList();

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Category filter
            SizedBox(
              height: 50,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  _buildCategoryChip(null, 'Tất cả', instruments.length),
                  ...categories.map((category) => _buildCategoryChip(
                        category,
                        _getCategoryName(category),
                        instruments.where((i) => i.type == category).length,
                      )),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Selected count
            if (_selectedIds.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(
                  'Đã chọn: ${_selectedIds.length}',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
            // Instruments list
            Expanded(
              child: ListView.builder(
                itemCount: filteredInstruments.length,
                itemBuilder: (context, index) {
                  final instrument = filteredInstruments[index];
                  final isSelected = _selectedIds.contains(instrument.id);

                  return CheckboxListTile(
                    title: Text(instrument.name),
                    subtitle: instrument.description != null
                        ? Text(
                            instrument.description!,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          )
                        : null,
                    value: isSelected,
                    onChanged: (_) => _toggleSelection(instrument.id),
                  );
                },
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

  Widget _buildCategoryChip(InstrumentType? category, String label, int count) {
    final isSelected = _selectedCategory == category;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text('$label ($count)'),
        selected: isSelected,
        onSelected: (selected) {
          setState(() => _selectedCategory = selected ? category : null);
        },
      ),
    );
  }

  String _getCategoryName(InstrumentType type) {
    switch (type) {
      case InstrumentType.string:
        return 'Dây';
      case InstrumentType.wind:
        return 'Hơi';
      case InstrumentType.percussion:
        return 'Gõ';
      case InstrumentType.keyboard:
        return 'Phím';
      case InstrumentType.other:
        return 'Khác';
    }
  }
}
