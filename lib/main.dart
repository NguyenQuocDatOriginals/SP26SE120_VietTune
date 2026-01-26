import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/di/injection.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'presentation/shared/pages/splash_page.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize dependency injection
  configureDependencies();
  
  // Global error handling for better stability
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    if (kDebugMode) {
      debugPrint('Flutter Error: ${details.exception}');
      debugPrint('Stack trace: ${details.stack}');
    }
    // In production, you might want to log to crash reporting service
    // Example: FirebaseCrashlytics.instance.recordFlutterError(details);
  };
  
  // Handle errors outside Flutter framework
  PlatformDispatcher.instance.onError = (error, stack) {
    if (kDebugMode) {
      debugPrint('Platform Error: $error');
      debugPrint('Stack trace: $stack');
    }
    return true; // Handled
  };
  
  // Run app with error zone
  runZonedGuarded(
    () {
      runApp(
        const ProviderScope(
          child: VietTuneApp(),
        ),
      );
    },
    (error, stack) {
      if (kDebugMode) {
        debugPrint('Zone Error: $error');
        debugPrint('Stack trace: $stack');
      }
      // In production: FirebaseCrashlytics.instance.recordError(error, stack);
    },
  );
}

class VietTuneApp extends StatelessWidget {
  const VietTuneApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'VietTune Archive',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: appRouter,
      builder: (context, child) {
        // Ensure we always render something even if routing fails to build.
        return child ?? const SplashPage();
      },
    );
  }
}
