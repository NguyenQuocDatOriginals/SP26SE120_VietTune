import 'dart:convert';
import 'dart:isolate';

import 'package:flutter/services.dart';

import '../../data/models/address/address_models.dart';

/// Keys for assets (lazy-loaded; full tree parsed in Isolate to avoid jank).
const String _kProvincesAsset = 'assets/data/vietnam_provinces.json';
const String _kLocationsAsset = 'assets/data/vietnam_locations.json';

/// Service that provides Vietnamese administrative data (Tỉnh → Huyện → Xã).
/// - [getProvinces]: loads a small JSON, cached.
/// - [getDistricts] / [getWards]: load full tree once in an Isolate, then cached.
class LocationDataService {
  List<Province>? _provincesCache;
  Map<String, List<District>>? _districtsByProvince;
  Map<String, List<Ward>>? _wardsByDistrict;
  bool _fullTreeLoaded = false;
  Object? _loadError;

  /// Returns all provinces. Uses lightweight JSON; result is cached.
  Future<List<Province>> getProvinces() async {
    if (_provincesCache != null) return _provincesCache!;
    final String raw =
        await rootBundle.loadString(_kProvincesAsset);
    final List<dynamic> list = jsonDecode(raw) as List<dynamic>;
    _provincesCache = list
        .map((e) => Province.fromJson(e as Map<String, dynamic>))
        .toList();
    return _provincesCache!;
  }

  /// Returns districts for [provinceCode]. Loads full tree in Isolate on first use, then cached.
  Future<List<District>> getDistricts(String provinceCode) async {
    await _ensureFullTreeLoaded();
    if (_loadError != null) return [];
    final list = _districtsByProvince?[provinceCode];
    return list ?? [];
  }

  /// Returns wards for [districtCode] (under the given province). Requires full tree loaded.
  Future<List<Ward>> getWards(String provinceCode, String districtCode) async {
    await _ensureFullTreeLoaded();
    if (_loadError != null) return [];
    final key = '${provinceCode}_$districtCode';
    final list = _wardsByDistrict?[key];
    return list ?? [];
  }

  Future<void> _ensureFullTreeLoaded() async {
    if (_fullTreeLoaded) return;
    try {
      final String raw =
          await rootBundle.loadString(_kLocationsAsset);
      final Map<String, dynamic>? decoded = await Isolate.run(
        () => jsonDecode(raw) as Map<String, dynamic>?,
      );
      if (decoded == null) return;
      _districtsByProvince = {};
      _wardsByDistrict = {};
      final List<dynamic> provinces = decoded['provinces'] as List<dynamic>? ?? [];
      for (final p in provinces) {
        final pm = p as Map<String, dynamic>;
        final pCode = pm['code'] as String? ?? '';
        final List<dynamic> districts = pm['districts'] as List<dynamic>? ?? [];
        final districtList = <District>[];
        for (final d in districts) {
          final dm = d as Map<String, dynamic>;
          final dCode = dm['code'] as String? ?? '';
          districtList.add(District.fromJson(dm, provinceCode: pCode));
          final List<dynamic> wards = dm['wards'] as List<dynamic>? ?? [];
          final wardList = wards
              .map((w) => Ward.fromJson(
                    w as Map<String, dynamic>,
                    districtCode: dCode,
                  ))
              .toList();
          _wardsByDistrict!['${pCode}_$dCode'] = wardList;
        }
        _districtsByProvince![pCode] = districtList;
      }
    } catch (e, st) {
      _loadError = e;
      assert(() {
        // ignore: avoid_print
        print('LocationDataService: failed to load full tree: $e $st');
        return true;
      }());
    } finally {
      _fullTreeLoaded = true;
    }
  }
}
