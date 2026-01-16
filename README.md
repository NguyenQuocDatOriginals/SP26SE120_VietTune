# VietTune Archive - Flutter Mobile App

A Flutter mobile application for preserving and discovering Vietnamese traditional music.

## Features

### Discovery & Research
- **Home Screen**: Browse featured songs, ethnic groups, and instruments
- **Advanced Search**: Filter songs by ethnic group, instrument, genre, region, and more
- **Song Details**: View complete song information with audio player, lyrics, cultural context
- **Browse by Category**: Explore songs by ethnic group or instrument

### Contributor Portal
- **Multi-step Submission Wizard**: 
  - Step 1: Audio upload (file picker or recording)
  - Step 2: Basic information (title, genre, ethnic group, instruments, location)
  - Step 3: Cultural context (optional)
  - Step 4: Lyrics (optional)
  - Step 5: Review and submit
- **Submissions Management**: View and track your contribution history with status filtering

### Profile & Favorites
- View user statistics
- Manage favorite songs
- App settings

### Authentication & RBAC
- Login/Register flow with mock accounts
- Role-based access control (Researcher, Contributor, Expert)
- Conditional navigation and UI actions per role

## Architecture

The app follows Clean Architecture principles with three main layers:

### Domain Layer
- **Entities**: Pure Dart models using Freezed
- **Repositories**: Abstract interfaces
- **Use Cases**: Business logic operations
- **Failures**: Error handling with union types

### Data Layer
- **Models**: JSON serializable DTOs
- **Repository Implementations**: Concrete implementations using mock data sources
- **Data Sources**: Mock data for development (ready for remote API integration)

### Presentation Layer
- **Pages**: Screen widgets
- **Widgets**: Reusable UI components
- **Providers**: Riverpod state management

## Tech Stack

- **Flutter**: UI framework
- **Riverpod**: State management
- **GoRouter**: Navigation and routing
- **GetIt + Injectable**: Dependency injection
- **Freezed**: Immutable data classes
- **Dartz**: Functional programming (Either for error handling)
- **Just Audio**: Audio playback
- **File Picker**: File selection
- **Google Fonts**: Typography

## Setup Instructions

1. **Install dependencies**:
   ```bash
   flutter pub get
   ```

2. **Generate code** (Freezed, JSON serializable, Injectable):
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

3. **Run the app**:
   ```bash
   flutter run
   ```

4. **Run tests**:
   ```bash
   flutter test
   ```

## Project Structure

```
lib/
├── core/                    # Infrastructure
│   ├── di/                 # Dependency injection
│   ├── router/             # GoRouter configuration
│   ├── theme/              # App theming
│   └── utils/              # Utilities & constants
├── domain/                 # Business Logic Layer
│   ├── entities/          # Pure Dart models
│   ├── repositories/      # Abstract interfaces
│   └── usecases/          # Business use cases
├── data/                   # Data Layer
│   ├── models/            # JSON serializable DTOs
│   ├── repositories/       # Repository implementations
│   └── datasources/       # Mock data sources
└── presentation/           # UI Layer
    ├── contribution/       # Contributor Portal
    ├── discovery/          # Research & Discovery
    ├── profile/            # Profile & Settings
    └── shared/             # Shared widgets
```

## Mock Data

The app currently uses mock data sources for development:
- ~50 Vietnamese traditional songs
- 54 ethnic groups
- 50+ traditional instruments
- Sample contribution requests
- Mock auth users (password: `password123`)
  - `researcher@viettune.vn`
  - `contributor@viettune.vn`
  - `expert@viettune.vn`

## Future Enhancements

- Backend API integration
- User authentication
- Offline caching
- Audio recording functionality
- Image uploads
- Push notifications
- Social sharing

## Development Notes

- The app uses Vietnamese language for UI text
- All audio files are handled through mock URLs (ready for real file upload)
- Authentication is mock-only; replace with real API before production
- Code generation is required after modifying Freezed/JSON serializable classes

## License

[Your License Here]
