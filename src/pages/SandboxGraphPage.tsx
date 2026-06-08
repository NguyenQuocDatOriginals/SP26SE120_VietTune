import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3-force';
import { graphExplorerService } from '@/services/graphExplorerService';
import { graphExplorerNodeToGraphNode } from '@/features/knowledge-graph/utils/graphExplorerAdapter';
import type { GraphNode, GraphLink, KnowledgeGraphData } from '@/types/graph';
import type { GraphExplorerNodeDto, GraphExplorerNodeDetailDto, GraphExplorerPathResponseDto, GraphExplorerNeighborSummaryDto, ConnectedNodeRankDto } from '@/types/graphExplorerApi';

interface D3Node extends GraphNode {
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}
interface D3Link extends Omit<GraphLink, 'source' | 'target'> {
  source: string | D3Node;
  target: string | D3Node;
}

const RELATION_LABELS: Record<string, string> = {
  BELONGS_TO_ETHNIC_GROUP: 'Thuộc về dân tộc',
  ETHNIC_GROUP_HAS_INSTRUMENT: 'Nhạc cụ đặc trưng',
  HAS_INSTRUMENT: 'Nhạc cụ liên quan',
  USES_INSTRUMENT: 'Sử dụng nhạc cụ',
  USED_IN_RECORDING: 'Sử dụng trong bản ghi',
  HAS_CEREMONY: 'Nghi lễ đặc trưng',
  PERFORMED_BY_ETHNIC_GROUP: 'Thực hiện bởi dân tộc',
  FEATURED_IN_RECORDING: 'Có trong bản ghi',
  PERFORMED_IN_CEREMONY: 'Biểu diễn trong nghi lễ',
  HAS_RECORDING: 'Bản ghi âm nhạc',
  HAS_VOCAL_STYLE: 'Lối hát đặc trưng',
  HAS_SCALE: 'Điệu/Hệ âm',
  HAS_TAG: 'Từ khóa liên quan',
  TAGGED_RECORDING: 'Bản ghi liên quan',
  ASSOCIATED_WITH: 'Liên kết với',
  BELONGS_TO_CULTURE: 'Thuộc văn hóa',
  ORIGINATES_FROM: 'Xuất xứ từ',
  USED_BY_ETHNIC_GROUP: 'Sử dụng bởi dân tộc',
};

export function getRelationshipLabel(
  relationType: string,
  direction: 'IN' | 'OUT',
  sourceGroup: string,
  targetGroup: string
): string {
  const isOut = direction === 'OUT';

  switch (relationType) {
    case 'PERFORMED_DURING':
      return isOut ? 'Trình diễn trong nghi lễ' : 'Bao gồm bản ghi âm';
      
    case 'USES_INSTRUMENT':
      return isOut ? 'Sử dụng nhạc cụ' : 'Được sử dụng trong bản ghi';
      
    case 'BELONGS_TO_CULTURE':
      return isOut ? 'Thuộc về dân tộc' : 'Sở hữu bản ghi âm';
      
    case 'HAS_VOCAL_STYLE':
      return isOut ? 'Thể hiện lối hát' : 'Được thể hiện trong bản ghi';
      
    case 'USES_SCALE':
      return isOut ? 'Sử dụng thang âm' : 'Được sử dụng trong bản ghi';
      
    case 'RECORDED_AT':
      return isOut ? 'Được thu âm tại' : 'Nơi thu âm của';
      
    case 'HAS_TAG':
      return isOut ? 'Gắn thẻ' : 'Được gắn cho bản ghi âm';

    case 'ORIGINATES_FROM':
      return isOut ? 'Có nguồn gốc từ dân tộc' : 'Là nguồn gốc của nhạc cụ';
      
    case 'USED_BY_ETHNIC_GROUP':
      return isOut ? 'Được sử dụng bởi dân tộc' : 'Sử dụng nhạc cụ';
      
    case 'HAS_CEREMONY':
      return isOut ? 'Có nghi lễ truyền thống' : 'Thuộc về dân tộc';
      
    case 'ASSOCIATED_WITH':
      return isOut ? 'Gắn liền với dân tộc' : 'Đặc trưng bởi lối hát';
      
    case 'PART_OF': {
      const cleanSource = sourceGroup.replace('Location:', '');
      const cleanTarget = targetGroup.replace('Location:', '');

      if (isOut) {
        if (cleanSource === 'Commune' || cleanTarget === 'District') return 'Trực thuộc Huyện';
        if (cleanSource === 'District' || cleanTarget === 'Province') return 'Trực thuộc Tỉnh';
        return 'Trực thuộc';
      } else {
        if (cleanSource === 'Province' || cleanTarget === 'District') return 'Bao gồm Huyện';
        if (cleanSource === 'District' || cleanTarget === 'Commune') return 'Bao gồm Xã';
        return 'Bao gồm';
      }
    }

    default:
      return RELATION_LABELS[relationType] || relationType;
  }
}

const getLinkLabel = (link: D3Link, nodes: D3Node[]) => {
  const source = typeof link.source === 'object' ? link.source as D3Node : nodes.find(n => n.id === link.source);
  const target = typeof link.target === 'object' ? link.target as D3Node : nodes.find(n => n.id === link.target);
  
  if (!source || !target || !link.type) return link.type || '';
  
  const sourceGroup = source.apiEntityType || source.entityType || '';
  const targetGroup = target.apiEntityType || target.entityType || '';
  
  return getRelationshipLabel(link.type, 'OUT', sourceGroup, targetGroup);
};

const NODE_GROUP_LABELS: Record<string, string> = {
  Recording: 'Bản ghi',
  Instrument: 'Nhạc cụ',
  EthnicGroup: 'Dân tộc',
  Ceremony: 'Nghi lễ',
  Province: 'Tỉnh/Thành',
  VocalStyle: 'Lối hát',
  MusicalScale: 'Hệ âm',
  Tag: 'Từ khóa',
  Location: 'Địa điểm',
  District: 'Quận/Huyện',
  Commune: 'Phường/Xã',
  KBEntry: 'Mục từ điển',
};

const getGroupLabel = (group: string) => NODE_GROUP_LABELS[group] || group;

