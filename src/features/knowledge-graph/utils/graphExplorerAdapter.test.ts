import { describe, expect, it } from 'vitest';

import {
  graphExplorerToViewerData,
  neo4jGroupToViewerType,
  parseGraphExplorerExpandResponse,
  parseGraphExplorerSearchResponse,
} from './graphExplorerAdapter';

describe('graphExplorerAdapter', () => {
  it('maps neo4j group to viewer type', () => {
    expect(neo4jGroupToViewerType('EthnicGroup')).toBe('ethnic_group');
    expect(neo4jGroupToViewerType('Recording')).toBe('recording');
    expect(neo4jGroupToViewerType('UnknownLabel')).toBe('recording');
  });

  it('parses search array with PascalCase keys', () => {
    const rows = parseGraphExplorerSearchResponse([
      { Id: 'a1', Label: 'Quan họ', Group: 'Recording' },
    ]);
    expect(rows).toEqual([{ id: 'a1', label: 'Quan họ', group: 'Recording' }]);
  });

  it('parses expand response into viewer graph with composite ids', () => {
    const dto = parseGraphExplorerExpandResponse({
      nodes: [
        { id: 'r1', label: 'Bản thu A', group: 'Recording' },
        { id: 'i1', label: 'Đàn bầu', group: 'Instrument' },
      ],
      links: [{ source: 'r1', target: 'i1', type: 'USES_INSTRUMENT' }],
    });
    const graph = graphExplorerToViewerData(dto);
    expect(graph.nodes).toHaveLength(2);
    expect(graph.links).toHaveLength(1);
    expect(graph.links[0]?.type).toBe('USES_INSTRUMENT');
    expect(graph.links[0]?.source).toBe('Recording:r1');
    expect(graph.links[0]?.target).toBe('Instrument:i1');
  });
});
