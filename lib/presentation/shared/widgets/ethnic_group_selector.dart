import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../domain/entities/ethnic_group.dart';
import '../../../domain/usecases/reference/get_ethnic_groups.dart';
import '../../../core/di/injection.dart';

/// Provider for ethnic groups list
final ethnicGroupsProvider = FutureProvider<List<EthnicGroup>>((ref) async {
  final useCase = getIt<GetEthnicGroups>();
  final result = await useCase();
  return result.fold(
    (failure) => [],
    (response) => response.items,
  );
});

/// Ethnic group selector widget with search
class EthnicGroupSelector extends ConsumerWidget {
  final String? selectedId;
  final ValueChanged<EthnicGroup?>? onSelected;
  final bool allowClear;

  const EthnicGroupSelector({
    super.key,
    this.selectedId,
    this.onSelected,
    this.allowClear = true,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final groupsAsync = ref.watch(ethnicGroupsProvider);

    return groupsAsync.when(
      data: (groups) {
        final selectedGroup = groups.firstWhere(
          (g) => g.id == selectedId,
          orElse: () => groups.first,
        );

        return Autocomplete<EthnicGroup>(
          initialValue: selectedId != null
              ? TextEditingValue(text: selectedGroup.name)
              : null,
          optionsBuilder: (textEditingValue) {
            if (textEditingValue.text.isEmpty) {
              return groups;
            }
            return groups.where((group) =>
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
            return Align(
              alignment: Alignment.topLeft,
              child: Material(
                elevation: 4,
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 200),
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: options.length,
                    itemBuilder: (context, index) {
                      final group = options.elementAt(index);
                      return ListTile(
                        title: Text(group.name),
                        subtitle: group.nameInNativeLanguage != group.name
                            ? Text(group.nameInNativeLanguage)
                            : null,
                        onTap: () => onSelected(group),
                      );
                    },
                  ),
                ),
              ),
            );
          },
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
