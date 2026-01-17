import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/utils/constants.dart';
import '../../presentation/contribution/pages/new_contribution_page.dart';
import '../../presentation/contribution/pages/submissions_page.dart';
import '../../presentation/contribution/pages/contribution_detail_page.dart';
import '../../presentation/discovery/pages/discover_home_page.dart';
import '../../presentation/discovery/pages/song_detail_page.dart';
import '../../presentation/discovery/pages/search_page.dart';
import '../../presentation/discovery/pages/instrument_detail_page.dart';
import '../../presentation/discovery/pages/ethnic_group_detail_page.dart';
import '../../presentation/profile/pages/profile_page.dart';
import '../../presentation/profile/pages/favorites_page.dart';
import '../../presentation/profile/pages/settings_page.dart';
import '../../presentation/shared/pages/splash_page.dart';
import '../../presentation/shared/pages/home_page.dart';
import '../../presentation/auth/pages/login_page.dart';
import '../../presentation/auth/pages/register_page.dart';
import 'auth_session.dart';
import '../../domain/entities/auth_state.dart';

/// App router configuration using GoRouter
final appRouter = GoRouter(
  initialLocation: AppRoutes.splash,
  refreshListenable: AuthSession.instance.notifier,
  redirect: (context, state) {
    final authState = AuthSession.instance.state;
    final isAuthenticated = authState is Authenticated;
    final isAuthRoute = state.matchedLocation.startsWith('/auth');
    final isSplash = state.matchedLocation == AppRoutes.splash;

    // Define public routes accessible by guests
    final publicRoutes = [
      AppRoutes.home,
      '/home/discover',
      '/home/discover/song',
      '/home/discover/search',
      '/home/discover/instrument',
      '/home/discover/ethnic-group',
    ];

    final isPublicRoute = publicRoutes.any(
      (route) => state.matchedLocation.startsWith(route),
    );

    // Require auth for protected routes only
    final protectedRoutes = [
      '/home/contribute',
      '/home/profile/favorites',
      '/home/profile/settings',
    ];

    final isProtectedRoute = protectedRoutes.any(
      (route) => state.matchedLocation.startsWith(route),
    );

    // Block unauthenticated users from protected routes
    if (!isAuthenticated && isProtectedRoute) {
      return AppRoutes.authLogin;
    }

    // Redirect authenticated users away from auth routes
    if (isAuthenticated && isAuthRoute) {
      return AppRoutes.home;
    }

    return null;
  },
  routes: [
    GoRoute(
      path: AppRoutes.splash,
      name: 'splash',
      builder: (context, state) => const SplashPage(),
    ),
    GoRoute(
      path: AppRoutes.authLogin,
      name: 'auth-login',
      builder: (context, state) => const LoginPage(),
    ),
    GoRoute(
      path: AppRoutes.authRegister,
      name: 'auth-register',
      builder: (context, state) => const RegisterPage(),
    ),
    GoRoute(
      path: AppRoutes.home,
      name: 'home',
      builder: (context, state) => const HomePage(),
      routes: [
        // Discovery routes
        GoRoute(
          path: 'discover',
          name: 'discover',
          builder: (context, state) => const DiscoverHomePage(),
        ),
        GoRoute(
          path: 'discover/song/:id',
          name: 'discover-song',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return SongDetailPage(songId: id);
          },
        ),
        GoRoute(
          path: 'discover/search',
          name: 'discover-search',
          builder: (context, state) => const SearchPage(),
        ),
        GoRoute(
          path: 'discover/instrument/:id',
          name: 'discover-instrument',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return InstrumentDetailPage(instrumentId: id);
          },
        ),
        GoRoute(
          path: 'discover/ethnic-group/:id',
          name: 'discover-ethnic-group',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return EthnicGroupDetailPage(ethnicGroupId: id);
          },
        ),
        // Contribution routes
        GoRoute(
          path: 'contribute',
          name: 'contribute',
          builder: (context, state) => const NewContributionPage(),
        ),
        GoRoute(
          path: 'contribute/new',
          name: 'contribute-new',
          builder: (context, state) => const NewContributionPage(),
        ),
        GoRoute(
          path: 'contribute/submissions',
          name: 'contribute-submissions',
          builder: (context, state) => const SubmissionsPage(),
        ),
        GoRoute(
          path: 'contribute/submission/:id',
          name: 'contribute-submission',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return ContributionDetailPage(contributionId: id);
          },
        ),
        // Profile routes
        GoRoute(
          path: 'profile',
          name: 'profile',
          builder: (context, state) => const ProfilePage(),
        ),
        GoRoute(
          path: 'profile/favorites',
          name: 'profile-favorites',
          builder: (context, state) => const FavoritesPage(),
        ),
        GoRoute(
          path: 'profile/settings',
          name: 'profile-settings',
          builder: (context, state) => const SettingsPage(),
        ),
      ],
    ),
  ],
  errorBuilder: (context, state) => Scaffold(
    body: Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64, color: Colors.red),
          const SizedBox(height: 16),
          Text(
            'Page not found',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 8),
          Text(
            state.error?.toString() ?? 'Unknown error',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => context.go(AppRoutes.home),
            child: const Text('Go Home'),
          ),
        ],
      ),
    ),
  ),
);
