// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// InjectableConfigGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:flutter_secure_storage/flutter_secure_storage.dart' as _i558;
import 'package:get_it/get_it.dart' as _i174;
import 'package:injectable/injectable.dart' as _i526;
import 'package:viettune_archive/core/di/injection.dart' as _i509;
import 'package:viettune_archive/core/services/contribution_draft_service.dart'
    as _i473;
import 'package:viettune_archive/core/services/ethnic_group_suggestion_service.dart'
    as _i474;
import 'package:viettune_archive/core/services/guest_favorite_service.dart'
    as _i228;
import 'package:viettune_archive/core/services/recording_service.dart' as _i771;
import 'package:viettune_archive/core/services/speech_to_text_service.dart'
    as _i420;
import 'package:viettune_archive/data/datasources/mock/mock_auth_data_source.dart'
    as _i601;
import 'package:viettune_archive/data/datasources/mock/mock_contribution_data_source.dart'
    as _i606;
import 'package:viettune_archive/data/datasources/mock/mock_ethnic_group_data_source.dart'
    as _i363;
import 'package:viettune_archive/data/datasources/mock/mock_instrument_data_source.dart'
    as _i1052;
import 'package:viettune_archive/data/datasources/mock/mock_song_data_source.dart'
    as _i327;
import 'package:viettune_archive/domain/repositories/auth_repository.dart'
    as _i807;
import 'package:viettune_archive/domain/repositories/contribution_repository.dart'
    as _i697;
import 'package:viettune_archive/domain/repositories/ethnic_group_repository.dart'
    as _i579;
import 'package:viettune_archive/domain/repositories/instrument_repository.dart'
    as _i935;
import 'package:viettune_archive/domain/repositories/song_repository.dart'
    as _i773;
import 'package:viettune_archive/domain/repositories/user_repository.dart'
    as _i151;
import 'package:viettune_archive/domain/usecases/auth/change_password.dart'
    as _i108;
import 'package:viettune_archive/domain/usecases/auth/get_current_user.dart'
    as _i971;
import 'package:viettune_archive/domain/usecases/auth/login.dart' as _i471;
import 'package:viettune_archive/domain/usecases/auth/logout.dart' as _i472;
import 'package:viettune_archive/domain/usecases/auth/refresh_token.dart'
    as _i215;
import 'package:viettune_archive/domain/usecases/auth/register.dart' as _i204;
import 'package:viettune_archive/domain/usecases/auth/request_contributor_role.dart'
    as _i802;
import 'package:viettune_archive/domain/usecases/auth/update_profile.dart'
    as _i983;
import 'package:viettune_archive/domain/usecases/contribution/get_contribution_by_id.dart'
    as _i325;
import 'package:viettune_archive/domain/usecases/contribution/get_user_contributions.dart'
    as _i23;
import 'package:viettune_archive/domain/usecases/contribution/submit_contribution.dart'
    as _i887;
import 'package:viettune_archive/domain/usecases/contribution/update_contribution.dart'
    as _i195;
import 'package:viettune_archive/domain/usecases/discovery/get_featured_songs.dart'
    as _i721;
import 'package:viettune_archive/domain/usecases/discovery/get_song_by_id.dart'
    as _i555;
import 'package:viettune_archive/domain/usecases/discovery/get_songs_by_ethnic_group.dart'
    as _i660;
import 'package:viettune_archive/domain/usecases/discovery/get_songs_by_instrument.dart'
    as _i860;
import 'package:viettune_archive/domain/usecases/discovery/search_songs.dart'
    as _i628;
import 'package:viettune_archive/domain/usecases/discovery/toggle_favorite.dart'
    as _i681;
import 'package:viettune_archive/domain/usecases/reference/get_ethnic_groups.dart'
    as _i644;
import 'package:viettune_archive/domain/usecases/reference/get_instruments.dart'
    as _i579;
import 'package:viettune_archive/domain/usecases/reference/get_regions.dart'
    as _i825;

