import '../data/facet_suggestion.dart';
import '../data/semantic_search_mapping.dart';
import '../data/semantic_search_params.dart';
import '../utils/vietnamese_string_utils.dart';
import '../../domain/entities/enums.dart';

/// Phase 2: Intent parsing — maps natural language query to facets + free text.
/// Uses longest-match-first on normalized (lowercase + no diacritics) strings.
class SemanticMapper {
  /// Parses [query] into structured params: facets (contextTypes, genres, province, etc.)
  /// and optional free text for keyword search.
  /// Synonym matching: normalizeVietnamese() for query and synonyms; synonyms sorted
  /// by length descending so e.g. "đám cưới" matches before "đám".
  SemanticSearchParams parse(String query) {
    final trimmed = query.trim();
    if (trimmed.isEmpty) {
      return const SemanticSearchParams();
    }

    final normalizedQuery = normalizeVietnamese(trimmed).toLowerCase();

    final contextTypes = _matchContextTypes(normalizedQuery);
    final genres = _matchMusicGenres(normalizedQuery);
    final province = _matchProvince(normalizedQuery);
    final ethnicGroupIds = _matchEthnicGroups(normalizedQuery);
    final instrumentIds = _matchInstruments(normalizedQuery);

    return SemanticSearchParams(
      query: trimmed,
      ethnicGroupIds: ethnicGroupIds.isEmpty ? null : ethnicGroupIds,
      instrumentIds: instrumentIds.isEmpty ? null : instrumentIds,
      genres: genres.isEmpty ? null : genres,
      contextTypes: contextTypes.isEmpty ? null : contextTypes,
      province: province,
    );
  }

  /// Longest-match-first: sort synonyms by length descending, then first match wins per key.
  List<ContextType> _matchContextTypes(String normalizedQuery) {
    final result = <ContextType>[];
    for (final entry in contextTypeSynonyms.entries) {
      final sorted = List<String>.from(entry.value)
        ..sort((a, b) => b.length.compareTo(a.length));
      for (final syn in sorted) {
        final norm = normalizeVietnamese(syn).toLowerCase();
        if (norm.isNotEmpty && normalizedQuery.contains(norm)) {
          result.add(entry.key);
          break;
        }
      }
    }
    return result;
  }

  List<MusicGenre> _matchMusicGenres(String normalizedQuery) {
    final result = <MusicGenre>[];
    for (final entry in musicGenreSynonyms.entries) {
      final sorted = List<String>.from(entry.value)
        ..sort((a, b) => b.length.compareTo(a.length));
      for (final syn in sorted) {
        final norm = normalizeVietnamese(syn).toLowerCase();
        if (norm.isNotEmpty && normalizedQuery.contains(norm)) {
          result.add(entry.key);
          break;
        }
      }
    }
    return result;
  }

  String? _matchProvince(String normalizedQuery) {
    final provinceMap = provinceNameToSynonyms;
    final entriesByLongest = provinceMap.entries.toList();
    for (final entry in entriesByLongest) {
      final sorted = List<String>.from(entry.value)
        ..sort((a, b) => b.length.compareTo(a.length));
      for (final syn in sorted) {
        final norm = normalizeVietnamese(syn).toLowerCase();
        if (norm.isNotEmpty && normalizedQuery.contains(norm)) {
          return entry.key;
        }
      }
    }
    return null;
  }

  List<String> _matchEthnicGroups(String normalizedQuery) {
    if (ethnicGroupSynonyms.isEmpty) {
      return [];
    }
    final result = <String>[];
    for (final entry in ethnicGroupSynonyms.entries) {
      final sorted = List<String>.from(entry.value)
        ..sort((a, b) => b.length.compareTo(a.length));
      for (final syn in sorted) {
        final norm = normalizeVietnamese(syn).toLowerCase();
        if (norm.isNotEmpty && normalizedQuery.contains(norm)) {
          result.add(entry.key);
          break;
        }
      }
    }
    return result;
  }

  List<String> _matchInstruments(String normalizedQuery) {
    if (instrumentSynonyms.isEmpty) {
      return [];
    }
    final result = <String>[];
    for (final entry in instrumentSynonyms.entries) {
      final sorted = List<String>.from(entry.value)
        ..sort((a, b) => b.length.compareTo(a.length));
      for (final syn in sorted) {
        final norm = normalizeVietnamese(syn).toLowerCase();
        if (norm.isNotEmpty && normalizedQuery.contains(norm)) {
          result.add(entry.key);
          break;
        }
      }
    }
    return result;
  }

