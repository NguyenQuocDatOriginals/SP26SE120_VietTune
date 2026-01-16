import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/cultural_context.dart';
import '../../domain/entities/enums.dart';

part 'cultural_context_model.g.dart';

/// Cultural context model DTO for JSON serialization
@JsonSerializable()
class CulturalContextModel {
  final String type; // ContextType enum as string
  final String? season;
  final String? occasion;
  final String? significance;
  @JsonKey(name: 'performance_details')
  final String? performanceDetails;
  @JsonKey(name: 'historical_background')
  final String? historicalBackground;

  const CulturalContextModel({
    required this.type,
    this.season,
    this.occasion,
    this.significance,
    this.performanceDetails,
    this.historicalBackground,
  });

  factory CulturalContextModel.fromJson(Map<String, dynamic> json) =>
      _$CulturalContextModelFromJson(json);

  Map<String, dynamic> toJson() => _$CulturalContextModelToJson(this);

  /// Convert model to domain entity
  CulturalContext toEntity() {
    return CulturalContext(
      type: ContextType.values.firstWhere(
        (e) => e.name == type,
        orElse: () => ContextType.entertainment,
      ),
      season: season,
      occasion: occasion,
      significance: significance,
      performanceDetails: performanceDetails,
      historicalBackground: historicalBackground,
    );
  }

  /// Create model from domain entity
  factory CulturalContextModel.fromEntity(CulturalContext entity) {
    return CulturalContextModel(
      type: entity.type.name,
      season: entity.season,
      occasion: entity.occasion,
      significance: entity.significance,
      performanceDetails: entity.performanceDetails,
      historicalBackground: entity.historicalBackground,
    );
  }
}
