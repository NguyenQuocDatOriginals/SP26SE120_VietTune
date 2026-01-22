import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/entities/song.dart';
import '../../data/models/song_model.dart';

/// Draft data structure
class DraftData {
  final Song songData;
  final int currentStep;
  final DateTime savedAt;
  final String version;

  DraftData({
    required this.songData,
    required this.currentStep,
    required this.savedAt,
    this.version = '1.0',
  });

  Map<String, dynamic> toJson() {
    final songModel = SongModel.fromEntity(songData);
    return {
      'songData': songModel.toJson(),
      'currentStep': currentStep,
      'savedAt': savedAt.toIso8601String(),
      'version': version,
    };
  }

  factory DraftData.fromJson(Map<String, dynamic> json) {
    try {
      final songModel = SongModel.fromJson(json['songData'] as Map<String, dynamic>);
      final song = songModel.toEntity();
      return DraftData(
        songData: song,
        currentStep: json['currentStep'] as int,
        savedAt: DateTime.parse(json['savedAt'] as String),
        version: json['version'] as String? ?? '1.0',
      );
    } catch (e) {
      throw FormatException('Failed to parse draft data: $e');
    }
  }
}

/// Service for managing contribution drafts
class ContributionDraftService {
  static const String _draftKey = 'contribution_draft';
  static const String _draftVersion = '1.0';

  /// Save draft to local storage
  Future<void> saveDraft(Song song, int currentStep) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final draftData = DraftData(
        songData: song,
        currentStep: currentStep,
        savedAt: DateTime.now(),
        version: _draftVersion,
      );

      final jsonString = jsonEncode(draftData.toJson());
      await prefs.setString(_draftKey, jsonString);
      
      debugPrint('Draft saved successfully at step $currentStep');
    } catch (e) {
      debugPrint('Error saving draft: $e');
      // Don't throw - draft saving should not break the app
    }
  }

  /// Load draft from local storage
  Future<DraftData?> loadDraft() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = prefs.getString(_draftKey);
      
      if (jsonString == null) {
        return null;
      }

      final json = jsonDecode(jsonString) as Map<String, dynamic>;
      final draftData = DraftData.fromJson(json);

      // Validate version compatibility
      if (draftData.version != _draftVersion) {
        debugPrint('Draft version mismatch. Clearing old draft.');
        await clearDraft();
        return null;
      }

      return draftData;
    } catch (e) {
      debugPrint('Error loading draft: $e');
      // If draft is corrupted, clear it
      await clearDraft();
      return null;
    }
  }

  /// Check if a draft exists
  Future<bool> hasDraft() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.containsKey(_draftKey);
    } catch (e) {
      debugPrint('Error checking draft: $e');
      return false;
    }
  }

  /// Clear draft from local storage
  Future<void> clearDraft() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_draftKey);
      debugPrint('Draft cleared successfully');
    } catch (e) {
      debugPrint('Error clearing draft: $e');
    }
  }

  /// Get draft age (how long ago it was saved)
  Future<Duration?> getDraftAge() async {
    try {
      final draft = await loadDraft();
      if (draft == null) return null;
      return DateTime.now().difference(draft.savedAt);
    } catch (e) {
      debugPrint('Error getting draft age: $e');
      return null;
    }
  }
}
