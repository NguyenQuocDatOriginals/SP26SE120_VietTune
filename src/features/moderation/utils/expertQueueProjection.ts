import type { LocalRecordingMini } from '@/features/moderation/types/localRecordingQueue.types';
import { mapApiSubmissionStatusToModeration } from '@/services/submissionApiMapper';
import { ModerationStatus } from '@/types';

export function normalizeQueueStatus(
  status?: ModerationStatus | string,
): ModerationStatus | string {
  return mapApiSubmissionStatusToModeration(status);
}

/** Same expert + filter + sort rules as queue `load()` — for optimistic list updates without refetch. */
export function projectModerationLists(
  migrated: LocalRecordingMini[],
  userId: string | undefined,
  statusFilter: string,
  dateSort: 'newest' | 'oldest',
): { expertItems: LocalRecordingMini[]; visibleItems: LocalRecordingMini[] } {
  const expertItems = migrated.filter((r) => {
    const status = normalizeQueueStatus(r.moderation?.status);
    if (r.moderation?.claimedBy === userId) return true;
    if (!r.moderation?.claimedBy && status === ModerationStatus.PENDING_REVIEW) return true;
    if (r.moderation?.reviewerId === userId) return true;
    return false;
  });
  let filtered = expertItems;
  if (statusFilter !== 'ALL') {
    filtered = filtered.filter((r) => normalizeQueueStatus(r.moderation?.status) === statusFilter);
  }
  filtered = [...filtered].sort((a, b) => {
    const aDate =
      (a as LocalRecordingMini & { uploadedDate?: string }).uploadedDate ||
      a.uploadedAt ||
      a.moderation?.reviewedAt ||
      '';
    const bDate =
      (b as LocalRecordingMini & { uploadedDate?: string }).uploadedDate ||
      b.uploadedAt ||
      b.moderation?.reviewedAt ||
      '';
    const dateA = new Date(aDate || 0).getTime();
    const dateB = new Date(bDate || 0).getTime();
    return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
  });
  return { expertItems, visibleItems: filtered };
}
