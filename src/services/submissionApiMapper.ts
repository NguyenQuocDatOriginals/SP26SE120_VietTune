// [VI] Nhập (import) các phụ thuộc cho file.
import type { LocalRecording } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { ModerationStatus } from '@/types';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface SubmissionLookupMaps {
// [VI] Thực thi một bước trong luồng xử lý.
  ethnicById?: Record<string, string>;
// [VI] Thực thi một bước trong luồng xử lý.
  ceremonyById?: Record<string, string>;
// [VI] Thực thi một bước trong luồng xử lý.
  instrumentById?: Record<string, string>;
// [VI] Thực thi một bước trong luồng xử lý.
  communeById?: Record<string, string>;
// [VI] Thực thi một bước trong luồng xử lý.
  districtById?: Record<string, string>;
// [VI] Thực thi một bước trong luồng xử lý.
  provinceById?: Record<string, string>;
// [VI] Thực thi một bước trong luồng xử lý.
  /** Normalized province UUID → “vùng/miền” label from `province.regionCode` (not tên phường/xã). */
// [VI] Thực thi một bước trong luồng xử lý.
  macroRegionByProvinceId?: Record<string, string>;
// [VI] Thực thi một bước trong luồng xử lý.
  /** Normalized district UUID → normalized province UUID */
// [VI] Thực thi một bước trong luồng xử lý.
  provinceIdByDistrictId?: Record<string, string>;
// [VI] Thực thi một bước trong luồng xử lý.
  /** Normalized commune UUID → normalized district UUID */
// [VI] Thực thi một bước trong luồng xử lý.
  districtIdByCommuneId?: Record<string, string>;
// [VI] Thực thi một bước trong luồng xử lý.
}

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
/** Địa lý cấp tỉnh → nhãn vùng/miền; không dùng tên phường/xã/huyện cho “Vùng miền”. */
// [VI] Khai báo hàm/biểu thức hàm.
function macroRegionLabelFromGeo(
// [VI] Thực thi một bước trong luồng xử lý.
  lookups: SubmissionLookupMaps | undefined,
// [VI] Thực thi một bước trong luồng xử lý.
  provinceId: string | undefined,
// [VI] Thực thi một bước trong luồng xử lý.
  districtId: string | undefined,
// [VI] Thực thi một bước trong luồng xử lý.
  communeId: string | undefined,
// [VI] Thực thi một bước trong luồng xử lý.
): string | undefined {
// [VI] Rẽ nhánh điều kiện (if).
  if (!lookups?.macroRegionByProvinceId) return undefined;
// [VI] Khai báo biến/hằng số.
  const byProv = lookups.macroRegionByProvinceId;
// [VI] Khai báo biến/hằng số.
  let pid = provinceId ? normalizeId(provinceId) : '';
// [VI] Rẽ nhánh điều kiện (if).
  if (!pid && districtId && lookups.provinceIdByDistrictId) {
// [VI] Thực thi một bước trong luồng xử lý.
    pid = lookups.provinceIdByDistrictId[normalizeId(districtId)] ?? '';
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Rẽ nhánh điều kiện (if).
  if (!pid && communeId && lookups.districtIdByCommuneId && lookups.provinceIdByDistrictId) {
// [VI] Khai báo biến/hằng số.
    const did = lookups.districtIdByCommuneId[normalizeId(communeId)] ?? '';
// [VI] Rẽ nhánh điều kiện (if).
    if (did) pid = lookups.provinceIdByDistrictId[did] ?? '';
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Rẽ nhánh điều kiện (if).
  if (!pid) return undefined;
// [VI] Khai báo biến/hằng số.
  const label = byProv[pid];
// [VI] Trả về kết quả từ hàm.
  return label?.trim() || undefined;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Maps backend SubmissionStatus (int) → UI enum.
// [VI] Thực thi một bước trong luồng xử lý.
 * Current backend payload for moderation queue uses `status = 1` as Pending.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Khai báo biến/hằng số.
const SUBMISSION_STATUS_INT: Record<number, ModerationStatus> = {
// [VI] Thực thi một bước trong luồng xử lý.
  0: ModerationStatus.PENDING_REVIEW,
// [VI] Thực thi một bước trong luồng xử lý.
  1: ModerationStatus.PENDING_REVIEW,
// [VI] Thực thi một bước trong luồng xử lý.
  2: ModerationStatus.APPROVED,
// [VI] Thực thi một bước trong luồng xử lý.
  3: ModerationStatus.REJECTED,
// [VI] Thực thi một bước trong luồng xử lý.
  4: ModerationStatus.TEMPORARILY_REJECTED,
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function mapApiSubmissionStatusToModeration(raw: unknown): ModerationStatus | string {
// [VI] Rẽ nhánh điều kiện (if).
  if (raw === null || raw === undefined) return ModerationStatus.PENDING_REVIEW;
// [VI] Rẽ nhánh điều kiện (if).
  if (typeof raw === 'string') {
// [VI] Khai báo biến/hằng số.
    const v = raw.trim();
// [VI] Rẽ nhánh điều kiện (if).
    if (/^\d+$/.test(v)) {
// [VI] Khai báo biến/hằng số.
      const n = Number(v);
// [VI] Khai báo biến/hằng số.
      const mapped = SUBMISSION_STATUS_INT[n];
// [VI] Trả về kết quả từ hàm.
      return mapped ?? ModerationStatus.PENDING_REVIEW;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Khai báo biến/hằng số.
    const normalized = v.toLowerCase().replace(/[\s-]+/g, '_');
// [VI] Rẽ nhánh điều kiện (if).
    if (normalized === 'pending' || normalized === 'pending_review') {
// [VI] Trả về kết quả từ hàm.
      return ModerationStatus.PENDING_REVIEW;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Rẽ nhánh điều kiện (if).
    if (normalized === 'in_review' || normalized === 'reviewing') {
// [VI] Trả về kết quả từ hàm.
      return ModerationStatus.IN_REVIEW;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Rẽ nhánh điều kiện (if).
    if (normalized === 'approved' || normalized === 'accept') {
// [VI] Trả về kết quả từ hàm.
      return ModerationStatus.APPROVED;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Rẽ nhánh điều kiện (if).
    if (
// [VI] Thực thi một bước trong luồng xử lý.
      normalized === 'rejected' ||
// [VI] Thực thi một bước trong luồng xử lý.
      normalized === 'reject' ||
// [VI] Thực thi một bước trong luồng xử lý.
      normalized === 'permanently_rejected'
// [VI] Thực thi một bước trong luồng xử lý.
    ) {
// [VI] Trả về kết quả từ hàm.
      return ModerationStatus.REJECTED;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Rẽ nhánh điều kiện (if).
    if (
// [VI] Thực thi một bước trong luồng xử lý.
      normalized === 'temporarily_rejected' ||
// [VI] Thực thi một bước trong luồng xử lý.
      normalized === 'temp_rejected' ||
// [VI] Thực thi một bước trong luồng xử lý.
      normalized === 'revision_required'
// [VI] Thực thi một bước trong luồng xử lý.
    ) {
// [VI] Trả về kết quả từ hàm.
      return ModerationStatus.TEMPORARILY_REJECTED;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Rẽ nhánh điều kiện (if).
    if ((Object.values(ModerationStatus) as string[]).includes(v)) return v as ModerationStatus;
// [VI] Trả về kết quả từ hàm.
    return v;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Rẽ nhánh điều kiện (if).
  if (typeof raw === 'number' && Number.isFinite(raw)) {
// [VI] Khai báo biến/hằng số.
    const mapped = SUBMISSION_STATUS_INT[raw];
// [VI] Trả về kết quả từ hàm.
    return mapped ?? ModerationStatus.PENDING_REVIEW;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return ModerationStatus.PENDING_REVIEW;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** Normalize list payloads from various VietTune API envelope shapes. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function extractSubmissionRows(res: unknown): Record<string, unknown>[] {
// [VI] Rẽ nhánh điều kiện (if).
  if (!res) return [];
// [VI] Rẽ nhánh điều kiện (if).
  if (Array.isArray(res)) return res as Record<string, unknown>[];
// [VI] Khai báo biến/hằng số.
  const r = res as Record<string, unknown>;
// [VI] Rẽ nhánh điều kiện (if).
  if (Array.isArray(r.data)) return r.data as Record<string, unknown>[];
// [VI] Khai báo biến/hằng số.
  const data = r.data as Record<string, unknown> | undefined;
// [VI] Rẽ nhánh điều kiện (if).
  if (data && Array.isArray(data.items)) return data.items as Record<string, unknown>[];
// [VI] Rẽ nhánh điều kiện (if).
  if (Array.isArray(r.items)) return r.items as Record<string, unknown>[];
// [VI] Thực thi một bước trong luồng xử lý.
  // PascalCase (.NET JSON without camelCase resolver)
// [VI] Rẽ nhánh điều kiện (if).
  if (Array.isArray(r.Data)) return r.Data as Record<string, unknown>[];
// [VI] Khai báo biến/hằng số.
  const dataP = r.Data as Record<string, unknown> | undefined;
// [VI] Rẽ nhánh điều kiện (if).
  if (dataP && Array.isArray(dataP.Items)) return dataP.Items as Record<string, unknown>[];
// [VI] Rẽ nhánh điều kiện (if).
  if (dataP && Array.isArray(dataP.items)) return dataP.items as Record<string, unknown>[];
// [VI] Rẽ nhánh điều kiện (if).
  if (Array.isArray(r.Items)) return r.Items as Record<string, unknown>[];
// [VI] Trả về kết quả từ hàm.
  return [];
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Map a submission object from GET /Submission/* or admin list to LocalRecording (meta).
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function mapSubmissionToLocalRecording(
// [VI] Thực thi một bước trong luồng xử lý.
  x: Record<string, unknown>,
// [VI] Thực thi một bước trong luồng xử lý.
  lookups?: SubmissionLookupMaps,
// [VI] Thực thi một bước trong luồng xử lý.
): LocalRecording {
// [VI] Khai báo biến/hằng số.
  const rec =
// [VI] Thực thi một bước trong luồng xử lý.
    x.recording && typeof x.recording === 'object'
// [VI] Thực thi một bước trong luồng xử lý.
      ? (x.recording as Record<string, unknown>)
// [VI] Thực thi một bước trong luồng xử lý.
      : null;

// [VI] Khai báo biến/hằng số.
  const submissionId = String(x.id ?? '');
// [VI] Khai báo biến/hằng số.
  const recordingEntityId = rec?.id != null && String(rec.id).trim() ? String(rec.id).trim() : '';
// [VI] Khai báo biến/hằng số.
  const id = recordingEntityId || submissionId;
// [VI] Khai báo biến/hằng số.
  const title =
// [VI] Thực thi một bước trong luồng xử lý.
    (rec?.title as string | undefined) || (x.title as string | undefined) || 'Không có tiêu đề';
// [VI] Khai báo biến/hằng số.
  const audioFileUrl =
// [VI] Thực thi một bước trong luồng xử lý.
    (rec?.audioFileUrl as string | undefined) ??
// [VI] Thực thi một bước trong luồng xử lý.
    (x.audioFileUrl as string | undefined) ??
// [VI] Thực thi một bước trong luồng xử lý.
    undefined;
// [VI] Khai báo biến/hằng số.
  const videoFileUrl =
// [VI] Thực thi một bước trong luồng xử lý.
    (rec?.videoFileUrl as string | undefined) ??
// [VI] Thực thi một bước trong luồng xử lý.
    (x.videoFileUrl as string | undefined) ??
// [VI] Thực thi một bước trong luồng xử lý.
    undefined;
// [VI] Khai báo biến/hằng số.
  const statusRaw = x.status;
// [VI] Khai báo biến/hằng số.
  const moderationStatus = mapApiSubmissionStatusToModeration(statusRaw);
// [VI] Khai báo biến/hằng số.
  const reviewerId =
// [VI] Thực thi một bước trong luồng xử lý.
    (x.reviewerId as string | undefined) ??
// [VI] Thực thi một bước trong luồng xử lý.
    (x.assignedReviewerId as string | undefined) ??
// [VI] Thực thi một bước trong luồng xử lý.
    (x.claimedBy as string | undefined);

// [VI] Khai báo biến/hằng số.
  const claimedBy =
// [VI] Thực thi một bước trong luồng xử lý.
    moderationStatus === ModerationStatus.IN_REVIEW && reviewerId ? reviewerId : undefined;
// [VI] Khai báo biến/hằng số.
  const decisionReviewerId =
// [VI] Thực thi một bước trong luồng xử lý.
    moderationStatus === ModerationStatus.APPROVED ||
// [VI] Thực thi một bước trong luồng xử lý.
    moderationStatus === ModerationStatus.REJECTED ||
// [VI] Thực thi một bước trong luồng xử lý.
    moderationStatus === ModerationStatus.TEMPORARILY_REJECTED
// [VI] Thực thi một bước trong luồng xử lý.
      ? reviewerId
// [VI] Thực thi một bước trong luồng xử lý.
      : undefined;

// [VI] Khai báo biến/hằng số.
  const instrumentIds = Array.isArray(rec?.instrumentIds) ? (rec?.instrumentIds as unknown[]) : [];
// [VI] Khai báo biến/hằng số.
  const instrumentObjects = Array.isArray(rec?.instruments)
// [VI] Thực thi một bước trong luồng xử lý.
    ? (rec?.instruments as Array<Record<string, unknown>>)
// [VI] Thực thi một bước trong luồng xử lý.
    : [];
// [VI] Khai báo biến/hằng số.
  const mappedInstrumentNames = instrumentIds
// [VI] Khai báo hàm/biểu thức hàm.
    .map((v) => String(v || '').trim())
// [VI] Thực thi một bước trong luồng xử lý.
    .filter(Boolean)
// [VI] Khai báo hàm/biểu thức hàm.
    .map((idVal) => lookups?.instrumentById?.[normalizeId(idVal)] || `ID:${idVal}`);
// [VI] Khai báo biến/hằng số.
  const embeddedInstrumentNames = instrumentObjects
// [VI] Khai báo hàm/biểu thức hàm.
    .map((it) => String(it?.name ?? it?.nameVietnamese ?? '').trim())
// [VI] Thực thi một bước trong luồng xử lý.
    .filter(Boolean);
// [VI] Khai báo biến/hằng số.
  const instrumentNames =
// [VI] Thực thi một bước trong luồng xử lý.
    mappedInstrumentNames.length > 0 ? mappedInstrumentNames : embeddedInstrumentNames;

// [VI] Khai báo biến/hằng số.
  const communeId = (rec?.communeId as string | undefined) || (x.communeId as string | undefined);
// [VI] Khai báo biến/hằng số.
  const districtId =
// [VI] Thực thi một bước trong luồng xử lý.
    (rec?.districtId as string | undefined) || (x.districtId as string | undefined);
// [VI] Khai báo biến/hằng số.
  const provinceId =
// [VI] Thực thi một bước trong luồng xử lý.
    (rec?.provinceId as string | undefined) || (x.provinceId as string | undefined);

// [VI] Khai báo biến/hằng số.
  const ethnicityFromApi =
// [VI] Thực thi một bước trong luồng xử lý.
    (x.ethnicityName as string | undefined) ||
// [VI] Thực thi một bước trong luồng xử lý.
    (rec?.ethnicityName as string | undefined) ||
// [VI] Thực thi một bước trong luồng xử lý.
    (rec?.ethnicGroupName as string | undefined) ||
// [VI] Thực thi một bước trong luồng xử lý.
    ((rec?.ethnicGroup as Record<string, unknown> | undefined)?.name as string | undefined) ||
// [VI] Thực thi một bước trong luồng xử lý.
    (rec?.ethnicGroupId
// [VI] Thực thi một bước trong luồng xử lý.
      ? lookups?.ethnicById?.[normalizeId(rec.ethnicGroupId)] || `ID:${String(rec.ethnicGroupId)}`
// [VI] Thực thi một bước trong luồng xử lý.
      : undefined);

// [VI] Khai báo biến/hằng số.
  const eventTypeFromApi =
// [VI] Thực thi một bước trong luồng xử lý.
    (x.ceremonyName as string | undefined) ||
// [VI] Thực thi một bước trong luồng xử lý.
    (rec?.ceremonyName as string | undefined) ||
// [VI] Thực thi một bước trong luồng xử lý.
    ((rec?.ceremony as Record<string, unknown> | undefined)?.name as string | undefined) ||
// [VI] Thực thi một bước trong luồng xử lý.
    (rec?.ceremonyId
// [VI] Thực thi một bước trong luồng xử lý.
      ? lookups?.ceremonyById?.[normalizeId(rec.ceremonyId)] || `ID:${String(rec.ceremonyId)}`
// [VI] Thực thi một bước trong luồng xử lý.
      : undefined);

// [VI] Khai báo biến/hằng số.
  const explicitRegion =
// [VI] Thực thi một bước trong luồng xử lý.
    (typeof rec?.region === 'string' && rec.region.trim() ? rec.region.trim() : undefined) ||
// [VI] Thực thi một bước trong luồng xử lý.
    (typeof x.region === 'string' && x.region.trim() ? x.region.trim() : undefined);
// [VI] Khai báo biến/hằng số.
  const regionMacroLabel =
// [VI] Thực thi một bước trong luồng xử lý.
    macroRegionLabelFromGeo(lookups, provinceId, districtId, communeId) ||
// [VI] Thực thi một bước trong luồng xử lý.
    explicitRegion ||
// [VI] Thực thi một bước trong luồng xử lý.
    undefined;

// [VI] Khai báo biến/hằng số.
  const mapped: LocalRecording = {
// [VI] Thực thi một bước trong luồng xử lý.
    id,
// [VI] Thực thi một bước trong luồng xử lý.
    ...(submissionId ? { submissionId } : {}),
// [VI] Thực thi một bước trong luồng xử lý.
    title,
// [VI] Thực thi một bước trong luồng xử lý.
    mediaType: audioFileUrl ? 'audio' : videoFileUrl ? 'video' : undefined,
// [VI] Thực thi một bước trong luồng xử lý.
    audioUrl: audioFileUrl,
// [VI] Thực thi một bước trong luồng xử lý.
    videoData: videoFileUrl,
// [VI] Thực thi một bước trong luồng xử lý.
    moderation: {
// [VI] Thực thi một bước trong luồng xử lý.
      status: moderationStatus,
// [VI] Thực thi một bước trong luồng xử lý.
      ...(claimedBy ? { claimedBy } : {}),
// [VI] Thực thi một bước trong luồng xử lý.
      ...(decisionReviewerId ? { reviewerId: decisionReviewerId } : {}),
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    uploadedDate: (x.createdAt as string) || (x.submittedAt as string) || new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
    basicInfo: {
// [VI] Thực thi một bước trong luồng xử lý.
      title,
// [VI] Thực thi một bước trong luồng xử lý.
      artist:
// [VI] Thực thi một bước trong luồng xử lý.
        (rec?.performerName as string | undefined) ||
// [VI] Thực thi một bước trong luồng xử lý.
        (x.performerName as string | undefined) ||
// [VI] Thực thi một bước trong luồng xử lý.
        (x.submittedBy as string | undefined),
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    uploader: {
// [VI] Thực thi một bước trong luồng xử lý.
      id:
// [VI] Thực thi một bước trong luồng xử lý.
        (rec?.uploadedById as string | undefined) ||
// [VI] Thực thi một bước trong luồng xử lý.
        (x.uploadedById as string | undefined) ||
// [VI] Thực thi một bước trong luồng xử lý.
        (x.contributorId as string | undefined) ||
// [VI] Thực thi một bước trong luồng xử lý.
        '',
// [VI] Thực thi một bước trong luồng xử lý.
      username: (x.submittedBy as string | undefined) || undefined,
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    culturalContext: {
// [VI] Thực thi một bước trong luồng xử lý.
      ethnicity: ethnicityFromApi,
// [VI] Thực thi một bước trong luồng xử lý.
      region: regionMacroLabel,
// [VI] Thực thi một bước trong luồng xử lý.
      province:
// [VI] Thực thi một bước trong luồng xử lý.
        (communeId ? lookups?.communeById?.[normalizeId(communeId)] : undefined) ||
// [VI] Thực thi một bước trong luồng xử lý.
        (rec?.communeName as string | undefined) ||
// [VI] Thực thi một bước trong luồng xử lý.
        (rec?.recordingLocation as string | undefined) ||
// [VI] Thực thi một bước trong luồng xử lý.
        undefined,
// [VI] Thực thi một bước trong luồng xử lý.
      eventType: eventTypeFromApi,
// [VI] Thực thi một bước trong luồng xử lý.
      instruments: instrumentNames,
// [VI] Thực thi một bước trong luồng xử lý.
      performanceType: (rec?.performanceContext as string | undefined) || undefined,
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    ...(typeof rec?.durationSeconds === 'number' && Number.isFinite(rec.durationSeconds)
// [VI] Thực thi một bước trong luồng xử lý.
      ? { duration: Math.floor(rec.durationSeconds as number) }
// [VI] Thực thi một bước trong luồng xử lý.
      : {}),
// [VI] Thực thi một bước trong luồng xử lý.
    ...(rec?.description && String(rec.description).trim()
// [VI] Thực thi một bước trong luồng xử lý.
      ? { description: String(rec.description).trim() }
// [VI] Thực thi một bước trong luồng xử lý.
      : {}),
// [VI] Thực thi một bước trong luồng xử lý.
    ...(rec?.recordingDate && String(rec.recordingDate).trim()
// [VI] Thực thi một bước trong luồng xử lý.
      ? { recordedDate: String(rec.recordingDate).trim() }
// [VI] Thực thi một bước trong luồng xử lý.
      : {}),
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Trả về kết quả từ hàm.
  return mapped;
// [VI] Thực thi một bước trong luồng xử lý.
}
