import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

/// "Modern Ethnic" color scheme - Phong cách dân tộc hiện đại
class AppColors {
  // Primary: Brocade Red (Đỏ thổ cẩm)
  static const Color primary = Color(0xFFB22222); // Brocade Red #B22222
  static const Color primaryDark = Color(0xFF8B1A1A);
  static const Color primaryLight = Color(0xFFD32F2F);
  
  // Accent: Heritage Gold (Vàng di sản)
  static const Color gold = Color(0xFFD4AF37); // Heritage Gold #D4AF37
  static const Color goldDark = Color(0xFFB8941F);
  static const Color goldLight = Color(0xFFE6C85A);
  
  // Secondary: Màu xanh chàm (Indigo) - thổ cẩm vùng cao
  static const Color secondary = Color(0xFF4A5B8A); // Indigo
  static const Color secondaryDark = Color(0xFF2E3A5F);
  static const Color secondaryLight = Color(0xFF6B7DA8);
  
  // Background: Vintage Cream (Kem cổ điển)
  static const Color background = Color(0xFFFDF5E6); // Vintage Cream #FDF5E6
  static const Color backgroundDark = Color(0xFFF5E6D3);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceElevated = Color(0xFFFFFEF9);
  
  // Text colors
  static const Color textPrimary = Color(0xFF2C2416); // Dark brown for heritage feel
  static const Color textSecondary = Color(0xFF6B6457);
  static const Color textTertiary = Color(0xFF9A9284);
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  static const Color textOnSecondary = Color(0xFFFFFFFF);
  
  // Status colors (heritage-inspired)
  static const Color success = Color(0xFF5B8C4A); // Olive green
  static const Color warning = gold; // Use gold for warnings
  static const Color error = Color(0xFFB22222); // Brocade Red
  static const Color info = Color(0xFF4A7BA8); // Blue-grey
  
  // Neutral colors
  static const Color divider = Color(0xFFE5DED0);
  static const Color border = Color(0xFFD5CAB8);
  
  // Gradient colors for backgrounds
  static const Color gradientStart = Color(0xFFFFF8F0);
  static const Color gradientEnd = Color(0xFFF5F0E8);
  
  // Legacy support (for gradual migration)
  @Deprecated('Use primary instead')
  static const Color primaryRed = primary;
  @Deprecated('Use warning instead')
  static const Color primaryGold = warning;
  static const Color secondaryDarkLegacy = Color(0xFF1A1A1A);
  static const Color secondaryLightLegacy = Color(0xFFF5F5F5);
  static const Color accentGreen = success;
  static const Color accentBlue = info;
  static const Color textOnGradient = textPrimary;
  static const Color textSecondaryOnGradient = textSecondary;
  static const Color buttonGradientTop = primary;
  static const Color buttonGradientBottom = primaryDark;
  static const Color gradientTop = background;
  static const Color gradientBottom = backgroundDark;
}

