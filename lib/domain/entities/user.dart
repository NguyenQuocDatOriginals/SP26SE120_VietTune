import 'package:freezed_annotation/freezed_annotation.dart';
import 'enums.dart';

part 'user.freezed.dart';
part 'user.g.dart';

/// User entity for authentication and authorization
@freezed
class User with _$User {
  const factory User({
    required String id,
    required String email,
    required String name,
    required UserRole role,
    String? phoneNumber,
    String? avatar,
    String? bio,
    String? affiliation,
    List<String>? specializations,
    DateTime? createdAt,
    DateTime? lastLoginAt,
    @Default(false) bool? isEmailVerified,
    @Default(true) bool? isActive,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