extension GetItInjectableX on _i174.GetIt {
// initializes the registration of main-scope dependencies inside of GetIt
  _i174.GetIt init({
    String? environment,
    _i526.EnvironmentFilter? environmentFilter,
  }) {
    final gh = _i526.GetItHelper(
      this,
      environment,
      environmentFilter,
    );
    final dataSourceModule = _$DataSourceModule();
    final serviceModule = _$ServiceModule();
    final repositoryModule = _$RepositoryModule();
    final useCaseModule = _$UseCaseModule();
    gh.lazySingleton<_i327.MockSongDataSource>(
        () => dataSourceModule.songDataSource);
    gh.lazySingleton<_i1052.MockInstrumentDataSource>(
        () => dataSourceModule.instrumentDataSource);
    gh.lazySingleton<_i363.MockEthnicGroupDataSource>(
        () => dataSourceModule.ethnicGroupDataSource);
    gh.lazySingleton<_i606.MockContributionDataSource>(
        () => dataSourceModule.contributionDataSource);
    gh.lazySingleton<_i601.MockAuthDataSource>(
        () => dataSourceModule.authDataSource);
    gh.lazySingleton<_i558.FlutterSecureStorage>(
        () => dataSourceModule.secureStorage);
    gh.lazySingleton<_i228.GuestFavoriteService>(
        () => serviceModule.guestFavoriteService);
    gh.lazySingleton<_i473.ContributionDraftService>(
        () => serviceModule.contributionDraftService);
    gh.lazySingleton<_i474.EthnicGroupSuggestionService>(
        () => serviceModule.ethnicGroupSuggestionService);
    gh.lazySingleton<_i771.RecordingService>(
        () => serviceModule.recordingService);
    gh.lazySingleton<_i420.SpeechToTextService>(
        () => serviceModule.speechToTextService);
    gh.lazySingleton<_i773.SongRepository>(
        () => repositoryModule.songRepository(gh<_i327.MockSongDataSource>()));
    gh.lazySingleton<_i697.ContributionRepository>(() => repositoryModule
        .contributionRepository(gh<_i606.MockContributionDataSource>()));
    gh.lazySingleton<_i628.SearchSongs>(
        () => useCaseModule.searchSongs(gh<_i773.SongRepository>()));
    gh.lazySingleton<_i555.GetSongById>(
        () => useCaseModule.getSongById(gh<_i773.SongRepository>()));
    gh.lazySingleton<_i721.GetFeaturedSongs>(
        () => useCaseModule.getFeaturedSongs(gh<_i773.SongRepository>()));
    gh.lazySingleton<_i660.GetSongsByEthnicGroup>(
        () => useCaseModule.getSongsByEthnicGroup(gh<_i773.SongRepository>()));
    gh.lazySingleton<_i860.GetSongsByInstrument>(
        () => useCaseModule.getSongsByInstrument(gh<_i773.SongRepository>()));
    gh.lazySingleton<_i681.ToggleFavorite>(
        () => useCaseModule.toggleFavorite(gh<_i773.SongRepository>()));
    gh.lazySingleton<_i151.UserRepository>(
        () => repositoryModule.userRepository(gh<_i601.MockAuthDataSource>()));
    gh.lazySingleton<_i579.EthnicGroupRepository>(() => repositoryModule
        .ethnicGroupRepository(gh<_i363.MockEthnicGroupDataSource>()));
    gh.lazySingleton<_i935.InstrumentRepository>(() => repositoryModule
        .instrumentRepository(gh<_i1052.MockInstrumentDataSource>()));
    gh.lazySingleton<_i807.AuthRepository>(
        () => repositoryModule.authRepository(gh<_i601.MockAuthDataSource>()));
    gh.lazySingleton<_i644.GetEthnicGroups>(
        () => useCaseModule.getEthnicGroups(gh<_i579.EthnicGroupRepository>()));
    gh.lazySingleton<_i825.GetRegions>(
        () => useCaseModule.getRegions(gh<_i579.EthnicGroupRepository>()));
    gh.lazySingleton<_i579.GetInstruments>(
        () => useCaseModule.getInstruments(gh<_i935.InstrumentRepository>()));
    gh.lazySingleton<_i887.SubmitContribution>(() =>
        useCaseModule.submitContribution(gh<_i697.ContributionRepository>()));
    gh.lazySingleton<_i23.GetUserContributions>(() =>
        useCaseModule.getUserContributions(gh<_i697.ContributionRepository>()));
    gh.lazySingleton<_i325.GetContributionById>(() =>
        useCaseModule.getContributionById(gh<_i697.ContributionRepository>()));
    gh.lazySingleton<_i195.UpdateContribution>(() =>
        useCaseModule.updateContribution(gh<_i697.ContributionRepository>()));
    gh.lazySingleton<_i471.Login>(
        () => useCaseModule.login(gh<_i807.AuthRepository>()));
    gh.lazySingleton<_i204.Register>(
        () => useCaseModule.register(gh<_i807.AuthRepository>()));
    gh.lazySingleton<_i472.Logout>(
        () => useCaseModule.logout(gh<_i807.AuthRepository>()));
    gh.lazySingleton<_i971.GetCurrentUser>(
        () => useCaseModule.getCurrentUser(gh<_i807.AuthRepository>()));
    gh.lazySingleton<_i802.RequestContributorRole>(
        () => useCaseModule.requestContributorRole(gh<_i807.AuthRepository>()));
    gh.lazySingleton<_i215.RefreshToken>(
        () => useCaseModule.refreshToken(gh<_i807.AuthRepository>()));
    gh.lazySingleton<_i983.UpdateProfile>(
        () => useCaseModule.updateProfile(gh<_i807.AuthRepository>()));
    gh.lazySingleton<_i108.ChangePassword>(
        () => useCaseModule.changePassword(gh<_i807.AuthRepository>()));
    return this;
  }
}

class _$DataSourceModule extends _i509.DataSourceModule {}

class _$ServiceModule extends _i509.ServiceModule {}

class _$RepositoryModule extends _i509.RepositoryModule {}

class _$UseCaseModule extends _i509.UseCaseModule {}
