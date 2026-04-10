// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Build tags array from local recording (UploadMusic contributor options).
// [VI] Thực thi một bước trong luồng xử lý.
 * Used so AudioPlayer, VideoPlayer, and "Thẻ" on RecordingDetailPage show the same tags.
// [VI] Thực thi một bước trong luồng xử lý.
 */

// [VI] Nhập (import) các phụ thuộc cho file.
import { REGION_NAMES } from '@/config/constants';
// [VI] Nhập (import) các phụ thuộc cho file.
import { Region } from '@/types';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type OriginalLocalDataForRegion = {
// [VI] Thực thi một bước trong luồng xử lý.
  region?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  culturalContext?: { region?: string };
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Returns the region display label. When the recording is from UploadMusic (originalLocalData set)
// [VI] Thực thi một bước trong luồng xử lý.
 * and the contributor did not select any region, returns "Không xác định" instead of defaulting
// [VI] Thực thi một bước trong luồng xử lý.
 * to "Đồng bằng Bắc Bộ". For API recordings (no originalLocalData), returns REGION_NAMES[region].
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function getRegionDisplayName(
// [VI] Thực thi một bước trong luồng xử lý.
  recordingRegion: Region | undefined,
// [VI] Thực thi một bước trong luồng xử lý.
  originalLocalData?: OriginalLocalDataForRegion | null,
// [VI] Thực thi một bước trong luồng xử lý.
): string {
// [VI] Rẽ nhánh điều kiện (if).
  if (!recordingRegion || !REGION_NAMES[recordingRegion]) return 'Không xác định';
// [VI] Rẽ nhánh điều kiện (if).
  if (originalLocalData) {
// [VI] Khai báo biến/hằng số.
    const regionStr =
// [VI] Thực thi một bước trong luồng xử lý.
      originalLocalData.region?.trim() || originalLocalData.culturalContext?.region?.trim();
// [VI] Rẽ nhánh điều kiện (if).
    if (!regionStr) return 'Không xác định';
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return REGION_NAMES[recordingRegion];
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const PERFORMANCE_KEY_TO_LABEL: Record<string, string> = {
// [VI] Thực thi một bước trong luồng xử lý.
  instrumental: 'Chỉ nhạc cụ (Instrumental)',
// [VI] Thực thi một bước trong luồng xử lý.
  acappella: 'Chỉ giọng hát không đệm (Acappella)',
// [VI] Thực thi một bước trong luồng xử lý.
  vocal_accompaniment: 'Giọng hát có nhạc đệm (Vocal with accompaniment)',
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type LocalRecordingForTags = {
// [VI] Thực thi một bước trong luồng xử lý.
  basicInfo?: { genre?: string };
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
  tags?: string[];
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Returns tags array from contributor-selected options (genre, ethnicity, region, province, eventType, performanceType label, instruments).
// [VI] Thực thi một bước trong luồng xử lý.
 * Use local.tags when present; otherwise build from basicInfo + culturalContext for backward compatibility.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function buildTagsFromLocal(local: LocalRecordingForTags): string[] {
// [VI] Rẽ nhánh điều kiện (if).
  if (local.tags && local.tags.length > 0) return local.tags;
// [VI] Khai báo biến/hằng số.
  const genreVal = local.basicInfo?.genre ?? '';
// [VI] Khai báo biến/hằng số.
  const ethnicityVal = local.culturalContext?.ethnicity ?? '';
// [VI] Khai báo biến/hằng số.
  const regionVal = local.culturalContext?.region ?? '';
// [VI] Khai báo biến/hằng số.
  const provinceVal = local.culturalContext?.province ?? '';
// [VI] Khai báo biến/hằng số.
  const eventVal = local.culturalContext?.eventType ?? '';
// [VI] Khai báo biến/hằng số.
  const perfKey = local.culturalContext?.performanceType ?? '';
// [VI] Khai báo biến/hằng số.
  const perfLabel = perfKey ? (PERFORMANCE_KEY_TO_LABEL[perfKey] ?? perfKey) : '';
// [VI] Khai báo biến/hằng số.
  const inst = local.culturalContext?.instruments ?? [];
// [VI] Trả về kết quả từ hàm.
  return [genreVal, ethnicityVal, regionVal, provinceVal, eventVal, perfLabel, ...inst].filter(
// [VI] Thực thi một bước trong luồng xử lý.
    Boolean,
// [VI] Thực thi một bước trong luồng xử lý.
  );
// [VI] Thực thi một bước trong luồng xử lý.
}
