// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Shared conversion from LocalRecording (upload/moderation storage) to Recording (display/API type).
// [VI] Thực thi một bước trong luồng xử lý.
 * Used for demo fallback when API is unavailable (HomePage, SemanticSearchPage, etc.).
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Nhập (import) các phụ thuộc cho file.
import { REGION_NAMES } from '@/config/constants';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { LocalRecording } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import {
// [VI] Thực thi một bước trong luồng xử lý.
  Recording,
// [VI] Thực thi một bước trong luồng xử lý.
  Region,
// [VI] Thực thi một bước trong luồng xử lý.
  RecordingType,
// [VI] Thực thi một bước trong luồng xử lý.
  RecordingQuality,
// [VI] Thực thi một bước trong luồng xử lý.
  VerificationStatus,
// [VI] Thực thi một bước trong luồng xử lý.
  UserRole,
// [VI] Thực thi một bước trong luồng xử lý.
  InstrumentCategory,
// [VI] Thực thi một bước trong luồng xử lý.
} from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { buildTagsFromLocal } from '@/utils/recordingTags';

// [VI] Khai báo biến/hằng số.
const getAudioDuration = (audioDataUrl: string): Promise<number> => {
// [VI] Khai báo hàm/biểu thức hàm.
  return new Promise((resolve) => {
// [VI] Khai báo biến/hằng số.
    const audio = new Audio();
// [VI] Khai báo hàm/biểu thức hàm.
    audio.addEventListener('loadedmetadata', () => resolve(Math.floor(audio.duration)));
// [VI] Khai báo hàm/biểu thức hàm.
    audio.addEventListener('error', () => resolve(0));
// [VI] Thực thi một bước trong luồng xử lý.
    audio.src = audioDataUrl;
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function convertLocalToRecording(local: LocalRecording): Promise<Recording> {
// [VI] Khai báo biến/hằng số.
  const cc = local.culturalContext;
// [VI] Khai báo biến/hằng số.
  let duration = 0;
// [VI] Khai báo biến/hằng số.
  const isVideo = local.mediaType === 'video' || local.mediaType === 'youtube';
// [VI] Rẽ nhánh điều kiện (if).
  if (!isVideo && local.audioData) {
// [VI] Thực thi một bước trong luồng xử lý.
    duration = await getAudioDuration(local.audioData);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Khai báo biến/hằng số.
  let mediaSrc: string | undefined;
// [VI] Rẽ nhánh điều kiện (if).
  if (
// [VI] Thực thi một bước trong luồng xử lý.
    local.mediaType === 'video' &&
// [VI] Thực thi một bước trong luồng xử lý.
    local.videoData &&
// [VI] Thực thi một bước trong luồng xử lý.
    typeof local.videoData === 'string' &&
// [VI] Thực thi một bước trong luồng xử lý.
    local.videoData.trim()
// [VI] Thực thi một bước trong luồng xử lý.
  ) {
// [VI] Thực thi một bước trong luồng xử lý.
    mediaSrc = local.videoData;
// [VI] Thực thi một bước trong luồng xử lý.
  } else if (
// [VI] Thực thi một bước trong luồng xử lý.
    local.mediaType === 'audio' &&
// [VI] Thực thi một bước trong luồng xử lý.
    local.audioData &&
// [VI] Thực thi một bước trong luồng xử lý.
    typeof local.audioData === 'string' &&
// [VI] Thực thi một bước trong luồng xử lý.
    local.audioData.trim()
// [VI] Thực thi một bước trong luồng xử lý.
  ) {
// [VI] Thực thi một bước trong luồng xử lý.
    mediaSrc = local.audioData;
// [VI] Thực thi một bước trong luồng xử lý.
  } else if (local.videoData && typeof local.videoData === 'string' && local.videoData.trim()) {
// [VI] Thực thi một bước trong luồng xử lý.
    mediaSrc = local.videoData;
// [VI] Thực thi một bước trong luồng xử lý.
  } else if (local.audioData && typeof local.audioData === 'string' && local.audioData.trim()) {
// [VI] Thực thi một bước trong luồng xử lý.
    mediaSrc = local.audioData;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Khai báo biến/hằng số.
  const isApproved = local.moderation?.status === 'APPROVED';
// [VI] Khai báo biến/hằng số.
  const ethnicityLabel = cc?.ethnicity?.trim();
// [VI] Khai báo biến/hằng số.
  const ethnicityResolved =
// [VI] Thực thi một bước trong luồng xử lý.
    local.ethnicity ??
// [VI] Thực thi một bước trong luồng xử lý.
    (ethnicityLabel
// [VI] Thực thi một bước trong luồng xử lý.
      ? {
// [VI] Thực thi một bước trong luồng xử lý.
          id: 'ref',
// [VI] Thực thi một bước trong luồng xử lý.
          name: ethnicityLabel,
// [VI] Thực thi một bước trong luồng xử lý.
          nameVietnamese: ethnicityLabel,
// [VI] Thực thi một bước trong luồng xử lý.
          region: Region.RED_RIVER_DELTA,
// [VI] Thực thi một bước trong luồng xử lý.
          recordingCount: 0,
// [VI] Thực thi một bước trong luồng xử lý.
        }
// [VI] Thực thi một bước trong luồng xử lý.
      : {
// [VI] Thực thi một bước trong luồng xử lý.
          id: 'local',
// [VI] Thực thi một bước trong luồng xử lý.
          name: 'Không xác định',
// [VI] Thực thi một bước trong luồng xử lý.
          nameVietnamese: 'Không xác định',
// [VI] Thực thi một bước trong luồng xử lý.
          region: Region.RED_RIVER_DELTA,
// [VI] Thực thi một bước trong luồng xử lý.
          recordingCount: 0,
// [VI] Thực thi một bước trong luồng xử lý.
        });

// [VI] Khai báo biến/hằng số.
  let regionResolved: Region = local.region ?? Region.RED_RIVER_DELTA;
// [VI] Khai báo biến/hằng số.
  let regionNameExtra = '';
// [VI] Rẽ nhánh điều kiện (if).
  if (cc?.region?.trim()) {
// [VI] Khai báo biến/hằng số.
    const label = cc.region.trim();
// [VI] Khai báo biến/hằng số.
    const matched = (Object.entries(REGION_NAMES) as [Region, string][]).find(
// [VI] Khai báo hàm/biểu thức hàm.
      ([, vn]) => vn === label,
// [VI] Thực thi một bước trong luồng xử lý.
    );
// [VI] Rẽ nhánh điều kiện (if).
    if (matched) {
// [VI] Thực thi một bước trong luồng xử lý.
      regionResolved = matched[0];
// [VI] Thực thi một bước trong luồng xử lý.
    } else {
// [VI] Thực thi một bước trong luồng xử lý.
      regionNameExtra = label;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Khai báo biến/hằng số.
  const tagsBase = buildTagsFromLocal(local);
// [VI] Khai báo biến/hằng số.
  const evt = cc?.eventType?.trim();
// [VI] Khai báo biến/hằng số.
  const tagsWithEvent = evt && !tagsBase.some((t) => t === evt) ? [...tagsBase, evt] : tagsBase;

// [VI] Khai báo biến/hằng số.
  const base: Recording = {
// [VI] Thực thi một bước trong luồng xử lý.
    id: local.id ?? 'local-' + Math.random().toString(36).slice(2),
// [VI] Thực thi một bước trong luồng xử lý.
    title: local.basicInfo?.title || local.title || 'Không có tiêu đề',
// [VI] Thực thi một bước trong luồng xử lý.
    titleVietnamese: local.basicInfo?.title || local.title || 'Không có tiêu đề',
// [VI] Thực thi một bước trong luồng xử lý.
    description: local.description || 'Bản thu được tải lên từ thiết bị của bạn',
// [VI] Thực thi một bước trong luồng xử lý.
    ethnicity: ethnicityResolved,
// [VI] Thực thi một bước trong luồng xử lý.
    region: regionResolved,
// [VI] Khai báo hàm/biểu thức hàm.
    recordingType: (() => {
// [VI] Rẽ nhánh điều kiện (if).
      if (local.recordingType) return local.recordingType;
// [VI] Khai báo biến/hằng số.
      const key = (local as LocalRecording & { culturalContext?: { performanceType?: string } })
// [VI] Thực thi một bước trong luồng xử lý.
        .culturalContext?.performanceType;
// [VI] Rẽ nhánh điều kiện (if).
      if (key === 'instrumental') return RecordingType.INSTRUMENTAL;
// [VI] Rẽ nhánh điều kiện (if).
      if (key === 'acappella' || key === 'vocal_accompaniment') return RecordingType.VOCAL;
// [VI] Trả về kết quả từ hàm.
      return RecordingType.OTHER;
// [VI] Thực thi một bước trong luồng xử lý.
    })(),
// [VI] Thực thi một bước trong luồng xử lý.
    duration: local.duration ?? duration,
// [VI] Thực thi một bước trong luồng xử lý.
    audioUrl: local.audioUrl ?? mediaSrc ?? '',
// [VI] Thực thi một bước trong luồng xử lý.
    instruments: local.instruments?.length
// [VI] Thực thi một bước trong luồng xử lý.
      ? local.instruments
// [VI] Khai báo hàm/biểu thức hàm.
      : (cc?.instruments ?? []).map((name, i) => ({
// [VI] Thực thi một bước trong luồng xử lý.
          id: `inst-${i}`,
// [VI] Thực thi một bước trong luồng xử lý.
          name,
// [VI] Thực thi một bước trong luồng xử lý.
          nameVietnamese: name,
// [VI] Thực thi một bước trong luồng xử lý.
          category: InstrumentCategory.IDIOPHONE,
// [VI] Thực thi một bước trong luồng xử lý.
          images: [],
// [VI] Thực thi một bước trong luồng xử lý.
          recordingCount: 0,
// [VI] Thực thi một bước trong luồng xử lý.
        })),
// [VI] Thực thi một bước trong luồng xử lý.
    performers: local.performers ?? [],
// [VI] Thực thi một bước trong luồng xử lý.
    uploadedDate: local.uploadedDate ?? new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
    uploader:
// [VI] Thực thi một bước trong luồng xử lý.
      typeof local.uploader === 'object' && local.uploader != null
// [VI] Thực thi một bước trong luồng xử lý.
        ? {
// [VI] Thực thi một bước trong luồng xử lý.
            id: local.uploader?.id ?? 'local-user',
// [VI] Thực thi một bước trong luồng xử lý.
            username: local.uploader?.username ?? 'Bạn',
// [VI] Thực thi một bước trong luồng xử lý.
            email: local.uploader?.email ?? '',
// [VI] Thực thi một bước trong luồng xử lý.
            fullName: local.uploader?.fullName ?? local.uploader?.username ?? 'Người tải lên',
// [VI] Thực thi một bước trong luồng xử lý.
            role: (typeof local.uploader?.role === 'string'
// [VI] Thực thi một bước trong luồng xử lý.
              ? local.uploader.role
// [VI] Thực thi một bước trong luồng xử lý.
              : UserRole.USER) as UserRole,
// [VI] Thực thi một bước trong luồng xử lý.
            createdAt: local.uploader?.createdAt ?? new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
            updatedAt: local.uploader?.updatedAt ?? new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
          }
// [VI] Thực thi một bước trong luồng xử lý.
        : {
// [VI] Thực thi một bước trong luồng xử lý.
            id: 'local-user',
// [VI] Thực thi một bước trong luồng xử lý.
            username: 'Bạn',
// [VI] Thực thi một bước trong luồng xử lý.
            email: '',
// [VI] Thực thi một bước trong luồng xử lý.
            fullName: 'Người tải lên',
// [VI] Thực thi một bước trong luồng xử lý.
            role: UserRole.USER,
// [VI] Thực thi một bước trong luồng xử lý.
            createdAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
            updatedAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
          },
// [VI] Thực thi một bước trong luồng xử lý.
    tags: tagsWithEvent,
// [VI] Thực thi một bước trong luồng xử lý.
    metadata: {
// [VI] Thực thi một bước trong luồng xử lý.
      ...local.metadata,
// [VI] Thực thi một bước trong luồng xử lý.
      recordingQuality: local.metadata?.recordingQuality ?? RecordingQuality.FIELD_RECORDING,
// [VI] Thực thi một bước trong luồng xử lý.
      lyrics: local.metadata?.lyrics ?? '',
// [VI] Thực thi một bước trong luồng xử lý.
      ...(evt && !local.metadata?.ritualContext ? { ritualContext: evt } : {}),
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    verificationStatus:
// [VI] Thực thi một bước trong luồng xử lý.
      local.verificationStatus ??
// [VI] Thực thi một bước trong luồng xử lý.
      (isApproved ? VerificationStatus.VERIFIED : VerificationStatus.PENDING),
// [VI] Thực thi một bước trong luồng xử lý.
    viewCount: local.viewCount ?? 0,
// [VI] Thực thi một bước trong luồng xử lý.
    likeCount: local.likeCount ?? 0,
// [VI] Thực thi một bước trong luồng xử lý.
    downloadCount: local.downloadCount ?? 0,
// [VI] Thực thi một bước trong luồng xử lý.
  };

// [VI] Khai báo biến/hằng số.
  const communeLabel = cc?.province?.trim();
// [VI] Khai báo biến/hằng số.
  const extras: Record<string, string> = {};
// [VI] Rẽ nhánh điều kiện (if).
  if (regionNameExtra) extras.regionName = regionNameExtra;
// [VI] Rẽ nhánh điều kiện (if).
  if (communeLabel) extras.communeName = communeLabel;
// [VI] Rẽ nhánh điều kiện (if).
  if (evt) extras.ceremonyName = evt;

// [VI] Trả về kết quả từ hàm.
  return { ...base, ...extras } as Recording;
// [VI] Thực thi một bước trong luồng xử lý.
}
