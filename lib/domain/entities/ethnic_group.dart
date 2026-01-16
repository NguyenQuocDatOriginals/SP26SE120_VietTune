import 'package:freezed_annotation/freezed_annotation.dart';

part 'ethnic_group.freezed.dart';
part 'ethnic_group.g.dart';

/// Ethnic group entity representing one of Vietnam's 54 ethnic minorities
@freezed
class EthnicGroup with _$EthnicGroup {
  const factory EthnicGroup({
    required String id,
    required String name,
    required String nameInNativeLanguage,
    required String region,
    required int population,
    required String languageFamily,
    String? description,
    String? imageUrl,
    List<String>? traditionalOccupations,
    List<String>? culturalPractices,
  }) = _EthnicGroup;

  factory EthnicGroup.fromJson(Map<String, dynamic> json) =>
      _$EthnicGroupFromJson(json);
}
