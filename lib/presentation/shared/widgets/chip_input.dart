import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/haptic_service.dart';

/// A widget for inputting multiple values as chips
/// 
/// Supports:
/// - Adding chips by typing and pressing Enter
/// - Removing chips by tapping the X button
/// - Suggestions dropdown
/// - Keyboard navigation
class ChipInput extends StatefulWidget {
  final List<String> chips;
  final ValueChanged<List<String>> onChipsChanged;
  final List<String>? suggestions;
  final String? label;
  final String? hintText;
  final String? helperText;
  final bool enabled;
  final bool required;
  final String? Function(List<String>)? validator;

  const ChipInput({
    super.key,
    required this.chips,
    required this.onChipsChanged,
    this.suggestions,
    this.label,
    this.hintText,
    this.helperText,
    this.enabled = true,
    this.required = false,
    this.validator,
  });

  @override
  State<ChipInput> createState() => _ChipInputState();
}

class _ChipInputState extends State<ChipInput> {
  final TextEditingController _textController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  List<String> _filteredSuggestions = [];
  bool _showSuggestions = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(_onFocusChange);
    _textController.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChange);
    _textController.removeListener(_onTextChanged);
    _textController.dispose();
    _focusNode.dispose();
    _removeOverlay();
    super.dispose();
  }

  void _onFocusChange() {
    if (_focusNode.hasFocus) {
      HapticService.onFieldFocus();
      _showSuggestionsOverlay();
    } else {
      _removeOverlay();
      // Add chip if there's text when focus is lost
      if (_textController.text.trim().isNotEmpty) {
        _addChip(_textController.text.trim());
      }
    }
  }

  void _onTextChanged() {
    final query = _textController.text.trim().toLowerCase();
    if (widget.suggestions != null && query.isNotEmpty) {
      _filteredSuggestions = widget.suggestions!
          .where((suggestion) =>
              suggestion.toLowerCase().contains(query) &&
              !widget.chips.contains(suggestion))
          .toList();
      _updateOverlay();
    } else {
      _filteredSuggestions = [];
      _updateOverlay();
    }
  }

  void _showSuggestionsOverlay() {
    if (widget.suggestions == null || _filteredSuggestions.isEmpty) {
      _removeOverlay();
      return;
    }

    _overlayEntry = _createOverlayEntry();
    Overlay.of(context).insert(_overlayEntry!);
    setState(() => _showSuggestions = true);
  }

  void _updateOverlay() {
    if (_showSuggestions && _focusNode.hasFocus) {
      _removeOverlay();
      if (_filteredSuggestions.isNotEmpty) {
        _showSuggestionsOverlay();
      }
    }
  }

  void _removeOverlay() {
    _overlayEntry?.remove();
    _overlayEntry = null;
    setState(() => _showSuggestions = false);
  }

  OverlayEntry _createOverlayEntry() {
    final RenderBox renderBox = context.findRenderObject() as RenderBox;
    final size = renderBox.size;

    return OverlayEntry(
      builder: (context) => Positioned(
        width: size.width,
        child: CompositedTransformFollower(
          link: _layerLink,
          showWhenUnlinked: false,
          offset: Offset(0.0, size.height + 4.0),
          child: Material(
            elevation: 4,
            borderRadius: BorderRadius.circular(12),
            color: AppColors.surface,
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 200),
              child: ListView.builder(
                shrinkWrap: true,
                padding: const EdgeInsets.symmetric(vertical: 8),
                itemCount: _filteredSuggestions.length,
                itemBuilder: (context, index) {
                  final suggestion = _filteredSuggestions[index];
                  return ListTile(
                    dense: true,
                    title: Text(suggestion),
                    onTap: () {
                      _addChip(suggestion);
                      _textController.clear();
                      _removeOverlay();
                      _focusNode.unfocus();
                    },
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _addChip(String value) {
    if (value.isEmpty) return;
    if (widget.chips.contains(value)) return;

    final newChips = [...widget.chips, value];
    widget.onChipsChanged(newChips);
    _textController.clear();
    HapticService.onButtonTap();
  }

  void _removeChip(String chip) {
    final newChips = widget.chips.where((c) => c != chip).toList();
    widget.onChipsChanged(newChips);
    HapticService.onButtonTap();
  }

  @override
  Widget build(BuildContext context) {
    final errorText = widget.validator?.call(widget.chips);
    final hasError = errorText != null;
    final isFocused = _focusNode.hasFocus;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
          if (widget.label != null) ...[
            Text(
              widget.label! + (widget.required ? ' *' : ''),
              style: AppTypography.labelLarge(
                color: widget.enabled 
                    ? AppColors.textPrimary 
                    : AppColors.textSecondary,
              ).copyWith(fontWeight: FontWeight.w600, height: 1.4),
            ),
            const SizedBox(height: 8),
          ],
          CompositedTransformTarget(
            link: _layerLink,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeInOut,
              decoration: BoxDecoration(
                color: widget.enabled 
                    ? AppColors.surface 
                    : AppColors.backgroundDark,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: hasError
                      ? AppColors.error
                      : isFocused
                          ? AppColors.primary
                          : AppColors.divider,
                  width: hasError || isFocused ? 2 : 1,
                ),
                boxShadow: isFocused && !hasError
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.1),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ]
                    : null,
              ),
              padding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 10,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Existing chips
                  if (widget.chips.isNotEmpty)
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: widget.chips.map((chip) {
                        return Chip(
                          label: Text(
                            chip,
                            style: AppTypography.labelMedium(),
                          ),
                          onDeleted: widget.enabled
                              ? () => _removeChip(chip)
                              : null,
                          deleteIcon: const PhosphorIcon(PhosphorIconsLight.x, size: 18),
                          backgroundColor: AppColors.primary.withOpacity(0.1),
                          deleteIconColor: AppColors.textSecondary,
                          side: BorderSide(
                            color: AppColors.primary.withOpacity(0.3),
                            width: 1,
                          ),
                          labelStyle: AppTypography.labelMedium(color: AppColors.textPrimary),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        );
                      }).toList(),
                    ),
                  // Input field
                  TextField(
                    controller: _textController,
                    focusNode: _focusNode,
                    enabled: widget.enabled,
                    style: AppTypography.bodyLarge(
                      color: widget.enabled 
                          ? AppColors.textPrimary 
                          : AppColors.textSecondary,
                    ).copyWith(height: 1.5),
                    decoration: InputDecoration(
                      hintText: widget.hintText ?? 'Nhập và nhấn Enter',
                      hintStyle: AppTypography.bodyMedium(
                        color: AppColors.textSecondary.withOpacity(0.7),
                      ),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: widget.chips.isEmpty 
                          ? EdgeInsets.zero 
                          : const EdgeInsets.only(top: 4),
                    ),
                    onSubmitted: (value) {
                      if (value.trim().isNotEmpty) {
                        _addChip(value.trim());
                        _removeOverlay();
                      }
                    },
                  ),
                ],
              ),
            ),
          ),
          if (errorText != null) ...[
            const SizedBox(height: 6),
            AnimatedOpacity(
              opacity: hasError ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 200),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  PhosphorIcon(
                    PhosphorIconsLight.warning,
                    size: 16,
                    color: AppColors.error,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      errorText,
                      style: AppTypography.bodySmall(color: AppColors.error).copyWith(
                        fontWeight: FontWeight.w500,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
          if (widget.helperText != null && errorText == null) ...[
            const SizedBox(height: 6),
            Text(
              widget.helperText!,
              style: AppTypography.bodySmall(
                color: AppColors.textSecondary.withOpacity(0.8),
              ).copyWith(height: 1.4),
            ),
          ],
      ],
    );
  }
}
