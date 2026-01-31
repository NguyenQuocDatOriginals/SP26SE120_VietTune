import '../../domain/entities/enums.dart';

/// Output of [SemanticMapper.parse]: structured search params from natural language.
/// Mirrors [SearchState] so Phase 3 can apply directly to [SearchNotifier].
class SemanticSearchParams {
  /// Free text for keyword search (full query or remainder after facet matches).
  final String? query;

  final List<String>? ethnicGroupIds;
  final List<String>? instrumentIds;
  final List<MusicGenre>? genres;
  final List<ContextType>? contextTypes;
  final String? province;

  const SemanticSearchParams({
    this.query,
    this.ethnicGroupIds,
    this.instrumentIds,
    this.genres,
    this.contextTypes,
    this.province,
  });

  /// Whether any facet was matched (excluding free text).
  bool get hasFacets =>
      (ethnicGroupIds?.isNotEmpty ?? false) ||
      (instrumentIds?.isNotEmpty ?? false) ||
      (genres?.isNotEmpty ?? false) ||
      (contextTypes?.isNotEmpty ?? false) ||
      (province != null && province!.isNotEmpty);
}
