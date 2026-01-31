import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../../domain/entities/image_metadata.dart';
import '../../../data/repositories/image_repository.dart';
import '../../../core/di/injection.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/haptic_service.dart';
import 'image_preview_widget.dart';
import 'image_gallery_dialog.dart';

/// Provider for image upload progress (global state)
final imageUploadProgressProvider = StateNotifierProvider<
    ImageUploadProgressNotifier,
    Map<String, double>>((ref) {
  return ImageUploadProgressNotifier();
});

class ImageUploadProgressNotifier extends StateNotifier<Map<String, double>> {
  ImageUploadProgressNotifier() : super({});

  void updateProgress(String imageId, double progress) {
    state = {...state, imageId: progress};
  }

  void clearProgress(String imageId) {
    final newState = {...state};
    newState.remove(imageId);
    state = newState;
  }

  void clearAll() {
    state = {};
  }
}

/// Provider for image upload errors (global state)
final imageUploadErrorProvider = StateNotifierProvider<
    ImageUploadErrorNotifier,
    Map<String, String?>>((ref) {
  return ImageUploadErrorNotifier();
});

class ImageUploadErrorNotifier extends StateNotifier<Map<String, String?>> {
  ImageUploadErrorNotifier() : super({});

  void setError(String imageId, String? error) {
    state = {...state, imageId: error};
  }

  void clearError(String imageId) {
    final newState = {...state};
    newState.remove(imageId);
    state = newState;
  }

  void clearAll() {
    state = {};
  }
}

/// Image picker widget with state management
/// 
/// Features:
/// - Pick images from gallery/camera
/// - Show upload progress
/// - Display images in grid
/// - Main image selection
/// - Error handling with retry
class ImagePickerWidget extends ConsumerStatefulWidget {
  final List<ImageMetadata> images;
  final ValueChanged<List<ImageMetadata>> onImagesChanged;
  final int maxImages;
  final String? label;
  final bool required;
  final bool allowMainImageSelection;

  const ImagePickerWidget({
    super.key,
    required this.images,
    required this.onImagesChanged,
    this.maxImages = 5,
    this.label,
    this.required = false,
    this.allowMainImageSelection = true,
  });

  @override
  ConsumerState<ImagePickerWidget> createState() => _ImagePickerWidgetState();
}

class _ImagePickerWidgetState extends ConsumerState<ImagePickerWidget> {
  final _repository = getIt<ImageRepository>();
  bool _isPicking = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Label
        if (widget.label != null) ...[
          Row(
            children: [
              Text(
                widget.label!,
                style: AppTypography.labelLarge(color: AppColors.textPrimary).copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (widget.required) ...[
                const SizedBox(width: 4),
                Text(
                  '*',
                  style: AppTypography.labelLarge(color: AppColors.error).copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 8),
        ],

        // Image count info
        if (widget.images.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              '${widget.images.length}/${widget.maxImages} ảnh',
              style: AppTypography.bodySmall(color: AppColors.textSecondary),
            ),
          ),

        // Image grid
        if (widget.images.isNotEmpty)
          _buildImageGrid(),

        const SizedBox(height: 12),

        // Add image button
        if (widget.images.length < widget.maxImages)
          _buildAddImageButton(),

        // Error messages
        _buildErrorMessages(),
      ],
    );
  }

