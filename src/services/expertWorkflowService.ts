// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Phase 1: base list GET /Submission/my + local overlay (EXPERT_MODERATION_STATE).
// [VI] Thực thi một bước trong luồng xử lý.
 * Phase 2 (VITE_EXPERT_API_PHASE2=true): queue from get-by-status or Admin submissions;
// [VI] Thực thi một bước trong luồng xử lý.
 * claim/unclaim/approve/reject call server first, then overlay (notes / verification).
// [VI] Thực thi một bước trong luồng xử lý.
 */

// [VI] Nhập (import) các phụ thuộc cho file.
import { EXPERT_API_PHASE2, EXPERT_QUEUE_SOURCE } from '@/config/expertWorkflowPhase';
// [VI] Nhập (import) các phụ thuộc cho file.
import {
// [VI] Thực thi một bước trong luồng xử lý.
  approveSubmissionOnServer,
// [VI] Thực thi một bước trong luồng xử lý.
  assignSubmissionReviewer,
// [VI] Thực thi một bước trong luồng xử lý.
  fetchExpertQueueBase,
// [VI] Thực thi một bước trong luồng xử lý.
  postExpertModerationAuditLog,
// [VI] Thực thi một bước trong luồng xử lý.
  rejectSubmissionOnServer,
// [VI] Thực thi một bước trong luồng xử lý.
} from '@/services/expertModerationApi';
// [VI] Nhập (import) các phụ thuộc cho file.
import { getLocalRecordingMetaList } from '@/services/recordingStorage';
// [VI] Nhập (import) các phụ thuộc cho file.
import { logServiceWarn } from '@/services/serviceLogger';
// [VI] Nhập (import) các phụ thuộc cho file.
import { getItemAsync, setItem } from '@/services/storageService';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { LocalRecording } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { ModerationStatus } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { MutationResult } from '@/types/mutationResult';
// [VI] Nhập (import) các phụ thuộc cho file.
import { mutationOk } from '@/types/mutationResult';

// [VI] Thực thi một bước trong luồng xử lý.
// Phase 1 Spike: storage key — replace with server session / assign API in Phase 2.
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const EXPERT_MODERATION_STATE_KEY = 'EXPERT_MODERATION_STATE';

