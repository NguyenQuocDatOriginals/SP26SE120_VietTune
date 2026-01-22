import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

/// Skeleton loader widget with shimmer effect for loading states
class SkeletonLoader extends StatefulWidget {
  final double? width;
  final double? height;
  final BorderRadius? borderRadius;
  final Widget? child;

  const SkeletonLoader({
    super.key,
    this.width,
    this.height,
    this.borderRadius,
    this.child,
  });

  @override
  State<SkeletonLoader> createState() => _SkeletonLoaderState();
}

class _SkeletonLoaderState extends State<SkeletonLoader>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();

    _animation = Tween<double>(begin: -1.0, end: 2.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            borderRadius: widget.borderRadius ?? BorderRadius.circular(8),
            gradient: LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              stops: [
                _animation.value - 0.3,
                _animation.value,
                _animation.value + 0.3,
              ].map((stop) => stop.clamp(0.0, 1.0)).toList(),
              colors: [
                AppColors.divider,
                AppColors.divider.withValues(alpha: 0.3),
                AppColors.divider,
              ],
            ),
          ),
          child: widget.child,
        );
      },
    );
  }
}

/// Pre-built skeleton widgets for common use cases
class SkeletonWidgets {
  /// Skeleton for a text line
  static Widget textLine({
    double? width,
    double height = 16,
  }) {
    return SkeletonLoader(
      width: width,
      height: height,
      borderRadius: BorderRadius.circular(4),
    );
  }

  /// Skeleton for a card
  static Widget card({
    double? width,
    double? height,
  }) {
    return SkeletonLoader(
      width: width,
      height: height,
      borderRadius: BorderRadius.circular(12),
    );
  }

  /// Skeleton for a circular avatar
  static Widget circle({
    double size = 48,
  }) {
    return SkeletonLoader(
      width: size,
      height: size,
      borderRadius: BorderRadius.circular(size / 2),
    );
  }

  /// Skeleton for metadata card
  static Widget metadataCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SkeletonWidgets.textLine(width: 120, height: 20),
          const SizedBox(height: 16),
          ...List.generate(4, (index) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    SkeletonWidgets.textLine(width: 100, height: 14),
                    const SizedBox(width: 20),
                    Expanded(
                      child: SkeletonWidgets.textLine(height: 14),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}
