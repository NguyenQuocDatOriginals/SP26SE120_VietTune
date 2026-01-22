import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../domain/entities/contribution_request.dart';
import '../../../domain/entities/song.dart';
import '../../../domain/entities/audio_metadata.dart';
import '../../../domain/entities/location.dart';
import '../../../domain/entities/enums.dart';
import '../../../core/utils/audio_metadata_extractor.dart';
import '../../../domain/usecases/contribution/get_user_contributions.dart';
import '../../../domain/usecases/contribution/get_contribution_by_id.dart';
import '../../../domain/repositories/base_repository.dart';
import '../../../core/di/injection.dart';
import '../../../core/services/contribution_draft_service.dart';

/// Provider for contribution form state
class ContributionFormNotifier extends StateNotifier<ContributionFormState> {
  final ContributionDraftService _draftService = getIt<ContributionDraftService>();
  Timer? _autoSaveTimer;

  ContributionFormNotifier() : super(ContributionFormState.initial()) {
    _startAutoSave();
  }

  @override
  void dispose() {
    _autoSaveTimer?.cancel();
    super.dispose();
  }

  void _startAutoSave() {
    _autoSaveTimer?.cancel();
    _autoSaveTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _saveDraft(),
    );
  }

  Future<void> _saveDraft() async {
    if (state.songData == null) return;
    try {
      await _draftService.saveDraft(
        state.songData!,
        state.currentStep,
      );
    } catch (e) {
      debugPrint('Failed to save draft: $e');
    }
  }

  void updateStep(int step) {
    if (step < 0 || step >= 6) return; // Validate step range (6 steps: merged Notes+Review)
    state = state.copyWith(currentStep: step);
    // Save draft on step change
    _saveDraft();
  }

  /// Check if can jump to a specific step
  bool canJumpToStep(int targetStep) {
    if (targetStep < 0 || targetStep >= 6) return false;
    if (targetStep == state.currentStep) return true; // Already on this step
    if (targetStep < state.currentStep) return true; // Can always go back
    
    // Can only jump forward if all previous steps are valid
    for (int i = 0; i < targetStep; i++) {
      if (!_isStepValid(i)) return false;
    }
    return true;
  }

  /// Check if a specific step is valid (without modifying state)
  bool _isStepValid(int step) {
    final song = state.songData;
    if (song == null) return false;

    switch (step) {
      case 0: // Audio upload
        return song.audioMetadata?.url != null &&
            song.audioMetadata!.url.isNotEmpty;
      case 1: // Identity (Title, Genre, Language)
        final hasTitle = song.title.isNotEmpty;
        final hasGenre = song.genre != null;
        final hasLanguage = song.language != null && song.language!.isNotEmpty;
        return hasTitle && hasGenre && hasLanguage;
      case 2: // People (Performers, Ethnic Group)
        final hasArtist = song.audioMetadata?.performerNames != null;
        final hasEthnicGroup = song.ethnicGroupId.isNotEmpty;
        return hasArtist && hasEthnicGroup;
      case 3: // Cultural context
        return song.ethnicGroupId.isNotEmpty; // Already validated in step 2
      case 4: // Performance details
        final performanceType = song.performanceType;
        if (performanceType == null) return false;
        final hasInstruments =
            song.audioMetadata?.instrumentIds?.isNotEmpty == true;
        switch (performanceType) {
          case PerformanceType.instrumental:
          case PerformanceType.vocalWithAccompaniment:
            return hasInstruments;
          case PerformanceType.aCappella:
            return true; // No instruments needed
          default:
            return false;
        }
      case 5: // Review (merged with Notes)
        // Review is valid if all previous steps are valid
        return _isStepValid(0) &&
            _isStepValid(1) &&
            _isStepValid(2) &&
            _isStepValid(3) &&
            _isStepValid(4);
      default:
        return false;
    }
  }

  void updateSongData(Song? song) {
    if (song != null) {
      state = state.copyWith(songData: song);
    }
  }

  void updateAudioUrl(String? url, {int? durationInSeconds}) {
    // Ensure songData exists
    final currentSong = state.songData ?? Song(
      id: '',
      title: '',
      genre: MusicGenre.folk,
      ethnicGroupId: '',
      verificationStatus: VerificationStatus.pending,
      author: 'Dân gian',
      language: 'Tiếng Việt',
      isRecordingDateEstimated: false,
    );
    
    final audioMetadata = currentSong.audioMetadata;
    state = state.copyWith(
      songData: currentSong.copyWith(
        audioMetadata: audioMetadata != null
            ? audioMetadata.copyWith(url: url ?? '')
            : AudioMetadata(
                url: url ?? '',
                durationInSeconds: durationInSeconds ?? 0,
                quality: AudioQuality.medium,
                recordingDate: DateTime.now(),
              ),
      ),
    );
  }

  void updateAudioMetadataExtracted(AudioFileMetadata metadata) {
    final song = state.songData;
    if (song == null) return;
    final audioMetadata = song.audioMetadata;
    if (audioMetadata == null) return;

    final updatedMetadata = audioMetadata.copyWith(
      format: metadata.format,
      bitrate: metadata.bitrateKbps,
      sampleRate: metadata.sampleRateHz,
      durationInSeconds: metadata.durationInSeconds,
    );

    state = state.copyWith(
      songData: song.copyWith(audioMetadata: updatedMetadata),
    );
  }

  void updateArtist(List<String> performerNames) {
    final song = state.songData;
    if (song == null) return;
    final audioMetadata = song.audioMetadata;
    if (audioMetadata == null) return;
    state = state.copyWith(
      songData: song.copyWith(
        audioMetadata: audioMetadata.copyWith(performerNames: performerNames),
      ),
    );
  }

  void updateAuthor(String? author) {
    state = state.copyWith(
      songData: state.songData?.copyWith(author: author),
    );
  }

  void updateLanguage(String language) {
    state = state.copyWith(
      songData: state.songData?.copyWith(language: language),
    );
  }

  void updateTitle(String title) {
    state = state.copyWith(
      songData: state.songData?.copyWith(title: title),
    );
  }

  void updateGenre(MusicGenre genre) {
    state = state.copyWith(
      songData: state.songData?.copyWith(genre: genre),
    );
  }

  void updatePerformanceType(PerformanceType type) {
    final song = state.songData;
    if (song == null) return;

    // Auto-clear instruments when switching to A Cappella
    if (type == PerformanceType.aCappella) {
      final audioMetadata = song.audioMetadata;
      if (audioMetadata != null && (audioMetadata.instrumentIds?.isNotEmpty ?? false)) {
        state = state.copyWith(
          songData: song.copyWith(
            performanceType: type,
            audioMetadata: audioMetadata.copyWith(instrumentIds: []),
          ),
        );
        return;
      }
    }

    state = state.copyWith(
      songData: song.copyWith(performanceType: type),
    );
  }

  void updateEthnicGroup(String ethnicGroupId) {
    state = state.copyWith(
      songData: state.songData?.copyWith(ethnicGroupId: ethnicGroupId),
    );
  }

  void updateInstruments(List<String> instrumentIds) {
    final audioMetadata = state.songData?.audioMetadata;
    if (audioMetadata != null) {
      state = state.copyWith(
        songData: state.songData?.copyWith(
          audioMetadata: audioMetadata.copyWith(instrumentIds: instrumentIds),
        ),
      );
    }
  }

  void updateRecordingDate(DateTime date) {
    final audioMetadata = state.songData?.audioMetadata;
    if (audioMetadata != null) {
      state = state.copyWith(
        songData: state.songData?.copyWith(
          audioMetadata: audioMetadata.copyWith(recordingDate: date),
        ),
      );
    }
  }

  void updateIsRecordingDateEstimated(bool isEstimated) {
    state = state.copyWith(
      songData: state.songData?.copyWith(isRecordingDateEstimated: isEstimated),
    );
  }

  void updateRecordingLocation(String province, String commune) {
    final audioMetadata = state.songData?.audioMetadata;
    if (audioMetadata != null) {
      final currentLocation = audioMetadata.recordingLocation;
      final newLocation = Location(
        latitude: currentLocation?.latitude ?? 0.0,
        longitude: currentLocation?.longitude ?? 0.0,
        province: province.isNotEmpty ? province : currentLocation?.province,
        district: currentLocation?.district,
        commune: commune.isNotEmpty ? commune : currentLocation?.commune,
        address: currentLocation?.address,
      );
      state = state.copyWith(
        songData: state.songData?.copyWith(
          audioMetadata: audioMetadata.copyWith(recordingLocation: newLocation),
        ),
      );
    }
  }

  void updateCopyrightInfo(String? info) {
    state = state.copyWith(
      songData: state.songData?.copyWith(copyrightInfo: info),
    );
  }

  void updateFieldNotes(String? notes) {
    state = state.copyWith(
      songData: state.songData?.copyWith(fieldNotes: notes),
    );
  }

  void updateLyrics({
    String? nativeScript,
    String? vietnameseTranslation,
  }) {
    state = state.copyWith(
      songData: state.songData?.copyWith(
        lyricsNativeScript: nativeScript,
        lyricsVietnameseTranslation: vietnameseTranslation,
      ),
    );
  }

  void reset() {
    state = ContributionFormState.initial();
    // Clear draft when resetting
    _draftService.clearDraft();
  }

  /// Load draft data
  Future<void> loadDraft() async {
    final draft = await _draftService.loadDraft();
    if (draft != null) {
      state = state.copyWith(
        songData: draft.songData,
        currentStep: draft.currentStep,
      );
    }
  }

  bool canProceedToNextStep() {
    switch (state.currentStep) {
      case 0: // Audio upload
        final url = state.songData?.audioMetadata?.url;
        final result = url != null && url.isNotEmpty;
        debugPrint('canProceedToNextStep(step 0): url=$url, result=$result');
        return result;
      case 1: // Identity (Title, Genre, Language)
        final hasTitle =
            state.songData?.title != null && state.songData!.title.isNotEmpty;
        final hasGenre = state.songData?.genre != null;
        final hasLanguage =
            state.songData?.language != null && state.songData!.language!.isNotEmpty;
        return hasTitle && hasGenre && hasLanguage;
      case 2: // People (Performers, Ethnic Group)
        // Allow empty performerNames (when "Không rõ" is checked)
        final hasArtist = state.songData?.audioMetadata?.performerNames != null;
        final hasEthnicGroup = state.songData?.ethnicGroupId != null &&
            state.songData!.ethnicGroupId.isNotEmpty;
        return hasArtist && hasEthnicGroup;
      case 3: // Cultural context
        final ethnicGroupId = state.songData?.ethnicGroupId;
        return ethnicGroupId != null && ethnicGroupId.isNotEmpty;
      case 4: // Performance details
        final performanceType = state.songData?.performanceType;
        if (performanceType == null) return false;

        final hasInstruments =
            state.songData?.audioMetadata?.instrumentIds?.isNotEmpty == true;

        switch (performanceType) {
          case PerformanceType.instrumental:
          case PerformanceType.vocalWithAccompaniment:
            return hasInstruments; // Bắt buộc có nhạc cụ
          case PerformanceType.aCappella:
            return !hasInstruments; // Không được có nhạc cụ
        }
      case 5: // Review (merged with Notes)
        return true;
      default:
        return false;
    }
  }
}

