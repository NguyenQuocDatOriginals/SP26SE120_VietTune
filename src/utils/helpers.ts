// [VI] Nhập (import) các phụ thuộc cho file.
import { type ClassValue, clsx } from 'clsx';

// [VI] Nhập (import) các phụ thuộc cho file.
import type { LocalRecording } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { ModerationStatus } from '@/types';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function cn(...inputs: ClassValue[]) {
// [VI] Trả về kết quả từ hàm.
  return clsx(inputs);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function formatDuration(seconds: number): string {
// [VI] Khai báo biến/hằng số.
  const mins = Math.floor(seconds / 60);
// [VI] Khai báo biến/hằng số.
  const secs = Math.floor(seconds % 60);
// [VI] Trả về kết quả từ hàm.
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function formatFileSize(bytes: number): string {
// [VI] Rẽ nhánh điều kiện (if).
  if (bytes === 0) return '0 Bytes';
// [VI] Khai báo biến/hằng số.
  const k = 1024;
// [VI] Khai báo biến/hằng số.
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
// [VI] Khai báo biến/hằng số.
  const i = Math.floor(Math.log(bytes) / Math.log(k));
// [VI] Trả về kết quả từ hàm.
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function truncate(str: string, length: number): string {
// [VI] Rẽ nhánh điều kiện (if).
  if (str.length <= length) return str;
// [VI] Trả về kết quả từ hàm.
  return str.substring(0, length) + '...';
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function debounce<T extends (...args: unknown[]) => unknown>(
// [VI] Thực thi một bước trong luồng xử lý.
  func: T,
// [VI] Thực thi một bước trong luồng xử lý.
  wait: number,
// [VI] Khai báo hàm/biểu thức hàm.
): (...args: Parameters<T>) => void {
// [VI] Khai báo biến/hằng số.
  let timeout: NodeJS.Timeout | null = null;

// [VI] Khai báo hàm/biểu thức hàm.
  return (...args: Parameters<T>) => {
// [VI] Rẽ nhánh điều kiện (if).
    if (timeout) clearTimeout(timeout);
// [VI] Khai báo hàm/biểu thức hàm.
    timeout = setTimeout(() => func(...args), wait);
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Migration function: Chuyển đổi video từ audioData sang videoData
// [VI] Thực thi một bước trong luồng xử lý.
 * Hàm này sẽ tự động migrate các bản ghi cũ có mediaType === "video"
// [VI] Thực thi một bước trong luồng xử lý.
 * nhưng đang lưu trong audioData sang videoData
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function migrateVideoDataToVideoData(recordings: LocalRecording[]): LocalRecording[] {
// [VI] Khai báo biến/hằng số.
  const migrated = recordings.map((rec) => {
// [VI] Thực thi một bước trong luồng xử lý.
    // Chỉ migrate nếu:
// [VI] Thực thi một bước trong luồng xử lý.
    // 1. mediaType === "video"
// [VI] Thực thi một bước trong luồng xử lý.
    // 2. Có audioData (không null/undefined và không rỗng)
// [VI] Thực thi một bước trong luồng xử lý.
    // 3. Chưa có videoData hoặc videoData rỗng/null
// [VI] Rẽ nhánh điều kiện (if).
    if (
// [VI] Thực thi một bước trong luồng xử lý.
      rec.mediaType === 'video' &&
// [VI] Thực thi một bước trong luồng xử lý.
      rec.audioData &&
// [VI] Thực thi một bước trong luồng xử lý.
      typeof rec.audioData === 'string' &&
// [VI] Thực thi một bước trong luồng xử lý.
      rec.audioData.trim().length > 0 &&
// [VI] Thực thi một bước trong luồng xử lý.
      (!rec.videoData || (typeof rec.videoData === 'string' && rec.videoData.trim().length === 0))
// [VI] Thực thi một bước trong luồng xử lý.
    ) {
// [VI] Trả về kết quả từ hàm.
      return {
// [VI] Thực thi một bước trong luồng xử lý.
        ...rec,
// [VI] Thực thi một bước trong luồng xử lý.
        videoData: rec.audioData, // Chuyển audioData sang videoData
// [VI] Thực thi một bước trong luồng xử lý.
        audioData: null, // Xóa audioData
// [VI] Thực thi một bước trong luồng xử lý.
      };
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Trả về kết quả từ hàm.
    return rec;
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Thực thi một bước trong luồng xử lý.
  // Pure function: no storage write. Callers use recordingStorage.setLocalRecording per item if needed.
// [VI] Trả về kết quả từ hàm.
  return migrated;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Format date and time to Vietnamese locale with full date and time
// [VI] Thực thi một bước trong luồng xử lý.
 * Format: "dd/MM/yyyy, HH:mm:ss"
// [VI] Thực thi một bước trong luồng xử lý.
 *
// [VI] Thực thi một bước trong luồng xử lý.
 * @param dateString - ISO date string or Date object
// [VI] Thực thi một bước trong luồng xử lý.
 * @returns Formatted date string in Vietnamese locale, or '-' if invalid
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function formatDateTime(dateString: string | Date | null | undefined): string {
// [VI] Rẽ nhánh điều kiện (if).
  if (!dateString) return '-';

// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Khai báo biến/hằng số.
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
// [VI] Rẽ nhánh điều kiện (if).
    if (isNaN(date.getTime())) return '-';

// [VI] Trả về kết quả từ hàm.
    return date.toLocaleString('vi-VN', {
// [VI] Thực thi một bước trong luồng xử lý.
      year: 'numeric',
// [VI] Thực thi một bước trong luồng xử lý.
      month: '2-digit',
// [VI] Thực thi một bước trong luồng xử lý.
      day: '2-digit',
// [VI] Thực thi một bước trong luồng xử lý.
      hour: '2-digit',
// [VI] Thực thi một bước trong luồng xử lý.
      minute: '2-digit',
// [VI] Thực thi một bước trong luồng xử lý.
      second: '2-digit',
// [VI] Thực thi một bước trong luồng xử lý.
      hour12: false,
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  } catch {
// [VI] Trả về kết quả từ hàm.
    return '-';
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Format date only (without time) to Vietnamese locale
// [VI] Thực thi một bước trong luồng xử lý.
 * Format: "dd/MM/yyyy"
// [VI] Thực thi một bước trong luồng xử lý.
 *
// [VI] Thực thi một bước trong luồng xử lý.
 * @param dateString - ISO date string or Date object
// [VI] Thực thi một bước trong luồng xử lý.
 * @returns Formatted date string in Vietnamese locale, or '-' if invalid
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function formatDate(dateString: string | Date | null | undefined): string {
// [VI] Rẽ nhánh điều kiện (if).
  if (!dateString) return '-';

// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Khai báo biến/hằng số.
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
// [VI] Rẽ nhánh điều kiện (if).
    if (isNaN(date.getTime())) return '-';

// [VI] Trả về kết quả từ hàm.
    return date.toLocaleDateString('vi-VN', {
// [VI] Thực thi một bước trong luồng xử lý.
      year: 'numeric',
// [VI] Thực thi một bước trong luồng xử lý.
      month: '2-digit',
// [VI] Thực thi một bước trong luồng xử lý.
      day: '2-digit',
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  } catch {
// [VI] Trả về kết quả từ hàm.
    return '-';
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Trạng thái kiểm duyệt sang tiếng Việt (dùng chung cho Contributions, Moderation, ApprovedRecordings).
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function getModerationStatusLabel(status?: ModerationStatus | string): string {
// [VI] Rẽ nhánh điều kiện (if).
  if (!status) return 'Không xác định';
/* eslint-disable no-fallthrough */
// [VI] Rẽ nhánh theo nhiều trường hợp (switch).
  switch (status) {
// [VI] Một nhánh trong switch (case/default).
    case ModerationStatus.PENDING_REVIEW:
// [VI] Một nhánh trong switch (case/default).
    case 'PENDING_REVIEW':
// [VI] Trả về kết quả từ hàm.
      return 'Đang chờ được kiểm duyệt';
// [VI] Một nhánh trong switch (case/default).
    case ModerationStatus.IN_REVIEW:
// [VI] Một nhánh trong switch (case/default).
    case 'IN_REVIEW':
// [VI] Trả về kết quả từ hàm.
      return 'Đang được kiểm duyệt';
// [VI] Một nhánh trong switch (case/default).
    case ModerationStatus.APPROVED:
// [VI] Một nhánh trong switch (case/default).
    case 'APPROVED':
// [VI] Trả về kết quả từ hàm.
      return 'Đã được kiểm duyệt';
// [VI] Một nhánh trong switch (case/default).
    case ModerationStatus.REJECTED:
// [VI] Một nhánh trong switch (case/default).
    case 'REJECTED':
// [VI] Trả về kết quả từ hàm.
      return 'Đã bị từ chối vĩnh viễn';
// [VI] Một nhánh trong switch (case/default).
    case ModerationStatus.TEMPORARILY_REJECTED:
// [VI] Một nhánh trong switch (case/default).
    case 'TEMPORARILY_REJECTED':
// [VI] Trả về kết quả từ hàm.
      return 'Đã bị từ chối tạm thời';
// [VI] Một nhánh trong switch (case/default).
    default:
// [VI] Trả về kết quả từ hàm.
      return String(status);
// [VI] Thực thi một bước trong luồng xử lý.
  }
/* eslint-enable no-fallthrough */
// [VI] Thực thi một bước trong luồng xử lý.
}
