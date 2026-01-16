// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ethnic_group_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

EthnicGroupModel _$EthnicGroupModelFromJson(Map<String, dynamic> json) =>
    EthnicGroupModel(
      id: json['id'] as String,
      name: json['name'] as String,
      nameInNativeLanguage: json['name_in_native_language'] as String,
      region: json['region'] as String,
      population: (json['population'] as num).toInt(),
      languageFamily: json['language_family'] as String,
      description: json['description'] as String?,
      imageUrl: json['image_url'] as String?,
      traditionalOccupations:
          (json['traditional_occupations'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList(),
      culturalPractices: (json['cultural_practices'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
    );

Map<String, dynamic> _$EthnicGroupModelToJson(EthnicGroupModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'name_in_native_language': instance.nameInNativeLanguage,
      'region': instance.region,
      'population': instance.population,
      'language_family': instance.languageFamily,
      'description': instance.description,
      'image_url': instance.imageUrl,
      'traditional_occupations': instance.traditionalOccupations,
      'cultural_practices': instance.culturalPractices,
    };