export default function SandboxGraphPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // States theo FE_KG.md
  const [graphData, setGraphData] = useState<{ nodes: D3Node[]; links: D3Link[] }>({ nodes: [], links: [] });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<GraphExplorerNodeDto[]>([]);
  const [selection, setSelection] = useState<D3Node | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [nodeDetail, setNodeDetail] = useState<GraphExplorerNodeDetailDto | null>(null);
  // Kiểu mở rộng: lưu thêm fromId/toId để biết cặp nào không tìm được đường
  type PairPathResult = GraphExplorerPathResponseDto & { fromId: string; toId: string };
  // Lưu tất cả các đường ngắn nhất giữa các cặp node được chọn (max 4 node → max 6 cặp)
  const [multiPaths, setMultiPaths] = useState<PairPathResult[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [expandedRelGroups, setExpandedRelGroups] = useState<Set<string>>(new Set());
  const [activeDetailNodeId, setActiveDetailNodeId] = useState<string | null>(null);
  // State chế độ tìm đường ngắn nhất — khi bật, click vào node sẽ thêm vào multi-selection
  const [isPathFindingMode, setIsPathFindingMode] = useState(false);
  // State hiển thị hướng dẫn sử dụng
  const [showHelp, setShowHelp] = useState(false);

  // State xếp hạng node nổi bật (Top 10)
  const [topConnectedNodes, setTopConnectedNodes] = useState<ConnectedNodeRankDto[]>([]);
  const [topConnectedGroup, setTopConnectedGroup] = useState<string>('');
  const [isTopConnectedLoading, setIsTopConnectedLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchTopConnected() {
      setIsTopConnectedLoading(true);
      try {
        const res = await graphExplorerService.getTopConnected(
          topConnectedGroup || undefined,
          10
        );
        if (active) {
          setTopConnectedNodes(res.rankList || []);
        }
      } catch (err) {
        console.error('Failed to fetch top connected nodes:', err);
      } finally {
        if (active) {
          setIsTopConnectedLoading(false);
        }
      }
    }
    fetchTopConnected();
    return () => {
      active = false;
    };
  }, [topConnectedGroup]);

  // State cho Popup mở rộng
  const [expandPopupData, setExpandPopupData] = useState<{ node: D3Node; detail: GraphExplorerNodeDetailDto; selectedRels: Set<string> } | null>(null);

  const simulationRef = useRef<d3.Simulation<D3Node, undefined> | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragPositionsRef = useRef<Record<string, { x: number; y: number }>>({});

  // Helper hàm hợp nhất đồ thị (Merge Subgraph)
  const mergeSubgraph = useCallback((current: { nodes: D3Node[]; links: D3Link[] }, incoming: KnowledgeGraphData) => {
    const newNodes = [...current.nodes];
    incoming.nodes.forEach(n => {
      if (!newNodes.find(existing => existing.id === n.id)) {
        // Cho node mới rơi ở giữa màn hình
        newNodes.push({ ...n, x: 0, y: 0 } as D3Node);
      }
    });

    const newLinks = [...current.links];
    incoming.links.forEach(l => {
      const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      
      const exists = newLinks.find(existing => {
        const eSource = typeof existing.source === 'object' ? (existing.source as any).id : existing.source;
        const eTarget = typeof existing.target === 'object' ? (existing.target as any).id : existing.target;
        return eSource === sourceId && eTarget === targetId && existing.type === l.type;
      });
      
      if (!exists) {
        newLinks.push({ ...l, source: sourceId, target: targetId } as D3Link);
      }
    });
    return { nodes: newNodes, links: newLinks };
  }, []);

  // Tìm kiếm ban đầu
  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    const res = await graphExplorerService.searchEntities(searchKeyword);
    setSearchResults(res);
  };

  // Click vào 1 kết quả search -> Seed (Thêm node này vào sơ đồ hiện tại, không xóa các node cũ)
  const handleSearchResultClick = async (hit: GraphExplorerNodeDto) => {
    // Chuyển đổi hit (raw GUID) sang định dạng GraphNode (viewerNodeId)
    const mappedNode = graphExplorerNodeToGraphNode(hit);
    
    const refX = containerRef.current ? containerRef.current.offsetWidth / 2 : 100;
    const refY = containerRef.current ? containerRef.current.offsetHeight / 2 : 100;
    
    const existingNode = graphData.nodes.find(gn => gn.id === mappedNode.id || gn.backendId === mappedNode.backendId);
    const nodeToSelect = existingNode || ({
      ...mappedNode,
      x: refX + (Math.random() * 40 - 20),
      y: refY + (Math.random() * 40 - 20)
    } as D3Node);
    
    if (!existingNode) {
      setGraphData(prev => ({
        nodes: [...prev.nodes, nodeToSelect],
        links: prev.links
      }));
    }

    // Reset đường đi ngắn nhất
    setMultiPaths([]);
    
    // Chọn node này
    setSelectedNodeIds(new Set([nodeToSelect.id]));
    setSelection(nodeToSelect);
    
    // Lấy chi tiết
    const detail = await graphExplorerService.getNodeDetail(mappedNode.backendId || mappedNode.id);
    setNodeDetail(detail);
  };


  const handleExpandRelation = async (node: D3Node, relType: string) => {
    // API có hỗ trợ truyền thêm relType để chỉ bung nhánh đó
    const expanded = await graphExplorerService.expandNode(node.backendId || node.id, { relType });
    setGraphData(prev => mergeSubgraph(prev, expanded));
    setExpandedNodes(prev => new Set(prev).add(node.id));
  };

  const handleCollapseRelation = (node: D3Node, relType: string) => {
    setGraphData(prev => {
      // 1. Tìm các link nối trực tiếp với node này qua relType
      const connectedLinks = prev.links.filter(l => {
        if (l.type !== relType) return false;
        const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return sId === node.id || tId === node.id;
      });

      // 2. Tìm danh sách các neighbor
      const neighborIds = new Set(connectedLinks.map(l => {
        const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return sId === node.id ? tId : sId;
      }));

      // 3. Giữ lại các link KHÔNG nối qua quan hệ này
      const newLinks = prev.links.filter(l => !connectedLinks.includes(l));

      // 4. Lấy danh sách ID của các node vẫn còn link
      const nodesWithLinks = new Set<string>();
      newLinks.forEach(l => {
        nodesWithLinks.add(typeof l.source === 'object' ? (l.source as any).id : l.source as string);
        nodesWithLinks.add(typeof l.target === 'object' ? (l.target as any).id : l.target as string);
      });

      // 5. Xoá neighbor NẾU nó không còn nối với bất kỳ node nào khác
      const newNodes = prev.nodes.filter(n => {
        if (neighborIds.has(n.id) && !nodesWithLinks.has(n.id)) {
          return false;
        }
        return true;
      });

      return { nodes: newNodes, links: newLinks };
    });
  };

  const handleCollapseSingleNeighbor = (parent: D3Node, neighborId: string) => {
    setGraphData(prev => {
      // 1. Tìm các link nối trực tiếp giữa parent và neighborId
      const connectedLinks = prev.links.filter(l => {
        const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return (sId === parent.id && tId === neighborId) || (sId === neighborId && tId === parent.id);
      });

      // 2. Giữ lại các link khác
      const newLinks = prev.links.filter(l => !connectedLinks.includes(l));

      // 3. Lấy danh sách ID của các node vẫn còn link
      const nodesWithLinks = new Set<string>();
      newLinks.forEach(l => {
        nodesWithLinks.add(typeof l.source === 'object' ? (l.source as any).id : l.source as string);
        nodesWithLinks.add(typeof l.target === 'object' ? (l.target as any).id : l.target as string);
      });

      // 4. Xóa neighborId nếu nó không còn nối với bất kỳ node nào khác
      const newNodes = prev.nodes.filter(n => {
        if (n.id === neighborId && !nodesWithLinks.has(n.id)) {
          return false;
        }
        return true;
      });

      return { nodes: newNodes, links: newLinks };
    });
  };

  const handleCollapseNode = (node: D3Node) => {
    setGraphData(prev => {
      // 1. Tìm các link nối trực tiếp với node này
      const connectedLinks = prev.links.filter(l => {
        const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return sId === node.id || tId === node.id;
      });

      // 2. Tìm danh sách các neighbor (láng giềng)
      const neighborIds = new Set(connectedLinks.map(l => {
        const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return sId === node.id ? tId : sId;
      }));

      // 3. Giữ lại các link KHÔNG nối với node đang collapse
      const newLinks = prev.links.filter(l => !connectedLinks.includes(l));

      // 4. Lấy danh sách ID của các node vẫn còn link
      const nodesWithLinks = new Set<string>();
      newLinks.forEach(l => {
        nodesWithLinks.add(typeof l.source === 'object' ? (l.source as any).id : l.source as string);
        nodesWithLinks.add(typeof l.target === 'object' ? (l.target as any).id : l.target as string);
      });

      // 5. Lọc node: Xoá neighbor NẾU nó không còn nối với bất kỳ node nào khác
      const newNodes = prev.nodes.filter(n => {
        if (neighborIds.has(n.id) && !nodesWithLinks.has(n.id)) {
          // Bỏ qua (xoá) nếu nó là neighbor và bị cô lập
          return false; 
        }
        return true;
      });

      return { nodes: newNodes, links: newLinks };
    });

    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.delete(node.id);
      return next;
    });
  };

  // Double Click: mở popup mở rộng node (không liên quan đến path finding)
  const handleNodeDoubleClick = async (node: D3Node) => {
    // 1. Phải lấy detail của node để biết nó có những quan hệ gì
    const detail = await graphExplorerService.getNodeDetail(node.backendId || node.id);
    if (!detail || !detail.neighbors || detail.neighbors.length === 0) {
      alert("Node này không có kết nối nào khác để mở rộng!");
      return;
    }

    // 2. Gom nhóm các loại quan hệ
    const relTypes = new Set(detail.neighbors.map(n => n.relationType));
    
    // 3. Mở popup (mặc định chọn sẵn tất cả)
    setExpandPopupData({
      node,
      detail,
      selectedRels: new Set(relTypes)
    });
  };

  const submitMultiExpand = async () => {
    if (!expandPopupData) return;
    const { node, selectedRels } = expandPopupData;
    
    // Đóng popup
    setExpandPopupData(null);

    // Gọi API expand cho TỪNG quan hệ được check (chạy song song)
    const promises = Array.from(selectedRels).map(relType => 
      graphExplorerService.expandNode(node.backendId || node.id, { relType })
    );
    
    const results = await Promise.all(promises);
    
    // Merge tất cả các kết quả vào canvas
    setGraphData(prev => {
      let merged = prev;
      for (const res of results) {
        merged = mergeSubgraph(merged, res);
      }
      return merged;
    });

    setExpandedNodes(prev => new Set(prev).add(node.id));
  };

  const handleRemoveNode = (nodeId: string) => {
    setGraphData(prev => {
      // 1. Loại bỏ node đích
      const newNodes = prev.nodes.filter(n => n.id !== nodeId);
      
      // 2. Loại bỏ các link nối với node này
      const newLinks = prev.links.filter(l => {
        const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return sId !== nodeId && tId !== nodeId;
      });

      // 3. Quét tìm các node còn lại đang có link
      const nodesWithLinks = new Set<string>();
      newLinks.forEach(l => {
        nodesWithLinks.add(typeof l.source === 'object' ? (l.source as any).id : l.source as string);
        nodesWithLinks.add(typeof l.target === 'object' ? (l.target as any).id : l.target as string);
      });

      // 4. Xóa luôn các node bị cô lập (degree = 0) do mất link
      const cleanedNodes = newNodes.filter(n => nodesWithLinks.has(n.id));

      return { nodes: cleanedNodes, links: newLinks };
    });

    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.delete(nodeId);
      return next;
    });

    // Nếu đang chọn node này thì clear luôn panel
    if (selection?.id === nodeId) {
      setSelection(null);
      setNodeDetail(null);
      setMultiPaths([]);
    }
  };



  // Click vào 1 neighbor trong sidebar -> Thêm/chọn node đó
  const handleNeighborItemClick = async (i: GraphExplorerNeighborSummaryDto) => {
    const mappedNode = graphExplorerNodeToGraphNode({
      id: i.id,
      label: i.label,
      group: i.group
    });

    const isOut = i.direction === 'OUT';

    setGraphData(prev => {
      const existsNode = prev.nodes.find(gn => gn.id === mappedNode.id || gn.backendId === mappedNode.id);
      let nextNodes = [...prev.nodes];
      let addedNode: D3Node;

      if (!existsNode) {
        const refX = selection?.x ?? 0;
        const refY = selection?.y ?? 0;
        addedNode = {
          ...mappedNode,
          x: refX + (Math.random() * 60 - 30),
          y: refY + (Math.random() * 60 - 30)
        } as D3Node;
        nextNodes.push(addedNode);
      } else {
        addedNode = existsNode;
      }

      if (selection) {
        const sourceId = isOut ? selection.id : addedNode.id;
        const targetId = isOut ? addedNode.id : selection.id;

        const existsLink = prev.links.find(l => {
          const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
          const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
          return sId === sourceId && tId === targetId && l.type === i.relationType;
        });

        if (!existsLink) {
          const newLink: D3Link = {
            source: sourceId,
            target: targetId,
            type: i.relationType,
            value: 1
          };
          return {
            nodes: nextNodes,
            links: [...prev.links, newLink]
          };
        }
      }

      return {
        nodes: nextNodes,
        links: prev.links
      };
    });

    const existingNode = graphData.nodes.find(gn => gn.id === mappedNode.id || gn.backendId === mappedNode.id);
    const nodeToSelect = existingNode || ({
      ...mappedNode,
      x: (selection?.x ?? 0) + 10,
      y: (selection?.y ?? 0) + 10
    } as D3Node);

    setSelectedNodeIds(new Set([nodeToSelect.id]));
    setActiveDetailNodeId(nodeToSelect.id);
    setSelection(nodeToSelect);
    setMultiPaths([]);
    const detail = await graphExplorerService.getNodeDetail(mappedNode.backendId || mappedNode.id);
    setNodeDetail(detail);
  };

  // D3 Physics Engine
  useEffect(() => {
    if (!containerRef.current || graphData.nodes.length === 0) return;
    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const simulation = d3.forceSimulation<D3Node>(graphData.nodes)
      .force('link', d3.forceLink<D3Node, d3.SimulationLinkDatum<D3Node>>(graphData.links as any).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', () => {
        setGraphData({ nodes: [...simulation.nodes()], links: [...graphData.links] });
      });

    simulationRef.current = simulation;
    return () => {
      simulation.stop();
    };
  }, [graphData.nodes.length, graphData.links.length]); // Khởi động lại khi số lượng đổi

  // Drag & Click logic
  const handlePointerDown = (e: React.PointerEvent, node: D3Node) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggedNode(node.id);
    
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    
    const positions: Record<string, { x: number; y: number }> = {};
    if (selectedNodeIds.has(node.id)) {
      graphData.nodes.forEach(n => {
        if (selectedNodeIds.has(n.id)) {
          positions[n.id] = { x: n.fx ?? n.x ?? 0, y: n.fy ?? n.y ?? 0 };
        }
      });
    } else {
      positions[node.id] = { x: node.fx ?? node.x ?? 0, y: node.fy ?? node.y ?? 0 };
    }
    dragPositionsRef.current = positions;

    if (simulationRef.current) simulationRef.current.alphaTarget(0.3).restart();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedNode || !containerRef.current || !simulationRef.current) return;
    
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    Object.entries(dragPositionsRef.current).forEach(([id, initialPos]) => {
      const targetNode = simulationRef.current?.nodes().find(n => n.id === id);
      if (targetNode) {
        targetNode.fx = initialPos.x + dx;
        targetNode.fy = initialPos.y + dy;
      }
    });
  };

  const handlePointerUp = async (e: React.PointerEvent) => {
    if (!draggedNode || !simulationRef.current) return;
    (e.target as Element).releasePointerCapture(e.pointerId);
    
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const dist = Math.hypot(dx, dy);
    
    const node = graphData.nodes.find(n => n.id === draggedNode);
    
    // Lưu tạm các trạng thái kéo hiện tại để dọn dẹp ĐỒNG BỘ ngay lập tức
    const currentDragPositions = { ...dragPositionsRef.current };
    
    // Reset ngay lập tức để tránh dính chuột khi gọi API bất đồng bộ dưới đây
    setDraggedNode(null);
    dragPositionsRef.current = {};
    simulationRef.current.alphaTarget(0);
    
    if (dist < 5 && node) {
      if (isPathFindingMode) {
        // Chế độ tìm đường: click thêm/bỏ node khỏi multi-selection
        const MAX_SELECTED = 4;
        const nextIds = new Set(selectedNodeIds);
        if (nextIds.has(node.id)) {
          nextIds.delete(node.id);
        } else {
          if (nextIds.size >= MAX_SELECTED) {
            const firstId = Array.from(nextIds)[0];
            nextIds.delete(firstId);
          }
          nextIds.add(node.id);
        }
        setSelectedNodeIds(nextIds);
        setActiveDetailNodeId(null);

        if (nextIds.size >= 2) {
          const arr = Array.from(nextIds);
          const pairs: [string, string][] = [];
          for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
              pairs.push([arr[i], arr[j]]);
            }
          }
          Promise.all(
            pairs.map(([aId, bId]) => {
              const nodeA = graphData.nodes.find(n => n.id === aId);
              const nodeB = graphData.nodes.find(n => n.id === bId);
              if (!nodeA || !nodeB) return Promise.resolve(null);
              return graphExplorerService.getShortestPath(
                nodeA.backendId || nodeA.id,
                nodeB.backendId || nodeB.id
              ).then(res => ({ ...res, fromId: aId, toId: bId } as PairPathResult))
               .catch(() => null);
            })
          ).then(results => {
            const validPaths = results.filter((r): r is PairPathResult => r !== null);
            setMultiPaths(validPaths);
            setGraphData(prev => {
              const merged = { ...prev, nodes: [...prev.nodes], links: [...prev.links] };
              for (const path of validPaths) {
                if (!path.pathFound) continue;
                for (const pNode of path.nodes) {
                  if (!merged.nodes.find(n => n.id === pNode.id)) {
                    const first = path.nodes[0];
                    const last = path.nodes[path.nodes.length - 1];
                    const refA = merged.nodes.find(n => n.id === first?.id);
                    const refB = merged.nodes.find(n => n.id === last?.id);
                    const midX = ((refA?.x ?? 0) + (refB?.x ?? 0)) / 2;
                    const midY = ((refA?.y ?? 0) + (refB?.y ?? 0)) / 2;
                    const rawGuid = pNode.backendId || pNode.id;
                    merged.nodes.push({
                      id: pNode.id, viewerNodeId: pNode.id,
                      entityId: rawGuid, backendId: rawGuid,
                      name: pNode.label, label: pNode.label,
                      type: 'recording' as const,
                      apiEntityType: pNode.group, entityType: pNode.group,
                      explorable: true, val: 1,
                      x: midX + (Math.random() * 80 - 40),
                      y: midY + (Math.random() * 80 - 40),
                    } as D3Node);
                  }
                }
                for (const pLink of path.links) {
                  const existsLink = merged.links.find(l => {
                    const eS = typeof l.source === 'object' ? (l.source as any).id : l.source;
                    const eT = typeof l.target === 'object' ? (l.target as any).id : l.target;
                    return eS === pLink.source && eT === pLink.target && l.type === pLink.type;
                  });
                  if (!existsLink) merged.links.push({ source: pLink.source, target: pLink.target, type: pLink.type, value: 1 } as D3Link);
                }
              }
              return merged;
            });
          });
        } else {
          setMultiPaths([]);
        }

        // Hiển thị thông tin chi tiết node được click
        setSelection(node);
        const detail = await graphExplorerService.getNodeDetail(node.backendId || node.id);
        setNodeDetail(detail);
      } else {
        // Chế độ bình thường: chọn 1 hoặc nhiều node (nếu giữ Ctrl/Cmd)
        const nextIds = new Set(selectedNodeIds);
        const isMulti = e.ctrlKey || e.metaKey;
        
        if (isMulti) {
          if (nextIds.has(node.id)) {
            nextIds.delete(node.id);
          } else {
            nextIds.add(node.id);
          }
        } else {
          nextIds.clear();
          nextIds.add(node.id);
        }
        setSelectedNodeIds(nextIds);
        setMultiPaths([]);
        
        if (nextIds.size === 1) {
          // Chỉ còn 1 node -> xem chi tiết
          const singleId = Array.from(nextIds)[0];
          const singleNode = graphData.nodes.find(n => n.id === singleId) || node;
          setSelection(singleNode);
          setActiveDetailNodeId(null);
          const detail = await graphExplorerService.getNodeDetail(singleNode.backendId || singleNode.id);
          setNodeDetail(detail);
        } else {
          // Nhiều node hoặc không có node nào -> ẩn chi tiết đơn, chuyển sang list
          setSelection(null);
          setActiveDetailNodeId(null);
          setNodeDetail(null);
        }
      }
    } else {
      // COI LÀ KÉO RÊ DRAG -> Khóa vị trí các node được kéo
      Object.keys(currentDragPositions).forEach(id => {
        const targetNode = simulationRef.current?.nodes().find(n => n.id === id);
        if (targetNode) {
          targetNode.fx = targetNode.x;
          targetNode.fy = targetNode.y;
        }
      });
    }
  };

  // Helpers vẽ vời — kiểm tra link/node có nằm trong BẤT KỲ đường ngắn nhất nào không
  const isLinkInPath = (s: string, t: string) =>
    multiPaths.some(p => p.pathFound && p.links.some(l =>
      (l.source === s && l.target === t) || (l.source === t && l.target === s)
    ));
  const isNodeInPath = (id: string) =>
    multiPaths.some(p => p.pathFound && p.nodes.some(n => n.id === id));
  // True khi có ít nhất 1 đường tìm được
  const hasAnyPath = multiPaths.some(p => p.pathFound);
  // True khi có ít nhất 1 cặp không tìm được đường
  const hasMissingPath = multiPaths.some(p => !p.pathFound);
  // Lấy danh sách các cặp không có đường nối (để vẽ đường đứt đỏ)
  const noPathPairs = multiPaths.filter(p => !p.pathFound);

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 p-4 shrink-0 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-emerald-600">Bản đồ Tri thức Âm nhạc (VietTune)</h1>
        <div className="text-xs text-slate-500 flex items-center gap-2">
          {/* Nút bật/tắt chế độ tìm đường ngắn nhất */}
          <button
            onClick={() => {
              const next = !isPathFindingMode;
              setIsPathFindingMode(next);
              if (!next) {
                // Tắt mode: xóa sạch mọi lựa chọn
                setSelectedNodeIds(new Set());
                setMultiPaths([]);
                setActiveDetailNodeId(null);
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 ${
              isPathFindingMode
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            <span>🔍</span>
            {isPathFindingMode ? 'Thoát tìm đường' : 'Tìm đường ngắn nhất'}
            {isPathFindingMode && selectedNodeIds.size > 0 && (
              <span className="ml-1 bg-white text-blue-600 rounded-full w-4 h-4 inline-flex items-center justify-center text-[10px] font-bold">
                {selectedNodeIds.size}
              </span>
            )}
          </button>
          {hasAnyPath && (
            <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded text-[10px] font-semibold">
              ✔ Đang hiển thị đường đi
            </span>
          )}

          {/* Nút ? hướng dẫn sử dụng tiếng Việt (mở ngoặc tiếng Anh) */}
          <div className="relative">
            <button
              onClick={() => setShowHelp(!showHelp)}
              onMouseEnter={() => setShowHelp(true)}
              onMouseLeave={() => setShowHelp(false)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 border border-slate-200 hover:border-emerald-300 font-bold text-sm flex items-center justify-center transition-all focus:outline-none"
              title="Hướng dẫn sử dụng"
            >
              ?
            </button>
            {showHelp && (
              <div 
                onMouseEnter={() => setShowHelp(true)}
                onMouseLeave={() => setShowHelp(false)}
                className="absolute right-0 top-9 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-fade-in text-slate-700 text-xs flex flex-col gap-2.5"
              >
                <h4 className="font-bold text-emerald-600 border-b border-slate-100 pb-1.5 text-sm">Hướng dẫn tương tác sơ đồ</h4>
                <ul className="flex flex-col gap-2 text-slate-600">
                  <li className="flex gap-2">
                    <span className="text-emerald-500 font-semibold shrink-0">👉</span>
                    <span><strong>Chọn thực thể:</strong> Nhấp chuột (click) vào thực thể để chọn và xem thông tin chi tiết.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500 font-semibold shrink-0">👉</span>
                    <span><strong>Mở rộng kết nối:</strong> Nhấp hai lần (double click) vào thực thể để bung các liên kết liên quan.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500 font-semibold shrink-0">👉</span>
                    <span><strong>Chọn nhiều thực thể:</strong> Giữ phím Ctrl và nhấp chuột (hold Ctrl + click) vào các thực thể trên sơ đồ để chọn đồng thời nhiều thực thể.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500 font-semibold shrink-0">👉</span>
                    <span><strong>Tìm đường ngắn nhất:</strong> Bật chế độ tìm đường ngắn nhất (shortest path finding mode) và nhấp chuột chọn từ 2 đến 4 thực thể trên sơ đồ.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500 font-semibold shrink-0">👉</span>
                    <span><strong>Bỏ chọn tất cả:</strong> Nhấp chuột vào vùng trống trên sơ đồ (click empty canvas space) để huỷ chọn.</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Tìm kiếm & Xếp hạng nổi bật */}
        <div className="w-80 bg-white border-r border-slate-200 shadow-sm overflow-y-auto p-5 shrink-0 flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Tìm kiếm thực thể</h3>
            <div className="relative">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors" 
                placeholder="Dân tộc, nhạc cụ, bản ghi..."
                value={searchKeyword}
                onChange={e => {
                  setSearchKeyword(e.target.value);
                  if (!e.target.value.trim()) setSearchResults([]);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSearch();
                  if (e.key === 'Escape') {
                    setSearchResults([]);
                    setSearchKeyword('');
                  }
                }}
              />
              {searchKeyword && (
                <button
                  onClick={() => {
                    setSearchKeyword('');
                    setSearchResults([]);
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Nếu không có từ khóa: hiển thị Top 10 nổi bật */}
          {!searchKeyword.trim() ? (
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Top 10 nổi bật</h3>
                <select
                  className="text-[11px] border border-slate-300 rounded px-1.5 py-0.5 text-slate-600 focus:outline-none focus:border-emerald-500"
                  value={topConnectedGroup}
                  onChange={e => setTopConnectedGroup(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="Recording">Bản ghi</option>
                  <option value="Instrument">Nhạc cụ</option>
                  <option value="EthnicGroup">Dân tộc</option>
                  <option value="Ceremony">Nghi lễ</option>
                  <option value="Province">Tỉnh/Thành</option>
                  <option value="VocalStyle">Lối hát</option>
                  <option value="MusicalScale">Hệ âm</option>
                  <option value="Tag">Từ khóa</option>
                  <option value="Location">Địa điểm</option>
                </select>
              </div>

              {isTopConnectedLoading ? (
                <div className="flex-grow flex items-center justify-center py-10">
                  <span className="text-xs text-slate-400 animate-pulse">Đang tải xếp hạng...</span>
                </div>
              ) : topConnectedNodes.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">Không có dữ liệu xếp hạng</div>
              ) : (
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[60vh] pr-1">
                  {topConnectedNodes.map((node, index) => {
                    const hit: GraphExplorerNodeDto = {
                      id: node.id,
                      label: node.label,
                      group: node.group,
                    };
                    const mapped = graphExplorerNodeToGraphNode(hit);
                    const isOnGraph = graphData.nodes.some(n => n.id === mapped.id || n.backendId === mapped.backendId);
                    const isSelected = selectedNodeIds.has(mapped.id);

                    let itemBgClass = "border-slate-100 bg-white hover:bg-emerald-50 hover:border-emerald-200";
                    let textClass = "text-slate-800";
                    if (isSelected) {
                      itemBgClass = "bg-rose-50 border-rose-300 hover:bg-rose-100 hover:border-rose-400";
                      textClass = "text-rose-900";
                    } else if (isOnGraph) {
                      itemBgClass = "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300";
                      textClass = "text-emerald-900";
                    }

                    return (
                      <div
                        key={node.id}
                        onClick={() => handleSearchResultClick(hit)}
                        className={`p-2 border rounded-lg cursor-pointer transition flex items-center gap-2 ${itemBgClass}`}
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${textClass}`} title={node.label}>
                            {node.label}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {getGroupLabel(node.group)}
                          </p>
                        </div>
                        {isSelected ? (
                          <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 font-semibold shrink-0">
                            đang chọn
                          </span>
                        ) : isOnGraph ? (
                          <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold shrink-0">
                            trên sơ đồ
                          </span>
                        ) : null}
                        <span className="text-[11px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold shrink-0">
                          {node.degreeCount}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Nếu có từ khóa: hiển thị Kết quả tìm kiếm */
            <div className="flex-grow flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide border-t border-slate-100 pt-3">
                Kết quả tìm kiếm
              </h3>
              {searchResults.length === 0 ? (
                <div className="text-xs text-slate-400 py-10 text-center">
                  {searchKeyword.length < 2 ? 'Nhập tối thiểu 2 ký tự...' : 'Nhấn Enter để tìm kiếm'}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[60vh] pr-1">
                  {searchResults.map(res => {
                    const mapped = graphExplorerNodeToGraphNode(res);
                    const isOnGraph = graphData.nodes.some(n => n.id === mapped.id || n.backendId === mapped.backendId);
                    const isSelected = selectedNodeIds.has(mapped.id);

                    let itemBgClass = "border-slate-100 bg-white hover:bg-emerald-50 hover:border-emerald-200";
                    let textClass = "text-slate-800";
                    if (isSelected) {
                      itemBgClass = "bg-rose-50 border-rose-300 hover:bg-rose-100 hover:border-rose-400";
                      textClass = "text-rose-900";
                    } else if (isOnGraph) {
                      itemBgClass = "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300";
                      textClass = "text-emerald-900";
                    }

                    return (
                      <div
                        key={res.id}
                        onClick={() => handleSearchResultClick(res)}
                        className={`p-2 border rounded-lg cursor-pointer transition flex items-center justify-between gap-2 group ${itemBgClass}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${textClass}`} title={res.label}>
                            {res.label}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {getGroupLabel(res.group)}
                          </p>
                        </div>
                        {isSelected ? (
                          <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 font-semibold shrink-0">
                            đang chọn
                          </span>
                        ) : isOnGraph ? (
                          <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold shrink-0">
                            trên sơ đồ
                          </span>
                        ) : (
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition shrink-0">
                            + sơ đồ
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        {/* Canvas SVG */}
        <div 
          ref={containerRef}
          className="flex-1 bg-slate-50 relative"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <svg
            className="w-full h-full"
            onClick={() => {
              // Click vào canvas trắng → bỏ chọn tất cả
              if (selectedNodeIds.size > 0) {
                setSelectedNodeIds(new Set());
                setSelection(null);
                setNodeDetail(null);
                setMultiPaths([]);
                setActiveDetailNodeId(null);
              }
            }}
          >
            {graphData.links.map((link, i) => {
              const source = link.source as unknown as D3Node;
              const target = link.target as unknown as D3Node;
              if (source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) return null;
              
              const sId = source.id;
              const tId = target.id;
              const isPath = isLinkInPath(sId, tId);

              return (
                <g key={`link-${i}`}>
                  <line 
                    x1={source.x} y1={source.y}
                    x2={target.x} y2={target.y}
                    stroke={isPath ? '#3b82f6' : '#cbd5e1'}
                    strokeWidth={isPath ? 3 : 1.5}
                  />
                  {/* Label trên link (relation type) */}
                  <text 
                    x={(source.x + target.x) / 2} 
                    y={(source.y + target.y) / 2} 
                    textAnchor="middle" 
                    fill={isPath ? '#2563eb' : '#94a3b8'} 
                    className="text-[9px]"
                  >
                    {getLinkLabel(link, graphData.nodes)}
                  </text>
                </g>
              );
            })}

            {/* Vẽ đường đứt đỏ cho các cặp không có đường nối */}
            {noPathPairs.map((pair, i) => {
              const nodeA = graphData.nodes.find(n => n.id === pair.fromId);
              const nodeB = graphData.nodes.find(n => n.id === pair.toId);
              if (!nodeA || !nodeB || nodeA.x === undefined || nodeA.y === undefined || nodeB.x === undefined || nodeB.y === undefined) return null;
              const midX = (nodeA.x + nodeB.x) / 2;
              const midY = (nodeA.y + nodeB.y) / 2;
              return (
                <g key={`no-path-${i}`} style={{ pointerEvents: 'none' }}>
                  {/* Đường đứt đỏ */}
                  <line
                    x1={nodeA.x} y1={nodeA.y}
                    x2={nodeB.x} y2={nodeB.y}
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="8 5"
                    opacity={0.7}
                  />
                  {/* Biểu tượng ⚠ ở giữa */}
                  <circle cx={midX} cy={midY} r={12} fill="#fef2f2" stroke="#ef4444" strokeWidth={1.5} />
                  <text
                    x={midX} y={midY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={11}
                    fill="#ef4444"
                    fontWeight="bold"
                    style={{ userSelect: 'none' }}
                  >
                    ✕
                  </text>
                  {/* Tooltip nhỏ */}
                  <text
                    x={midX} y={midY + 22}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#ef4444"
                    fontWeight="600"
                    style={{ userSelect: 'none' }}
                  >
                    Không có đường nối
                  </text>
                </g>
              );
            })}
            
            {graphData.nodes.map(node => {
              if (node.x === undefined || node.y === undefined) return null;
              const isSelected = selectedNodeIds.has(node.id);
              const inPath = isNodeInPath(node.id);
              
              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x}, ${node.y})`}
                  className={draggedNode === node.id ? 'cursor-grabbing' : 'cursor-grab'}
                  onPointerDown={(e) => handlePointerDown(e, node)}
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={() => handleNodeDoubleClick(node)}
                >
                  <circle 
                    r={isSelected || inPath ? 24 : 18} 
                    fill={isSelected ? '#ef4444' : inPath ? '#3b82f6' : '#10b981'} 
                    stroke={isSelected || inPath ? '#fff' : '#e2e8f0'} 
                    strokeWidth={3}
                  />
                  <text 
                    y={32} 
                    textAnchor="middle" 
                    className={`text-xs font-semibold ${isSelected ? 'fill-red-600 font-bold' : 'fill-slate-700'}`}
                    style={{ userSelect: 'none' }}
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Node Detail Sidebar */}
        {selectedNodeIds.size > 0 && (
          <div className="w-80 bg-white border-l border-slate-200 shadow-xl overflow-y-auto p-5 shrink-0 flex flex-col gap-4">
            {selectedNodeIds.size > 1 && !activeDetailNodeId ? (
              // 1. Giao diện hiển thị danh sách các node được chọn (khi chọn nhiều)
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 leading-tight">Đang chọn {selectedNodeIds.size} thực thể</h2>
                  <p className="text-xs text-slate-400 mt-1">Nhấp vào một thực thể bên dưới để xem chi tiết.</p>
                </div>
                
                {/* Cảnh báo nếu có cặp nào không tìm được đường */}
                {multiPaths.length > 0 && hasMissingPath && (
                   <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded text-sm">
                     Một số cặp thực thể không có đường nối trực tiếp trong cơ sở dữ liệu.
                   </div>
                )}
                
                <div className="border-t border-slate-100 pt-4 flex-1 overflow-y-auto pr-1">
                  <div className="flex flex-col gap-2">
                    {Array.from(selectedNodeIds).map(id => {
                      const node = graphData.nodes.find(gn => gn.id === id);
                      if (!node) return null;
                      return (
                        <div 
                          key={id}
                          className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg cursor-pointer transition flex items-center justify-between"
                          onClick={async () => {
                            setActiveDetailNodeId(id);
                            setSelection(node);
                            const detail = await graphExplorerService.getNodeDetail(node.backendId || node.id);
                            setNodeDetail(detail);
                          }}
                        >
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                              {getGroupLabel(node.apiEntityType || node.entityType || '')}
                            </span>
                            <p className="text-sm font-semibold text-slate-800">{node.name}</p>
                          </div>
                          <span className="text-xs text-emerald-600 font-medium shrink-0">&rarr;</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 border-t border-slate-100 pt-4">
                  <button 
                    className="flex-1 py-2 bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-600 font-medium rounded transition"
                    onClick={() => {
                      setGraphData(prev => {
                        const nextNodes = prev.nodes.filter(n => !selectedNodeIds.has(n.id));
                        const nextLinks = prev.links.filter(l => {
                          const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
                          const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
                          return !selectedNodeIds.has(sId) && !selectedNodeIds.has(tId);
                        });
                        return { nodes: nextNodes, links: nextLinks };
                      });
                      setSelectedNodeIds(new Set());
                      setSelection(null);
                      setNodeDetail(null);
                      setMultiPaths([]);
                      setActiveDetailNodeId(null);
                    }}
                  >
                    Xóa tất cả ({selectedNodeIds.size})
                  </button>
                </div>
              </div>
            ) : (
              // 2. Giao diện chi tiết của 1 node (khi chỉ chọn 1 node HOẶC nhấp xem chi tiết từ list)
              nodeDetail && selection && (
                <div className="flex-1 flex flex-col gap-4">
                  {selectedNodeIds.size > 1 && (
                    <button
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline self-start mb-1"
                      onClick={() => {
                        setActiveDetailNodeId(null);
                        setNodeDetail(null);
                        setSelection(null);
                      }}
                    >
                      &larr; Thu gọn chi tiết
                    </button>
                  )}
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{getGroupLabel(nodeDetail.group)}</span>
                      <h2 className="text-lg font-bold text-slate-800 leading-tight mt-1">{nodeDetail.label}</h2>
                      <div className="mt-2 text-sm text-slate-600 flex items-center gap-1">
                        <span className="font-semibold text-slate-800">{nodeDetail.degreeCount}</span> liên kết
                      </div>
                    </div>
                    <button 
                      className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded text-xs font-semibold transition flex items-center gap-1 shrink-0"
                      onClick={() => handleRemoveNode(selection.id)}
                      title="Xóa thực thể này khỏi sơ đồ"
                    >
                      ✕ Xóa
                    </button>
                  </div>

                  {/* Cảnh báo nếu có cặp không tìm được đường */}
                  {multiPaths.length > 0 && hasMissingPath && (
                     <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded text-sm">
                       Một số cặp thực thể không có đường nối trực tiếp trong cơ sở dữ liệu.
                     </div>
                  )}

                  {/* Thông tin thuộc tính của node */}
                  {nodeDetail.properties && Object.keys(nodeDetail.properties).length > 0 && (
                    <div className="border-t border-slate-100 pt-4">
                      <h3 className="font-semibold text-slate-800 mb-2 text-sm">Thông tin chi tiết</h3>
                      <div className="text-xs text-slate-600 flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                        {Object.entries(nodeDetail.properties).map(([key, val]) => {
                          if (key.toLowerCase() === 'id' || key.toLowerCase() === 'label' || !val) return null;
                          
                          const propLabels: Record<string, string> = {
                            primaryregion: 'Vùng miền chính',
                            languagefamily: 'Ngữ hệ',
                            name: 'Tên gọi',
                            description: 'Mô tả',
                            population: 'Dân số',
                            origin: 'Nguồn gốc',
                            recordingdate: 'Ngày thu âm',
                            duration: 'Thời lượng',
                            audiourl: 'Đường dẫn âm thanh',
                            othernames: 'Tên gọi khác',
                            culture: 'Văn hóa',
                            location: 'Địa điểm',
                            notes: 'Ghi chú',
                            instrumenttype: 'Loại nhạc cụ',
                            vocalrange: 'Tầm giọng',
                            scaletype: 'Loại thang âm',
                            ceremonytype: 'Loại nghi lễ',
                            artist: 'Nghệ sĩ trình diễn',
                            performer: 'Người thực hiện',
                            lyrics: 'Lời bài hát',
                          };
                          const normKey = key.toLowerCase();
                          const displayKey = propLabels[normKey] || key;
                          const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
                          
                          return (
                            <div key={key} className="flex flex-col gap-0.5 border-b border-slate-50 pb-1.5">
                              <span className="font-semibold text-slate-500">{displayKey}</span>
                              <span className="text-slate-700 whitespace-pre-wrap">{displayVal}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-4 flex-1">
                    <h3 className="font-semibold text-slate-800 mb-3 text-sm">Các liên kết liên quan</h3>
                    <div className="flex flex-col gap-3">
                      {Object.entries(
                        (nodeDetail.neighbors || []).reduce((acc, curr) => {
                          const translatedKey = getRelationshipLabel(
                            curr.relationType,
                            curr.direction,
                            nodeDetail.group,
                            curr.group
                          );
                          if (!acc[translatedKey]) {
                            acc[translatedKey] = [];
                          }
                          acc[translatedKey].push(curr);
                          return acc;
                        }, {} as Record<string, typeof nodeDetail.neighbors>)
                      ).map(([translatedLabel, items]) => {
                        const relType = items[0].relationType;
                        const isExpanded = expandedRelGroups.has(translatedLabel);
                        const visibleItems = isExpanded ? items : items.slice(0, 5);

                        // Kiểm tra xem có ít nhất 1 node con thuộc nhóm này đang hiển thị trên Graph
                        const hasAnyVisible = items.some(i => 
                          graphData.nodes.some(gn => gn.backendId === i.id || gn.entityId === i.id || gn.id === i.id)
                        );

                        return (
                          <div key={translatedLabel} className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                {translatedLabel} ({items.length})
                              </p>
                              <div className="flex gap-1 shrink-0">
                                <button 
                                  className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-200 transition"
                                  onClick={() => handleExpandRelation(selection!, relType)}
                                  title="Mở rộng tất cả các liên kết này"
                                >
                                  + Mở rộng
                                </button>
                                {hasAnyVisible && (
                                  <button 
                                    className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded border border-rose-200 transition animate-fade-in"
                                    onClick={() => handleCollapseRelation(selection!, relType)}
                                    title="Xóa nhánh liên kết này khỏi sơ đồ"
                                  >
                                    ✕ Thu gọn
                                  </button>
                                )}
                              </div>
                            </div>
                            <ul className="text-sm flex flex-col gap-1.5 pl-2 border-l-2 border-slate-200 mt-2">
                              {visibleItems.map(i => {
                                const isOnGraph = graphData.nodes.some(gn => gn.backendId === i.id || gn.entityId === i.id || gn.id === i.id);
                                return (
                                  <li 
                                    key={i.id} 
                                    className={`text-slate-700 truncate hover:text-emerald-600 cursor-pointer flex items-center justify-between gap-1 group py-0.5`}
                                    title={i.label}
                                    onClick={() => handleNeighborItemClick(i)}
                                  >
                                    <span className={`truncate ${isOnGraph ? 'text-emerald-600 font-semibold' : 'text-slate-700'}`}>
                                      • {i.label}
                                    </span>
                                    {isOnGraph ? (
                                      <div className="flex items-center gap-1 shrink-0">
                                        <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1 py-0.2 rounded border border-emerald-100 font-normal">
                                          đang hiển thị
                                        </span>
                                        <button
                                          type="button"
                                          className="text-[9px] bg-rose-50 hover:bg-rose-100 text-rose-600 p-0.5 rounded border border-rose-100 transition shrink-0"
                                          onClick={(e) => {
                                            e.stopPropagation(); // Không kích hoạt click vào phần tử cha
                                            const graphNode = graphData.nodes.find(gn => gn.backendId === i.id || gn.entityId === i.id || gn.id === i.id);
                                            if (graphNode) {
                                              handleCollapseSingleNeighbor(selection!, graphNode.id);
                                            }
                                          }}
                                          title="Xóa thực thể này khỏi sơ đồ"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded opacity-0 group-hover:opacity-100 transition shrink-0 font-normal">
                                        + thêm vào sơ đồ
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                              {items.length > 5 && (
                                <li>
                                  <button
                                    type="button"
                                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                                    onClick={() => {
                                      setExpandedRelGroups(prev => {
                                        const next = new Set(prev);
                                        if (isExpanded) {
                                          next.delete(translatedLabel);
                                        } else {
                                          next.add(translatedLabel);
                                        }
                                        return next;
                                      });
                                    }}
                                  >
                                    {isExpanded ? '↑ Thu gọn bớt' : `+ ${items.length - 5} nữa...`}
                                  </button>
                                </li>
                              )}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      className={`flex-1 py-2 font-medium rounded transition text-white ${
                        expandedNodes.has(selection.id) 
                          ? 'bg-rose-500 hover:bg-rose-600' 
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                      onClick={() => {
                        if (expandedNodes.has(selection.id)) {
                          handleCollapseNode(selection);
                        } else {
                          handleNodeDoubleClick(selection);
                        }
                      }}
                    >
                      {expandedNodes.has(selection.id) ? 'Thu gọn' : 'Mở rộng'}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Popup / Modal chọn nhánh mở rộng */}
      {expandPopupData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Mở rộng liên kết của: {expandPopupData.node.name}</h3>
              <button 
                className="text-slate-400 hover:text-slate-600 font-bold px-2"
                onClick={() => setExpandPopupData(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <p className="text-sm text-slate-600 mb-4">Chọn các mối quan hệ bạn muốn mở rộng trên sơ đồ:</p>
              
              <div className="flex flex-col gap-2">
                {Array.from(new Set(expandPopupData.detail.neighbors.map(n => n.relationType))).map(relType => {
                  const count = expandPopupData.detail.neighbors.filter(n => n.relationType === relType).length;
                  const isChecked = expandPopupData.selectedRels.has(relType);
                  
                  const neighborsForRel = expandPopupData.detail.neighbors.filter(n => n.relationType === relType);
                  const labels = Array.from(new Set(neighborsForRel.map(n => 
                    getRelationshipLabel(relType, n.direction, expandPopupData.detail.group, n.group)
                  )));
                  const labelText = labels.join(' / ');

                  return (
                    <label key={relType} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
                        checked={isChecked}
                        onChange={(e) => {
                          setExpandPopupData(prev => {
                            if (!prev) return prev;
                            const nextRels = new Set(prev.selectedRels);
                            if (e.target.checked) nextRels.add(relType);
                            else nextRels.delete(relType);
                            return { ...prev, selectedRels: nextRels };
                          });
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{labelText}</p>
                        <p className="text-xs text-slate-500">{count} thực thể liên quan</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button 
                className="px-4 py-2 rounded text-slate-600 font-medium hover:bg-slate-200 transition"
                onClick={() => setExpandPopupData(null)}
              >
                Hủy bỏ
              </button>
              <button 
                className="px-6 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={expandPopupData.selectedRels.size === 0}
                onClick={submitMultiExpand}
              >
                Mở rộng ({expandPopupData.selectedRels.size})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