/// App theme configuration
class AppTheme {
  static ThemeData get lightTheme {
    final headingFont = GoogleFonts.beVietnamPro();
    final bodyFont = GoogleFonts.beVietnamPro();
    
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.light(
        primary: AppColors.primary,
        onPrimary: AppColors.textOnPrimary,
        secondary: AppColors.secondary,
        onSecondary: AppColors.textOnSecondary,
        surface: AppColors.surface,
        onSurface: AppColors.textPrimary,
        error: AppColors.error,
        onError: Colors.white,
        background: AppColors.background,
        onBackground: AppColors.textPrimary,
      ),
      scaffoldBackgroundColor: AppColors.background,
      textTheme: _textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 1,
        shadowColor: AppColors.divider,
        titleTextStyle: _textTheme.titleLarge?.copyWith(
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimary,
          fontFamily: headingFont.fontFamily,
        ),
        iconTheme: const IconThemeData(
          color: AppColors.textPrimary,
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: AppColors.border, width: 1),
        ),
        color: AppColors.surface,
        shadowColor: Colors.black.withValues(alpha: 0.1),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.error, width: 1),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.error, width: 2),
        ),
        filled: true,
        fillColor: AppColors.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.textOnPrimary,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 0,
          textStyle: bodyFont.copyWith(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: bodyFont.copyWith(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
          ),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: AppColors.surface,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
        selectedLabelStyle: bodyFont.copyWith(
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: bodyFont.copyWith(
          fontSize: 12,
          fontWeight: FontWeight.normal,
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.backgroundDark,
        selectedColor: AppColors.primaryLight.withValues(alpha: 0.2),
        disabledColor: AppColors.divider,
        labelStyle: _textTheme.bodyMedium?.copyWith(
          color: AppColors.textPrimary,
        ),
        secondaryLabelStyle: _textTheme.bodyMedium?.copyWith(
          color: AppColors.primary,
          fontWeight: FontWeight.w600,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: AppColors.border),
        ),
        side: BorderSide(color: AppColors.border),
        checkmarkColor: AppColors.primary,
      ),
      iconTheme: const IconThemeData(
        color: AppColors.textPrimary,
        size: 24,
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.divider,
        thickness: 1,
        space: 1,
      ),
    );
  }

  static TextTheme get _textTheme {
    // Sans-serif font for headings and body (clean, modern)
    final headingFont = GoogleFonts.beVietnamPro();
    final bodyFont = GoogleFonts.beVietnamPro();
    
    return TextTheme(
      // Display styles - Serif for grandeur
      displayLarge: headingFont.copyWith(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
        letterSpacing: -0.5,
        height: 1.2,
      ),
      displayMedium: headingFont.copyWith(
        fontSize: 28,
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
        letterSpacing: -0.5,
        height: 1.2,
      ),
      displaySmall: headingFont.copyWith(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
        letterSpacing: -0.25,
        height: 1.3,
      ),
      // Headline styles - Serif for important titles
      headlineLarge: headingFont.copyWith(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
        letterSpacing: -0.25,
        height: 1.3,
      ),
      headlineMedium: headingFont.copyWith(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
        letterSpacing: 0,
        height: 1.3,
      ),
      headlineSmall: headingFont.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
        letterSpacing: 0,
        height: 1.4,
      ),
      // Title styles - Mix of serif and sans-serif
      titleLarge: headingFont.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
        letterSpacing: 0.15,
        height: 1.4,
      ),
      titleMedium: bodyFont.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w500,
        color: AppColors.textPrimary,
        letterSpacing: 0.15,
        height: 1.5,
      ),
      titleSmall: bodyFont.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: AppColors.textPrimary,
        letterSpacing: 0.1,
        height: 1.5,
      ),
      // Body styles - Sans-serif for readability
      bodyLarge: bodyFont.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.normal,
        color: AppColors.textPrimary,
        letterSpacing: 0.15,
        height: 1.6,
      ),
      bodyMedium: bodyFont.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.normal,
        color: AppColors.textPrimary,
        letterSpacing: 0.1,
        height: 1.6,
      ),
      bodySmall: bodyFont.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.normal,
        color: AppColors.textSecondary,
        letterSpacing: 0.25,
        height: 1.5,
      ),
      // Label styles - Sans-serif
      labelLarge: bodyFont.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: AppColors.textPrimary,
        letterSpacing: 0.1,
        height: 1.5,
      ),
      labelMedium: bodyFont.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: AppColors.textSecondary,
        letterSpacing: 0.25,
        height: 1.5,
      ),
      labelSmall: bodyFont.copyWith(
        fontSize: 10,
        fontWeight: FontWeight.w500,
        color: AppColors.textSecondary,
        letterSpacing: 0.25,
        height: 1.4,
      ),
    );
  }
  
  /// Gradient background decoration - subtle heritage gradient
  static const BoxDecoration gradientBackground = BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [
        AppColors.gradientStart,
        AppColors.gradientEnd,
      ],
      stops: [0.0, 1.0],
    ),
  );
  
  /// Subtle terracotta gradient for hero sections
  static const BoxDecoration heroGradient = BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [
        AppColors.primaryLight,
        AppColors.primary,
      ],
    ),
  );
  
  /// Pill-shaped button style with terracotta gradient
  static ButtonStyle get pillButtonStyle => ElevatedButton.styleFrom(
    backgroundColor: AppColors.primary,
    foregroundColor: AppColors.textOnPrimary,
    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(28), // Pill shape
    ),
    elevation: 0,
  );
  
  /// Helper to create a pill button with terracotta gradient decoration
  static Widget createPillButton({
    required VoidCallback? onPressed,
    required Widget child,
    IconData? icon,
    bool isFullWidth = false,
  }) {
    return Container(
      width: isFullWidth ? double.infinity : null,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primary,
            AppColors.primaryDark,
          ],
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
            spreadRadius: 0,
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          foregroundColor: AppColors.textOnPrimary,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(28),
          ),
          elevation: 0,
        ),
        child: icon != null
            ? Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  PhosphorIcon(icon, size: 20, color: AppColors.textOnPrimary),
                  const SizedBox(width: 8),
                  child,
                ],
              )
            : child,
      ),
    );
  }
  
  /// Helper to create an outlined pill button with terracotta border
  static Widget createOutlinedPillButton({
    required VoidCallback? onPressed,
    required Widget child,
    IconData? icon,
    bool isFullWidth = false,
  }) {
    return Container(
      width: isFullWidth ? double.infinity : null,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        border: Border.all(
          color: AppColors.primary,
          width: 2,
        ),
      ),
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.transparent,
          foregroundColor: AppColors.primary,
          side: BorderSide.none, // Remove default border, using Container border
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(28),
          ),
          elevation: 0,
        ),
        child: icon != null
            ? Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  PhosphorIcon(icon, size: 20, color: AppColors.primary),
                  const SizedBox(width: 8),
                  child,
                ],
              )
            : child,
      ),
    );
  }
}

