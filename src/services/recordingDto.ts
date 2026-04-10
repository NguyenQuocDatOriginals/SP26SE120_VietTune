// [VI] Nhập (import) các phụ thuộc cho file.
import type { LocalRecording } from '@/types';

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * OpenAPI `RecordingDto` (VietTuneArchive v1) — additionalProperties: false.
// [VI] Thực thi một bước trong luồng xử lý.
 * Only keys allowed by the spec are sent; omit undefined/null optional fields.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type RecordingDto = {
// [VI] Thực thi một bước trong luồng xử lý.
  title?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  description?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  audioFileUrl?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  videoFileUrl?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  audioFormat?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  durationSeconds?: number | null;
// [VI] Thực thi một bước trong luồng xử lý.
  fileSizeBytes?: number | null;
// [VI] Thực thi một bước trong luồng xử lý.
  uploadedById?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  communeId?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  ethnicGroupId?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  ceremonyId?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  vocalStyleId?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  musicalScaleId?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  performanceContext?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  lyricsOriginal?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  lyricsVietnamese?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  performerName?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  performerAge?: number | null;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingDate?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  gpsLatitude?: number | null;
// [VI] Thực thi một bước trong luồng xử lý.
  gpsLongitude?: number | null;
// [VI] Thực thi một bước trong luồng xử lý.
  tempo?: number | null;
// [VI] Thực thi một bước trong luồng xử lý.
  keySignature?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  status?: number | null;
// [VI] Thực thi một bước trong luồng xử lý.
  instrumentIds?: string[] | null;
// [VI] Thực thi một bước trong luồng xử lý.
  /** Extension fields accepted by upload/update in practice */
// [VI] Thực thi một bước trong luồng xử lý.
  composer?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  language?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingLocation?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Thực thi một bước trong luồng xử lý.
/** Map `LocalRecording` → JSON body for PUT /Recording/{id}/upload (OpenAPI RecordingDto only). */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function buildRecordingUploadPayload(recording: LocalRecording): Record<string, unknown> {
// [VI] Khai báo biến/hằng số.
  const uploaderId = (recording.uploader as { id?: string } | undefined)?.id;
// [VI] Khai báo biến/hằng số.
  const duration =
// [VI] Thực thi một bước trong luồng xử lý.
    typeof recording.duration === 'number' && Number.isFinite(recording.duration)
// [VI] Thực thi một bước trong luồng xử lý.
      ? Math.round(recording.duration)
// [VI] Thực thi một bước trong luồng xử lý.
      : undefined;

// [VI] Khai báo biến/hằng số.
  const dto: RecordingDto = {
// [VI] Thực thi một bước trong luồng xử lý.
    title: recording.basicInfo?.title ?? recording.title ?? null,
// [VI] Thực thi một bước trong luồng xử lý.
    description: recording.description ?? null,
// [VI] Thực thi một bước trong luồng xử lý.
    audioFileUrl:
// [VI] Thực thi một bước trong luồng xử lý.
      typeof recording.audioUrl === 'string' && !recording.audioUrl.startsWith('data:')
// [VI] Thực thi một bước trong luồng xử lý.
        ? recording.audioUrl
// [VI] Thực thi một bước trong luồng xử lý.
        : typeof recording.audioData === 'string' && !recording.audioData.startsWith('data:')
// [VI] Thực thi một bước trong luồng xử lý.
          ? recording.audioData
// [VI] Thực thi một bước trong luồng xử lý.
          : null,
// [VI] Thực thi một bước trong luồng xử lý.
    videoFileUrl:
// [VI] Thực thi một bước trong luồng xử lý.
      typeof recording.videoData === 'string' && !recording.videoData.startsWith('data:')
// [VI] Thực thi một bước trong luồng xử lý.
        ? recording.videoData
// [VI] Thực thi một bước trong luồng xử lý.
        : null,
// [VI] Thực thi một bước trong luồng xử lý.
    durationSeconds: duration ?? null,
// [VI] Thực thi một bước trong luồng xử lý.
    performerName: recording.basicInfo?.artist ?? null,
// [VI] Thực thi một bước trong luồng xử lý.
    recordingDate: recording.recordedDate ?? recording.basicInfo?.recordingDate ?? null,
// [VI] Thực thi một bước trong luồng xử lý.
    lyricsOriginal: recording.metadata?.lyrics ?? null,
// [VI] Thực thi một bước trong luồng xử lý.
    lyricsVietnamese: recording.metadata?.lyricsTranslation ?? null,
// [VI] Thực thi một bước trong luồng xử lý.
    performanceContext:
// [VI] Thực thi một bước trong luồng xử lý.
      recording.metadata?.ritualContext ?? recording.metadata?.culturalSignificance ?? null,
// [VI] Thực thi một bước trong luồng xử lý.
    tempo: recording.metadata?.tempo ?? null,
// [VI] Thực thi một bước trong luồng xử lý.
    instrumentIds:
// [VI] Thực thi một bước trong luồng xử lý.
      Array.isArray(recording.instruments) && recording.instruments.length > 0
// [VI] Khai báo hàm/biểu thức hàm.
        ? recording.instruments.map((i) => i.id).filter(Boolean)
// [VI] Thực thi một bước trong luồng xử lý.
        : null,
// [VI] Thực thi một bước trong luồng xử lý.
  };

// [VI] Rẽ nhánh điều kiện (if).
  if (uploaderId) dto.uploadedById = uploaderId;
// [VI] Khai báo biến/hằng số.
  const ethnicId = recording.ethnicity?.id;
// [VI] Rẽ nhánh điều kiện (if).
  if (ethnicId) dto.ethnicGroupId = ethnicId;

// [VI] Khai báo biến/hằng số.
  const body: Record<string, unknown> = {};
// [VI] Vòng lặp (for).
  for (const [k, v] of Object.entries(dto)) {
// [VI] Rẽ nhánh điều kiện (if).
    if (v !== undefined) body[k] = v;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return body;
// [VI] Thực thi một bước trong luồng xử lý.
}
