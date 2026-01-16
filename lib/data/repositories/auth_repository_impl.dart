import 'package:dartz/dartz.dart';
import '../../domain/entities/user.dart';
import '../../domain/failures/failure.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/mock/mock_auth_data_source.dart';
import '../models/auth_response_model.dart';

/// Auth repository implementation using mock data source
class AuthRepositoryImpl implements AuthRepository {
  final MockAuthDataSource _dataSource;

  AuthRepositoryImpl(this._dataSource);

  @override
  Future<Either<Failure, AuthResponse>> login({
    required String email,
    required String password,
  }) async {
    try {
      final AuthResponseModel model = await _dataSource.login(
        email: email,
        password: password,
      );
      return Right(model.toEntity());
    } catch (e) {
      return Left(Failure.unauthorized(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, AuthResponse>> register({
    required String email,
    required String password,
    required String name,
    String? phoneNumber,
  }) async {
    try {
      final model = await _dataSource.register(
        email: email,
        password: password,
        name: name,
        phoneNumber: phoneNumber,
      );
      return Right(model.toEntity());
    } catch (e) {
      return Left(Failure.validation(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> requestContributorRole({
    required String userId,
    required String reason,
  }) async {
    try {
      await _dataSource.requestContributorRole(
        userId: userId,
        reason: reason,
      );
      return const Right(null);
    } catch (e) {
      return Left(Failure.validation(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> logout() async {
    try {
      await _dataSource.logout();
      return const Right(null);
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, User>> getCurrentUser() async {
    try {
      final user = await _dataSource.getCurrentUser();
      return Right(user.toEntity());
    } catch (e) {
      return Left(Failure.unauthorized(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, AuthResponse>> refreshToken(String refreshToken) async {
    try {
      final model = await _dataSource.refreshToken(refreshToken);
      return Right(model.toEntity());
    } catch (e) {
      return Left(Failure.unauthorized(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, User>> updateProfile({
    required String userId,
    String? name,
    String? bio,
    String? avatar,
  }) async {
    try {
      final user = await _dataSource.updateProfile(
        userId: userId,
        name: name,
        bio: bio,
        avatar: avatar,
      );
      return Right(user.toEntity());
    } catch (e) {
      return Left(Failure.server(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final currentUser = await _dataSource.getCurrentUser();
      await _dataSource.changePassword(
        userId: currentUser.id,
        currentPassword: currentPassword,
        newPassword: newPassword,
      );
      return const Right(null);
    } catch (e) {
      return Left(Failure.validation(message: e.toString()));
    }
  }
}