  Widget _buildImageGrid() {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
        childAspectRatio: 1,
      ),
      itemCount: widget.images.length,
      itemBuilder: (context, index) {
        final image = widget.images[index];
        return _buildImageItem(image, index);
      },
    );
  }

  Widget _buildImageItem(ImageMetadata image, int index) {
    final progressMap = ref.watch(imageUploadProgressProvider);
    final errorMap = ref.watch(imageUploadErrorProvider);

    final progress = progressMap[image.relativePath] ?? 0.0;
    final error = errorMap[image.relativePath];

    return Stack(
      children: [
        ImagePreviewWidget(
          image: image,
          onTap: () => _viewImage(index),
          onRemove: () => _removeImage(index),
          showRemoveButton: true,
        ),
        // Progress indicator with better UX
        if (progress > 0 && progress < 1.0)
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.primaryDark.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(
                      width: 40,
                      height: 40,
                      child: CircularProgressIndicator(
                        value: progress,
                        strokeWidth: 3,
                        color: AppColors.primary,
                        backgroundColor: AppColors.textOnPrimary.withValues(alpha: 0.24),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${(progress * 100).toInt()}%',
                      style: AppTypography.labelMedium(color: AppColors.textOnPrimary).copyWith(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Đang xử lý...',
                      style: AppTypography.labelSmall(color: AppColors.textOnPrimary.withValues(alpha: 0.85)),
                    ),
                  ],
                ),
              ),
            ),
          ),
        // Error overlay with better UX
        if (error != null)
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  PhosphorIcon(
                    PhosphorIconsLight.warning,
                    color: AppColors.textOnPrimary,
                    size: 32,
                  ),
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Text(
                      error,
                      style: AppTypography.labelSmall(color: AppColors.textOnPrimary).copyWith(fontWeight: FontWeight.w500),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: () => _retryImage(image, index),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      side: BorderSide(color: AppColors.textOnPrimary),
                    ),
                    icon: PhosphorIcon(
                      PhosphorIconsLight.arrowClockwise,
                      size: 14,
                      color: AppColors.textOnPrimary,
                    ),
                    label: Text(
                      'Thử lại',
                      style: AppTypography.labelSmall(color: AppColors.textOnPrimary).copyWith(fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ),
        // Main image selection button
        if (widget.allowMainImageSelection)
          Positioned(
            bottom: 8,
            left: 8,
            child: GestureDetector(
              onTap: () => _toggleMainImage(index),
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: image.isMainImage
                      ? AppColors.primary
                      : AppColors.primaryDark.withValues(alpha: 0.6),
                  shape: BoxShape.circle,
                ),
                child: PhosphorIcon(
                  PhosphorIconsLight.star,
                  size: 16,
                  color: AppColors.textOnPrimary,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildAddImageButton() {
    return OutlinedButton.icon(
      onPressed: _isPicking ? null : _showImageSourceDialog,
      icon: _isPicking
          ? SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            )
          : PhosphorIcon(PhosphorIconsLight.imageSquare),
      label: Text(
        _isPicking ? 'Đang xử lý...' : 'Thêm ảnh',
        style: AppTypography.button().copyWith(color: AppColors.primary),
      ),
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(double.infinity, 48),
        side: BorderSide(
          color: AppColors.primary,
          width: 1.5,
        ),
        foregroundColor: AppColors.primary,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  Widget _buildErrorMessages() {
    // Collect all errors
    final errorMap = ref.watch(imageUploadErrorProvider);
    final errors = <String>[];
    for (final image in widget.images) {
      final error = errorMap[image.relativePath];
      if (error != null) {
        errors.add(error);
      }
    }

    if (errors.isEmpty) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.error.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.error),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: errors.map((error) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  PhosphorIcon(
                    PhosphorIconsLight.warning,
                    size: 16,
                    color: AppColors.error,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      error,
                      style: AppTypography.bodySmall(color: AppColors.error),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  void _showImageSourceDialog() {
    HapticService.onButtonTap();
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: PhosphorIcon(PhosphorIconsLight.camera, color: AppColors.primary),
              title: const Text('Chụp ảnh'),
              onTap: () {
                Navigator.pop(context);
                _pickImages(ImageSource.camera);
              },
            ),
            ListTile(
              leading: PhosphorIcon(PhosphorIconsLight.imagesSquare, color: AppColors.primary),
              title: const Text('Chọn từ thư viện'),
              onTap: () {
                Navigator.pop(context);
                _pickImages(ImageSource.gallery);
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Future<void> _pickImages(ImageSource source) async {
    if (_isPicking) return;

    setState(() => _isPicking = true);

    try {
      final remainingSlots = widget.maxImages - widget.images.length;
      if (remainingSlots <= 0) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Đã đạt tối đa ${widget.maxImages} ảnh'),
            ),
          );
        }
        return;
      }

      // Pick and process images
      final stream = _repository.pickAndProcessImages(
        maxImages: remainingSlots,
        source: source,
      );

      await for (final result in stream) {
        if (!mounted) break;

        // Update progress
        final progressNotifier = ref.read(imageUploadProgressProvider.notifier);
        final errorNotifier = ref.read(imageUploadErrorProvider.notifier);

        if (result.image != null) {
          progressNotifier.updateProgress(
            result.image!.relativePath,
            result.progress,
          );
        }

        // Handle completion
        if (result.isComplete) {
          if (result.image != null && result.error == null) {
            // Success - add to list
            final updatedImages = [...widget.images, result.image!];
            widget.onImagesChanged(updatedImages);
            progressNotifier.clearProgress(result.image!.relativePath);
            HapticService.onStepComplete();
          } else if (result.error != null) {
            // Error
            if (result.image != null) {
              errorNotifier.setError(result.image!.relativePath, result.error);
            } else {
              // Show error snackbar
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(result.error ?? 'Có lỗi xảy ra'),
                    backgroundColor: AppColors.error,
                  ),
                );
              }
            }
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isPicking = false);
      }
    }
  }

  void _viewImage(int index) {
    ImageGalleryDialog.show(
      context,
      images: widget.images,
      initialIndex: index,
    );
  }

  void _removeImage(int index) {
    HapticService.onButtonTap();
    final updatedImages = List<ImageMetadata>.from(widget.images);
    final removedImage = updatedImages.removeAt(index);
    
    // Delete file
    _repository.deleteImage(removedImage.relativePath);
    
    // Clear progress/error
    ref.read(imageUploadProgressProvider.notifier)
        .clearProgress(removedImage.relativePath);
    ref.read(imageUploadErrorProvider.notifier)
        .clearError(removedImage.relativePath);
    
    widget.onImagesChanged(updatedImages);
  }

  void _toggleMainImage(int index) {
    HapticService.onButtonTap();
    // Set all to false first, then set selected to true
    final updatedImages = widget.images.asMap().entries.map((entry) {
      if (entry.key == index) {
        return entry.value.copyWith(isMainImage: true);
      } else {
        return entry.value.copyWith(isMainImage: false);
      }
    }).toList();
    
    widget.onImagesChanged(updatedImages);
  }

  void _retryImage(ImageMetadata image, int index) {
    // Remove and re-add
    _removeImage(index);
    // Note: In a real implementation, you might want to retry the upload
    // For now, user needs to pick again
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Vui lòng chọn lại ảnh'),
      ),
    );
  }
}
