import 'package:json_annotation/json_annotation.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/entities/user.dart';
import 'user_model.dart';

part 'auth_response_model.g.dart';

/// Auth response DTO
@JsonSerializable()
class AuthResponseModel {
  final UserModel user;
  @JsonKey(name: 'access_token')
  final String accessToken;
  @JsonKey(name: 'refresh_token')
  final String refreshToken;

  const AuthResponseModel({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
  });

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseModelFromJson(json);

  Map<String, dynamic> toJson() => _$AuthResponseModelToJson(this);

  AuthResponse toEntity() {
    final User entity = user.toEntity();
    return AuthResponse(
      user: entity,
      accessToken: accessToken,
      refreshToken: refreshToken,
    );
  }
}
