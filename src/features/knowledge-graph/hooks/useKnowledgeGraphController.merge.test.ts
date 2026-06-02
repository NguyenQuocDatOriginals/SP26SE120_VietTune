import { describe, expect, it } from 'vitest';

import { mergeSubgraph } from './useKnowledgeGraphController';
import type { KnowledgeGraphData } from '@/types/graph';

describe('mergeSubgraph with Neo4j-shaped chunks', () => {
  it('merges PG and Neo4j nodes without duplicate ids', () => {
    const pg: KnowledgeGraphData = {
      nodes: [
        {
          id: 'Recording:r1',
          name: 'A',
          type: 'recording',
          entityId: 'r1',
          entityType: 'Recording',
        },
      ],
      links: [],
    };
    const neo4j: KnowledgeGraphData = {
      nodes: [
        {
          id: 'Instrument:i1',
          name: 'Đàn bầu',
          type: 'instrument',
          entityId: 'i1',
          entityType: 'Instrument',
        },
      ],
      links: [{ source: 'Recording:r1', target: 'Instrument:i1', type: 'USES_INSTRUMENT' }],
    };
    const merged = mergeSubgraph(pg, neo4j);
    expect(merged.nodes).toHaveLength(2);
    expect(merged.links).toHaveLength(1);
    expect(merged.links[0]?.type).toBe('USES_INSTRUMENT');
  });
});
