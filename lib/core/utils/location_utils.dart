import 'dart:math' as math;
import '../../domain/entities/location.dart';
import 'constants.dart';

/// Location utility functions
class LocationUtils {
  /// Format location as Vietnamese address string
  static String formatVietnameseAddress(Location location) {
    final parts = <String>[];
    
    if (location.commune != null && location.commune!.isNotEmpty) {
      parts.add(location.commune!);
    }
    if (location.district != null && location.district!.isNotEmpty) {
      parts.add(location.district!);
    }
    if (location.province != null && location.province!.isNotEmpty) {
      parts.add(location.province!);
    }
    
    return parts.join(', ');
  }

  /// Format GPS coordinates as string
  static String formatCoordinates(Location location) {
    return '${location.latitude.toStringAsFixed(6)}, ${location.longitude.toStringAsFixed(6)}';
  }

  /// Get region from province
  static String? getRegionFromProvince(String province) {
    for (final entry in VietnameseProvinces.provincesByRegion.entries) {
      if (entry.value.contains(province)) {
        return entry.key;
      }
    }
    return null;
  }

  /// Get all provinces in a region
  static List<String> getProvincesInRegion(String region) {
    return VietnameseProvinces.provincesByRegion[region] ?? [];
  }

  /// Check if province is valid
  static bool isValidProvince(String province) {
    return VietnameseProvinces.allProvinces.contains(province);
  }

  /// Calculate distance between two locations (Haversine formula)
  /// Returns distance in kilometers
  static double calculateDistance(
    Location location1,
    Location location2,
  ) {
    const double earthRadius = 6371; // km

    final lat1Rad = location1.latitude * (math.pi / 180);
    final lat2Rad = location2.latitude * (math.pi / 180);
    final deltaLatRad = (location2.latitude - location1.latitude) *
        (math.pi / 180);
    final deltaLonRad = (location2.longitude - location1.longitude) *
        (math.pi / 180);

    final a = math.sin(deltaLatRad / 2) * math.sin(deltaLatRad / 2) +
        math.cos(lat1Rad) *
            math.cos(lat2Rad) *
            math.sin(deltaLonRad / 2) *
            math.sin(deltaLonRad / 2);
    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));

    return earthRadius * c;
  }
}
