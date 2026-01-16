import 'package:freezed_annotation/freezed_annotation.dart';
import 'enums.dart';

part 'cultural_context.freezed.dart';
part 'cultural_context.g.dart';

/// Cultural context for song performance
@freezed
class CulturalContext with _$CulturalContext {
  const factory CulturalContext({
    required ContextType type,
    String? season,
    String? occasion,
    String? significance,
    String? performanceDetails,
    String? historicalBackground,
  }) = _CulturalContext;

  factory CulturalContext.fromJson(Map<String, dynamic> json) =>
      _$CulturalContextFromJson(json);
}
