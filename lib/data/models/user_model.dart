import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/enums.dart';
import '../../domain/entities/user.dart';

part 'user_model.g.dart';

/// User model DTO for JSON serialization
@JsonSerializable()
class UserModel {
  final String id;
  final String email;
  final String name;
  final String role;
  @JsonKey(name: 'phone_number')
  final String? phoneNumber;
  final String? avatar;
  final String? bio;
  final String? affiliation;
  final List<String>? specializations;
  @JsonKey(name: 'created_at')
  final String? createdAt;
  @JsonKey(name: 'last_login_at')
  final String? lastLoginAt;
  @JsonKey(name: 'is_email_verified')
  final bool? isEmailVerified;
  @JsonKey(name: 'is_active')
  final bool? isActive;
  @JsonKey(name: 'password_hash')
  final String? passwordHash;

  const UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.phoneNumber,
    this.avatar,
    this.bio,
    this.affiliation,
    this.specializations,
    this.createdAt,
    this.lastLoginAt,
    this.isEmailVerified,
    this.isActive,
    this.passwordHash,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  User toEntity() {
    return User(
      id: id,
      email: email,
      name: name,
      role: UserRole.values.firstWhere(
        (e) => e.name == role,
        orElse: () => UserRole.researcher,
      ),
      phoneNumber: phoneNumber,
      avatar: avatar,
      bio: bio,
      affiliation: affiliation,
      specializations: specializations,
      createdAt: createdAt != null ? DateTime.parse(createdAt!) : null,
      lastLoginAt: lastLoginAt != null ? DateTime.parse(lastLoginAt!) : null,
      isEmailVerified: isEmailVerified,
      isActive: isActive,
    );
  }

  factory UserModel.fromEntity(User entity, {String? passwordHash}) {
    return UserModel(
      id: entity.id,
      email: entity.email,
      name: entity.name,
      role: entity.role.name,
      phoneNumber: entity.phoneNumber,
      avatar: entity.avatar,
      bio: entity.bio,
      affiliation: entity.affiliation,
      specializations: entity.specializations,
      createdAt: entity.createdAt?.toIso8601String(),
      lastLoginAt: entity.lastLoginAt?.toIso8601String(),
      isEmailVerified: entity.isEmailVerified,
      isActive: entity.isActive,
      passwordHash: passwordHash,
    );
  }
}
