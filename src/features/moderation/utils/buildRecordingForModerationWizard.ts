// [VI] Nhập (import) các phụ thuộc cho file.
import type { LocalRecordingMini } from '@/features/moderation/types/localRecordingQueue.types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { Region, RecordingQuality, RecordingType, UserRole, VerificationStatus } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { Recording } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { buildTagsFromLocal } from '@/utils/recordingTags';

// [VI] Thực thi một bước trong luồng xử lý.
/** Minimal `Recording` shape for AudioPlayer/VideoPlayer inside the verification wizard. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function buildRecordingForModerationWizard(item: LocalRecordingMini): Recording {
// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    id: item.id ?? '',
// [VI] Thực thi một bước trong luồng xử lý.
    title: item.basicInfo?.title || item.title || 'Không có tiêu đề',
// [VI] Thực thi một bước trong luồng xử lý.
    titleVietnamese: item.basicInfo?.title || item.title || 'Không có tiêu đề',
// [VI] Thực thi một bước trong luồng xử lý.
    description: 'Bản thu đang chờ kiểm duyệt',
// [VI] Thực thi một bước trong luồng xử lý.
    ethnicity: {
// [VI] Thực thi một bước trong luồng xử lý.
      id: 'local',
// [VI] Thực thi một bước trong luồng xử lý.
      name: item.culturalContext?.ethnicity || 'Không xác định',
// [VI] Thực thi một bước trong luồng xử lý.
      nameVietnamese: item.culturalContext?.ethnicity || 'Không xác định',
// [VI] Khai báo hàm/biểu thức hàm.
      region: (() => {
// [VI] Khai báo biến/hằng số.
        const regionKey = item.culturalContext?.region as keyof typeof Region;
// [VI] Trả về kết quả từ hàm.
        return Region[regionKey] ?? Region.RED_RIVER_DELTA;
// [VI] Thực thi một bước trong luồng xử lý.
      })(),
// [VI] Thực thi một bước trong luồng xử lý.
      recordingCount: 0,
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Khai báo hàm/biểu thức hàm.
    region: (() => {
// [VI] Khai báo biến/hằng số.
      const regionKey = item.culturalContext?.region as keyof typeof Region;
// [VI] Trả về kết quả từ hàm.
      return Region[regionKey] ?? Region.RED_RIVER_DELTA;
// [VI] Thực thi một bước trong luồng xử lý.
    })(),
// [VI] Thực thi một bước trong luồng xử lý.
    recordingType: RecordingType.OTHER,
// [VI] Thực thi một bước trong luồng xử lý.
    duration: 0,
// [VI] Thực thi một bước trong luồng xử lý.
    audioUrl: item.audioData ?? '',
// [VI] Thực thi một bước trong luồng xử lý.
    instruments: [],
// [VI] Thực thi một bước trong luồng xử lý.
    performers: [],
// [VI] Thực thi một bước trong luồng xử lý.
    uploadedDate: item.uploadedAt || new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
    uploader: {
// [VI] Thực thi một bước trong luồng xử lý.
      id: item.uploader?.id || 'local-user',
// [VI] Thực thi một bước trong luồng xử lý.
      username: item.uploader?.username || 'Khách',
// [VI] Thực thi một bước trong luồng xử lý.
      email: '',
// [VI] Thực thi một bước trong luồng xử lý.
      fullName: item.uploader?.username || 'Khách',
// [VI] Thực thi một bước trong luồng xử lý.
      role: UserRole.USER,
// [VI] Thực thi một bước trong luồng xử lý.
      createdAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
      updatedAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    tags: buildTagsFromLocal(item),
// [VI] Thực thi một bước trong luồng xử lý.
    metadata: { recordingQuality: RecordingQuality.FIELD_RECORDING, lyrics: '' },
// [VI] Thực thi một bước trong luồng xử lý.
    verificationStatus:
// [VI] Thực thi một bước trong luồng xử lý.
      item.moderation?.status === 'APPROVED'
// [VI] Thực thi một bước trong luồng xử lý.
        ? VerificationStatus.VERIFIED
// [VI] Thực thi một bước trong luồng xử lý.
        : VerificationStatus.PENDING,
// [VI] Thực thi một bước trong luồng xử lý.
    viewCount: 0,
// [VI] Thực thi một bước trong luồng xử lý.
    likeCount: 0,
// [VI] Thực thi một bước trong luồng xử lý.
    downloadCount: 0,
// [VI] Thực thi một bước trong luồng xử lý.
  } as Recording;
// [VI] Thực thi một bước trong luồng xử lý.
}
