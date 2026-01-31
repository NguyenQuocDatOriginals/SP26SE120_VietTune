import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:speech_to_text/speech_to_text.dart';
import '../../../core/theme/app_theme.dart';
import '../../discovery/pages/search_page.dart';
import 'ethnic_group_selector.dart';
import 'instrument_selector.dart';

/// Omni-Search Header - Intelligent search entry point
class OmniSearchHeader extends ConsumerStatefulWidget {
  final bool isFixed;

  const OmniSearchHeader({
    super.key,
    this.isFixed = false,
  });

  @override
  ConsumerState<OmniSearchHeader> createState() => _OmniSearchHeaderState();
}

class _OmniSearchHeaderState extends ConsumerState<OmniSearchHeader> {
  final List<String> _dynamicPlaceholders = [
    'Tìm bài hát cầu mưa của người Thái...',
    'So sánh đàn Bầu và đàn Nhị...',
    'Nhạc cụ nào dùng trong lễ hội?',
    'Tìm dân ca miền Bắc...',
    'Bài hát nghi lễ của người H\'Mông...',
    'Nhạc cụ truyền thống Việt Nam...',
  ];
  int _placeholderIndex = 0;
  final SpeechToText _speechToText = SpeechToText();
  bool _isListening = false;
  bool _speechAvailable = false;

  @override
  void initState() {
    super.initState();
    _initSpeechState();
    _rotatePlaceholder();
  }

  Future<void> _initSpeechState() async {
    _speechAvailable = await _speechToText.initialize();
    setState(() {});
  }

  void _rotatePlaceholder() {
    Future.delayed(const Duration(seconds: 4), () {
      if (mounted) {
        setState(() {
          _placeholderIndex = (_placeholderIndex + 1) % _dynamicPlaceholders.length;
        });
        _rotatePlaceholder();
      }
    });
  }

