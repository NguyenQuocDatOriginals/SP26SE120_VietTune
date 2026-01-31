import 'dart:async';

import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/di/injection.dart';
import '../../../core/services/location_data_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/vietnamese_string_utils.dart';
import '../../../data/models/address/address_models.dart';
import '../../../domain/entities/location.dart';

/// Step in the location picker drill-down.
enum _LocationStep { province, district, ward }

/// Full-height bottom sheet: Tỉnh → Huyện → Xã with breadcrumb, search, slide, checkmark.
/// Returns [Location] when user selects a ward; null if dismissed without selection.
Future<Location?> showLocationPickerSheet(BuildContext context) async {
  return showModalBottomSheet<Location?>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Colors.transparent,
    builder: (context) => const _LocationPickerSheet(),
  );
}

class _LocationPickerSheet extends StatefulWidget {
  const _LocationPickerSheet();

  @override
  State<_LocationPickerSheet> createState() => _LocationPickerSheetState();
}

class _LocationPickerSheetState extends State<_LocationPickerSheet> {
  final LocationDataService _locationService = getIt<LocationDataService>();

  _LocationStep _step = _LocationStep.province;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocus = FocusNode();
  Timer? _searchDebounce;

  List<Province> _provinces = [];
  List<District> _districts = [];
  List<Ward> _wards = [];
  bool _loading = true;
  String? _loadError;

  Province? _selectedProvince;
  District? _selectedDistrict;
  Ward? _selectedWard;

  @override
  void initState() {
    super.initState();
    _loadProvinces();
  }

  @override
  void dispose() {
    _searchDebounce?.cancel();
    _searchController.dispose();
    _searchFocus.dispose();
    super.dispose();
  }

  Future<void> _loadProvinces() async {
    setState(() {
      _loading = true;
      _loadError = null;
    });
    try {
      final list = await _locationService.getProvinces();
      if (mounted) {
        setState(() {
          _provinces = list;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loadError = e.toString();
          _loading = false;
        });
      }
    }
  }

  Future<void> _goToDistricts(Province p) async {
    setState(() {
      _selectedProvince = p;
      _step = _LocationStep.district;
      _searchQuery = '';
      _searchController.clear();
      _loading = true;
    });
    try {
      final list = await _locationService.getDistricts(p.code);
      if (mounted) {
        setState(() {
          _districts = list;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loadError = e.toString();
          _loading = false;
        });
      }
    }
  }

  Future<void> _goToWards(District d) async {
    setState(() {
      _selectedDistrict = d;
      _step = _LocationStep.ward;
      _searchQuery = '';
      _searchController.clear();
      _loading = true;
    });
    try {
      final list = await _locationService.getWards(
        _selectedProvince!.code,
        d.code,
      );
      if (mounted) {
        setState(() {
          _wards = list;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loadError = e.toString();
          _loading = false;
        });
      }
    }
  }

  void _onSelectWard(Ward w) {
    _selectedWard = w;
    final location = Location(
      latitude: 0,
      longitude: 0,
      province: _selectedProvince!.name,
      district: _selectedDistrict!.name,
      commune: w.name,
    );
    Navigator.of(context).pop<Location?>(location);
  }

  void _onBack() {
    if (_step == _LocationStep.district) {
      setState(() {
        _step = _LocationStep.province;
        _selectedProvince = null;
        _searchQuery = '';
        _searchController.clear();
      });
    } else if (_step == _LocationStep.ward) {
      setState(() {
        _step = _LocationStep.district;
        _selectedDistrict = null;
        _searchQuery = '';
        _searchController.clear();
      });
    }
  }

  String _breadcrumbText() {
    final parts = <String>[];
    if (_selectedProvince != null) parts.add(_selectedProvince!.name);
    if (_selectedDistrict != null) parts.add(_selectedDistrict!.name);
    if (parts.isEmpty) return 'Tỉnh → Huyện → Xã';
    return parts.join(' › ');
  }

  List<Province> get _filteredProvinces {
    if (_searchQuery.isEmpty) return _provinces;
    return _provinces
        .where((p) => vietnameseContains(p.name, _searchQuery))
        .toList();
  }

  List<District> get _filteredDistricts {
    if (_searchQuery.isEmpty) return _districts;
    return _districts
        .where((d) => vietnameseContains(d.name, _searchQuery))
        .toList();
  }

