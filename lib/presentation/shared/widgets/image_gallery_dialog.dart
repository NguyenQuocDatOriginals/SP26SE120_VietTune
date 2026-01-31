import 'dart:io';
import 'package:flutter/material.dart';
import '../../../domain/entities/image_metadata.dart';
import '../../../core/services/image_storage_service.dart';
import '../../../core/di/injection.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../../core/theme/app_theme.dart';

/// Full-screen image gallery dialog
/// 
/// Displays images in a swipeable gallery with zoom functionality
class ImageGalleryDialog extends StatefulWidget {
  final List<ImageMetadata> images;
  final int initialIndex;

  const ImageGalleryDialog({
    super.key,
    required this.images,
    this.initialIndex = 0,
  });

  @override
  State<ImageGalleryDialog> createState() => _ImageGalleryDialogState();

  /// Show the gallery dialog
  static Future<void> show(
    BuildContext context, {
    required List<ImageMetadata> images,
    int initialIndex = 0,
  }) {
    return showDialog(
      context: context,
      barrierColor: AppColors.primaryDark.withValues(alpha: 0.9),
      builder: (context) => ImageGalleryDialog(
        images: images,
        initialIndex: initialIndex,
      ),
    );
  }
}

class _ImageGalleryDialogState extends State<ImageGalleryDialog> {
  late PageController _pageController;
  late int _currentIndex;
  final _storageService = getIt<ImageStorageService>();

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryDark,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: PhosphorIcon(PhosphorIconsLight.x, color: AppColors.textOnPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          '${_currentIndex + 1} / ${widget.images.length}',
          style: AppTypography.titleMedium(color: AppColors.textOnPrimary),
        ),
        centerTitle: true,
      ),
      body: PageView.builder(
        controller: _pageController,
        itemCount: widget.images.length,
        onPageChanged: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        itemBuilder: (context, index) {
          final image = widget.images[index];
          return _buildImagePage(image);
        },
      ),
    );
  }

  Widget _buildImagePage(ImageMetadata image) {
    return FutureBuilder<File?>(
      future: _storageService.getFileFromRelativePath(image.relativePath),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.textOnPrimary),
          );
        }

        if (snapshot.hasError || snapshot.data == null) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                PhosphorIcon(
                  PhosphorIconsLight.warning,
                  size: 64,
                  color: AppColors.textOnPrimary.withValues(alpha: 0.54),
                ),
                const SizedBox(height: 16),
                Text(
                  'Không thể tải ảnh',
                  style: AppTypography.bodyMedium(color: AppColors.textOnPrimary.withValues(alpha: 0.54)),
                ),
              ],
            ),
          );
        }

        final file = snapshot.data!;
        
        return InteractiveViewer(
          minScale: 0.5,
          maxScale: 4.0,
          child: Center(
            child: Image.file(
              file,
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) {
                return Center(
                  child: PhosphorIcon(
                    PhosphorIconsLight.image,
                    size: 64,
                    color: AppColors.textOnPrimary.withValues(alpha: 0.54),
                  ),
                );
              },
            ),
          ),
        );
      },
    );
  }
}
