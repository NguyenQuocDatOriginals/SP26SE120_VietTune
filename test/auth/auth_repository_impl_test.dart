import 'package:flutter_test/flutter_test.dart';
import 'package:viettune_archive/data/datasources/mock/mock_auth_data_source.dart';
import 'package:viettune_archive/data/repositories/auth_repository_impl.dart';
import 'package:viettune_archive/domain/entities/enums.dart';

void main() {
  test('login with mock accounts succeeds', () async {
    final dataSource = MockAuthDataSourceImpl();
    final repository = AuthRepositoryImpl(dataSource);

    final result = await repository.login(
      email: 'researcher@viettune.vn',
      password: 'password123',
    );

    result.fold(
      (_) => fail('Expected login success'),
      (_) => expect(true, true),
    );
  });

  test('request contributor role updates current user', () async {
    final dataSource = MockAuthDataSourceImpl();
    final repository = AuthRepositoryImpl(dataSource);

    final login = await repository.login(
      email: 'researcher@viettune.vn',
      password: 'password123',
    );
    login.fold(
      (_) => fail('Expected login success'),
      (_) => expect(true, true),
    );

    await repository.requestContributorRole(
      userId: 'researcher1',
      reason: 'Upgrade',
    );

    final current = await repository.getCurrentUser();
    current.fold(
      (_) => fail('Expected current user'),
      (user) => expect(user.role, UserRole.contributor),
    );
  });
}
