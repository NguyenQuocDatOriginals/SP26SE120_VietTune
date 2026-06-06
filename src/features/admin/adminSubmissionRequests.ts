import type { DeleteRecordingRequest, EditRecordingRequest } from '@/types';

export type AdminSubmissionRow = {
  id: string;
  title: string;
  status: string;
  reviewerId?: string;
  submittedBy?: string;
  submittedAt?: string;
};

const STATUS_BY_NUMBER: Record<number, string> = {
  0: 'Draft',
  1: 'Pending',
  2: 'Approved',
  3: 'Rejected',
  4: 'UpdateRequested',
  5: 'Embargoed',
};

function normalizeStatus(raw: unknown): string {
  if (raw == null) return '';
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return STATUS_BY_NUMBER[raw] ?? String(raw);
  }
  return String(raw).trim();
}

function rowFromRecord(r: Record<string, unknown>): AdminSubmissionRow | null {
  const id = String(r.id ?? r.Id ?? '').trim();
  if (!id) return null;
  return {
    id,
    title: String(r.title ?? r.Title ?? 'Không có tiêu đề'),
    status: normalizeStatus(r.status ?? r.Status),
    reviewerId: String(r.reviewerId ?? r.ReviewerId ?? '').trim() || undefined,
    submittedBy: String(r.submittedBy ?? r.SubmittedBy ?? r.contributorId ?? r.ContributorId ?? '').trim() || undefined,
    submittedAt: String(r.submittedAt ?? r.SubmittedAt ?? r.createdAt ?? r.CreatedAt ?? '').trim() || undefined,
  };
}

export function parseAdminSubmissionRows(rows: Record<string, unknown>[]): AdminSubmissionRow[] {
  return rows.map(rowFromRecord).filter((r): r is AdminSubmissionRow => r !== null);
}

function isUpdateRequestedStatus(status: string): boolean {
  const s = status.trim().toLowerCase().replace(/[\s_-]+/g, '');
  return s === 'updaterequested' || s === '4';
}

/** Edit requests: submissions in UpdateRequested state (swagger: SubmissionStatus = 4). */
export function deriveEditRecordingRequests(
  rows: AdminSubmissionRow[],
  userNameById?: Map<string, string>,
): EditRecordingRequest[] {
  return rows
    .filter((r) => isUpdateRequestedStatus(r.status))
    .map((r) => ({
      id: r.id,
      recordingId: r.id,
      recordingTitle: r.title,
      contributorId: r.submittedBy ?? '',
      contributorName: userNameById?.get(r.submittedBy ?? '') ?? r.submittedBy ?? 'Người đóng góp',
      requestedAt: r.submittedAt ?? new Date().toISOString(),
      status: 'pending' as const,
    }));
}

/**
 * Delete requests: swagger has no dedicated delete-request status on SubmissionAdminDto.
 * Returns empty until BE adds a representable state.
 */
export function deriveDeleteRecordingRequests(rows: AdminSubmissionRow[]): DeleteRecordingRequest[] {
  void rows;
  return [];
}