/// Contribution form state
class ContributionFormState {
  final int currentStep;
  final Song? songData;
  final bool isSubmitting;
  final String? error;

  ContributionFormState({
    required this.currentStep,
    this.songData,
    this.isSubmitting = false,
    this.error,
  });

  factory ContributionFormState.initial() {
    return ContributionFormState(
      currentStep: 0,
      songData: Song(
        id: '',
        title: '',
        genre: MusicGenre.folk,
        ethnicGroupId: '',
        verificationStatus: VerificationStatus.pending,
        author: 'Dân gian',
        language: 'Tiếng Việt',
        isRecordingDateEstimated: false,
      ),
    );
  }

  ContributionFormState copyWith({
    int? currentStep,
    Song? songData,
    bool? isSubmitting,
    String? error,
  }) {
    return ContributionFormState(
      currentStep: currentStep ?? this.currentStep,
      songData: songData ?? this.songData,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: error ?? this.error,
    );
  }
}

/// Provider for contribution form
final contributionFormProvider =
    StateNotifierProvider<ContributionFormNotifier, ContributionFormState>(
  (ref) => ContributionFormNotifier(),
);

/// Provider for user contributions
final userContributionsProvider = FutureProvider.family<
    PaginatedResponse<ContributionRequest>,
    ({String userId, VerificationStatus? statusFilter, QueryParams params})>(
  (ref, params) async {
    final useCase = getIt<GetUserContributions>();
    final result = await useCase(
      userId: params.userId,
      statusFilter: params.statusFilter,
      params: params.params,
    );
    return result.fold(
      (failure) => throw failure,
      (response) => response,
    );
  },
);

/// Provider for contribution by ID
final contributionByIdProvider =
    FutureProvider.family<ContributionRequest, String>(
  (ref, contributionId) async {
    final useCase = getIt<GetContributionById>();
    final result = await useCase(contributionId);
    return result.fold(
      (failure) => throw failure,
      (contribution) => contribution,
    );
  },
);
