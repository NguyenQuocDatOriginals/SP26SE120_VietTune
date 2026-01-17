import 'package:shared_preferences/shared_preferences.dart';

/// Service for managing guest user favorites in local storage
class GuestFavoriteService {
  SharedPreferences? _prefs;
  static const _key = 'guest_favorites';

  GuestFavoriteService();

  Future<SharedPreferences> get _preferences async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }

  /// Get all favorite song IDs for guest user
  Future<List<String>> getFavorites() async {
    final prefs = await _preferences;
    return prefs.getStringList(_key) ?? [];
  }

  /// Add a song to guest favorites
  Future<void> addFavorite(String songId) async {
    final prefs = await _preferences;
    final favorites = await getFavorites();
    if (!favorites.contains(songId)) {
      favorites.add(songId);
      await prefs.setStringList(_key, favorites);
    }
  }

  /// Remove a song from guest favorites
  Future<void> removeFavorite(String songId) async {
    final prefs = await _preferences;
    final favorites = await getFavorites();
    favorites.remove(songId);
    await prefs.setStringList(_key, favorites);
  }

  /// Check if a song is in guest favorites
  Future<bool> isFavorite(String songId) async {
    final favorites = await getFavorites();
    return favorites.contains(songId);
  }

  /// Clear all guest favorites (used after migration to authenticated account)
  Future<void> clear() async {
    final prefs = await _preferences;
    await prefs.remove(_key);
  }

  /// Get count of guest favorites
  Future<int> getCount() async {
    final favorites = await getFavorites();
    return favorites.length;
  }
}
