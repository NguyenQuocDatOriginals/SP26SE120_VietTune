// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from '@/services/api';
// [VI] Nhập (import) các phụ thuộc cho file.
import { buildSubmissionLookupMaps } from '@/services/expertModerationApi';
// [VI] Nhập (import) các phụ thuộc cho file.
import { mapSubmissionToLocalRecording } from '@/services/submissionApiMapper';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { SubmissionLookupMaps } from '@/services/submissionApiMapper';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { LocalRecording, Recording } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { convertLocalToRecording } from '@/utils/localRecordingToRecording';

// [VI] Thực thi một bước trong luồng xử lý.
/** Query for GET /Recording/search-by-filter (see BE Swagger). */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type RecordingSearchByFilterQuery = {
// [VI] Thực thi một bước trong luồng xử lý.
  q?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  ethnicGroupId?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  instrumentId?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  ceremonyId?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  /** Macro region: FE sends `Region` enum key (e.g. RED_RIVER_DELTA); align with BE if codes differ. */
// [VI] Thực thi một bước trong luồng xử lý.
  regionCode?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  communeId?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  page?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  pageSize?: number;
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Khai báo hàm/biểu thức hàm.
function normalizeJsonKey(k: string): string {
// [VI] Rẽ nhánh điều kiện (if).
  if (!k) return k;
// [VI] Rẽ nhánh điều kiện (if).
  if (/^[A-Z]{1,4}$/.test(k)) return k.toLowerCase();
// [VI] Rẽ nhánh điều kiện (if).
  if (/^[A-Z]/.test(k)) return k.charAt(0).toLowerCase() + k.slice(1);
// [VI] Trả về kết quả từ hàm.
  return k;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** Coerce common .NET / Swagger envelope shapes; normalize PascalCase keys for the mapper. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function normalizeDotNetJsonKeys(input: unknown, depth = 0): unknown {
// [VI] Rẽ nhánh điều kiện (if).
  if (input === null || input === undefined || depth > 8) return input;
// [VI] Rẽ nhánh điều kiện (if).
  if (Array.isArray(input)) {
// [VI] Khai báo hàm/biểu thức hàm.
    return input.map((x) => normalizeDotNetJsonKeys(x, depth + 1));
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Rẽ nhánh điều kiện (if).
  if (typeof input !== 'object') return input;
// [VI] Khai báo biến/hằng số.
  const obj = input as Record<string, unknown>;
// [VI] Khai báo biến/hằng số.
  const out: Record<string, unknown> = {};
// [VI] Vòng lặp (for).
  for (const [k, v] of Object.entries(obj)) {
// [VI] Thực thi một bước trong luồng xử lý.
    out[normalizeJsonKey(k)] = normalizeDotNetJsonKeys(v, depth + 1);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return out;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function extractRecordingFilterSearchRows(res: unknown): Record<string, unknown>[] {
// [VI] Khai báo biến/hằng số.
  const root = normalizeDotNetJsonKeys(res) as Record<string, unknown> | unknown[] | null;
// [VI] Rẽ nhánh điều kiện (if).
  if (!root) return [];
// [VI] Rẽ nhánh điều kiện (if).
  if (Array.isArray(root)) return root as Record<string, unknown>[];
// [VI] Khai báo biến/hằng số.
  const r = root as Record<string, unknown>;
// [VI] Khai báo biến/hằng số.
  const candidates = [
// [VI] Thực thi một bước trong luồng xử lý.
    r.data,
// [VI] Thực thi một bước trong luồng xử lý.
    r.items,
// [VI] Thực thi một bước trong luồng xử lý.
    (r.data as Record<string, unknown> | undefined)?.items,
// [VI] Thực thi một bước trong luồng xử lý.
    (r.data as Record<string, unknown> | undefined)?.records,
// [VI] Thực thi một bước trong luồng xử lý.
    (r.data as Record<string, unknown> | undefined)?.data,
// [VI] Thực thi một bước trong luồng xử lý.
    r.records,
// [VI] Thực thi một bước trong luồng xử lý.
    r.result,
// [VI] Thực thi một bước trong luồng xử lý.
    (r.result as Record<string, unknown> | undefined)?.items,
// [VI] Thực thi một bước trong luồng xử lý.
    r.value,
// [VI] Thực thi một bước trong luồng xử lý.
  ];
// [VI] Vòng lặp (for).
  for (const c of candidates) {
// [VI] Rẽ nhánh điều kiện (if).
    if (Array.isArray(c)) return c as Record<string, unknown>[];
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Khai báo biến/hằng số.
  const dataVal = r.data;
// [VI] Rẽ nhánh điều kiện (if).
  if (dataVal && typeof dataVal === 'object' && !Array.isArray(dataVal)) {
// [VI] Khai báo biến/hằng số.
    const d = dataVal as Record<string, unknown>;
// [VI] Khai báo biến/hằng số.
    const looksLikeRecording =
// [VI] Thực thi một bước trong luồng xử lý.
      typeof d.title === 'string' ||
// [VI] Thực thi một bước trong luồng xử lý.
      typeof d.audioFileUrl === 'string' ||
// [VI] Thực thi một bước trong luồng xử lý.
      Array.isArray(d.instrumentIds);
// [VI] Rẽ nhánh điều kiện (if).
    if (looksLikeRecording) return [d];
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return [];
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function filterRowToLocal(
// [VI] Thực thi một bước trong luồng xử lý.
  row: Record<string, unknown>,
// [VI] Thực thi một bước trong luồng xử lý.
  lookups: SubmissionLookupMaps,
// [VI] Thực thi một bước trong luồng xử lý.
): LocalRecording {
// [VI] Khai báo biến/hằng số.
  const rec =
// [VI] Thực thi một bước trong luồng xử lý.
    row.recording && typeof row.recording === 'object' && !Array.isArray(row.recording)
// [VI] Thực thi một bước trong luồng xử lý.
      ? (row.recording as Record<string, unknown>)
// [VI] Thực thi một bước trong luồng xử lý.
      : row;
// [VI] Khai báo biến/hằng số.
  const topId = String(
// [VI] Thực thi một bước trong luồng xử lý.
    row.id ??
// [VI] Thực thi một bước trong luồng xử lý.
      row.recordingId ??
// [VI] Thực thi một bước trong luồng xử lý.
      row.recording_id ??
// [VI] Thực thi một bước trong luồng xử lý.
      rec.id ??
// [VI] Thực thi một bước trong luồng xử lý.
      rec.recordingId ??
// [VI] Thực thi một bước trong luồng xử lý.
      rec.recording_id ??
// [VI] Thực thi một bước trong luồng xử lý.
      '',
// [VI] Thực thi một bước trong luồng xử lý.
  ).trim();
// [VI] Khai báo biến/hằng số.
  const syntheticSubmission = {
// [VI] Thực thi một bước trong luồng xử lý.
    ...row,
// [VI] Thực thi một bước trong luồng xử lý.
    id: topId || String(row.submissionId ?? row.submission_id ?? '').trim(),
// [VI] Thực thi một bước trong luồng xử lý.
    status: 2,
// [VI] Thực thi một bước trong luồng xử lý.
    recording: rec,
// [VI] Thực thi một bước trong luồng xử lý.
  } as Record<string, unknown>;
// [VI] Trả về kết quả từ hàm.
  return mapSubmissionToLocalRecording(syntheticSubmission, lookups);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Server-side search for researcher catalog (metadata filters + optional `q`).
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function fetchRecordingsSearchByFilter(
// [VI] Thực thi một bước trong luồng xử lý.
  query: RecordingSearchByFilterQuery,
// [VI] Thực thi một bước trong luồng xử lý.
): Promise<Recording[]> {
// [VI] Khai báo biến/hằng số.
  const params: Record<string, string | number> = {
// [VI] Thực thi một bước trong luồng xử lý.
    page: query.page ?? 1,
// [VI] Thực thi một bước trong luồng xử lý.
    pageSize: query.pageSize ?? 500,
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Rẽ nhánh điều kiện (if).
  if (query.q?.trim()) params.q = query.q.trim();
// [VI] Rẽ nhánh điều kiện (if).
  if (query.ethnicGroupId) params.ethnicGroupId = query.ethnicGroupId;
// [VI] Rẽ nhánh điều kiện (if).
  if (query.instrumentId) params.instrumentId = query.instrumentId;
// [VI] Rẽ nhánh điều kiện (if).
  if (query.ceremonyId) params.ceremonyId = query.ceremonyId;
// [VI] Rẽ nhánh điều kiện (if).
  if (query.regionCode) params.regionCode = query.regionCode;
// [VI] Rẽ nhánh điều kiện (if).
  if (query.communeId) params.communeId = query.communeId;

// [VI] Khai báo biến/hằng số.
  const [lookups, res] = await Promise.all([
// [VI] Thực thi một bước trong luồng xử lý.
    buildSubmissionLookupMaps(),
// [VI] Thực thi một bước trong luồng xử lý.
    api.get<unknown>('/Recording/search-by-filter', { params }),
// [VI] Thực thi một bước trong luồng xử lý.
  ]);
// [VI] Khai báo biến/hằng số.
  const rows = extractRecordingFilterSearchRows(res);
// [VI] Khai báo biến/hằng số.
  const locals = rows.map((row, index) => {
// [VI] Khai báo biến/hằng số.
    const local = filterRowToLocal(
// [VI] Thực thi một bước trong luồng xử lý.
      normalizeDotNetJsonKeys(row) as Record<string, unknown>,
// [VI] Thực thi một bước trong luồng xử lý.
      lookups,
// [VI] Thực thi một bước trong luồng xử lý.
    );
// [VI] Rẽ nhánh điều kiện (if).
    if (!local.id?.trim()) {
// [VI] Trả về kết quả từ hàm.
      return { ...local, id: `search-row-${index}` };
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Trả về kết quả từ hàm.
    return local;
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Khai báo biến/hằng số.
  const byId = new Map<string, LocalRecording>();
// [VI] Vòng lặp (for).
  for (const l of locals) {
// [VI] Thực thi một bước trong luồng xử lý.
    byId.set(l.id ?? `row-${byId.size}`, l);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Khai báo hàm/biểu thức hàm.
  return Promise.all([...byId.values()].map((l) => convertLocalToRecording(l)));
// [VI] Thực thi một bước trong luồng xử lý.
}
