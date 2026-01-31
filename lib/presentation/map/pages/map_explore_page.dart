import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../../core/theme/app_theme.dart';

/// Map exploration page with heatmap visualization
class MapExplorePage extends ConsumerStatefulWidget {
  const MapExplorePage({super.key});

  @override
  ConsumerState<MapExplorePage> createState() => _MapExplorePageState();
}

class _MapExplorePageState extends ConsumerState<MapExplorePage> {
  String? _selectedEthnicGroup;
  String? _selectedRegion;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bản đồ âm nhạc'),
        actions: [
          IconButton(
            icon: PhosphorIcon(PhosphorIconsLight.funnel),
            onPressed: _showFilters,
            tooltip: 'Lọc dữ liệu',
          ),
        ],
      ),
      body: Container(
        decoration: AppTheme.gradientBackground,
        child: Column(
          children: [
            // Filter chips bar
            if (_selectedEthnicGroup != null || _selectedRegion != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    if (_selectedEthnicGroup != null)
                      Chip(
                        label: Text('Dân tộc: $_selectedEthnicGroup'),
                        onDeleted: () {
                          setState(() => _selectedEthnicGroup = null);
                        },
                      ),
                    if (_selectedRegion != null) ...[
                      const SizedBox(width: 8),
                      Chip(
                        label: Text('Vùng: $_selectedRegion'),
                        onDeleted: () {
                          setState(() => _selectedRegion = null);
                        },
                      ),
                    ],
                    const Spacer(),
                    TextButton(
                      onPressed: () {
                        setState(() {
                          _selectedEthnicGroup = null;
                          _selectedRegion = null;
                        });
                      },
                      child: const Text('Xóa tất cả'),
                    ),
                  ],
                ),
              ),
            
            // Map placeholder - will integrate flutter_map
            Expanded(
              child: Container(
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Stack(
                  children: [
                    // Placeholder for map
                    Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          PhosphorIcon(
                            PhosphorIconsLight.mapTrifold,
                            size: 64,
                            color: AppColors.textSecondary,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Bản đồ Việt Nam',
                            style: AppTypography.titleLarge(),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Heatmap sẽ hiển thị mật độ bản thu âm\nVùng xám = chưa có dữ liệu',
                            style: AppTypography.bodyMedium(color: AppColors.textSecondary),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton.icon(
                            onPressed: () {
                              // TODO: Integrate flutter_map
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Tính năng bản đồ đang được phát triển'),
                                ),
                              );
                            },
                            icon: PhosphorIcon(PhosphorIconsLight.compass),
                            label: const Text('Khám phá bản đồ'),
                          ),
                        ],
                      ),
                    ),
                    
                    // Legend
                    Positioned(
                      top: 16,
                      right: 16,
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.1),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Chú thích',
                              style: AppTypography.titleSmall().copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            _buildLegendItem('Nhiều bản thu', AppColors.primary),
                            _buildLegendItem('Trung bình', AppColors.primaryLight),
                            _buildLegendItem('Ít bản thu', AppColors.secondaryLight),
                            _buildLegendItem('Chưa có dữ liệu', AppColors.textSecondary),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            // Stats bar
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                border: Border(
                  top: BorderSide(color: AppColors.border),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStatItem(
                    context,
                    'Tổng bản thu',
                    '1,234',
                    PhosphorIconsLight.musicNotes,
                  ),
                  _buildStatItem(
                    context,
                    'Vùng đã khảo sát',
                    '45/63',
                    PhosphorIconsLight.mapTrifold,
                  ),
                  _buildStatItem(
                    context,
                    'Dân tộc',
                    '32/54',
                    PhosphorIconsLight.users,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'map-add-recording-fab',
        onPressed: () {
          // Navigate to contribute
          // TODO: Navigate to contribute page
        },
        icon: PhosphorIcon(PhosphorIconsLight.mapPin),
        label: const Text('Thêm bản thu'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textOnPrimary,
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Container(
            width: 16,
            height: 16,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: AppTypography.bodySmall(),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(
    BuildContext context,
    String label,
    String value,
    IconData icon,
  ) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        PhosphorIcon(icon, color: AppColors.primary, size: 24),
        const SizedBox(height: 4),
        Text(
          value,
          style: AppTypography.titleLarge().copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: AppTypography.bodySmall(color: AppColors.textSecondary),
        ),
      ],
    );
  }

  void _showFilters() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Lọc dữ liệu',
              style: AppTypography.titleLarge().copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Dân tộc',
              style: AppTypography.titleMedium(),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                'Tất cả',
                'Kinh',
                'Tày',
                'Thái',
                'H\'Mông',
                'Khơ-me',
                'Mường',
              ].map((group) {
                final isSelected = _selectedEthnicGroup == group;
                return FilterChip(
                  label: Text(group),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      _selectedEthnicGroup = selected ? group : null;
                    });
                    Navigator.pop(context);
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            Text(
              'Vùng miền',
              style: AppTypography.titleMedium(),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                'Tất cả',
                'Tây Bắc',
                'Đông Bắc',
                'Đồng bằng sông Hồng',
                'Bắc Trung Bộ',
                'Duyên hải Nam Trung Bộ',
                'Tây Nguyên',
                'Đông Nam Bộ',
                'Đồng bằng sông Cửu Long',
              ].map((region) {
                final isSelected = _selectedRegion == region;
                return FilterChip(
                  label: Text(region),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      _selectedRegion = selected ? region : null;
                    });
                    Navigator.pop(context);
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
