import '../../domain/entities/enums.dart';

/// Kind of facet for autocomplete (Phase 4).
enum FacetSuggestionKind {
  contextType,
  musicGenre,
  province,
  ethnicGroup,
  instrument,
}

/// One autocomplete suggestion: display label + facet kind + value to apply.
/// UI uses [kind] and [value] to call the right SearchNotifier.update* (merge one facet).
class FacetSuggestion {
  final String displayLabel;
  final FacetSuggestionKind kind;
  final dynamic value;

  const FacetSuggestion({
    required this.displayLabel,
    required this.kind,
    required this.value,
  });
}