/// Audio player specific theme
///
/// Inline player (card): uses [background], [waveformActive] = primary.
/// Full-screen player: uses [fullScreen*] colors per docs/PLAN-audioplayer-app-colors.md
/// — gold for circular border, waveform, progress; primary for Play/Pause CTA.
class AudioPlayerTheme {
  static const Color primary = AppColors.primary;
  static const Color secondary = AppColors.secondary;
  static const Color background = AppColors.surface;
  static const Color surface = AppColors.surfaceElevated;
  static const Color text = AppColors.textPrimary;
  static const Color textSecondary = AppColors.textSecondary;
  static const Color waveformActive = AppColors.primary;
  static const Color waveformInactive = AppColors.divider;

  // --- Full-screen player (layout like reference, app colors) ---
  static const Color fullScreenBackground = AppColors.background;
  static const Color fullScreenHeaderText = AppColors.textPrimary;
  static const Color fullScreenCircularBorderColor = AppColors.gold;
  static const Color fullScreenCircularBorderShadow = AppColors.goldDark;
  static const Color fullScreenWaveformActive = AppColors.gold;
  static const Color fullScreenWaveformInactive = AppColors.divider;
  static const Color fullScreenProgressActive = AppColors.gold;
  static const Color fullScreenProgressInactive = AppColors.divider;
  static const Color fullScreenProgressThumb = AppColors.gold;
  static const Color fullScreenMetadataChipBackground = AppColors.surface;
  static const Color fullScreenMetadataChipBorder = AppColors.border;
  static const Color fullScreenMetadataChipText = AppColors.textPrimary;
  static const Color fullScreenControlIconColor = AppColors.gold;
  static const Color fullScreenPlayButtonGradientStart = AppColors.primary;
  static const Color fullScreenPlayButtonGradientEnd = AppColors.primaryDark;
}

