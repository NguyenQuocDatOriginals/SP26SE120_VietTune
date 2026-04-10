// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Lưu trữ local theo từng bản thu để tránh OOM: không bao giờ tải tất cả blob media cùng lúc.
// [VI] Thực thi một bước trong luồng xử lý.
 * - localRecordingIds: JSON array of IDs
// [VI] Thực thi một bước trong luồng xử lý.
 * - localRecording_meta:{id}: metadata only (no audioData/videoData)
// [VI] Thực thi một bước trong luồng xử lý.
 * - localRecording_full:{id}: full record including media
// [VI] Thực thi một bước trong luồng xử lý.
 */

// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from '@/services/api';
// [VI] Nhập (import) các phụ thuộc cho file.
import { buildRecordingUploadPayload } from '@/services/recordingDto';
// [VI] Nhập (import) các phụ thuộc cho file.
import { logServiceError, logServiceWarn } from '@/services/serviceLogger';
// [VI] Nhập (import) các phụ thuộc cho file.
import {
// [VI] Thực thi một bước trong luồng xử lý.
  extractSubmissionRows,
// [VI] Thực thi một bước trong luồng xử lý.
  mapSubmissionToLocalRecording,
// [VI] Thực thi một bước trong luồng xử lý.
} from '@/services/submissionApiMapper';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { LocalRecording } from '@/types';

// [VI] Thực thi một bước trong luồng xử lý.
// LƯU Ý: Vì đang chuyển hoàn toàn sang backend, các hàm này hiện đóng vai trò adapter mỏng
// [VI] Thực thi một bước trong luồng xử lý.
// để ánh xạ các hàm LocalRecording cũ sang API Submission và Recording mới.

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function getLocalRecordingIds(): Promise<string[]> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Khai báo biến/hằng số.
    const res = await api.get<unknown>('/Submission/my');
// [VI] Trả về kết quả từ hàm.
    return extractSubmissionRows(res)
// [VI] Khai báo hàm/biểu thức hàm.
      .map((x) => x.id as string | undefined)
// [VI] Khai báo hàm/biểu thức hàm.
      .filter((id): id is string => !!id);
// [VI] Thực thi một bước trong luồng xử lý.
  } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
    logServiceWarn('Failed to get submission IDs', err);
// [VI] Trả về kết quả từ hàm.
    return [];
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function getLocalRecordingMetaList(): Promise<LocalRecording[]> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Khai báo biến/hằng số.
    const res = await api.get<unknown>('/Submission/my');
// [VI] Khai báo hàm/biểu thức hàm.
    return extractSubmissionRows(res).map((row) => mapSubmissionToLocalRecording(row));
// [VI] Thực thi một bước trong luồng xử lý.
  } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
    logServiceWarn('Failed to get submissions list', err);
// [VI] Trả về kết quả từ hàm.
    return [];
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function getLocalRecordingFull(id: string): Promise<LocalRecording | null> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Khai báo biến/hằng số.
    const res = await api.get<unknown>(`/Submission/${id}`);
// [VI] Khai báo biến/hằng số.
    const envelope = res as Record<string, unknown>;
// [VI] Khai báo biến/hằng số.
    const x = (envelope?.data ?? res) as Record<string, unknown> | null;
// [VI] Rẽ nhánh điều kiện (if).
    if (!x || typeof x !== 'object') return null;
// [VI] Trả về kết quả từ hàm.
    return mapSubmissionToLocalRecording(x);
// [VI] Thực thi một bước trong luồng xử lý.
  } catch (err) {
// [VI] Trả về kết quả từ hàm.
    return null;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function setLocalRecording(recording: LocalRecording): Promise<void> {
// [VI] Thực thi một bước trong luồng xử lý.
  // Remote update: OpenAPI PUT /Recording/{id}/upload with RecordingDto body (no extra properties).
// [VI] Rẽ nhánh điều kiện (if).
  if (recording.id && !recording.id.startsWith('local-')) {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const body = buildRecordingUploadPayload(recording);
// [VI] Thực thi một bước trong luồng xử lý.
      await api.put(`/Recording/${recording.id}/upload`, body);
// [VI] Thực thi một bước trong luồng xử lý.
      return;
// [VI] Thực thi một bước trong luồng xử lý.
    } catch {
// [VI] Thực thi một bước trong luồng xử lý.
      // Fallback to create if update fails
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Thực thi một bước trong luồng xử lý.
  // Otherwise, create a new submission via recordingService / API
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Khai báo biến/hằng số.
    const payload = {
// [VI] Thực thi một bước trong luồng xử lý.
      title: recording.basicInfo?.title || recording.title || 'Không có tiêu đề',
// [VI] Thực thi một bước trong luồng xử lý.
      description: recording.description || '',
// [VI] Thực thi một bước trong luồng xử lý.
      audioFileUrl: recording.audioData || recording.audioUrl,
// [VI] Thực thi một bước trong luồng xử lý.
      videoFileUrl: recording.videoData,
// [VI] Thực thi một bước trong luồng xử lý.
      recordDate: recording.recordedDate,
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Thực thi một bước trong luồng xử lý.
    await api.post('/Submission/create-submission', payload);
// [VI] Thực thi một bước trong luồng xử lý.
  } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
    logServiceError('Failed to post submission', err);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function removeLocalRecording(id: string): Promise<void> {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Thực thi một bước trong luồng xử lý.
    await api.delete(`/Submission/${id}`);
// [VI] Thực thi một bước trong luồng xử lý.
  } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
    logServiceError('Failed to delete submission', err);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function clearAllLocalRecordings(): Promise<void> {
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
  throw new Error('clearAllLocalRecordings is not supported with remote submission APIs.');
// [VI] Thực thi một bước trong luồng xử lý.
}
