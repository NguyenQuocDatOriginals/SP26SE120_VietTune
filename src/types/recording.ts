// [VI] Nhập (import) các phụ thuộc cho file.
import { ModerationStatus } from '@/types/moderation';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { Ethnicity, Instrument, Performer, Region } from '@/types/reference';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { User } from '@/types/user';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface Recording {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  title: string;
// [VI] Thực thi một bước trong luồng xử lý.
  titleVietnamese?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  description?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  ethnicity: Ethnicity;
// [VI] Thực thi một bước trong luồng xử lý.
  region: Region;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingType: RecordingType;
// [VI] Thực thi một bước trong luồng xử lý.
  duration: number;
// [VI] Thực thi một bước trong luồng xử lý.
  audioUrl: string;
// [VI] Thực thi một bước trong luồng xử lý.
  waveformUrl?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  coverImage?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  instruments: Instrument[];
// [VI] Thực thi một bước trong luồng xử lý.
  performers: Performer[];
// [VI] Thực thi một bước trong luồng xử lý.
  recordedDate?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  uploadedDate: string;
// [VI] Thực thi một bước trong luồng xử lý.
  uploader: User;
// [VI] Thực thi một bước trong luồng xử lý.
  tags: string[];
// [VI] Thực thi một bước trong luồng xử lý.
  metadata: RecordingMetadata;
// [VI] Thực thi một bước trong luồng xử lý.
  verificationStatus: VerificationStatus;
// [VI] Thực thi một bước trong luồng xử lý.
  verifiedBy?: User;
// [VI] Thực thi một bước trong luồng xử lý.
  viewCount: number;
// [VI] Thực thi một bước trong luồng xử lý.
  likeCount: number;
// [VI] Thực thi một bước trong luồng xử lý.
  downloadCount: number;
// [VI] Thực thi một bước trong luồng xử lý.
  _semanticScore?: number;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface RecordingMetadata {
// [VI] Thực thi một bước trong luồng xử lý.
  tuningSystem?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  modalStructure?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  tempo?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  ritualContext?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  regionalVariation?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  lyrics?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  lyricsTranslation?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  transcription?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  culturalSignificance?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  historicalContext?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingQuality: RecordingQuality;
// [VI] Thực thi một bước trong luồng xử lý.
  originalSource?: string;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export enum RecordingType {
// [VI] Thực thi một bước trong luồng xử lý.
  INSTRUMENTAL = 'INSTRUMENTAL',
// [VI] Thực thi một bước trong luồng xử lý.
  VOCAL = 'VOCAL',
// [VI] Thực thi một bước trong luồng xử lý.
  CEREMONIAL = 'CEREMONIAL',
// [VI] Thực thi một bước trong luồng xử lý.
  FOLK_SONG = 'FOLK_SONG',
// [VI] Thực thi một bước trong luồng xử lý.
  EPIC = 'EPIC',
// [VI] Thực thi một bước trong luồng xử lý.
  LULLABY = 'LULLABY',
// [VI] Thực thi một bước trong luồng xử lý.
  WORK_SONG = 'WORK_SONG',
// [VI] Thực thi một bước trong luồng xử lý.
  OTHER = 'OTHER',
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export enum RecordingQuality {
// [VI] Thực thi một bước trong luồng xử lý.
  PROFESSIONAL = 'PROFESSIONAL',
// [VI] Thực thi một bước trong luồng xử lý.
  FIELD_RECORDING = 'FIELD_RECORDING',
// [VI] Thực thi một bước trong luồng xử lý.
  ARCHIVE = 'ARCHIVE',
// [VI] Thực thi một bước trong luồng xử lý.
  DIGITIZED = 'DIGITIZED',
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export enum VerificationStatus {
// [VI] Thực thi một bước trong luồng xử lý.
  PENDING = 'PENDING',
// [VI] Thực thi một bước trong luồng xử lý.
  VERIFIED = 'VERIFIED',
// [VI] Thực thi một bước trong luồng xử lý.
  REJECTED = 'REJECTED',
// [VI] Thực thi một bước trong luồng xử lý.
  UNDER_REVIEW = 'UNDER_REVIEW',
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface UploadRecordingForm {
// [VI] Thực thi một bước trong luồng xử lý.
  title: string;
// [VI] Thực thi một bước trong luồng xử lý.
  titleVietnamese?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  description?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  ethnicityId: string;
// [VI] Thực thi một bước trong luồng xử lý.
  region: Region;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingType: RecordingType;
// [VI] Thực thi một bước trong luồng xử lý.
  audioFile: File;
// [VI] Thực thi một bước trong luồng xử lý.
  coverImage?: File;
// [VI] Thực thi một bước trong luồng xử lý.
  instrumentIds: string[];
// [VI] Thực thi một bước trong luồng xử lý.
  performerIds: string[];
// [VI] Thực thi một bước trong luồng xử lý.
  recordedDate?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  tags: string[];
// [VI] Thực thi một bước trong luồng xử lý.
  metadata: Partial<RecordingMetadata>;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface LocalRecording {
// [VI] Thực thi một bước trong luồng xử lý.
  id?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  submissionId?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  title?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  titleVietnamese?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  description?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  ethnicity?: Ethnicity;
// [VI] Thực thi một bước trong luồng xử lý.
  region?: Region;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingType?: RecordingType;
// [VI] Thực thi một bước trong luồng xử lý.
  duration?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  audioUrl?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  waveformUrl?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  coverImage?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  instruments?: Instrument[];
// [VI] Thực thi một bước trong luồng xử lý.
  performers?: Performer[];
// [VI] Thực thi một bước trong luồng xử lý.
  recordedDate?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  uploadedDate?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  uploader?:
// [VI] Thực thi một bước trong luồng xử lý.
    | User
// [VI] Thực thi một bước trong luồng xử lý.
    | {
// [VI] Thực thi một bước trong luồng xử lý.
        id?: string;
// [VI] Thực thi một bước trong luồng xử lý.
        username?: string;
// [VI] Thực thi một bước trong luồng xử lý.
        email?: string;
// [VI] Thực thi một bước trong luồng xử lý.
        fullName?: string;
// [VI] Thực thi một bước trong luồng xử lý.
        role?: string;
// [VI] Thực thi một bước trong luồng xử lý.
        createdAt?: string;
// [VI] Thực thi một bước trong luồng xử lý.
        updatedAt?: string;
// [VI] Thực thi một bước trong luồng xử lý.
      };
// [VI] Thực thi một bước trong luồng xử lý.
  tags?: string[];
// [VI] Thực thi một bước trong luồng xử lý.
  metadata?: Partial<RecordingMetadata>;
// [VI] Thực thi một bước trong luồng xử lý.
  verificationStatus?: VerificationStatus;
// [VI] Thực thi một bước trong luồng xử lý.
  verifiedBy?: User;
// [VI] Thực thi một bước trong luồng xử lý.
  viewCount?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  likeCount?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  downloadCount?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  basicInfo?: {
// [VI] Thực thi một bước trong luồng xử lý.
    title?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    artist?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    genre?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    recordingDate?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
  culturalContext?: {
// [VI] Thực thi một bước trong luồng xử lý.
    region?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    ethnicity?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    instruments?: string[];
// [VI] Thực thi một bước trong luồng xử lý.
    eventType?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    province?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    performanceType?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
  audioData?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  videoData?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  youtubeUrl?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  mediaType?: 'audio' | 'video' | 'youtube';
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
    assignBlockedByRbac?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
    reviewerId?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
    reviewerName?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
    reviewedAt?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
    rejectionNote?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    notes?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    contributorEditLocked?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
  resubmittedForModeration?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
}
