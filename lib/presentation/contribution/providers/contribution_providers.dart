import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../domain/entities/contribution_request.dart';
import '../../../domain/entities/song.dart';
import '../../../domain/entities/audio_metadata.dart';
import '../../../domain/entities/enums.dart';
import '../../../domain/usecases/contribution/get_user_contributions.dart';
import '../../../domain/usecases/contribution/submit_contribution.dart';
import '../../../domain/usecases/contribution/get_contribution_by_id.dart';
import '../../../domain/usecases/contribution/update_contribution.dart';
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
        return state.songData?.title != null &&
            state.songData!.title.isNotEmpty &&
            state.songData?.ethnicGroupId != null &&
            state.songData!.ethnicGroupId.isNotEmpty;
      case 2: // Cultural context
        return true; // Optional step
      case 3: // Lyrics
        return true; // Optional step
      case 4: // Review
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