/// Metadata card theme
class MetadataCardTheme {
  static const Color background = AppColors.surface;
  static const Color border = AppColors.border;
  static const double borderRadius = 16.0;
  static const double elevation = 0.0;
}

/// Typography helpers for consistent font usage
class AppTypography {
  // Font instances
  static final TextStyle _headingFont = GoogleFonts.beVietnamPro();
  static final TextStyle _bodyFont = GoogleFonts.beVietnamPro();
  
  // Heading styles (Playfair Display - Serif)
  static TextStyle heading1({Color? color}) => _headingFont.copyWith(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: color ?? AppColors.textPrimary,
    letterSpacing: -0.5,
    height: 1.2,
  );
  
  static TextStyle heading2({Color? color}) => _headingFont.copyWith(
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: color ?? AppColors.textPrimary,
    letterSpacing: -0.5,
    height: 1.2,
  );
  
  static TextStyle heading3({Color? color}) => _headingFont.copyWith(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: color ?? AppColors.textPrimary,
    letterSpacing: -0.25,
    height: 1.3,
  );
  
  static TextStyle heading4({Color? color}) => _headingFont.copyWith(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: color ?? AppColors.textPrimary,
    letterSpacing: 0,
    height: 1.3,
  );
  
  static TextStyle heading5({Color? color}) => _headingFont.copyWith(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: color ?? AppColors.textPrimary,
    letterSpacing: 0,
    height: 1.4,
  );
  
  // Body styles (Noto Sans - Sans-serif)
  static TextStyle bodyLarge({Color? color}) => _bodyFont.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.normal,
    color: color ?? AppColors.textPrimary,
    letterSpacing: 0.15,
    height: 1.6,
  );
  
  static TextStyle bodyMedium({Color? color}) => _bodyFont.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    color: color ?? AppColors.textPrimary,
    letterSpacing: 0.1,
    height: 1.6,
  );
  
  static TextStyle bodySmall({Color? color}) => _bodyFont.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    color: color ?? AppColors.textSecondary,
    letterSpacing: 0.25,
    height: 1.5,
  );
  
  // Label styles (Noto Sans)
  static TextStyle labelLarge({Color? color}) => _bodyFont.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: color ?? AppColors.textPrimary,
    letterSpacing: 0.1,
    height: 1.5,
  );
  
  static TextStyle labelMedium({Color? color}) => _bodyFont.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: color ?? AppColors.textSecondary,
    letterSpacing: 0.25,
    height: 1.5,
  );
  
  static TextStyle labelSmall({Color? color}) => _bodyFont.copyWith(
    fontSize: 10,
    fontWeight: FontWeight.w500,
    color: color ?? AppColors.textSecondary,
    letterSpacing: 0.25,
    height: 1.4,
  );
  
  // Button text (Noto Sans)
  static TextStyle button({Color? color}) => _bodyFont.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: color ?? AppColors.textOnPrimary,
    letterSpacing: 0.5,
    height: 1.4,
  );

  // Title styles (Material-aligned)
  static TextStyle titleLarge({Color? color}) => _bodyFont.copyWith(
    fontSize: 22,
    fontWeight: FontWeight.w600,
    color: color ?? AppColors.textPrimary,
    letterSpacing: 0,
    height: 1.3,
  );
  static TextStyle titleMedium({Color? color}) => _bodyFont.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    color: color ?? AppColors.textPrimary,
    letterSpacing: 0.15,
    height: 1.5,
  );
  static TextStyle titleSmall({Color? color}) => _bodyFont.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: color ?? AppColors.textPrimary,
    letterSpacing: 0.1,
    height: 1.5,
  );
  
  // Caption (Noto Sans)
  static TextStyle caption({Color? color}) => _bodyFont.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    color: color ?? AppColors.textSecondary,
    letterSpacing: 0.25,
    height: 1.4,
  );
}