  List<Ward> get _filteredWards {
    if (_searchQuery.isEmpty) return _wards;
    return _wards
        .where((w) => vietnameseContains(w.name, _searchQuery))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    final bottomPadding = media.padding.bottom;

    return Container(
      height: media.size.height * 0.88,
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          _buildHeader(context),
          _buildSearchBar(),
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 220),
              switchInCurve: Curves.easeOutCubic,
              switchOutCurve: Curves.easeInCubic,
              transitionBuilder: (child, animation) {
                return SlideTransition(
                  position: Tween<Offset>(
                    begin: const Offset(0.05, 0),
                    end: Offset.zero,
                  ).animate(animation),
                  child: child,
                );
              },
              child: KeyedSubtree(
                key: ValueKey(_step),
                child: _buildStepContent(context, bottomPadding),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    String title;
    switch (_step) {
      case _LocationStep.province:
        title = 'Chọn Tỉnh/Thành phố';
        break;
      case _LocationStep.district:
        title = 'Chọn Quận/Huyện';
        break;
      case _LocationStep.ward:
        title = 'Chọn Phường/Xã';
        break;
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (_step != _LocationStep.province)
                IconButton(
                  icon: PhosphorIcon(PhosphorIconsLight.caretLeft),
                  onPressed: _onBack,
                  style: IconButton.styleFrom(
                    foregroundColor: AppColors.textPrimary,
                  ),
                )
              else
                const SizedBox(width: 48),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      title,
                      style: AppTypography.titleMedium(color: AppColors.textPrimary).copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _breadcrumbText(),
                      style: AppTypography.bodySmall(color: AppColors.textSecondary),
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop<Location?>(null),
                child: Text(
                  'Đóng',
                  style: AppTypography.bodyMedium(color: AppColors.primary),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    String hint;
    switch (_step) {
      case _LocationStep.province:
        hint = 'Tìm Tỉnh/Thành phố...';
        break;
      case _LocationStep.district:
        hint = 'Tìm Quận/Huyện...';
        break;
      case _LocationStep.ward:
        hint = 'Tìm Phường/Xã...';
        break;
    }

    return Semantics(
      label: hint,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
        child: TextField(
          controller: _searchController,
          focusNode: _searchFocus,
          decoration: InputDecoration(
            hintText: hint,
          prefixIcon: const PhosphorIcon(PhosphorIconsLight.magnifyingGlass, size: 22),
          isDense: true,
          filled: true,
          fillColor: AppColors.surfaceElevated,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.divider),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.divider),
          ),
        ),
        onChanged: (value) {
          _searchDebounce?.cancel();
          _searchDebounce = Timer(const Duration(milliseconds: 150), () {
            if (mounted) setState(() => _searchQuery = _searchController.text);
          });
        },
        ),
      ),
    );
  }

  Widget _buildStepContent(BuildContext context, double bottomPadding) {
    if (_loading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: CircularProgressIndicator(),
        ),
      );
    }
    if (_loadError != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            _loadError!,
            style: AppTypography.bodyMedium(color: AppColors.error),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    switch (_step) {
      case _LocationStep.province:
        return _buildList<Province>(
          key: const ValueKey('province'),
          items: _filteredProvinces,
          bottomPadding: bottomPadding,
          onTap: _goToDistricts,
          isSelected: (p) => _selectedProvince?.code == p.code,
          titleBuilder: (p) => p.name,
        );
      case _LocationStep.district:
        return _buildList<District>(
          key: const ValueKey('district'),
          items: _filteredDistricts,
          bottomPadding: bottomPadding,
          onTap: _goToWards,
          isSelected: (d) => _selectedDistrict?.code == d.code,
          titleBuilder: (d) => d.name,
        );
      case _LocationStep.ward:
        return _buildList<Ward>(
          key: const ValueKey('ward'),
          items: _filteredWards,
          bottomPadding: bottomPadding,
          onTap: _onSelectWard,
          isSelected: (w) => _selectedWard?.code == w.code,
          titleBuilder: (w) => w.name,
        );
    }
  }

  Widget _buildList<T>({
    required Key key,
    required List<T> items,
    required double bottomPadding,
    required void Function(T) onTap,
    required bool Function(T) isSelected,
    required String Function(T) titleBuilder,
  }) {
    return ListView.builder(
      key: key,
      padding: EdgeInsets.only(left: 16, right: 16, bottom: bottomPadding + 16),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        final selected = isSelected(item);
        final title = titleBuilder(item);
        return Semantics(
          label: selected ? '$title, đã chọn' : title,
          button: true,
          child: ListTile(
            title: Text(
              title,
              style: AppTypography.bodyMedium(color: AppColors.textPrimary).copyWith(
                fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
            trailing: selected
                ? PhosphorIcon(PhosphorIconsLight.checkCircle, color: AppColors.primary, size: 22)
                : null,
            onTap: () => onTap(item),
          ),
        );
      },
    );
  }
}
