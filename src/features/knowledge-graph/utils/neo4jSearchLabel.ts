import {
  apiTypesQueryForTab,
  type ResearcherGraphTabView,
} from '@/features/knowledge-graph/utils/researcherGraphUx';

/** Minimum keyword length for Neo4j graph-explorer search (matches BE + FE guard). */
export const NEO4J_SEARCH_MIN_LENGTH = 2;

/**
 * Label sent to `/api/graph-explorer/search`.
 * Explicit type dropdown wins; otherwise tab context (e.g. ethnicity → EthnicGroup).
 */
export function resolveNeo4jSearchLabel(
  typeFilter: string,
  graphView: ResearcherGraphTabView,
): string | undefined {
  const explicit = typeFilter.trim();
  if (explicit) return explicit;
  return apiTypesQueryForTab(graphView);
}

/**
 * Label for `/api/graph-explorer/expand` — only when user explicitly picks a type filter.
 * Tab-derived labels are omitted so expand returns full neighborhoods.
 */
export function resolveNeo4jExpandLabel(typeFilter: string): string | undefined {
  const explicit = typeFilter.trim();
  return explicit || undefined;
}
