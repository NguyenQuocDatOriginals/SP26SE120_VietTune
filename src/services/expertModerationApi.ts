// [VI] Nhập (import) các phụ thuộc cho file.
import axios from 'axios';

// [VI] Nhập (import) các phụ thuộc cho file.
import { EXPERT_QUEUE_USE_MOCK, type ExpertQueueSource } from '@/config/expertWorkflowPhase';
// [VI] Nhập (import) các phụ thuộc cho file.
import { macroRegionDisplayNameFromProvinceRegionCode } from '@/config/provinceRegionCodes';
// [VI] Nhập (import) các phụ thuộc cho file.
import apiClient, { api } from '@/services/api';
// [VI] Nhập (import) các phụ thuộc cho file.
import { buildMockExpertQueue } from '@/services/expertModerationMock';
// [VI] Nhập (import) các phụ thuộc cho file.
import { referenceDataService } from '@/services/referenceDataService';
// [VI] Nhập (import) các phụ thuộc cho file.
import { logServiceWarn } from '@/services/serviceLogger';
// [VI] Nhập (import) các phụ thuộc cho file.
import {
// [VI] Thực thi một bước trong luồng xử lý.
  extractSubmissionRows,
// [VI] Thực thi một bước trong luồng xử lý.
  mapSubmissionToLocalRecording,
// [VI] Khai báo kiểu (type) để mô tả dữ liệu.
  type SubmissionLookupMaps,
// [VI] Thực thi một bước trong luồng xử lý.
} from '@/services/submissionApiMapper';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { LocalRecording } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { mutationFail, mutationOk } from '@/types/mutationResult';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { MutationResult } from '@/types/mutationResult';

// [VI] Khai báo biến/hằng số.
const DEFAULT_PAGE_SIZE = 200;
// [VI] Khai báo biến/hằng số.
const LOOKUP_TTL_MS = 15 * 60 * 1000;
// [VI] Khai báo biến/hằng số.
let lookupCache: { ts: number; data: SubmissionLookupMaps } | null = null;
// [VI] Khai báo biến/hằng số.
let lookupInflight: Promise<SubmissionLookupMaps> | null = null;

