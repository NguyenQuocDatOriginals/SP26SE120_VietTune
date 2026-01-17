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
    widget.onSelectionChanged?.call(_selectedIds);
  }

  void _clearSearch() {
    setState(() {
      _searchController.clear();
      _searchQuery = '';
    });
  }

  List<Instrument> _filterInstruments(List<Instrument> instruments) {
    var filtered = instruments;

    // Filter by category
    if (_selectedCategory != null) {
      filtered = filtered.where((i) => i.type == _selectedCategory).toList();
    }

    // Filter by search query
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((instrument) {
        final nameLower = instrument.name.toLowerCase();
        final descriptionLower = instrument.description.toLowerCase();
        return nameLower.contains(_searchQuery) ||
            descriptionLower.contains(_searchQuery);
      }).toList();
    }

    return filtered;
  }

  void _showInstrumentDetails(BuildContext context, Instrument instrument) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Text(
                instrument.name,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 8),
              // Type badge
              Chip(
                label: Text(_getCategoryName(instrument.type)),
                backgroundColor: Theme.of(context).colorScheme.primaryContainer,
              ),
              const SizedBox(height: 16),
              // Description
              Text(
                instrument.description,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              // Materials
              if ((instrument.materials?.length ?? 0) > 0) ...[
                const SizedBox(height: 16),
                Text(
                  'Chất liệu:',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  instrument.materials?.join(', ') ?? '',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
              // Playing technique
              if ((instrument.playingTechnique?.isNotEmpty ?? false)) ...[
                const SizedBox(height: 16),
                Text(
                  'Kỹ thuật chơi:',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  instrument.playingTechnique ?? '',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
              // Associated ethnic groups
              if ((instrument.associatedEthnicGroups?.length ?? 0) > 0) ...[
                const SizedBox(height: 16),
                Text(
                  'Dân tộc liên quan:',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 4),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: (instrument.associatedEthnicGroups ?? [])
                      .map((id) => Chip(
                            label: Text(id),
                            visualDensity: VisualDensity.compact,
                          ))
                      .toList(),
                ),
              ],
              const SizedBox(height: 16),
              // Close button
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Đóng'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final instrumentsAsync = ref.watch(instrumentsProvider);

    return instrumentsAsync.when(
      data: (instruments) {
        final categories = InstrumentType.values;
        final filteredInstruments = _filterInstruments(instruments);

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search bar
            TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Tìm kiếm nhạc cụ...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: _clearSearch,
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              onChanged: (value) {
                setState(() => _searchQuery = value.toLowerCase());
              },
            ),
            const SizedBox(height: 12),
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
            const SizedBox(height: 12),
            // Selected count
            if (_selectedIds.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(
                  'Đã chọn: ${_selectedIds.length}',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                ),
              ),
            // Instruments list
            Expanded(
              child: filteredInstruments.isEmpty
                  ? Center(
                      child: Text(
                        'Không tìm thấy nhạc cụ phù hợp',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.grey[600],
                            ),
                      ),
                    )
                  : ListView.builder(
                      itemCount: filteredInstruments.length,
                      itemBuilder: (context, index) {
                        final instrument = filteredInstruments[index];
                        final isSelected = _selectedIds.contains(instrument.id);

                        return ListTile(
                          dense: true,
                          contentPadding:
                              const EdgeInsets.symmetric(horizontal: 8),
                          leading: Checkbox(
                            value: isSelected,
                            onChanged: (_) => _toggleSelection(instrument.id),
                          ),
                          title: Row(
                            children: [
                              Expanded(
                                child: Text(instrument.name),
                              ),
                              IconButton(
                                icon: Icon(
                                  Icons.info_outline,
                                  size: 20,
                                  color: Colors.grey[600],
                                ),
                                onPressed: () =>
                                    _showInstrumentDetails(context, instrument),
                                tooltip: 'Xem chi tiết',
                              ),
                            ],
                          ),
                          onTap: () => _toggleSelection(instrument.id),
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
