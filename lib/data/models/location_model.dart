import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/location.dart';

part 'location_model.g.dart';

/// Location model DTO for JSON serialization
@JsonSerializable()
class LocationModel {
  final double latitude;
  final double longitude;
  final String? province;
  final String? district;
  final String? commune;
  final String? address;

  const LocationModel({
    required this.latitude,
    required this.longitude,
    this.province,
    this.district,
    this.commune,
    this.address,
  });

  factory LocationModel.fromJson(Map<String, dynamic> json) =>
      _$LocationModelFromJson(json);

  Map<String, dynamic> toJson() => _$LocationModelToJson(this);

  /// Convert model to domain entity
  Location toEntity() {
    return Location(
      latitude: latitude,
      longitude: longitude,
      province: province,
      district: district,
      commune: commune,
      address: address,
    );
  }

  /// Create model from domain entity
  factory LocationModel.fromEntity(Location entity) {
    return LocationModel(
      latitude: entity.latitude,
      longitude: entity.longitude,
      province: entity.province,
      district: entity.district,
      commune: entity.commune,
      address: entity.address,
    );
  }
}
