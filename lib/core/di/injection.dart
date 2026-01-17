import 'package:get_it/get_it.dart';
import 'package:injectable/injectable.dart';
import 'injection.config.dart';
import '../../data/datasources/mock/mock_contribution_data_source.dart';
import '../../data/datasources/mock/mock_ethnic_group_data_source.dart';
import '../../data/datasources/mock/mock_instrument_data_source.dart';
import '../../data/datasources/mock/mock_song_data_source.dart';
import '../../data/datasources/mock/mock_auth_data_source.dart';
import '../../data/repositories/contribution_repository_impl.dart';
import '../../data/repositories/ethnic_group_repository_impl.dart';
import '../../data/repositories/instrument_repository_impl.dart';
import '../../data/repositories/song_repository_impl.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../data/repositories/user_repository_impl.dart';
import '../../domain/repositories/contribution_repository.dart';
import '../../domain/repositories/ethnic_group_repository.dart';
import '../../domain/repositories/instrument_repository.dart';
import '../../domain/repositories/song_repository.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/repositories/user_repository.dart';
import '../../domain/usecases/contribution/get_contribution_by_id.dart';
import '../../domain/usecases/contribution/get_user_contributions.dart';
import '../../domain/usecases/contribution/submit_contribution.dart';
import '../../domain/usecases/contribution/update_contribution.dart';
import '../../domain/usecases/discovery/get_featured_songs.dart';
import '../../domain/usecases/discovery/get_song_by_id.dart';
import '../../domain/usecases/discovery/get_songs_by_ethnic_group.dart';
import '../../domain/usecases/discovery/get_songs_by_instrument.dart';
import '../../domain/usecases/discovery/search_songs.dart';
import '../../domain/usecases/discovery/toggle_favorite.dart';
import '../../domain/usecases/reference/get_ethnic_groups.dart';
import '../../domain/usecases/reference/get_instruments.dart';
import '../../domain/usecases/reference/get_regions.dart';
import '../../domain/usecases/auth/login.dart';
import '../../domain/usecases/auth/register.dart';
import '../../domain/usecases/auth/logout.dart';
import '../../domain/usecases/auth/get_current_user.dart';
import '../../domain/usecases/auth/request_contributor_role.dart';
import '../../domain/usecases/auth/refresh_token.dart';
import '../../domain/usecases/auth/update_profile.dart';
import '../../domain/usecases/auth/change_password.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/guest_favorite_service.dart';

final getIt = GetIt.instance;

@InjectableInit()
void configureDependencies() => getIt.init();

@module
abstract class DataSourceModule {
  @lazySingleton
  MockSongDataSource get songDataSource => MockSongDataSourceImpl();

  @lazySingleton
  MockInstrumentDataSource get instrumentDataSource =>
      MockInstrumentDataSourceImpl();

  @lazySingleton
  MockEthnicGroupDataSource get ethnicGroupDataSource =>
      MockEthnicGroupDataSourceImpl();

  @lazySingleton
  MockContributionDataSource get contributionDataSource =>
      MockContributionDataSourceImpl();

  @lazySingleton
  MockAuthDataSource get authDataSource => MockAuthDataSourceImpl();

  @lazySingleton
  FlutterSecureStorage get secureStorage => const FlutterSecureStorage();
}

@module
abstract class RepositoryModule {
  @LazySingleton(as: SongRepository)
  SongRepositoryImpl songRepository(MockSongDataSource dataSource) =>
      SongRepositoryImpl(dataSource);

  @LazySingleton(as: InstrumentRepository)
  InstrumentRepositoryImpl instrumentRepository(
    MockInstrumentDataSource dataSource,
  ) =>
      InstrumentRepositoryImpl(dataSource);

  @LazySingleton(as: EthnicGroupRepository)
  EthnicGroupRepositoryImpl ethnicGroupRepository(
    MockEthnicGroupDataSource dataSource,
  ) =>
      EthnicGroupRepositoryImpl(dataSource);

  @LazySingleton(as: ContributionRepository)
  ContributionRepositoryImpl contributionRepository(
    MockContributionDataSource dataSource,
  ) =>
      ContributionRepositoryImpl(dataSource);

  @LazySingleton(as: AuthRepository)
  AuthRepositoryImpl authRepository(MockAuthDataSource dataSource) =>
      AuthRepositoryImpl(dataSource);

  @LazySingleton(as: UserRepository)
  UserRepositoryImpl userRepository(MockAuthDataSource dataSource) =>
      UserRepositoryImpl(dataSource);
}

@module
abstract class UseCaseModule {
  @lazySingleton
  SearchSongs searchSongs(SongRepository repository) =>
      SearchSongs(repository);

  @lazySingleton
  GetSongById getSongById(SongRepository repository) =>
      GetSongById(repository);

  @lazySingleton
  GetFeaturedSongs getFeaturedSongs(SongRepository repository) =>
      GetFeaturedSongs(repository);

  @lazySingleton
  GetSongsByEthnicGroup getSongsByEthnicGroup(SongRepository repository) =>
      GetSongsByEthnicGroup(repository);

  @lazySingleton
  GetSongsByInstrument getSongsByInstrument(SongRepository repository) =>
      GetSongsByInstrument(repository);

  @lazySingleton
  ToggleFavorite toggleFavorite(SongRepository repository) =>
      ToggleFavorite(repository);

  @lazySingleton
  GetInstruments getInstruments(InstrumentRepository repository) =>
      GetInstruments(repository);

  @lazySingleton
  GetEthnicGroups getEthnicGroups(EthnicGroupRepository repository) =>
      GetEthnicGroups(repository);

  @lazySingleton
  GetRegions getRegions(EthnicGroupRepository repository) =>
      GetRegions(repository);

  @lazySingleton
  SubmitContribution submitContribution(ContributionRepository repository) =>
      SubmitContribution(repository);

  @lazySingleton
  GetUserContributions getUserContributions(
    ContributionRepository repository,
  ) =>
      GetUserContributions(repository);

  @lazySingleton
  GetContributionById getContributionById(ContributionRepository repository) =>
      GetContributionById(repository);

  @lazySingleton
  UpdateContribution updateContribution(ContributionRepository repository) =>
      UpdateContribution(repository);

  @lazySingleton
  Login login(AuthRepository repository) => Login(repository);

  @lazySingleton
  Register register(AuthRepository repository) => Register(repository);

  @lazySingleton
  Logout logout(AuthRepository repository) => Logout(repository);

  @lazySingleton
  GetCurrentUser getCurrentUser(AuthRepository repository) =>
      GetCurrentUser(repository);

  @lazySingleton
  RequestContributorRole requestContributorRole(AuthRepository repository) =>
      RequestContributorRole(repository);

  @lazySingleton
  RefreshToken refreshToken(AuthRepository repository) =>
      RefreshToken(repository);

  @lazySingleton
  UpdateProfile updateProfile(AuthRepository repository) =>
      UpdateProfile(repository);

  @lazySingleton
  ChangePassword changePassword(AuthRepository repository) =>
      ChangePassword(repository);
}

@module
abstract class ServiceModule {
  @lazySingleton
  GuestFavoriteService get guestFavoriteService => GuestFavoriteService();
}