// [VI] Thực thi một bước trong luồng xử lý.
/** Phase 1 (and Phase 2 draft): working expert notes per submissionId in localStorage. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const EXPERT_REVIEW_NOTES_KEY = 'EXPERT_REVIEW_NOTES_BY_SUBMISSION';

// [VI] Thực thi một bước trong luồng xử lý.
/** Checkbox / form state for the 3-step verification wizard (matches ModerationPage). */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface ModerationVerificationData {
// [VI] Thực thi một bước trong luồng xử lý.
  step1?: {
// [VI] Thực thi một bước trong luồng xử lý.
    infoComplete: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
    infoAccurate: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
    formatCorrect: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
    notes?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    completedAt?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
  step2?: {
// [VI] Thực thi một bước trong luồng xử lý.
    culturalValue: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
    authenticity: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
    accuracy: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
    expertNotes?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    completedAt?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
  step3?: {
// [VI] Thực thi một bước trong luồng xử lý.
    crossChecked: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
    sourcesVerified: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
    finalApproval: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
    finalNotes?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    completedAt?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** Expert-owned moderation fields persisted locally until Phase 2 API. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface LocalModerationState {
// [VI] Thực thi một bước trong luồng xử lý.
  status?: ModerationStatus | string;
// [VI] Thực thi một bước trong luồng xử lý.
  claimedBy?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  claimedByName?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  claimedAt?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  reviewerId?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  reviewerName?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  reviewedAt?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  verificationStep?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  /** `null` clears persisted verification (JSON survives round-trip; `undefined` omits key). */
// [VI] Thực thi một bước trong luồng xử lý.
  verificationData?: ModerationVerificationData | null;
// [VI] Thực thi một bước trong luồng xử lý.
  rejectionNote?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  /** Phase 1 Spike: expert-facing notes (approve / reject confirm); Phase 2 → API audit. */
// [VI] Thực thi một bước trong luồng xử lý.
  notes?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  contributorEditLocked?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  /** Phase 2: POST assign returned 403 — claim exists in overlay only (local/mock). */
// [VI] Thực thi một bước trong luồng xử lý.
  assignBlockedByRbac?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** Per-submission patch stored under EXPERT_MODERATION_STATE. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface ExpertSubmissionLocalPatch {
// [VI] Thực thi một bước trong luồng xử lý.
  moderation: LocalModerationState;
// [VI] Thực thi một bước trong luồng xử lý.
  resubmittedForModeration?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type ExpertModerationStateMap = Record<string, ExpertSubmissionLocalPatch>;

// [VI] Khai báo hàm/biểu thức hàm.
function mergeVerificationData(
// [VI] Thực thi một bước trong luồng xử lý.
  base?: ModerationVerificationData,
// [VI] Thực thi một bước trong luồng xử lý.
  next?: ModerationVerificationData | null,
// [VI] Thực thi một bước trong luồng xử lý.
): ModerationVerificationData | undefined {
// [VI] Rẽ nhánh điều kiện (if).
  if (next === null) return undefined;
// [VI] Rẽ nhánh điều kiện (if).
  if (!base && !next) return undefined;
// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    ...base,
// [VI] Thực thi một bước trong luồng xử lý.
    ...next,
// [VI] Thực thi một bước trong luồng xử lý.
    step1: { ...base?.step1, ...next?.step1 },
// [VI] Thực thi một bước trong luồng xử lý.
    step2: { ...base?.step2, ...next?.step2 },
// [VI] Thực thi một bước trong luồng xử lý.
    step3: { ...base?.step3, ...next?.step3 },
// [VI] Thực thi một bước trong luồng xử lý.
  } as ModerationVerificationData;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
async function readMap(): Promise<ExpertModerationStateMap> {
// [VI] Khai báo biến/hằng số.
  const raw = await getItemAsync(EXPERT_MODERATION_STATE_KEY);
// [VI] Rẽ nhánh điều kiện (if).
  if (!raw) return {};
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Khai báo biến/hằng số.
    const p = JSON.parse(raw) as unknown;
// [VI] Rẽ nhánh điều kiện (if).
    if (p && typeof p === 'object' && !Array.isArray(p)) return p as ExpertModerationStateMap;
// [VI] Thực thi một bước trong luồng xử lý.
  } catch {
// [VI] Thực thi một bước trong luồng xử lý.
    /* ignore */
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return {};
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
async function writeMap(map: ExpertModerationStateMap): Promise<void> {
// [VI] Thực thi một bước trong luồng xử lý.
  await setItem(EXPERT_MODERATION_STATE_KEY, JSON.stringify(map));
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
async function readReviewNotesMap(): Promise<Record<string, string>> {
// [VI] Khai báo biến/hằng số.
  const raw = await getItemAsync(EXPERT_REVIEW_NOTES_KEY);
// [VI] Rẽ nhánh điều kiện (if).
  if (!raw) return {};
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Khai báo biến/hằng số.
    const p = JSON.parse(raw) as unknown;
// [VI] Rẽ nhánh điều kiện (if).
    if (p && typeof p === 'object' && !Array.isArray(p)) return p as Record<string, string>;
// [VI] Thực thi một bước trong luồng xử lý.
  } catch {
// [VI] Thực thi một bước trong luồng xử lý.
    /* ignore */
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return {};
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
async function writeReviewNotesMap(map: Record<string, string>): Promise<void> {
// [VI] Thực thi một bước trong luồng xử lý.
  await setItem(EXPERT_REVIEW_NOTES_KEY, JSON.stringify(map));
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function mergeBaseWithPatch(
// [VI] Thực thi một bước trong luồng xử lý.
  base: LocalRecording,
// [VI] Thực thi một bước trong luồng xử lý.
  patch?: ExpertSubmissionLocalPatch | null,
// [VI] Thực thi một bước trong luồng xử lý.
): LocalRecording {
// [VI] Rẽ nhánh điều kiện (if).
  if (!patch) return base;
// [VI] Khai báo biến/hằng số.
  const merged: LocalRecording = { ...base };
// [VI] Rẽ nhánh điều kiện (if).
  if (patch.resubmittedForModeration !== undefined) {
// [VI] Thực thi một bước trong luồng xử lý.
    merged.resubmittedForModeration = patch.resubmittedForModeration;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Khai báo biến/hằng số.
  const bm = base.moderation ?? {};
// [VI] Khai báo biến/hằng số.
  const pm = patch.moderation;
// [VI] Khai báo biến/hằng số.
  const prevVd = (bm as { verificationData?: ModerationVerificationData }).verificationData;
// [VI] Khai báo biến/hằng số.
  const nextVd = pm.verificationData;
// [VI] Khai báo biến/hằng số.
  const mergedModeration: Record<string, unknown> = { ...bm, ...pm };
// [VI] Rẽ nhánh điều kiện (if).
  if (nextVd === null) {
// [VI] Thực thi một bước trong luồng xử lý.
    delete mergedModeration.verificationData;
// [VI] Thực thi một bước trong luồng xử lý.
  } else {
// [VI] Thực thi một bước trong luồng xử lý.
    mergedModeration.verificationData = mergeVerificationData(prevVd, nextVd ?? undefined);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
  merged.moderation = mergedModeration as LocalRecording['moderation'];
// [VI] Trả về kết quả từ hàm.
  return merged;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type ClaimSubmissionResult =
// [VI] Thực thi một bước trong luồng xử lý.
  | { success: true; serverAssignSynced?: boolean; assignBlockedByRbac?: boolean }
// [VI] Thực thi một bước trong luồng xử lý.
  | { success: false };

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type ExpertOverlaySnapshot = ExpertSubmissionLocalPatch | undefined;

// [VI] Khai báo hàm/biểu thức hàm.
function deepClonePatch(patch: ExpertSubmissionLocalPatch): ExpertSubmissionLocalPatch {
// [VI] Trả về kết quả từ hàm.
  return JSON.parse(JSON.stringify(patch)) as ExpertSubmissionLocalPatch;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
async function applyApproveToMap(
// [VI] Thực thi một bước trong luồng xử lý.
  submissionId: string,
// [VI] Thực thi một bước trong luồng xử lý.
  expertId: string,
// [VI] Thực thi một bước trong luồng xử lý.
  expertUsername: string,
// [VI] Thực thi một bước trong luồng xử lý.
  verificationData: ModerationVerificationData | undefined,
// [VI] Thực thi một bước trong luồng xử lý.
  notes: string,
// [VI] Thực thi một bước trong luồng xử lý.
): Promise<void> {
// [VI] Khai báo biến/hằng số.
  const map = await readMap();
// [VI] Khai báo biến/hằng số.
  const prev = map[submissionId]?.moderation ?? {};
// [VI] Khai báo biến/hằng số.
  const trimmedNotes = notes.trim();
// [VI] Khai báo biến/hằng số.
  const moderation: LocalModerationState = {
// [VI] Thực thi một bước trong luồng xử lý.
    ...prev,
// [VI] Thực thi một bước trong luồng xử lý.
    status: ModerationStatus.APPROVED,
// [VI] Thực thi một bước trong luồng xử lý.
    reviewerId: expertId,
// [VI] Thực thi một bước trong luồng xử lý.
    reviewerName: expertUsername,
// [VI] Thực thi một bước trong luồng xử lý.
    reviewedAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
    claimedBy: null,
// [VI] Thực thi một bước trong luồng xử lý.
    claimedByName: null,
// [VI] Thực thi một bước trong luồng xử lý.
    claimedAt: null,
// [VI] Thực thi một bước trong luồng xử lý.
    verificationStep: undefined,
// [VI] Thực thi một bước trong luồng xử lý.
    verificationData: mergeVerificationData(
// [VI] Thực thi một bước trong luồng xử lý.
      prev.verificationData === null ? undefined : prev.verificationData,
// [VI] Thực thi một bước trong luồng xử lý.
      verificationData,
// [VI] Thực thi một bước trong luồng xử lý.
    ),
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
  delete moderation.assignBlockedByRbac;
// [VI] Rẽ nhánh điều kiện (if).
  if (trimmedNotes) moderation.notes = trimmedNotes;
// [VI] Nhánh điều kiện bổ sung (else).
  else delete moderation.notes;
// [VI] Thực thi một bước trong luồng xử lý.
  map[submissionId] = {
// [VI] Thực thi một bước trong luồng xử lý.
    resubmittedForModeration: false,
// [VI] Thực thi một bước trong luồng xử lý.
    moderation,
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
  await writeMap(map);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
async function applyRejectToMap(
// [VI] Thực thi một bước trong luồng xử lý.
  submissionId: string,
// [VI] Thực thi một bước trong luồng xử lý.
  expertId: string,
// [VI] Thực thi một bước trong luồng xử lý.
  expertUsername: string,
// [VI] Thực thi một bước trong luồng xử lý.
  type: 'direct' | 'temporary',
// [VI] Thực thi một bước trong luồng xử lý.
  rejectionNote: string,
// [VI] Thực thi một bước trong luồng xử lý.
  notes: string,
// [VI] Thực thi một bước trong luồng xử lý.
  opts?: { wasResubmitted?: boolean },
// [VI] Thực thi một bước trong luồng xử lý.
): Promise<void> {
// [VI] Khai báo biến/hằng số.
  const map = await readMap();
// [VI] Khai báo biến/hằng số.
  const prev = map[submissionId]?.moderation ?? {};
// [VI] Khai báo biến/hằng số.
  const lockFromReject = type === 'direct' && opts?.wasResubmitted === true;
// [VI] Khai báo biến/hằng số.
  const trimmedExpertNotes = notes.trim();
// [VI] Khai báo biến/hằng số.
  const moderation: LocalModerationState = {
// [VI] Thực thi một bước trong luồng xử lý.
    ...prev,
// [VI] Thực thi một bước trong luồng xử lý.
    status: type === 'direct' ? ModerationStatus.REJECTED : ModerationStatus.TEMPORARILY_REJECTED,
// [VI] Thực thi một bước trong luồng xử lý.
    reviewerId: expertId,
// [VI] Thực thi một bước trong luồng xử lý.
    reviewerName: expertUsername,
// [VI] Thực thi một bước trong luồng xử lý.
    reviewedAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
    rejectionNote: rejectionNote || '',
// [VI] Thực thi một bước trong luồng xử lý.
    contributorEditLocked: lockFromReject || prev.contributorEditLocked,
// [VI] Thực thi một bước trong luồng xử lý.
    claimedBy: null,
// [VI] Thực thi một bước trong luồng xử lý.
    claimedByName: null,
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
  delete moderation.assignBlockedByRbac;
// [VI] Rẽ nhánh điều kiện (if).
  if (trimmedExpertNotes) moderation.notes = trimmedExpertNotes;
// [VI] Nhánh điều kiện bổ sung (else).
  else delete moderation.notes;
// [VI] Thực thi một bước trong luồng xử lý.
  map[submissionId] = {
// [VI] Thực thi một bước trong luồng xử lý.
    ...map[submissionId],
// [VI] Thực thi một bước trong luồng xử lý.
    moderation,
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
  await writeMap(map);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const expertWorkflowService = {
// [VI] Thực thi một bước trong luồng xử lý.
  /**
// [VI] Thực thi một bước trong luồng xử lý.
   * Working notes while reviewing (Phase 1 & 2 draft): persisted in localStorage by submissionId.
// [VI] Thực thi một bước trong luồng xử lý.
   */
// [VI] Thực thi một bước trong luồng xử lý.
  async getExpertReviewNotes(submissionId: string): Promise<string> {
// [VI] Khai báo biến/hằng số.
    const m = await readReviewNotesMap();
// [VI] Trả về kết quả từ hàm.
    return m[submissionId] ?? '';
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Phase 1: persist to localStorage. Phase 2: same for draft; server audit on approve/reject via logExpertModerationDecision. */
// [VI] Thực thi một bước trong luồng xử lý.
  async setExpertReviewNotes(submissionId: string, text: string): Promise<void> {
// [VI] Khai báo biến/hằng số.
    const m = await readReviewNotesMap();
// [VI] Khai báo biến/hằng số.
    const t = text.trim();
// [VI] Rẽ nhánh điều kiện (if).
    if (!t) delete m[submissionId];
// [VI] Nhánh điều kiện bổ sung (else).
    else m[submissionId] = text;
// [VI] Thực thi một bước trong luồng xử lý.
    await writeReviewNotesMap(m);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  async clearExpertReviewNotes(submissionId: string): Promise<void> {
// [VI] Khai báo biến/hằng số.
    const m = await readReviewNotesMap();
// [VI] Rẽ nhánh điều kiện (if).
    if (!(submissionId in m)) return;
// [VI] Thực thi một bước trong luồng xử lý.
    delete m[submissionId];
// [VI] Thực thi một bước trong luồng xử lý.
    await writeReviewNotesMap(m);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Phase 2: POST /AuditLog with expert notes after successful approve/reject on server. Phase 1: no-op. */
// [VI] Thực thi một bước trong luồng xử lý.
  async logExpertModerationDecision(params: {
// [VI] Thực thi một bước trong luồng xử lý.
    submissionId: string;
// [VI] Thực thi một bước trong luồng xử lý.
    userId: string;
// [VI] Thực thi một bước trong luồng xử lý.
    action: 'expert_approve' | 'expert_reject';
// [VI] Thực thi một bước trong luồng xử lý.
    combinedNotes: string;
// [VI] Thực thi một bước trong luồng xử lý.
  }): Promise<boolean> {
// [VI] Rẽ nhánh điều kiện (if).
    if (!EXPERT_API_PHASE2) return true;
// [VI] Khai báo biến/hằng số.
    const summary = params.combinedNotes.trim();
// [VI] Rẽ nhánh điều kiện (if).
    if (!summary) return true;
// [VI] Trả về kết quả từ hàm.
    return postExpertModerationAuditLog({
// [VI] Thực thi một bước trong luồng xử lý.
      userId: params.userId,
// [VI] Thực thi một bước trong luồng xử lý.
      submissionId: params.submissionId,
// [VI] Thực thi một bước trong luồng xử lý.
      action: params.action,
// [VI] Thực thi một bước trong luồng xử lý.
      notesSummary: summary,
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /**
// [VI] Thực thi một bước trong luồng xử lý.
   * Phase 1 Spike: API base list + local overlay merge.
// [VI] Thực thi một bước trong luồng xử lý.
   * Phase 2: point base fetch to Admin submissions; keep overlay merge optional for optimistic UI.
// [VI] Thực thi một bước trong luồng xử lý.
   */
// [VI] Thực thi một bước trong luồng xử lý.
  async getQueue(): Promise<LocalRecording[]> {
// [VI] Khai báo biến/hằng số.
    const baseList = EXPERT_API_PHASE2
// [VI] Thực thi một bước trong luồng xử lý.
      ? await fetchExpertQueueBase(EXPERT_QUEUE_SOURCE)
// [VI] Thực thi một bước trong luồng xử lý.
      : await getLocalRecordingMetaList();
// [VI] Khai báo biến/hằng số.
    const map = await readMap();
// [VI] Khai báo hàm/biểu thức hàm.
    return baseList.map((item) => {
// [VI] Khai báo biến/hằng số.
      const id = item.id;
// [VI] Rẽ nhánh điều kiện (if).
      if (!id) return item;
// [VI] Trả về kết quả từ hàm.
      return mergeBaseWithPatch(item, map[id] ?? null);
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Merge overlay onto a single recording (detail panel / dialog). Phase 1 Spike. */
// [VI] Thực thi một bước trong luồng xử lý.
  async applyOverlayToRecording(base: LocalRecording | null): Promise<LocalRecording | null> {
// [VI] Rẽ nhánh điều kiện (if).
    if (!base?.id) return base;
// [VI] Khai báo biến/hằng số.
    const map = await readMap();
// [VI] Trả về kết quả từ hàm.
    return mergeBaseWithPatch(base, map[base.id] ?? null);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /**
// [VI] Thực thi một bước trong luồng xử lý.
   * Claim submission: Phase 2 calls POST /Admin/submissions/{id}/assign first.
// [VI] Thực thi một bước trong luồng xử lý.
   * On 403 Forbidden (RBAC): logs warning, applies local overlay only and returns success with assignBlockedByRbac.
// [VI] Thực thi một bước trong luồng xử lý.
   */
// [VI] Thực thi một bước trong luồng xử lý.
  async claimSubmission(
// [VI] Thực thi một bước trong luồng xử lý.
    submissionId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    expertId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    expertUsername: string,
// [VI] Thực thi một bước trong luồng xử lý.
  ): Promise<ClaimSubmissionResult> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      let serverAssignSynced = !EXPERT_API_PHASE2;
// [VI] Khai báo biến/hằng số.
      let assignBlockedByRbac = false;

// [VI] Rẽ nhánh điều kiện (if).
      if (EXPERT_API_PHASE2) {
// [VI] Khai báo biến/hằng số.
        const assignResult = await assignSubmissionReviewer(submissionId, expertId);
// [VI] Rẽ nhánh điều kiện (if).
        if (assignResult.ok) {
// [VI] Thực thi một bước trong luồng xử lý.
          serverAssignSynced = true;
// [VI] Thực thi một bước trong luồng xử lý.
        } else if (assignResult.forbidden) {
// [VI] Thực thi một bước trong luồng xử lý.
          logServiceWarn(
// [VI] Thực thi một bước trong luồng xử lý.
            '[expertWorkflowService] Claim: server assign returned 403 — using local overlay only (mock claim). submissionId=',
// [VI] Thực thi một bước trong luồng xử lý.
            submissionId,
// [VI] Thực thi một bước trong luồng xử lý.
          );
// [VI] Thực thi một bước trong luồng xử lý.
          serverAssignSynced = false;
// [VI] Thực thi một bước trong luồng xử lý.
          assignBlockedByRbac = true;
// [VI] Thực thi một bước trong luồng xử lý.
        } else {
// [VI] Trả về kết quả từ hàm.
          return { success: false };
// [VI] Thực thi một bước trong luồng xử lý.
        }
// [VI] Thực thi một bước trong luồng xử lý.
      }

// [VI] Khai báo biến/hằng số.
      const map = await readMap();
// [VI] Khai báo biến/hằng số.
      const prev = map[submissionId]?.moderation ?? {};
// [VI] Khai báo biến/hằng số.
      const moderation: LocalModerationState = {
// [VI] Thực thi một bước trong luồng xử lý.
        ...prev,
// [VI] Thực thi một bước trong luồng xử lý.
        status: ModerationStatus.IN_REVIEW,
// [VI] Thực thi một bước trong luồng xử lý.
        claimedBy: expertId,
// [VI] Thực thi một bước trong luồng xử lý.
        claimedByName: expertUsername,
// [VI] Thực thi một bước trong luồng xử lý.
        claimedAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
        verificationStep: prev.verificationStep ?? 1,
// [VI] Thực thi một bước trong luồng xử lý.
      };
// [VI] Rẽ nhánh điều kiện (if).
      if (assignBlockedByRbac) moderation.assignBlockedByRbac = true;
// [VI] Nhánh điều kiện bổ sung (else).
      else delete moderation.assignBlockedByRbac;

// [VI] Thực thi một bước trong luồng xử lý.
      map[submissionId] = {
// [VI] Thực thi một bước trong luồng xử lý.
        ...map[submissionId],
// [VI] Thực thi một bước trong luồng xử lý.
        moderation,
// [VI] Thực thi một bước trong luồng xử lý.
      };
// [VI] Thực thi một bước trong luồng xử lý.
      await writeMap(map);

// [VI] Rẽ nhánh điều kiện (if).
      if (EXPERT_API_PHASE2) {
// [VI] Trả về kết quả từ hàm.
        return {
// [VI] Thực thi một bước trong luồng xử lý.
          success: true,
// [VI] Thực thi một bước trong luồng xử lý.
          serverAssignSynced,
// [VI] Thực thi một bước trong luồng xử lý.
          assignBlockedByRbac,
// [VI] Thực thi một bước trong luồng xử lý.
        };
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Trả về kết quả từ hàm.
      return { success: true };
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceWarn('[expertWorkflowService] claimSubmission failed', err);
// [VI] Trả về kết quả từ hàm.
      return { success: false };
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  async unclaimSubmission(submissionId: string): Promise<boolean> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Rẽ nhánh điều kiện (if).
      if (EXPERT_API_PHASE2) {
// [VI] Khai báo biến/hằng số.
        const res = await assignSubmissionReviewer(submissionId, null);
// [VI] Rẽ nhánh điều kiện (if).
        if (!res.ok) {
// [VI] Rẽ nhánh điều kiện (if).
          if (res.forbidden) {
// [VI] Thực thi một bước trong luồng xử lý.
            logServiceWarn(
// [VI] Thực thi một bước trong luồng xử lý.
              '[expertWorkflowService] Unclaim: server unassign returned 403 — clearing local overlay only. submissionId=',
// [VI] Thực thi một bước trong luồng xử lý.
              submissionId,
// [VI] Thực thi một bước trong luồng xử lý.
            );
// [VI] Thực thi một bước trong luồng xử lý.
          } else {
// [VI] Trả về kết quả từ hàm.
            return false;
// [VI] Thực thi một bước trong luồng xử lý.
          }
// [VI] Thực thi một bước trong luồng xử lý.
        }
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Khai báo biến/hằng số.
      const map = await readMap();
// [VI] Khai báo biến/hằng số.
      const prev = map[submissionId]?.moderation ?? {};
// [VI] Thực thi một bước trong luồng xử lý.
      map[submissionId] = {
// [VI] Thực thi một bước trong luồng xử lý.
        ...map[submissionId],
// [VI] Thực thi một bước trong luồng xử lý.
        moderation: {
// [VI] Thực thi một bước trong luồng xử lý.
          ...prev,
// [VI] Thực thi một bước trong luồng xử lý.
          status: ModerationStatus.PENDING_REVIEW,
// [VI] Thực thi một bước trong luồng xử lý.
          claimedBy: null,
// [VI] Thực thi một bước trong luồng xử lý.
          claimedByName: null,
// [VI] Thực thi một bước trong luồng xử lý.
          claimedAt: null,
// [VI] Thực thi một bước trong luồng xử lý.
          verificationStep: undefined,
// [VI] Thực thi một bước trong luồng xử lý.
          assignBlockedByRbac: undefined,
// [VI] Thực thi một bước trong luồng xử lý.
          // Phase 1 Spike: null clears checklist after JSON round-trip (undefined would be dropped).
// [VI] Thực thi một bước trong luồng xử lý.
          verificationData: null,
// [VI] Thực thi một bước trong luồng xử lý.
        },
// [VI] Thực thi một bước trong luồng xử lý.
      };
// [VI] Thực thi một bước trong luồng xử lý.
      await writeMap(map);
// [VI] Trả về kết quả từ hàm.
      return true;
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceWarn('[expertWorkflowService] unclaimSubmission failed', err);
// [VI] Trả về kết quả từ hàm.
      return false;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Deep copy of overlay row for optimistic revert. */
// [VI] Thực thi một bước trong luồng xử lý.
  async snapshotSubmissionOverlay(submissionId: string): Promise<ExpertOverlaySnapshot> {
// [VI] Khai báo biến/hằng số.
    const map = await readMap();
// [VI] Khai báo biến/hằng số.
    const row = map[submissionId];
// [VI] Rẽ nhánh điều kiện (if).
    if (!row) return undefined;
// [VI] Trả về kết quả từ hàm.
    return deepClonePatch(row);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Restore overlay after failed server sync (or delete row if snapshot was undefined). */
// [VI] Thực thi một bước trong luồng xử lý.
  async restoreSubmissionOverlay(
// [VI] Thực thi một bước trong luồng xử lý.
    submissionId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    snapshot: ExpertOverlaySnapshot,
// [VI] Thực thi một bước trong luồng xử lý.
  ): Promise<void> {
// [VI] Khai báo biến/hằng số.
    const map = await readMap();
// [VI] Rẽ nhánh điều kiện (if).
    if (snapshot === undefined) delete map[submissionId];
// [VI] Nhánh điều kiện bổ sung (else).
    else map[submissionId] = deepClonePatch(snapshot);
// [VI] Thực thi một bước trong luồng xử lý.
    await writeMap(map);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Persist approve to EXPERT_MODERATION_STATE only (no API). */
// [VI] Thực thi một bước trong luồng xử lý.
  async commitApproveLocal(
// [VI] Thực thi một bước trong luồng xử lý.
    submissionId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    expertId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    expertUsername: string,
// [VI] Thực thi một bước trong luồng xử lý.
    verificationData: ModerationVerificationData | undefined,
// [VI] Thực thi một bước trong luồng xử lý.
    notes: string,
// [VI] Thực thi một bước trong luồng xử lý.
  ): Promise<void> {
// [VI] Thực thi một bước trong luồng xử lý.
    await applyApproveToMap(submissionId, expertId, expertUsername, verificationData, notes);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Persist reject to EXPERT_MODERATION_STATE only (no API). */
// [VI] Thực thi một bước trong luồng xử lý.
  async commitRejectLocal(
// [VI] Thực thi một bước trong luồng xử lý.
    submissionId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    expertId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    expertUsername: string,
// [VI] Thực thi một bước trong luồng xử lý.
    type: 'direct' | 'temporary',
// [VI] Thực thi một bước trong luồng xử lý.
    rejectionNote: string,
// [VI] Thực thi một bước trong luồng xử lý.
    notes: string,
// [VI] Thực thi một bước trong luồng xử lý.
    opts?: { wasResubmitted?: boolean },
// [VI] Thực thi một bước trong luồng xử lý.
  ): Promise<void> {
// [VI] Thực thi một bước trong luồng xử lý.
    await applyRejectToMap(
// [VI] Thực thi một bước trong luồng xử lý.
      submissionId,
// [VI] Thực thi một bước trong luồng xử lý.
      expertId,
// [VI] Thực thi một bước trong luồng xử lý.
      expertUsername,
// [VI] Thực thi một bước trong luồng xử lý.
      type,
// [VI] Thực thi một bước trong luồng xử lý.
      rejectionNote,
// [VI] Thực thi một bước trong luồng xử lý.
      notes,
// [VI] Thực thi một bước trong luồng xử lý.
      opts,
// [VI] Thực thi một bước trong luồng xử lý.
    );
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Phase 2: PUT approve-submission; Phase 1: no-op success. Luôn trả MutationResult (không nuốt lỗi). */
// [VI] Thực thi một bước trong luồng xử lý.
  async syncApproveToServer(submissionId: string): Promise<MutationResult> {
// [VI] Rẽ nhánh điều kiện (if).
    if (!EXPERT_API_PHASE2) return mutationOk();
// [VI] Trả về kết quả từ hàm.
    return approveSubmissionOnServer(submissionId);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Phase 2: PUT reject-submission; Phase 1: no-op success. */
// [VI] Thực thi một bước trong luồng xử lý.
  async syncRejectToServer(submissionId: string): Promise<MutationResult> {
// [VI] Rẽ nhánh điều kiện (if).
    if (!EXPERT_API_PHASE2) return mutationOk();
// [VI] Trả về kết quả từ hàm.
    return rejectSubmissionOnServer(submissionId);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Sequential: server (Phase 2) then local map — for non-optimistic callers. */
// [VI] Thực thi một bước trong luồng xử lý.
  async approveSubmission(
// [VI] Thực thi một bước trong luồng xử lý.
    submissionId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    expertId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    expertUsername: string,
// [VI] Thực thi một bước trong luồng xử lý.
    verificationData: ModerationVerificationData | undefined,
// [VI] Thực thi một bước trong luồng xử lý.
    notes: string,
// [VI] Thực thi một bước trong luồng xử lý.
  ): Promise<boolean> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Rẽ nhánh điều kiện (if).
      if (EXPERT_API_PHASE2) {
// [VI] Khai báo biến/hằng số.
        const serverRes = await approveSubmissionOnServer(submissionId);
// [VI] Rẽ nhánh điều kiện (if).
        if (!serverRes.ok) return false;
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
      await applyApproveToMap(submissionId, expertId, expertUsername, verificationData, notes);
// [VI] Trả về kết quả từ hàm.
      return true;
// [VI] Thực thi một bước trong luồng xử lý.
    } catch {
// [VI] Trả về kết quả từ hàm.
      return false;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  async rejectSubmission(
// [VI] Thực thi một bước trong luồng xử lý.
    submissionId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    expertId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    expertUsername: string,
// [VI] Thực thi một bước trong luồng xử lý.
    type: 'direct' | 'temporary',
// [VI] Thực thi một bước trong luồng xử lý.
    rejectionNote: string,
// [VI] Thực thi một bước trong luồng xử lý.
    notes: string,
// [VI] Thực thi một bước trong luồng xử lý.
    opts?: { wasResubmitted?: boolean },
// [VI] Thực thi một bước trong luồng xử lý.
  ): Promise<boolean> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Rẽ nhánh điều kiện (if).
      if (EXPERT_API_PHASE2) {
// [VI] Khai báo biến/hằng số.
        const serverRes = await rejectSubmissionOnServer(submissionId);
// [VI] Rẽ nhánh điều kiện (if).
        if (!serverRes.ok) return false;
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
      await applyRejectToMap(
// [VI] Thực thi một bước trong luồng xử lý.
        submissionId,
// [VI] Thực thi một bước trong luồng xử lý.
        expertId,
// [VI] Thực thi một bước trong luồng xử lý.
        expertUsername,
// [VI] Thực thi một bước trong luồng xử lý.
        type,
// [VI] Thực thi một bước trong luồng xử lý.
        rejectionNote,
// [VI] Thực thi một bước trong luồng xử lý.
        notes,
// [VI] Thực thi một bước trong luồng xử lý.
        opts,
// [VI] Thực thi một bước trong luồng xử lý.
      );
// [VI] Trả về kết quả từ hàm.
      return true;
// [VI] Thực thi một bước trong luồng xử lý.
    } catch {
// [VI] Trả về kết quả từ hàm.
      return false;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  async updateVerificationStep(
// [VI] Thực thi một bước trong luồng xử lý.
    submissionId: string,
// [VI] Thực thi một bước trong luồng xử lý.
    payload: { verificationStep: number; verificationData?: ModerationVerificationData },
// [VI] Thực thi một bước trong luồng xử lý.
  ): Promise<boolean> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const map = await readMap();
// [VI] Khai báo biến/hằng số.
      const prev = map[submissionId]?.moderation ?? {};
// [VI] Thực thi một bước trong luồng xử lý.
      map[submissionId] = {
// [VI] Thực thi một bước trong luồng xử lý.
        ...map[submissionId],
// [VI] Thực thi một bước trong luồng xử lý.
        moderation: {
// [VI] Thực thi một bước trong luồng xử lý.
          ...prev,
// [VI] Thực thi một bước trong luồng xử lý.
          verificationStep: payload.verificationStep,
// [VI] Thực thi một bước trong luồng xử lý.
          verificationData: mergeVerificationData(
// [VI] Thực thi một bước trong luồng xử lý.
            prev.verificationData === null ? undefined : prev.verificationData,
// [VI] Thực thi một bước trong luồng xử lý.
            payload.verificationData,
// [VI] Thực thi một bước trong luồng xử lý.
          ),
// [VI] Thực thi một bước trong luồng xử lý.
        },
// [VI] Thực thi một bước trong luồng xử lý.
      };
// [VI] Thực thi một bước trong luồng xử lý.
      await writeMap(map);
// [VI] Trả về kết quả từ hàm.
      return true;
// [VI] Thực thi một bước trong luồng xử lý.
    } catch {
// [VI] Trả về kết quả từ hàm.
      return false;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Phase 1 Spike: call after successful DELETE /Submission so overlay does not resurrect stale rows. */
// [VI] Thực thi một bước trong luồng xử lý.
  async removeSubmissionOverlay(submissionId: string): Promise<void> {
// [VI] Khai báo biến/hằng số.
    const map = await readMap();
// [VI] Rẽ nhánh điều kiện (if).
    if (!(submissionId in map)) return;
// [VI] Thực thi một bước trong luồng xử lý.
    delete map[submissionId];
// [VI] Thực thi một bước trong luồng xử lý.
    await writeMap(map);
// [VI] Khai báo biến/hằng số.
    const notesMap = await readReviewNotesMap();
// [VI] Rẽ nhánh điều kiện (if).
    if (submissionId in notesMap) {
// [VI] Thực thi một bước trong luồng xử lý.
      delete notesMap[submissionId];
// [VI] Thực thi một bước trong luồng xử lý.
      await writeReviewNotesMap(notesMap);
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
};
