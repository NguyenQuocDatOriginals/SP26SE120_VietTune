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

/// Provider for contribution form state
class ContributionFormNotifier extends StateNotifier<ContributionFormState> {
  ContributionFormNotifier() : super(ContributionFormState.initial());

  void updateStep(int step) {
    state = state.copyWith(currentStep: step);
  }

  void updateSongData(Song? song) {
    if (song != null) {
      state = state.copyWith(songData: song);
    }
  }

  void updateAudioUrl(String? url, {int? durationInSeconds}) {
    final audioMetadata = state.songData?.audioMetadata;
    state = state.copyWith(
      songData: state.songData?.copyWith(
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
  }

  bool canProceedToNextStep() {
    switch (state.currentStep) {
      case 0: // Audio upload
        return state.songData?.audioMetadata?.url != null &&
            state.songData!.audioMetadata!.url.isNotEmpty;
      case 1: // Basic info
        final hasTitle =
            state.songData?.title != null && state.songData!.title.isNotEmpty;
        final hasArtist =
            state.songData?.audioMetadata?.performerNames?.isNotEmpty == true;
        final hasGenre = state.songData?.genre != null;
        final hasLanguage =
            state.songData?.language != null && state.songData!.language!.isNotEmpty;
        return hasTitle && hasArtist && hasGenre && hasLanguage;
      case 2: // Cultural context
        final ethnicGroupId = state.songData?.ethnicGroupId;
        return ethnicGroupId != null && ethnicGroupId.isNotEmpty;
      case 3: // Performance details
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
      case 4: // Notes & submit
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
