import 'package:freezed_annotation/freezed_annotation.dart';
import 'enums.dart';

part 'instrument.freezed.dart';
part 'instrument.g.dart';

/// Traditional Vietnamese musical instrument entity
@freezed
class Instrument with _$Instrument {
  const factory Instrument({
    required String id,
    required String name,
    required InstrumentType type,
    required String description,
    List<String>? materials,
    String? playingTechnique,
    String? imageUrl,
    String? audioSampleUrl,
    List<String>? associatedEthnicGroups,
  }) = _Instrument;

  factory Instrument.fromJson(Map<String, dynamic> json) =>
      _$InstrumentFromJson(json);
}
