// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ethnic_group.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$EthnicGroupImpl _$$EthnicGroupImplFromJson(Map<String, dynamic> json) =>
    _$EthnicGroupImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      nameInNativeLanguage: json['nameInNativeLanguage'] as String,
      region: json['region'] as String,
      population: (json['population'] as num).toInt(),
      languageFamily: json['languageFamily'] as String,
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String?,
      traditionalOccupations: (json['traditionalOccupations'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      culturalPractices: (json['culturalPractices'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
    );

Map<String, dynamic> _$$EthnicGroupImplToJson(_$EthnicGroupImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'nameInNativeLanguage': instance.nameInNativeLanguage,
      'region': instance.region,
      'population': instance.population,
      'languageFamily': instance.languageFamily,
      'description': instance.description,
      'imageUrl': instance.imageUrl,
      'traditionalOccupations': instance.traditionalOccupations,
      'culturalPractices': instance.culturalPractices,
    };
