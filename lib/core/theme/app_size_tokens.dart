import 'package:flutter/material.dart';

/// Design tokens cho Spacing & Radius — Modern Ethnic, hệ số 4.
/// Dùng thống nhất để đạt sự chỉn chu, trang trọng toàn app.
class AppSizeTokens {
  AppSizeTokens._();

  // --- Spacing (hệ số 4) ---
  static const double space4 = 4;
  static const double space8 = 8;
  static const double space12 = 12;
  static const double space16 = 16;
  static const double space24 = 24;
  static const double space32 = 32;
  static const double space48 = 48;

  /// EdgeInsets theo token: all
  static const EdgeInsets padding4 = EdgeInsets.all(space4);
  static const EdgeInsets padding8 = EdgeInsets.all(space8);
  static const EdgeInsets padding12 = EdgeInsets.all(space12);
  static const EdgeInsets padding16 = EdgeInsets.all(space16);
  static const EdgeInsets padding24 = EdgeInsets.all(space24);
  static const EdgeInsets padding32 = EdgeInsets.all(space32);
  static const EdgeInsets padding48 = EdgeInsets.all(space48);

  /// SizedBox vertical (chiều cao) thường dùng
  static const SizedBox vertical4 = SizedBox(height: space4);
  static const SizedBox vertical8 = SizedBox(height: space8);
  static const SizedBox vertical12 = SizedBox(height: space12);
  static const SizedBox vertical16 = SizedBox(height: space16);
  static const SizedBox vertical24 = SizedBox(height: space24);
  static const SizedBox vertical32 = SizedBox(height: space32);
  static const SizedBox vertical48 = SizedBox(height: space48);

  /// SizedBox horizontal
  static const SizedBox horizontal4 = SizedBox(width: space4);
  static const SizedBox horizontal8 = SizedBox(width: space8);
  static const SizedBox horizontal12 = SizedBox(width: space12);
  static const SizedBox horizontal16 = SizedBox(width: space16);
  static const SizedBox horizontal24 = SizedBox(width: space24);

  // --- Radius: 3 cấp (small: 8, medium: 12, large: 20 cho Bottom Sheet / Card lớn) ---
  static const double radiusSmall = 8;
  static const double radiusMedium = 12;
  static const double radiusLarge = 20;

  static BorderRadius get borderRadiusSmall => BorderRadius.circular(radiusSmall);
  static BorderRadius get borderRadiusMedium => BorderRadius.circular(radiusMedium);
  static BorderRadius get borderRadiusLarge => BorderRadius.circular(radiusLarge);

  // --- Tags / Pills (status, genre) — đồng nhất, gọn, đẹp ---
  static const double tagPaddingHorizontal = 8;
  static const double tagPaddingVertical = 5;
  static const double tagMinHeight = 26;
  static const double tagBorderRadius = 13;
  static EdgeInsets get tagPadding => const EdgeInsets.symmetric(
    horizontal: tagPaddingHorizontal,
    vertical: tagPaddingVertical,
  );

  // --- Unified Song Experience (Option A: 40% player / 60% detail) ---
  /// Fraction of screen height for the fixed player section (0.4 = 40%).
  static const double kPlayerSectionFraction = 0.4;
  /// Minimum height in logical pixels for the player section on small screens.
  static const double kPlayerSectionMinHeight = 200.0;
  /// On screens shorter than this, use [kPlayerSectionSmallScreenFraction] so detail gets more space.
  static const double kSmallScreenHeightBreakpoint = 600.0;
  /// Fraction for player section on small screens (0.35 = 35%).
  static const double kPlayerSectionSmallScreenFraction = 0.35;
}
