import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../domain/entities/ethnic_group.dart';
import '../../../domain/usecases/reference/get_ethnic_groups.dart';
import '../../../core/di/injection.dart';
import '../../../core/services/ethnic_group_suggestion_service.dart';
import '../../../core/services/haptic_service.dart';
import '../../../core/theme/app_theme.dart';

/// Provider for ethnic groups list
final ethnicGroupsProvider = FutureProvider<List<EthnicGroup>>((ref) async {
  final useCase = getIt<GetEthnicGroups>();
  final result = await useCase();
  return result.fold(
    (failure) => [],
    (response) => response.items,
  );
});

/// Ethnic group selector widget with search and smart suggestions
class EthnicGroupSelector extends ConsumerWidget {
  final String? selectedId;
  final ValueChanged<EthnicGroup?>? onSelected;
  final bool allowClear;
  final String? province; // For smart suggestions

  const EthnicGroupSelector({
    super.key,
    this.selectedId,
    this.onSelected,
    this.allowClear = true,
    this.province,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final groupsAsync = ref.watch(ethnicGroupsProvider);
    final suggestionService = getIt<EthnicGroupSuggestionService>();

    return groupsAsync.when(
      data: (groups) {
        // Sort groups: priority first (if province provided), then alphabetical
        final sortedGroups = suggestionService.sortGroupsByPriority(
          groups,
          province,
        );
        
        // Get priority groups for suggestions badge
        final priorityGroups = suggestionService.getPriorityGroups(
          groups,
          province,
        );

        final selectedGroup = sortedGroups.firstWhere(
          (g) => g.id == selectedId,
          orElse: () => sortedGroups.isNotEmpty ? sortedGroups.first : groups.first,
        );

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Suggested groups badge (if province provided and has suggestions)
            if (province != null && priorityGroups.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: AppColors.primary.withOpacity(0.3),
                    width: 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.location_on,
                          size: 16,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Gợi ý cho $province:',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: priorityGroups.take(5).map((group) {
                        final isSelected = group.id == selectedId;
                        return FilterChip(
                          label: Text(
                            group.name,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.normal,
                              color: isSelected
                                  ? AppColors.textOnPrimary
                                  : AppColors.textPrimary,
                            ),
                          ),
                          selected: isSelected,
                          selectedColor: AppColors.primary,
                          checkmarkColor: AppColors.textOnPrimary,
                          onSelected: (selected) {
                            HapticService.onButtonTap();
                            onSelected?.call(selected ? group : null);
                          },
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
            ],
            
            // Autocomplete dropdown
            Autocomplete<EthnicGroup>(
          initialValue: selectedId != null
              ? TextEditingValue(text: selectedGroup.name)
              : null,
          optionsBuilder: (textEditingValue) {
            if (textEditingValue.text.isEmpty) {
              return sortedGroups;
            }
            return sortedGroups.where((group) =>
                group.name.toLowerCase().contains(
                      textEditingValue.text.toLowerCase(),
                    ) ||
                group.nameInNativeLanguage.toLowerCase().contains(
                      textEditingValue.text.toLowerCase(),
                    ));
          },
          displayStringForOption: (option) => option.name,
          onSelected: (group) => onSelected?.call(group),
          fieldViewBuilder: (
            context,
            textEditingController,
            focusNode,
            onFieldSubmitted,
          ) {
            return TextFormField(
              controller: textEditingController,
              focusNode: focusNode,
              decoration: InputDecoration(
                labelText: 'Dân tộc',
                border: const OutlineInputBorder(),
                suffixIcon: allowClear && selectedId != null
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          textEditingController.clear();
                          onSelected?.call(null);
                        },
                      )
                    : null,
              ),
              onFieldSubmitted: (value) => onFieldSubmitted(),
            );
          },
          optionsViewBuilder: (context, onSelected, options) {
            // Sort options: priority first
            final sortedOptions = suggestionService.sortGroupsByPriority(
              options.toList(),
              province,
            );
            return Align(
              alignment: Alignment.topLeft,
              child: Material(
                elevation: 4,
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 200),
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: sortedOptions.length,
                    itemBuilder: (context, index) {
                      final group = sortedOptions[index];
                      final isPriority = priorityGroups.any((g) => g.id == group.id);
                      return ListTile(
                        leading: isPriority
                            ? Icon(
                                Icons.star,
                                size: 18,
                                color: AppColors.primary,
                              )
                            : null,
                        title: Text(group.name),
                        subtitle: group.nameInNativeLanguage != group.name
                            ? Text(group.nameInNativeLanguage)
                            : null,
                        onTap: () {
                          HapticService.onButtonTap();
                          onSelected(group);
                        },
                      );
                    },
                  ),
                ),
              ),
            );
          },
            ),
          ],
        );
      },
      loading: () => const TextField(
        decoration: InputDecoration(
          labelText: 'Dân tộc',
          border: OutlineInputBorder(),
          suffixIcon: SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        ),
        enabled: false,
      ),
      error: (error, stack) => TextField(
        decoration: InputDecoration(
          labelText: 'Dân tộc',
          border: const OutlineInputBorder(),
          errorText: 'Error loading ethnic groups',
        ),
        enabled: false,
      ),
    );
  }
}