  /// Phase 4: Prefix match on synonyms → suggestions (label + facet type).
  /// [prefix] is normalized (lowercase + no diacritics) for matching.
  /// Returns at most one suggestion per facet key (first matching synonym).
  List<FacetSuggestion> getSuggestions(String prefix) {
    final trimmed = prefix.trim();
    if (trimmed.isEmpty) {
      return [];
    }
    final normalizedPrefix = normalizeVietnamese(trimmed).toLowerCase();
    final result = <FacetSuggestion>[];

    for (final entry in contextTypeSynonyms.entries) {
      for (final syn in entry.value) {
        final norm = normalizeVietnamese(syn).toLowerCase();
        if (norm.startsWith(normalizedPrefix) || normalizedPrefix.startsWith(norm)) {
          result.add(FacetSuggestion(
            displayLabel: 'Bối cảnh: ${_contextTypeLabel(entry.key)}',
            kind: FacetSuggestionKind.contextType,
            value: entry.key,
          ));
          break;
        }
      }
    }
    for (final entry in musicGenreSynonyms.entries) {
      for (final syn in entry.value) {
        final norm = normalizeVietnamese(syn).toLowerCase();
        if (norm.startsWith(normalizedPrefix) || normalizedPrefix.startsWith(norm)) {
          result.add(FacetSuggestion(
            displayLabel: 'Thể loại: ${_genreLabel(entry.key)}',
            kind: FacetSuggestionKind.musicGenre,
            value: entry.key,
          ));
          break;
        }
      }
    }
    final provinceMap = provinceNameToSynonyms;
    for (final entry in provinceMap.entries) {
      for (final syn in entry.value) {
        final norm = normalizeVietnamese(syn).toLowerCase();
        if (norm.startsWith(normalizedPrefix) || normalizedPrefix.startsWith(norm)) {
          result.add(FacetSuggestion(
            displayLabel: 'Tỉnh: ${entry.key}',
            kind: FacetSuggestionKind.province,
            value: entry.key,
          ));
          break;
        }
      }
    }
    for (final entry in ethnicGroupSynonyms.entries) {
      final displayName = entry.value.isNotEmpty ? entry.value.first : entry.key;
      for (final syn in entry.value) {
        final norm = normalizeVietnamese(syn).toLowerCase();
        if (norm.startsWith(normalizedPrefix) || normalizedPrefix.startsWith(norm)) {
          result.add(FacetSuggestion(
            displayLabel: 'Dân tộc: $displayName',
            kind: FacetSuggestionKind.ethnicGroup,
            value: entry.key,
          ));
          break;
        }
      }
    }
    for (final entry in instrumentSynonyms.entries) {
      final displayName = entry.value.isNotEmpty ? entry.value.first : entry.key;
      for (final syn in entry.value) {
        final norm = normalizeVietnamese(syn).toLowerCase();
        if (norm.startsWith(normalizedPrefix) || normalizedPrefix.startsWith(norm)) {
          result.add(FacetSuggestion(
            displayLabel: 'Nhạc cụ: $displayName',
            kind: FacetSuggestionKind.instrument,
            value: entry.key,
          ));
          break;
        }
      }
    }

    return result.length > 12 ? result.sublist(0, 12) : result;
  }

  /// Gợi ý mặc định khi ô tìm kiếm trống (vd: bấm icon search).
  /// Trả về một gợi ý cho mỗi bối cảnh, thể loại; giới hạn 12.
  List<FacetSuggestion> getDefaultSuggestions() {
    final result = <FacetSuggestion>[];
    for (final entry in contextTypeSynonyms.entries) {
      result.add(FacetSuggestion(
        displayLabel: 'Bối cảnh: ${_contextTypeLabel(entry.key)}',
        kind: FacetSuggestionKind.contextType,
        value: entry.key,
      ));
    }
    for (final entry in musicGenreSynonyms.entries) {
      result.add(FacetSuggestion(
        displayLabel: 'Thể loại: ${_genreLabel(entry.key)}',
        kind: FacetSuggestionKind.musicGenre,
        value: entry.key,
      ));
    }
    return result.length > 12 ? result.sublist(0, 12) : result;
  }

  String _contextTypeLabel(ContextType type) {
    switch (type) {
      case ContextType.wedding:
        return 'Đám cưới';
      case ContextType.funeral:
        return 'Đám tang';
      case ContextType.festival:
        return 'Lễ hội';
      case ContextType.religious:
        return 'Tôn giáo';
      case ContextType.entertainment:
        return 'Giải trí';
      case ContextType.work:
        return 'Lao động';
      case ContextType.lullaby:
        return 'Hát ru';
    }
  }

  String _genreLabel(MusicGenre genre) {
    switch (genre) {
      case MusicGenre.folk:
        return 'Dân ca';
      case MusicGenre.ceremonial:
        return 'Nghi lễ';
      case MusicGenre.courtMusic:
        return 'Nhã nhạc';
      case MusicGenre.operatic:
        return 'Tuồng';
      case MusicGenre.contemporary:
        return 'Đương đại';
    }
  }
}
