import 'package:freezed_annotation/freezed_annotation.dart';

part 'location.freezed.dart';
part 'location.g.dart';

/// Location entity with GPS coordinates and Vietnamese administrative divisions
@freezed
class Location with _$Location {
  const factory Location({
    required double latitude,
    required double longitude,
    String? province,
    String? district,
    String? commune,
    String? address,
  }) = _Location;

  factory Location.fromJson(Map<String, dynamic> json) =>
      _$LocationFromJson(json);
}