  void _openSearchModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _OmniSearchModal(
        speechToText: _speechToText,
        speechAvailable: _speechAvailable,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        top: widget.isFixed ? MediaQuery.of(context).padding.top + 8 : 0,
        left: 20,
        right: 20,
        bottom: 16,
      ),
      decoration: widget.isFixed
          ? BoxDecoration(
              color: AppColors.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            )
          : null,
      child: GestureDetector(
        onTap: _openSearchModal,
        child: Container(
          height: 64,
          padding: const EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(32),
            border: Border.all(
              color: AppColors.border,
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.12),
                blurRadius: 20,
                offset: const Offset(0, 8),
                spreadRadius: 0,
              ),
            ],
          ),
          child: Row(
            children: [
              PhosphorIcon(
                PhosphorIconsLight.magnifyingGlass,
                color: AppColors.textSecondary,
                size: 24,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: Text(
                    _dynamicPlaceholders[_placeholderIndex],
                    key: ValueKey(_placeholderIndex),
                    style: AppTypography.bodyLarge(
                      color: AppColors.textSecondary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              GestureDetector(
                onTap: () => _openVoiceSearch(context),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: PhosphorIcon(
                    PhosphorIconsLight.microphone,
                    color: AppColors.primary,
                    size: 20,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openVoiceSearch(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _VoiceSearchModal(
        speechToText: _speechToText,
        speechAvailable: _speechAvailable,
      ),
    );
  }
}

/// Omni-Search Modal with voice search and quick filters
class _OmniSearchModal extends ConsumerStatefulWidget {
  final SpeechToText speechToText;
  final bool speechAvailable;

  const _OmniSearchModal({
    required this.speechToText,
    required this.speechAvailable,
  });

  @override
  ConsumerState<_OmniSearchModal> createState() => _OmniSearchModalState();
}

class _OmniSearchModalState extends ConsumerState<_OmniSearchModal> {
  final _searchController = TextEditingController();
  bool _isListening = false;
  String _lastWords = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _startListening() async {
    if (!widget.speechAvailable) return;

    _lastWords = '';
    _searchController.clear();
    await widget.speechToText.listen(
      onResult: (result) {
        setState(() {
          _lastWords = result.recognizedWords;
          _searchController.text = _lastWords;
        });
      },
      listenFor: const Duration(seconds: 30),
      pauseFor: const Duration(seconds: 3),
      localeId: 'vi_VN',
    );
    setState(() => _isListening = true);
  }

  void _stopListening() async {
    await widget.speechToText.stop();
    setState(() => _isListening = false);
    if (_lastWords.isNotEmpty) {
      _performSearch();
    }
  }

  void _performSearch() {
    if (_searchController.text.trim().isEmpty) return;
    context.pop();
    context.pushNamed(
      'discover-search',
      extra: {'query': _searchController.text.trim()},
    );
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) => Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            // Handle bar
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            // Header
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      'Tìm kiếm thông minh',
                      style: AppTypography.heading4(),
                    ),
                  ),
                  IconButton(
                    icon: const PhosphorIcon(PhosphorIconsLight.x),
                    onPressed: () => context.pop(),
                  ),
                ],
              ),
            ),
            // Search input
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Container(
                height: 56,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(
                    color: AppColors.border,
                    width: 1.5,
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        style: AppTypography.bodyLarge(),
                        decoration: InputDecoration(
                          hintText: 'Nhập từ khóa tìm kiếm...',
                          hintStyle: AppTypography.bodyLarge(
                            color: AppColors.textSecondary,
                          ),
                          border: InputBorder.none,
                        ),
                        onSubmitted: (_) => _performSearch(),
                      ),
                    ),
                    const SizedBox(width: 12),
                    GestureDetector(
                      onTap: _isListening ? _stopListening : _startListening,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: _isListening
                              ? AppColors.error
                              : AppColors.primary.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: PhosphorIcon(
                          _isListening ? PhosphorIconsLight.stop : PhosphorIconsLight.microphone,
                          color: _isListening
                              ? AppColors.textOnPrimary
                              : AppColors.primary,
                          size: 20,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (_isListening) ...[
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      PhosphorIcon(
                        PhosphorIconsLight.microphone,
                        color: AppColors.primary,
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _lastWords.isEmpty
                              ? 'Đang nghe...'
                              : _lastWords,
                          style: AppTypography.bodyMedium(
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
            const SizedBox(height: 24),
            // Quick Filters Section
            Expanded(
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  Text(
                    'Lọc nhanh',
                    style: AppTypography.heading5(),
                  ),
                  const SizedBox(height: 16),
                  _QuickFiltersSection(),
                  const SizedBox(height: 32),
                ],
              ),
            ),
            // Search button
            Padding(
              padding: const EdgeInsets.all(20),
              child: SizedBox(
                width: double.infinity,
                child: AppTheme.createPillButton(
                  onPressed: _performSearch,
                  isFullWidth: true,
                  child: Text(
                    'Tìm kiếm',
                    style: AppTypography.button(),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Voice Search Modal (simplified version)
class _VoiceSearchModal extends ConsumerStatefulWidget {
  final SpeechToText speechToText;
  final bool speechAvailable;

  const _VoiceSearchModal({
    required this.speechToText,
    required this.speechAvailable,
  });

  @override
  ConsumerState<_VoiceSearchModal> createState() => _VoiceSearchModalState();
}

class _VoiceSearchModalState extends ConsumerState<_VoiceSearchModal> {
  bool _isListening = false;
  String _lastWords = '';
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _startListening() async {
    if (!widget.speechAvailable) return;

    _lastWords = '';
    _searchController.clear();
    await widget.speechToText.listen(
      onResult: (result) {
        setState(() {
          _lastWords = result.recognizedWords;
          _searchController.text = _lastWords;
        });
      },
      listenFor: const Duration(seconds: 30),
      pauseFor: const Duration(seconds: 3),
      localeId: 'vi_VN',
    );
    setState(() => _isListening = true);
  }

  void _stopListening() async {
    await widget.speechToText.stop();
    setState(() => _isListening = false);
    if (_lastWords.isNotEmpty) {
      _performSearch();
    }
  }

  void _performSearch() {
    if (_searchController.text.trim().isEmpty) return;
    context.pop();
    context.pushNamed(
      'discover-search',
      extra: {'query': _searchController.text.trim()},
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 400,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Close button
          Align(
            alignment: Alignment.topRight,
            child: IconButton(
              icon: const PhosphorIcon(PhosphorIconsLight.x),
              onPressed: () => context.pop(),
            ),
          ),
          // Microphone animation
          GestureDetector(
            onTap: _isListening ? _stopListening : _startListening,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: _isListening
                    ? AppColors.error
                    : AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: (_isListening
                            ? AppColors.error
                            : AppColors.primary)
                        .withValues(alpha: 0.3),
                    blurRadius: 20,
                    spreadRadius: _isListening ? 10 : 0,
                  ),
                ],
              ),
              child: PhosphorIcon(
                _isListening ? PhosphorIconsLight.stop : PhosphorIconsLight.microphone,
                size: 48,
                color: _isListening
                    ? AppColors.textOnPrimary
                    : AppColors.primary,
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            _isListening ? 'Đang nghe...' : 'Nhấn để bắt đầu nói',
            style: AppTypography.heading5(),
          ),
          if (_lastWords.isNotEmpty) ...[
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  _lastWords,
                  style: AppTypography.bodyLarge(),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ],
          if (_lastWords.isNotEmpty) ...[
            const SizedBox(height: 24),
            AppTheme.createPillButton(
              onPressed: _performSearch,
              child: Text(
                'Tìm kiếm',
                style: AppTypography.button(),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Quick Filters Section
class _QuickFiltersSection extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Ethnic Groups
        _FilterChipGroup(
          title: 'Dân tộc',
          icon: PhosphorIconsLight.users,
          onTap: () {
            // Show ethnic group selector
            showModalBottomSheet(
              context: context,
              builder: (context) => EthnicGroupSelector(
                onSelected: (group) {
                  // Navigate to search with filter
                  context.pop();
                  if (group != null) {
                    context.pushNamed(
                      'discover-search',
                      extra: {'ethnicGroupIds': [group.id]},
                    );
                  }
                },
              ),
            );
          },
        ),
        const SizedBox(height: 16),
        // Instruments
        _FilterChipGroup(
          title: 'Nhạc cụ',
          icon: PhosphorIconsLight.musicNotes,
          onTap: () {
            // Show instrument selector
            showModalBottomSheet(
              context: context,
              builder: (context) => InstrumentSelector(
                onSelectionChanged: (ids) {
                  // Navigate to search with filter
                  context.pop();
                  if (ids.isNotEmpty) {
                    context.pushNamed(
                      'discover-search',
                      extra: {'instrumentIds': ids},
                    );
                  }
                },
              ),
            );
          },
        ),
        const SizedBox(height: 16),
        // Regions
        _FilterChipGroup(
          title: 'Vùng miền',
          icon: PhosphorIconsLight.mapTrifold,
          onTap: () {
            // Show region selector
            _showRegionSelector(context);
          },
        ),
      ],
    );
  }

  void _showRegionSelector(BuildContext context) {
    final regions = ['Miền Bắc', 'Miền Trung', 'Miền Nam', 'Tây Nguyên'];
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Chọn vùng miền',
              style: AppTypography.heading5(),
            ),
            const SizedBox(height: 16),
            ...regions.map((region) => ListTile(
                  title: Text(region),
                  onTap: () {
                    context.pop();
                    context.pushNamed(
                      'discover-search',
                      extra: {'region': region},
                    );
                  },
                )),
          ],
        ),
      ),
    );
  }
}

/// Filter Chip Group Widget
class _FilterChipGroup extends StatelessWidget {
  final String title;
  final IconData icon;
  final VoidCallback onTap;

  const _FilterChipGroup({
    required this.title,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: AppColors.border,
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: PhosphorIcon(
                icon,
                color: AppColors.primary,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: AppTypography.labelLarge(),
              ),
            ),
            PhosphorIcon(
              PhosphorIconsLight.caretRight,
              color: AppColors.textSecondary,
            ),
          ],
        ),
      ),
    );
  }
}
