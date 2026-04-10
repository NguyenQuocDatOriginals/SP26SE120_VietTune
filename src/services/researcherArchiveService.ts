// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from '@/services/api';
// [VI] Nhập (import) các phụ thuộc cho file.
import { buildSubmissionLookupMaps } from '@/services/expertModerationApi';
// [VI] Nhập (import) các phụ thuộc cho file.
import {
// [VI] Thực thi một bước trong luồng xử lý.
  extractSubmissionRows,
// [VI] Thực thi một bước trong luồng xử lý.
  mapSubmissionToLocalRecording,
// [VI] Thực thi một bước trong luồng xử lý.
} from '@/services/submissionApiMapper';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { LocalRecording, Recording } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { convertLocalToRecording } from '@/utils/localRecordingToRecording';

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Integer for GET /Submission/get-by-status = “đã duyệt” (same as Contributions tab Đã duyệt).
// [VI] Thực thi một bước trong luồng xử lý.
 * Backend uses **2** = approved; **3** = rejected.
// [VI] Thực thi một bước trong luồng xử lý.
 * Override with `VITE_RESEARCHER_VERIFIED_SUBMISSION_STATUS` if needed.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Khai báo biến/hằng số.
const DEFAULT_VERIFIED = 2;

// [VI] Khai báo hàm/biểu thức hàm.
function verifiedStatusCodes(): number[] {
// [VI] Khai báo biến/hằng số.
  const raw =
// [VI] Thực thi một bước trong luồng xử lý.
    import.meta.env.VITE_RESEARCHER_VERIFIED_SUBMISSION_STATUS ?? String(DEFAULT_VERIFIED);
// [VI] Trả về kết quả từ hàm.
  return raw
// [VI] Thực thi một bước trong luồng xử lý.
    .split(',')
// [VI] Khai báo hàm/biểu thức hàm.
    .map((s: string) => parseInt(s.trim(), 10))
// [VI] Khai báo hàm/biểu thức hàm.
    .filter((n: number) => !Number.isNaN(n));
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Approved/verified submission rows → `Recording` for researcher UI (IDs resolved to display names).
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function fetchVerifiedSubmissionsAsRecordings(opts?: {
// [VI] Thực thi một bước trong luồng xử lý.
  signal?: AbortSignal;
// [VI] Thực thi một bước trong luồng xử lý.
}): Promise<Recording[]> {
// [VI] Khai báo biến/hằng số.
  const statuses = verifiedStatusCodes();
// [VI] Khai báo biến/hằng số.
  const signal = opts?.signal;
// [VI] Khai báo biến/hằng số.
  const lookupPromise = buildSubmissionLookupMaps();
// [VI] Khai báo biến/hằng số.
  const submissionPromises = statuses.map((status) =>
// [VI] Thực thi một bước trong luồng xử lý.
    api.get<unknown>('/Submission/get-by-status', {
// [VI] Thực thi một bước trong luồng xử lý.
      params: { status, page: 1, pageSize: 500 },
// [VI] Thực thi một bước trong luồng xử lý.
      signal,
// [VI] Thực thi một bước trong luồng xử lý.
    }),
// [VI] Thực thi một bước trong luồng xử lý.
  );
// [VI] Khai báo biến/hằng số.
  const [lookups, ...responses] = await Promise.all([lookupPromise, ...submissionPromises]);

// [VI] Khai báo biến/hằng số.
  const merged: LocalRecording[] = [];
// [VI] Vòng lặp (for).
  for (const res of responses) {
// [VI] Khai báo biến/hằng số.
    const rows = extractSubmissionRows(res);
// [VI] Vòng lặp (for).
    for (const row of rows) {
// [VI] Thực thi một bước trong luồng xử lý.
      merged.push(mapSubmissionToLocalRecording(row, lookups));
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Khai báo biến/hằng số.
  const byId = new Map<string, (typeof merged)[0]>();
// [VI] Vòng lặp (for).
  for (const local of merged) {
// [VI] Rẽ nhánh điều kiện (if).
    if (local.id) byId.set(local.id, local);
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Khai báo hàm/biểu thức hàm.
  return Promise.all([...byId.values()].map((l) => convertLocalToRecording(l)));
// [VI] Thực thi một bước trong luồng xử lý.
}
