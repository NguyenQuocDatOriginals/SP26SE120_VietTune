import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/ethnic_group.dart';

part 'ethnic_group_model.g.dart';

/// Ethnic group model DTO for JSON serialization
@JsonSerializable()
class EthnicGroupModel {
  final String id;
  final String name;
  @JsonKey(name: 'name_in_native_language')
  final String nameInNativeLanguage;
  final String region;
  final int population;
  @JsonKey(name: 'language_family')
  final String languageFamily;
  final String? description;
  @JsonKey(name: 'image_url')
  final String? imageUrl;
  @JsonKey(name: 'traditional_occupations')
  final List<String>? traditionalOccupations;
  @JsonKey(name: 'cultural_practices')
  final List<String>? culturalPractices;

  const EthnicGroupModel({
    required this.id,
    required this.name,
    required this.nameInNativeLanguage,
    required this.region,
    required this.population,
    required this.languageFamily,
    this.description,
    this.imageUrl,
    this.traditionalOccupations,
    this.culturalPractices,
  });

  factory EthnicGroupModel.fromJson(Map<String, dynamic> json) =>
      _$EthnicGroupModelFromJson(json);

  Map<String, dynamic> toJson() => _$EthnicGroupModelToJson(this);

  /// Convert model to domain entity
  EthnicGroup toEntity() {
    return EthnicGroup(
      id: id,
      name: name,
      nameInNativeLanguage: nameInNativeLanguage,
      region: region,
      population: population,
      languageFamily: languageFamily,
      description: description,
      imageUrl: imageUrl,
      traditionalOccupations: traditionalOccupations,
      culturalPractices: culturalPractices,
    );
  }

  /// Create model from domain entity
  factory EthnicGroupModel.fromEntity(EthnicGroup entity) {
    return EthnicGroupModel(
      id: entity.id,
      name: entity.name,
      nameInNativeLanguage: entity.nameInNativeLanguage,
      region: entity.region,
      population: entity.population,
      languageFamily: entity.languageFamily,
      description: entity.description,
      imageUrl: entity.imageUrl,
      traditionalOccupations: entity.traditionalOccupations,
      culturalPractices: entity.culturalPractices,
    );
  }
}
