// [VI] Nhập (import) các phụ thuộc cho file.
import type { ModerationVerificationData } from '@/services/expertWorkflowService';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { ModerationStatus } from '@/types';

// [VI] Thực thi một bước trong luồng xử lý.
/** Queue / overlay shape for expert moderation list items (aligned with expertWorkflowService). */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface LocalRecordingMini {
// [VI] Thực thi một bước trong luồng xử lý.
  id?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  title?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  mediaType?: 'audio' | 'video' | 'youtube';
// [VI] Thực thi một bước trong luồng xử lý.
  audioData?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  audioUrl?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  videoData?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  youtubeUrl?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  basicInfo?: {
// [VI] Thực thi một bước trong luồng xử lý.
    title?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    artist?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    composer?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    language?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    genre?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    recordingDate?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    dateEstimated?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
    dateNote?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    recordingLocation?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
  culturalContext?: {
// [VI] Thực thi một bước trong luồng xử lý.
    ethnicity?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    region?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    province?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    eventType?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    performanceType?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    instruments?: string[];
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
  additionalNotes?: {
// [VI] Thực thi một bước trong luồng xử lý.
    description?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    fieldNotes?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    transcription?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    hasLyricsFile?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
  adminInfo?: {
// [VI] Thực thi một bước trong luồng xử lý.
    collector?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    copyright?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    archiveOrg?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    catalogId?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
  uploadedAt?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  uploader?: { id?: string; username?: string };
// [VI] Thực thi một bước trong luồng xử lý.
  moderation?: {
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
    verificationData?: ModerationVerificationData;
// [VI] Thực thi một bước trong luồng xử lý.
    rejectionNote?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    notes?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    contributorEditLocked?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
    assignBlockedByRbac?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
  resubmittedForModeration?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
}
