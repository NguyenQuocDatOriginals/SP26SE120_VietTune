import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/haptic_service.dart';

/// Progressive Disclosure Section widget
/// 
/// Shows required fields first, with optional fields in an expandable section.
/// This reduces cognitive load by making forms appear shorter initially.
class ProgressiveDisclosureSection extends StatefulWidget {
  final String? title;
  final List<Widget> requiredFields;
  final List<Widget> optionalFields;
  final String expandButtonText;
  final String collapseButtonText;
  
  const ProgressiveDisclosureSection({
    super.key,
    this.title,
    required this.requiredFields,
    this.optionalFields = const [],
    this.expandButtonText = '+ Thêm chi tiết',
    this.collapseButtonText = '- Ẩn chi tiết',
  });
  
  @override
  State<ProgressiveDisclosureSection> createState() => 
      _ProgressiveDisclosureSectionState();
}

class _ProgressiveDisclosureSectionState 
    extends State<ProgressiveDisclosureSection> {
  bool _isExpanded = false;
  
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title (optional)
        if (widget.title != null) ...[
          Text(
            widget.title!,
            style: AppTypography.titleMedium(color: AppColors.textPrimary).copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
        ],
        
        // Required fields (always visible)
        ...widget.requiredFields,
        
        // Expand/Collapse button
        if (widget.optionalFields.isNotEmpty) ...[
          const SizedBox(height: 8),
          AnimatedCrossFade(
            firstChild: _buildExpandButton(),
            secondChild: _buildCollapseButton(),
            crossFadeState: _isExpanded 
                ? CrossFadeState.showSecond 
                : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 200),
          ),
        ],
        
        // Optional fields (expandable)
        AnimatedSize(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          child: _isExpanded
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 16),
                    ...widget.optionalFields,
                  ],
                )
              : const SizedBox.shrink(),
        ),
      ],
    );
  }
  
  Widget _buildExpandButton() {
    return Semantics(
      label: widget.expandButtonText,
      hint: 'Chạm để hiện thêm các trường tùy chọn',
      button: true,
      child: TextButton.icon(
        onPressed: () {
          setState(() => _isExpanded = true);
          HapticService.onFieldFocus();
        },
        icon: PhosphorIcon(
          PhosphorIconsLight.plusCircle,
          size: 18,
        ),
        label: Text(
          widget.expandButtonText,
          style: AppTypography.labelLarge().copyWith(fontWeight: FontWeight.w500),
        ),
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        ),
      ),
    );
  }
  
  Widget _buildCollapseButton() {
    return Semantics(
      label: widget.collapseButtonText,
      hint: 'Chạm để ẩn các trường tùy chọn',
      button: true,
      child: TextButton.icon(
        onPressed: () {
          setState(() => _isExpanded = false);
          HapticService.onFieldFocus();
        },
        icon: PhosphorIcon(
          PhosphorIconsLight.minusCircle,
          size: 18,
        ),
        label: Text(
          widget.collapseButtonText,
          style: AppTypography.labelLarge(color: AppColors.textSecondary).copyWith(fontWeight: FontWeight.w500),
        ),
        style: TextButton.styleFrom(
          foregroundColor: AppColors.textSecondary,
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        ),
      ),
    );
  }
}
