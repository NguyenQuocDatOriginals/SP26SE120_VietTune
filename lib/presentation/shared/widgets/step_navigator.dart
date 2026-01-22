import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/haptic_service.dart';

/// Step status for navigation
enum StepStatus {
  completed,
  inProgress,
  pending,
  skipped,
}

/// Step Navigator widget for contribution wizard
/// Optimized with modern UI/UX best practices
class StepNavigator extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final List<String> stepTitles;
  final List<IconData>? stepIcons;
  final ValueChanged<int>? onStepTap;
  final bool Function(int step)? canJumpToStep;

  const StepNavigator({
    super.key,
    required this.currentStep,
    required this.totalSteps,
    required this.stepTitles,
    this.stepIcons,
    this.onStepTap,
    this.canJumpToStep,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isSmallScreen = screenWidth < 600;
    final isCompactMode = screenWidth < 400;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
      child: isSmallScreen
          ? _buildScrollableNavigator(context, isCompactMode)
          : _buildFullNavigator(context),
    );
  }

  Widget _buildScrollableNavigator(BuildContext context, bool isCompactMode) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: List.generate(
          totalSteps,
          (index) => _buildStepWithConnector(
            context,
            index,
            null,
            isCompactMode: isCompactMode,
            isScrollable: true,
          ),
        ),
      ),
    );
  }

  Widget _buildFullNavigator(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: List.generate(
            totalSteps,
            (index) => _buildStepWithConnector(
              context,
              index,
              constraints,
              isCompactMode: false,
              isScrollable: false,
            ),
          ),
        );
      },
    );
  }

  Widget _buildStepWithConnector(
    BuildContext context,
    int index,
    BoxConstraints? constraints, {
    required bool isCompactMode,
    required bool isScrollable,
  }) {
    final isLast = index == totalSteps - 1;
    final status = _getStepStatus(index);
    final isClickable = _isStepClickable(index);

    final stepWidget = Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Step indicator
        _buildStepIndicator(
          context,
          index,
          status,
          isClickable,
          isCompactMode: isCompactMode,
        ),
        // Connector line (except for last step)
        if (!isLast)
          _buildConnectorLine(
            index,
            status,
            isScrollable: isScrollable,
          ),
      ],
    );

    if (isScrollable) {
      return stepWidget;
    } else {
      return Expanded(child: stepWidget);
    }
  }

  Widget _buildConnectorLine(
    int index,
    StepStatus status, {
    required bool isScrollable,
  }) {
    final isCompleted = status == StepStatus.completed ||
        status == StepStatus.inProgress;
    final nextStatus = index + 1 < totalSteps
        ? _getStepStatus(index + 1)
        : StepStatus.pending;
    final isNextCompleted = nextStatus == StepStatus.completed ||
        nextStatus == StepStatus.inProgress;

    final connector = Container(
      margin: const EdgeInsets.only(top: 20), // Align with circle center
      width: isScrollable ? 40 : null,
      height: 2,
      decoration: BoxDecoration(
        gradient: (isCompleted || isNextCompleted)
            ? LinearGradient(
                colors: [
                  AppColors.primary,
                  isNextCompleted
                      ? AppColors.primary
                      : AppColors.primary.withValues(alpha: 0.3),
                ],
                stops: const [0.0, 1.0],
              )
            : null,
        color: (isCompleted || isNextCompleted)
            ? null
            : AppColors.divider,
        borderRadius: BorderRadius.circular(1),
      ),
    );

    if (isScrollable) {
      return connector;
    } else {
      return Expanded(child: connector);
    }
  }

  Widget _buildStepIndicator(
    BuildContext context,
    int index,
    StepStatus status,
    bool isClickable, {
    required bool isCompactMode,
  }) {
    final stepTitle = index < stepTitles.length
        ? stepTitles[index]
        : 'Bước ${index + 1}';
    final stepIcon = stepIcons != null && index < stepIcons!.length
        ? stepIcons![index]
        : _getDefaultIcon(index);

    // Ensure minimum 48dp touch target
    const minTouchTarget = 48.0;
    final circleSize = isCompactMode ? 40.0 : 44.0;
    final touchTargetPadding = (minTouchTarget - circleSize) / 2;

    return MouseRegion(
      cursor: isClickable ? SystemMouseCursors.click : SystemMouseCursors.basic,
      child: GestureDetector(
        onTap: isClickable
            ? () {
                HapticService.onButtonTap();
                onStepTap?.call(index);
              }
            : null,
        behavior: HitTestBehavior.opaque,
        child: Semantics(
          label: stepTitle,
          hint: isClickable
              ? 'Chạm để chuyển đến bước này'
              : 'Bước hiện tại',
          button: isClickable,
          child: Tooltip(
            message: stepTitle,
            waitDuration: const Duration(milliseconds: 500),
            child: Padding(
              padding: EdgeInsets.all(touchTargetPadding),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Step circle with improved styling
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                    width: circleSize,
                    height: circleSize,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _getStepColor(status),
                      border: Border.all(
                        color: _getStepBorderColor(status),
                        width: status == StepStatus.inProgress ? 3 : 2,
                      ),
                      boxShadow: status == StepStatus.inProgress
                          ? [
                              BoxShadow(
                                color: AppColors.primary.withValues(alpha: 0.25),
                                blurRadius: 12,
                                spreadRadius: 2,
                                offset: const Offset(0, 2),
                              ),
                              BoxShadow(
                                color: AppColors.gold.withValues(alpha: 0.15),
                                blurRadius: 8,
                                spreadRadius: 1,
                              ),
                            ]
                          : status == StepStatus.completed
                              ? [
                                  BoxShadow(
                                    color: AppColors.primary.withValues(alpha: 0.15),
                                    blurRadius: 6,
                                    spreadRadius: 1,
                                    offset: const Offset(0, 1),
                                  ),
                                ]
                              : null,
                    ),
                    child: Center(
                      child: _buildStepContent(index, status, stepIcon),
                    ),
                  ),
                // Step title - hide in compact mode
                if (!isCompactMode) ...[
                  const SizedBox(height: 10),
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 80),
                    child: Text(
                      stepTitle,
                      style: TextStyle(
                        fontSize: 11,
                        height: 1.3,
                        fontWeight: status == StepStatus.inProgress
                            ? FontWeight.w700
                            : status == StepStatus.completed
                                ? FontWeight.w600
                                : FontWeight.w500,
                        color: _getStepTextColor(status),
                        letterSpacing: status == StepStatus.inProgress ? 0.2 : 0,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(height: 6),
                ],
                // Progress indicator dot with animation
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 5,
                  height: 5,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: status == StepStatus.completed ||
                            status == StepStatus.inProgress
                        ? AppColors.primary
                        : AppColors.divider,
                    boxShadow: (status == StepStatus.completed ||
                            status == StepStatus.inProgress)
                        ? [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.4),
                              blurRadius: 4,
                              spreadRadius: 0.5,
                            ),
                          ]
                        : null,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      ),
    );
  }

  Widget _buildStepContent(int index, StepStatus status, IconData stepIcon) {
    if (status == StepStatus.completed) {
      return const Icon(
        Icons.check_rounded,
        color: Colors.white,
        size: 22,
      );
    } else if (status == StepStatus.skipped) {
      return const Icon(
        Icons.remove_rounded,
        color: Colors.white,
        size: 22,
      );
    } else if (status == StepStatus.inProgress) {
      // Show icon for active step if available
      return Icon(
        stepIcon,
        color: Colors.white,
        size: 20,
      );
    } else {
      // Pending step - show number
      return Text(
        '${index + 1}',
        style: TextStyle(
          color: _getStepTextColor(status),
          fontWeight: FontWeight.bold,
          fontSize: 15,
          letterSpacing: -0.5,
        ),
      );
    }
  }

  StepStatus _getStepStatus(int index) {
    if (index < currentStep) {
      return StepStatus.completed;
    } else if (index == currentStep) {
      return StepStatus.inProgress;
    } else {
      return StepStatus.pending;
    }
  }

  bool _isStepClickable(int index) {
    if (onStepTap == null) return false;
    if (index == currentStep) return false; // Can't click current step
    if (canJumpToStep != null && !canJumpToStep!(index)) return false;
    // Can jump to completed steps or next step if current is valid
    return index <= currentStep + 1;
  }

  Color _getStepColor(StepStatus status) {
    switch (status) {
      case StepStatus.completed:
        return AppColors.primary;
      case StepStatus.inProgress:
        return AppColors.primary;
      case StepStatus.skipped:
        return AppColors.textSecondary;
      case StepStatus.pending:
        return AppColors.surface;
    }
  }

  Color _getStepBorderColor(StepStatus status) {
    switch (status) {
      case StepStatus.completed:
        return AppColors.primary;
      case StepStatus.inProgress:
        return AppColors.gold;
      case StepStatus.skipped:
        return AppColors.textSecondary;
      case StepStatus.pending:
        return AppColors.divider;
    }
  }

  Color _getStepTextColor(StepStatus status) {
    switch (status) {
      case StepStatus.completed:
        return AppColors.primary;
      case StepStatus.inProgress:
        return AppColors.primary;
      case StepStatus.skipped:
        return AppColors.textSecondary;
      case StepStatus.pending:
        return AppColors.textTertiary;
    }
  }

  IconData _getDefaultIcon(int index) {
    // Default icons for each step type
    switch (index) {
      case 0:
        return Icons.upload_file_rounded;
      case 1:
        return Icons.info_outline_rounded;
      case 2:
        return Icons.people_outline_rounded;
      case 3:
        return Icons.music_note_rounded;
      case 4:
        return Icons.note_outlined;
      case 5:
        return Icons.rate_review_rounded;
      default:
        return Icons.circle_outlined;
    }
  }
}
