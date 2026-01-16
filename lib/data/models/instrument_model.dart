import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/instrument.dart';
import '../../domain/entities/enums.dart';

part 'instrument_model.g.dart';

/// Instrument model DTO for JSON serialization
@JsonSerializable()
class InstrumentModel {
  final String id;
  final String name;
  final String type; // InstrumentType enum as string
  final String description;
  final List<String>? materials;
  @JsonKey(name: 'playing_technique')
  final String? playingTechnique;
  @JsonKey(name: 'image_url')
  final String? imageUrl;
  @JsonKey(name: 'audio_sample_url')
  final String? audioSampleUrl;
  @JsonKey(name: 'associated_ethnic_groups')
  final List<String>? associatedEthnicGroups;

  const InstrumentModel({
    required this.id,
    required this.name,
    required this.type,
    required this.description,
    this.materials,
    this.playingTechnique,
    this.imageUrl,
    this.audioSampleUrl,
    this.associatedEthnicGroups,
  });

  factory InstrumentModel.fromJson(Map<String, dynamic> json) =>
      _$InstrumentModelFromJson(json);

  Map<String, dynamic> toJson() => _$InstrumentModelToJson(this);

  /// Convert model to domain entity
  Instrument toEntity() {
    return Instrument(
      id: id,
      name: name,
      type: InstrumentType.values.firstWhere(
        (e) => e.name == type,
        orElse: () => InstrumentType.other,
      ),
      description: description,
      materials: materials,
      playingTechnique: playingTechnique,
      imageUrl: imageUrl,
      audioSampleUrl: audioSampleUrl,
      associatedEthnicGroups: associatedEthnicGroups,
    );
  }

  /// Create model from domain entity
  factory InstrumentModel.fromEntity(Instrument entity) {
    return InstrumentModel(
      id: entity.id,
      name: entity.name,
      type: entity.type.name,
      description: entity.description,
      materials: entity.materials,
      playingTechnique: entity.playingTechnique,
      imageUrl: entity.imageUrl,
      audioSampleUrl: entity.audioSampleUrl,
      associatedEthnicGroups: entity.associatedEthnicGroups,
    );
  }
}
