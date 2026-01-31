import 'dart:io';
import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../../domain/entities/image_metadata.dart';
import '../../../core/services/image_storage_service.dart';
import '../../../core/di/injection.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/haptic_service.dart';

/// Widget for displaying a single image preview
/// 
/// Shows thumbnail with loading states, tap to view full screen,
/// and remove button.
class ImagePreviewWidget extends StatelessWidget {
  final ImageMetadata image;
  final VoidCallback? onRemove;
  final VoidCallback? onTap;
  final bool showRemoveButton;
  final double? width;
  final double? height;
  final BoxFit fit;

  const ImagePreviewWidget({
    super.key,
    required this.image,
    this.onRemove,
    this.onTap,
    this.showRemoveButton = true,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
  });

  @override
  Widget build(BuildContext context) {
    final storageService = getIt<ImageStorageService>();
    
    return FutureBuilder<File?>(
      future: storageService.getFileFromRelativePath(image.relativePath),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return _buildLoadingPlaceholder();
        }

        if (snapshot.hasError || snapshot.data == null) {
          return _buildErrorPlaceholder();
        }

        final file = snapshot.data!;
        
        return GestureDetector(
          onTap: onTap,
          child: Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.file(
                  file,
                  width: width,
                  height: height,
                  fit: fit,
                  errorBuilder: (context, error, stackTrace) {
                    return _buildErrorPlaceholder();
                  },
                ),
              ),
              // Main image badge
              if (image.isMainImage)
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        PhosphorIcon(
                          PhosphorIconsLight.star,
                          size: 14,
                          color: AppColors.textOnPrimary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Ảnh chính',
                          style: AppTypography.labelSmall(color: AppColors.textOnPrimary).copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              // Remove button
              if (showRemoveButton && onRemove != null)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Material(
                    color: AppColors.primaryDark.withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(20),
                    child: InkWell(
                      onTap: () {
                        HapticService.onButtonTap();
                        onRemove?.call();
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: Padding(
                        padding: const EdgeInsets.all(6),
                        child: PhosphorIcon(
                          PhosphorIconsLight.x,
                          size: 18,
                          color: AppColors.textOnPrimary,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLoadingPlaceholder() {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.divider,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Center(
        child: SizedBox(
          width: 24,
          height: 24,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
      ),
    );
  }

  Widget _buildErrorPlaceholder() {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.divider,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          PhosphorIcon(
            PhosphorIconsLight.image,
            size: 32,
            color: AppColors.textSecondary,
          ),
          const SizedBox(height: 4),
          Text(
            'Không thể tải ảnh',
            style: AppTypography.labelSmall(color: AppColors.textSecondary).copyWith(fontSize: 10),
          ),
        ],
      ),
    );
  }
}