// [VI] Khai báo hàm/biểu thức hàm.
function normalizeId(v: unknown): string {
// [VI] Trả về kết quả từ hàm.
  return String(v ?? '')
// [VI] Thực thi một bước trong luồng xử lý.
    .trim()
// [VI] Thực thi một bước trong luồng xử lý.
    .toLowerCase();
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** Shared reference maps for resolving ethnic/ceremony/instrument/geo IDs in submission payloads. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function buildSubmissionLookupMaps(): Promise<SubmissionLookupMaps> {
// [VI] Rẽ nhánh điều kiện (if).
  if (lookupCache && Date.now() - lookupCache.ts < LOOKUP_TTL_MS) {
// [VI] Trả về kết quả từ hàm.
    return lookupCache.data;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Rẽ nhánh điều kiện (if).
  if (lookupInflight) return lookupInflight;
// [VI] Khai báo hàm/biểu thức hàm.
  lookupInflight = (async () => {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const [ethnics, ceremonies, instruments, communes, districts, provinces] = await Promise.all([
// [VI] Thực thi một bước trong luồng xử lý.
        referenceDataService.getEthnicGroups(),
// [VI] Thực thi một bước trong luồng xử lý.
        referenceDataService.getCeremonies(),
// [VI] Thực thi một bước trong luồng xử lý.
        referenceDataService.getInstruments(),
// [VI] Thực thi một bước trong luồng xử lý.
        referenceDataService.getCommunes(),
// [VI] Thực thi một bước trong luồng xử lý.
        referenceDataService.getDistricts(),
// [VI] Thực thi một bước trong luồng xử lý.
        referenceDataService.getProvinces(),
// [VI] Thực thi một bước trong luồng xử lý.
      ]);

// [VI] Khai báo biến/hằng số.
      const macroRegionByProvinceId = Object.fromEntries(
// [VI] Thực thi một bước trong luồng xử lý.
        provinces
// [VI] Khai báo hàm/biểu thức hàm.
          .map((p) => {
// [VI] Khai báo biến/hằng số.
            const label = macroRegionDisplayNameFromProvinceRegionCode(p.regionCode).trim();
// [VI] Trả về kết quả từ hàm.
            return label ? ([normalizeId(p.id), label] as const) : null;
// [VI] Thực thi một bước trong luồng xử lý.
          })
// [VI] Khai báo hàm/biểu thức hàm.
          .filter((e): e is readonly [string, string] => e != null),
// [VI] Thực thi một bước trong luồng xử lý.
      );
// [VI] Khai báo biến/hằng số.
      const provinceIdByDistrictId = Object.fromEntries(
// [VI] Khai báo hàm/biểu thức hàm.
        districts.map((d) => [normalizeId(d.id), normalizeId(d.provinceId)]),
// [VI] Thực thi một bước trong luồng xử lý.
      );
// [VI] Khai báo biến/hằng số.
      const districtIdByCommuneId = Object.fromEntries(
// [VI] Khai báo hàm/biểu thức hàm.
        communes.map((c) => [normalizeId(c.id), normalizeId(c.districtId)]),
// [VI] Thực thi một bước trong luồng xử lý.
      );

// [VI] Khai báo biến/hằng số.
      const data: SubmissionLookupMaps = {
// [VI] Khai báo hàm/biểu thức hàm.
        ethnicById: Object.fromEntries(ethnics.map((x) => [normalizeId(x.id), x.name])),
// [VI] Khai báo hàm/biểu thức hàm.
        ceremonyById: Object.fromEntries(ceremonies.map((x) => [normalizeId(x.id), x.name])),
// [VI] Khai báo hàm/biểu thức hàm.
        instrumentById: Object.fromEntries(instruments.map((x) => [normalizeId(x.id), x.name])),
// [VI] Khai báo hàm/biểu thức hàm.
        communeById: Object.fromEntries(communes.map((x) => [normalizeId(x.id), x.name])),
// [VI] Khai báo hàm/biểu thức hàm.
        districtById: Object.fromEntries(districts.map((x) => [normalizeId(x.id), x.name])),
// [VI] Khai báo hàm/biểu thức hàm.
        provinceById: Object.fromEntries(provinces.map((x) => [normalizeId(x.id), x.name])),
// [VI] Thực thi một bước trong luồng xử lý.
        macroRegionByProvinceId,
// [VI] Thực thi một bước trong luồng xử lý.
        provinceIdByDistrictId,
// [VI] Thực thi một bước trong luồng xử lý.
        districtIdByCommuneId,
// [VI] Thực thi một bước trong luồng xử lý.
      };
// [VI] Thực thi một bước trong luồng xử lý.
      lookupCache = { ts: Date.now(), data };
// [VI] Trả về kết quả từ hàm.
      return data;
// [VI] Thực thi một bước trong luồng xử lý.
    } catch {
// [VI] Trả về kết quả từ hàm.
      return {};
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  })();
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Trả về kết quả từ hàm.
    return await lookupInflight;
// [VI] Thực thi một bước trong luồng xử lý.
  } finally {
// [VI] Thực thi một bước trong luồng xử lý.
    lookupInflight = null;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
async function getSubmissionsByStatus(params: {
// [VI] Thực thi một bước trong luồng xử lý.
  status?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  page?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  pageSize?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  lookups?: SubmissionLookupMaps;
// [VI] Thực thi một bước trong luồng xử lý.
}): Promise<LocalRecording[]> {
// [VI] Khai báo biến/hằng số.
  const lookups = params.lookups ?? (await buildSubmissionLookupMaps());
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Khai báo biến/hằng số.
    const res = await api.get<unknown>('/Submission/get-by-status', {
// [VI] Thực thi một bước trong luồng xử lý.
      params: {
// [VI] Thực thi một bước trong luồng xử lý.
        ...(params.status !== undefined ? { status: params.status } : {}),
// [VI] Thực thi một bước trong luồng xử lý.
        page: params.page ?? 1,
// [VI] Thực thi một bước trong luồng xử lý.
        pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
// [VI] Thực thi một bước trong luồng xử lý.
      },
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Khai báo hàm/biểu thức hàm.
    return extractSubmissionRows(res).map((row) => mapSubmissionToLocalRecording(row, lookups));
// [VI] Thực thi một bước trong luồng xử lý.
  } catch (err: unknown) {
// [VI] Thực thi một bước trong luồng xử lý.
    // Backend returns 400 when no records match the status filter (instead of 200 + [])
// [VI] Khai báo biến/hằng số.
    const status = (err as { response?: { status?: number } })?.response?.status;
// [VI] Rẽ nhánh điều kiện (if).
    if (status === 400 || status === 404) return [];
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
    throw err; // Propagate unexpected errors
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
async function getAdminSubmissions(params: {
// [VI] Thực thi một bước trong luồng xử lý.
  page?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  pageSize?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  status?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  reviewer?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  lookups?: SubmissionLookupMaps;
// [VI] Thực thi một bước trong luồng xử lý.
}): Promise<LocalRecording[]> {
// [VI] Khai báo biến/hằng số.
  const lookups = params.lookups ?? (await buildSubmissionLookupMaps());
// [VI] Khai báo biến/hằng số.
  const res = await api.get<unknown>('/Admin/submissions', {
// [VI] Thực thi một bước trong luồng xử lý.
    params: {
// [VI] Thực thi một bước trong luồng xử lý.
      page: params.page ?? 1,
// [VI] Thực thi một bước trong luồng xử lý.
      pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
// [VI] Thực thi một bước trong luồng xử lý.
      ...(params.status ? { status: params.status } : {}),
// [VI] Thực thi một bước trong luồng xử lý.
      ...(params.reviewer ? { reviewer: params.reviewer } : {}),
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Khai báo hàm/biểu thức hàm.
  return extractSubmissionRows(res).map((row) => mapSubmissionToLocalRecording(row, lookups));
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function fetchExpertQueueBase(source: ExpertQueueSource): Promise<LocalRecording[]> {
// [VI] Rẽ nhánh điều kiện (if).
  if (EXPERT_QUEUE_USE_MOCK) {
// [VI] Trả về kết quả từ hàm.
    return buildMockExpertQueue();
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Khai báo biến/hằng số.
  const lookups = await buildSubmissionLookupMaps();
// [VI] Rẽ nhánh điều kiện (if).
  if (source === 'admin') {
// [VI] Trả về kết quả từ hàm.
    return getAdminSubmissions({ page: 1, pageSize: DEFAULT_PAGE_SIZE, lookups });
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
  // Moderation queue requirement: only fetch submissions with backend status = 1.
// [VI] Thực thi một bước trong luồng xử lý.
  // Keep a single source of truth from API instead of mixing multiple statuses.
// [VI] Trả về kết quả từ hàm.
  return getSubmissionsByStatus({
// [VI] Thực thi một bước trong luồng xử lý.
    status: 1,
// [VI] Thực thi một bước trong luồng xử lý.
    page: 1,
// [VI] Thực thi một bước trong luồng xử lý.
    pageSize: DEFAULT_PAGE_SIZE,
// [VI] Thực thi một bước trong luồng xử lý.
    lookups,
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Fetch approved submissions (backend status=2) for the Expert "Quản lý bản thu đã kiểm duyệt" page.
// [VI] Thực thi một bước trong luồng xử lý.
 * Uses GET /Submission/get-by-status instead of /Submission/my (which is Contributor-only).
// [VI] Thực thi một bước trong luồng xử lý.
 * Returns [] silently if backend returns 400/404 (no records found).
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function fetchApprovedSubmissionsForExpert(): Promise<LocalRecording[]> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Trả về kết quả từ hàm.
    return await getSubmissionsByStatus({ status: 2, page: 1, pageSize: DEFAULT_PAGE_SIZE });
// [VI] Thực thi một bước trong luồng xử lý.
  } catch (err: unknown) {
// [VI] Khai báo biến/hằng số.
    const status = (err as { response?: { status?: number } })?.response?.status;
// [VI] Rẽ nhánh điều kiện (if).
    if (status === 400 || status === 404) return [];
// [VI] Thực thi một bước trong luồng xử lý.
    logServiceWarn('[expertModerationApi] fetchApprovedSubmissionsForExpert failed', status);
// [VI] Trả về kết quả từ hàm.
    return [];
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** Result of POST /Admin/submissions/{id}/assign — never throws. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type AssignReviewerResult =
// [VI] Thực thi một bước trong luồng xử lý.
  | { ok: true }
// [VI] Thực thi một bước trong luồng xử lý.
  | { ok: false; forbidden: boolean; httpStatus?: number };

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * POST /Admin/submissions/{id}/assign — wrapped in try/catch.
// [VI] Thực thi một bước trong luồng xử lý.
 * On 403 Forbidden: returns `{ ok: false, forbidden: true }` and logs a console warning (RBAC not ready).
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function assignSubmissionReviewer(
// [VI] Thực thi một bước trong luồng xử lý.
  submissionId: string,
// [VI] Thực thi một bước trong luồng xử lý.
  reviewerId: string | null,
// [VI] Thực thi một bước trong luồng xử lý.
): Promise<AssignReviewerResult> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Thực thi một bước trong luồng xử lý.
    await apiClient.post(`/Admin/submissions/${submissionId}/assign`, {
// [VI] Thực thi một bước trong luồng xử lý.
      reviewerId,
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Trả về kết quả từ hàm.
    return { ok: true };
// [VI] Thực thi một bước trong luồng xử lý.
  } catch (err: unknown) {
// [VI] Rẽ nhánh điều kiện (if).
    if (axios.isAxiosError(err)) {
// [VI] Khai báo biến/hằng số.
      const status = err.response?.status;
// [VI] Rẽ nhánh điều kiện (if).
      if (status === 403) {
// [VI] Thực thi một bước trong luồng xử lý.
        logServiceWarn(
// [VI] Thực thi một bước trong luồng xử lý.
          '[expertModerationApi] Assign reviewer forbidden (403). RBAC may not allow this role yet. submissionId=',
// [VI] Thực thi một bước trong luồng xử lý.
          { submissionId, reviewerId },
// [VI] Thực thi một bước trong luồng xử lý.
        );
// [VI] Trả về kết quả từ hàm.
        return { ok: false, forbidden: true, httpStatus: 403 };
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceWarn('[expertModerationApi] Assign reviewer failed', {
// [VI] Thực thi một bước trong luồng xử lý.
        submissionId,
// [VI] Thực thi một bước trong luồng xử lý.
        reviewerId,
// [VI] Thực thi một bước trong luồng xử lý.
        status,
// [VI] Thực thi một bước trong luồng xử lý.
        message: err.message,
// [VI] Thực thi một bước trong luồng xử lý.
      });
// [VI] Trả về kết quả từ hàm.
      return { ok: false, forbidden: false, httpStatus: status };
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
    logServiceWarn('[expertModerationApi] Assign reviewer unexpected error', err);
// [VI] Trả về kết quả từ hàm.
    return { ok: false, forbidden: false };
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function approveSubmissionOnServer(submissionId: string): Promise<MutationResult> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Thực thi một bước trong luồng xử lý.
    await api.put('/Submission/approve-submission', undefined, {
// [VI] Thực thi một bước trong luồng xử lý.
      params: { submissionId },
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Trả về kết quả từ hàm.
    return mutationOk();
// [VI] Thực thi một bước trong luồng xử lý.
  } catch (err: unknown) {
// [VI] Khai báo biến/hằng số.
    const httpStatus = axios.isAxiosError(err) ? err.response?.status : undefined;
// [VI] Trả về kết quả từ hàm.
    return mutationFail(err, httpStatus);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function rejectSubmissionOnServer(submissionId: string): Promise<MutationResult> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Thực thi một bước trong luồng xử lý.
    await api.put('/Submission/reject-submission', undefined, {
// [VI] Thực thi một bước trong luồng xử lý.
      params: { submissionId },
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Trả về kết quả từ hàm.
    return mutationOk();
// [VI] Thực thi một bước trong luồng xử lý.
  } catch (err: unknown) {
// [VI] Khai báo biến/hằng số.
    const httpStatus = axios.isAxiosError(err) ? err.response?.status : undefined;
// [VI] Trả về kết quả từ hàm.
    return mutationFail(err, httpStatus);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** OpenAPI AuditLogDto — POST /AuditLog (expert moderation trail, Phase 2). */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type ExpertModerationAuditPayload = {
// [VI] Thực thi một bước trong luồng xử lý.
  userId: string;
// [VI] Thực thi một bước trong luồng xử lý.
  submissionId: string;
// [VI] Thực thi một bước trong luồng xử lý.
  action: 'expert_approve' | 'expert_reject';
// [VI] Thực thi một bước trong luồng xử lý.
  /** Serialized into newValuesJson */
// [VI] Thực thi một bước trong luồng xử lý.
  notesSummary: string;
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function postExpertModerationAuditLog(
// [VI] Thực thi một bước trong luồng xử lý.
  params: ExpertModerationAuditPayload,
// [VI] Thực thi một bước trong luồng xử lý.
): Promise<boolean> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Khai báo biến/hằng số.
    const newValuesJson = JSON.stringify({
// [VI] Thực thi một bước trong luồng xử lý.
      submissionId: params.submissionId,
// [VI] Thực thi một bước trong luồng xử lý.
      expertNotes: params.notesSummary,
// [VI] Thực thi một bước trong luồng xử lý.
      source: 'expert_moderation',
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
    await api.post('/AuditLog', {
// [VI] Thực thi một bước trong luồng xử lý.
      userId: params.userId,
// [VI] Thực thi một bước trong luồng xử lý.
      entityType: 'Submission',
// [VI] Thực thi một bước trong luồng xử lý.
      entityId: params.submissionId,
// [VI] Thực thi một bước trong luồng xử lý.
      action: params.action,
// [VI] Thực thi một bước trong luồng xử lý.
      oldValuesJson: null,
// [VI] Thực thi một bước trong luồng xử lý.
      newValuesJson,
// [VI] Thực thi một bước trong luồng xử lý.
      createdAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Trả về kết quả từ hàm.
    return true;
// [VI] Thực thi một bước trong luồng xử lý.
  } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
    logServiceWarn('[expertModerationApi] Audit log POST failed', err);
// [VI] Trả về kết quả từ hàm.
    return false;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}
