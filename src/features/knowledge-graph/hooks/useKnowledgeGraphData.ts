// [VI] Nhập (import) các phụ thuộc cho file.
import { useMemo } from 'react';

// [VI] Nhập (import) các phụ thuộc cho file.
import { REGION_NAMES } from '@/config/constants';
// [VI] Nhập (import) các phụ thuộc cho file.
import { EthnicGroupItem, InstrumentItem, CeremonyItem } from '@/services/referenceDataService';
// [VI] Nhập (import) các phụ thuộc cho file.
import { Recording } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { KnowledgeGraphData, GraphNode, GraphLink } from '@/types/graph';

// [VI] Khai báo hàm/biểu thức hàm.
function asRow(r: Recording): Record<string, unknown> {
// [VI] Trả về kết quả từ hàm.
  return r as unknown as Record<string, unknown>;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function getCeremonyLabel(r: Recording, eventTypes: string[]): string {
// [VI] Khai báo biến/hằng số.
  const byTags = r.tags?.find(
// [VI] Khai báo hàm/biểu thức hàm.
    (t) => t === eventTypes.find((e) => e === t) || eventTypes.some((e) => t.includes(e)),
// [VI] Thực thi một bước trong luồng xử lý.
  );
// [VI] Rẽ nhánh điều kiện (if).
  if (byTags) return byTags;
// [VI] Khai báo biến/hằng số.
  const byMetadata = r.metadata?.ritualContext ?? '';
// [VI] Rẽ nhánh điều kiện (if).
  if (byMetadata) return byMetadata;
// [VI] Khai báo biến/hằng số.
  const row = asRow(r);
// [VI] Khai báo biến/hằng số.
  const named = [row.ceremonyName, row.eventTypeName, row.ritualName].find(
// [VI] Khai báo hàm/biểu thức hàm.
    (x): x is string => typeof x === 'string' && x.trim().length > 0,
// [VI] Thực thi một bước trong luồng xử lý.
  );
// [VI] Trả về kết quả từ hàm.
  return named || '';
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function getRegionLabel(r: Recording): string {
// [VI] Khai báo biến/hằng số.
  const row = asRow(r);
// [VI] Khai báo biến/hằng số.
  const named = [row.regionName, row.regionLabel].find(
// [VI] Khai báo hàm/biểu thức hàm.
    (x): x is string => typeof x === 'string' && x.trim().length > 0,
// [VI] Thực thi một bước trong luồng xử lý.
  );
// [VI] Rẽ nhánh điều kiện (if).
  if (named) return named;
// [VI] Khai báo biến/hằng số.
  const fromEnum = r.region ? REGION_NAMES[r.region as keyof typeof REGION_NAMES] : '';
// [VI] Rẽ nhánh điều kiện (if).
  if (fromEnum) return fromEnum;
// [VI] Trả về kết quả từ hàm.
  return (
// [VI] Thực thi một bước trong luồng xử lý.
    [r.region, row.provinceName, row.recordingLocation].find(
// [VI] Khai báo hàm/biểu thức hàm.
      (x): x is string => typeof x === 'string' && x.trim().length > 0,
// [VI] Thực thi một bước trong luồng xử lý.
    ) || ''
// [VI] Thực thi một bước trong luồng xử lý.
  );
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const useKnowledgeGraphData = (
// [VI] Thực thi một bước trong luồng xử lý.
  recordings: Recording[],
// [VI] Thực thi một bước trong luồng xử lý.
  ethnicRefData: EthnicGroupItem[],
// [VI] Thực thi một bước trong luồng xử lý.
  instrumentRefData: InstrumentItem[],
// [VI] Thực thi một bước trong luồng xử lý.
  ceremonyRefData: CeremonyItem[],
// [VI] Khai báo hàm/biểu thức hàm.
): KnowledgeGraphData => {
// [VI] Khai báo hàm/biểu thức hàm.
  return useMemo(() => {
// [VI] Khai báo biến/hằng số.
    const nodesMap = new Map<string, GraphNode>();
// [VI] Khai báo biến/hằng số.
    const links: GraphLink[] = [];

// [VI] Khai báo biến/hằng số.
    const addNode = (node: GraphNode) => {
// [VI] Rẽ nhánh điều kiện (if).
      if (!nodesMap.has(node.id)) {
// [VI] Thực thi một bước trong luồng xử lý.
        nodesMap.set(node.id, node);
// [VI] Thực thi một bước trong luồng xử lý.
      } else {
// [VI] Khai báo biến/hằng số.
        const ext = nodesMap.get(node.id)!;
// [VI] Thực thi một bước trong luồng xử lý.
        ext.val = (ext.val || 0) + (node.val || 0);
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    };

// [VI] Khai báo biến/hằng số.
    const addLink = (source: string, target: string, type: string) => {
// [VI] Khai báo biến/hằng số.
      const exists = links.find(
// [VI] Khai báo hàm/biểu thức hàm.
        (l) =>
// [VI] Thực thi một bước trong luồng xử lý.
          (l.source === source && l.target === target) ||
// [VI] Thực thi một bước trong luồng xử lý.
          (l.source === target && l.target === source),
// [VI] Thực thi một bước trong luồng xử lý.
      );
// [VI] Rẽ nhánh điều kiện (if).
      if (!exists) links.push({ source, target, type });
// [VI] Thực thi một bước trong luồng xử lý.
    };

// [VI] Khai báo biến/hằng số.
    const eventTypes = ceremonyRefData.map((c) => c.name);

// [VI] Khai báo biến/hằng số.
    const ethImageMap: Record<string, string> = {};
// [VI] Khai báo hàm/biểu thức hàm.
    ethnicRefData.forEach((e) => {
// [VI] Rẽ nhánh điều kiện (if).
      if (e.imageUrl) ethImageMap[e.name] = e.imageUrl;
// [VI] Thực thi một bước trong luồng xử lý.
    });

// [VI] Khai báo biến/hằng số.
    const instImageMap: Record<string, string> = {};
// [VI] Khai báo hàm/biểu thức hàm.
    instrumentRefData.forEach((i) => {
// [VI] Rẽ nhánh điều kiện (if).
      if (i.imageUrl) instImageMap[i.name] = i.imageUrl;
// [VI] Thực thi một bước trong luồng xử lý.
    });

// [VI] Khai báo hàm/biểu thức hàm.
    recordings.forEach((r) => {
// [VI] Khai báo biến/hằng số.
      const recId = `rec_${r.id}`;
// [VI] Thực thi một bước trong luồng xử lý.
      addNode({
// [VI] Thực thi một bước trong luồng xử lý.
        id: recId,
// [VI] Thực thi một bước trong luồng xử lý.
        name: r.title || 'Unknown',
// [VI] Thực thi một bước trong luồng xử lý.
        type: 'recording',
// [VI] Thực thi một bước trong luồng xử lý.
        val: 1,
// [VI] Thực thi một bước trong luồng xử lý.
        desc: r.description || '',
// [VI] Thực thi một bước trong luồng xử lý.
      });

// [VI] Khai báo biến/hằng số.
      const ethName = r.ethnicity?.nameVietnamese ?? r.ethnicity?.name;
// [VI] Rẽ nhánh điều kiện (if).
      if (ethName) {
// [VI] Khai báo biến/hằng số.
        const ethId = `eth_${ethName}`;
// [VI] Thực thi một bước trong luồng xử lý.
        addNode({
// [VI] Thực thi một bước trong luồng xử lý.
          id: ethId,
// [VI] Thực thi một bước trong luồng xử lý.
          name: ethName,
// [VI] Thực thi một bước trong luồng xử lý.
          type: 'ethnic_group',
// [VI] Thực thi một bước trong luồng xử lý.
          val: 0.5,
// [VI] Thực thi một bước trong luồng xử lý.
          imgUrl: ethImageMap[ethName],
// [VI] Thực thi một bước trong luồng xử lý.
        });
// [VI] Thực thi một bước trong luồng xử lý.
        addLink(recId, ethId, 'belongs_to');
// [VI] Thực thi một bước trong luồng xử lý.
      }

// [VI] Khai báo biến/hằng số.
      const regionName = getRegionLabel(r);
// [VI] Rẽ nhánh điều kiện (if).
      if (regionName) {
// [VI] Khai báo biến/hằng số.
        const regId = `reg_${regionName}`;
// [VI] Thực thi một bước trong luồng xử lý.
        addNode({ id: regId, name: regionName, type: 'region', val: 0.8 });
// [VI] Rẽ nhánh điều kiện (if).
        if (ethName) {
// [VI] Thực thi một bước trong luồng xử lý.
          addLink(`eth_${ethName}`, regId, 'located_in');
// [VI] Thực thi một bước trong luồng xử lý.
        } else {
// [VI] Thực thi một bước trong luồng xử lý.
          addLink(recId, regId, 'located_in');
// [VI] Thực thi một bước trong luồng xử lý.
        }
// [VI] Thực thi một bước trong luồng xử lý.
      }

// [VI] Khai báo biến/hằng số.
      const cerName = getCeremonyLabel(r, eventTypes);
// [VI] Rẽ nhánh điều kiện (if).
      if (cerName) {
// [VI] Khai báo biến/hằng số.
        const cerId = `cer_${cerName}`;
// [VI] Thực thi một bước trong luồng xử lý.
        addNode({ id: cerId, name: cerName, type: 'ceremony', val: 0.3 });
// [VI] Thực thi một bước trong luồng xử lý.
        addLink(recId, cerId, 'played_in');
// [VI] Rẽ nhánh điều kiện (if).
        if (ethName) {
// [VI] Thực thi một bước trong luồng xử lý.
          addLink(`eth_${ethName}`, cerId, 'performs');
// [VI] Thực thi một bước trong luồng xử lý.
        }
// [VI] Thực thi một bước trong luồng xử lý.
      }

// [VI] Rẽ nhánh điều kiện (if).
      if (r.instruments) {
// [VI] Khai báo hàm/biểu thức hàm.
        r.instruments.forEach((inst) => {
// [VI] Khai báo biến/hằng số.
          const iname = inst.nameVietnamese ?? inst.name;
// [VI] Rẽ nhánh điều kiện (if).
          if (iname) {
// [VI] Khai báo biến/hằng số.
            const instId = `inst_${iname}`;
// [VI] Thực thi một bước trong luồng xử lý.
            addNode({
// [VI] Thực thi một bước trong luồng xử lý.
              id: instId,
// [VI] Thực thi một bước trong luồng xử lý.
              name: iname,
// [VI] Thực thi một bước trong luồng xử lý.
              type: 'instrument',
// [VI] Thực thi một bước trong luồng xử lý.
              val: 0.4,
// [VI] Thực thi một bước trong luồng xử lý.
              imgUrl: instImageMap[iname],
// [VI] Thực thi một bước trong luồng xử lý.
            });
// [VI] Thực thi một bước trong luồng xử lý.
            addLink(recId, instId, 'uses_instrument');
// [VI] Rẽ nhánh điều kiện (if).
            if (ethName) {
// [VI] Thực thi một bước trong luồng xử lý.
              addLink(instId, `eth_${ethName}`, 'instrument_of');
// [VI] Thực thi một bước trong luồng xử lý.
            }
// [VI] Thực thi một bước trong luồng xử lý.
          }
// [VI] Thực thi một bước trong luồng xử lý.
        });
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    });

// [VI] Trả về kết quả từ hàm.
    return {
// [VI] Thực thi một bước trong luồng xử lý.
      nodes: Array.from(nodesMap.values()),
// [VI] Thực thi một bước trong luồng xử lý.
      links,
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Thực thi một bước trong luồng xử lý.
  }, [recordings, ethnicRefData, instrumentRefData, ceremonyRefData]);
// [VI] Thực thi một bước trong luồng xử lý.
};
