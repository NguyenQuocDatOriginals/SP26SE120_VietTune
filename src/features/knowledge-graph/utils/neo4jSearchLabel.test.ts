import { describe, expect, it } from 'vitest';

import {
  NEO4J_SEARCH_MIN_LENGTH,
  resolveNeo4jExpandLabel,
  resolveNeo4jSearchLabel,
} from '@/features/knowledge-graph/utils/neo4jSearchLabel';

describe('neo4jSearchLabel', () => {
  it('exposes min search length of 2', () => {
    expect(NEO4J_SEARCH_MIN_LENGTH).toBe(2);
  });

  it('prefers explicit type filter for search', () => {
    expect(resolveNeo4jSearchLabel('Instrument', 'ethnicity')).toBe('Instrument');
  });

  it('falls back to tab type for search when filter empty', () => {
    expect(resolveNeo4jSearchLabel('', 'ethnicity')).toBe('EthnicGroup');
    expect(resolveNeo4jSearchLabel('', 'overview')).toBeUndefined();
  });

  it('only applies expand label when user explicitly filters', () => {
    expect(resolveNeo4jExpandLabel('')).toBeUndefined();
    expect(resolveNeo4jExpandLabel('EthnicGroup')).toBe('EthnicGroup');
  });
});
