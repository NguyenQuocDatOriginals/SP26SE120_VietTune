// [VI] Nhập (import) các phụ thuộc cho file.
import axios from 'axios';

// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from './api';
// [VI] Nhập (import) các phụ thuộc cho file.
import { extractSubmissionRows } from './submissionApiMapper';

// [VI] Thực thi một bước trong luồng xử lý.
// Types matching the backend response
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface SubmissionRecording {
// [VI] Thực thi một bước trong luồng xử lý.
  title: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  description: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  videoFileUrl: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  audioFileUrl?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  audioFormat: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  durationSeconds: number | null;
// [VI] Thực thi một bước trong luồng xử lý.
  fileSizeBytes: number | null;
// [VI] Thực thi một bước trong luồng xử lý.
  uploadedById: string;
// [VI] Thực thi một bước trong luồng xử lý.
  communeId: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  ethnicGroupId: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  ceremonyId: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  vocalStyleId: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  musicalScaleId: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  performanceContext: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  lyricsOriginal: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  lyricsVietnamese: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  performerName: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  performerAge: number | null;
// [VI] Thực thi một bước trong luồng xử lý.
  composer: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  language: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingLocation: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingDate: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  gpsLatitude: number | null;
// [VI] Thực thi một bước trong luồng xử lý.
  gpsLongitude: number | null;
// [VI] Thực thi một bước trong luồng xử lý.
  tempo: number | null;
// [VI] Thực thi một bước trong luồng xử lý.
  keySignature: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  instrumentIds: string[];
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface Submission {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingId: string;
// [VI] Thực thi một bước trong luồng xử lý.
  contributorId: string;
// [VI] Thực thi một bước trong luồng xử lý.
  currentStage: number;
// [VI] Thực thi một bước trong luồng xử lý.
  status: number;
// [VI] Thực thi một bước trong luồng xử lý.
  notes: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  submittedAt: string;
// [VI] Thực thi một bước trong luồng xử lý.
  updatedAt: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  recording: SubmissionRecording;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo interface để ràng buộc cấu trúc dữ liệu.
interface SubmissionListResponse {
// [VI] Thực thi một bước trong luồng xử lý.
  isSuccess: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  message: string;
// [VI] Thực thi một bước trong luồng xử lý.
  data: Submission[];
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo interface để ràng buộc cấu trúc dữ liệu.
interface SubmissionDetailResponse {
// [VI] Thực thi một bước trong luồng xử lý.
  isSuccess: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  message: string;
// [VI] Thực thi một bước trong luồng xử lý.
  data: Submission;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function pickField(row: Record<string, unknown> | null | undefined, ...keys: string[]): unknown {
// [VI] Rẽ nhánh điều kiện (if).
  if (!row) return undefined;
// [VI] Vòng lặp (for).
  for (const k of keys) {
// [VI] Rẽ nhánh điều kiện (if).
    if (row[k] !== undefined && row[k] !== null) return row[k];
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return undefined;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function str(v: unknown): string {
// [VI] Trả về kết quả từ hàm.
  return v == null ? '' : String(v);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function strNull(v: unknown): string | null {
// [VI] Rẽ nhánh điều kiện (if).
  if (v == null || v === '') return null;
// [VI] Trả về kết quả từ hàm.
  return String(v);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function numOr(v: unknown, def: number): number {
// [VI] Khai báo biến/hằng số.
  const n = Number(v);
// [VI] Trả về kết quả từ hàm.
  return Number.isFinite(n) ? n : def;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Map một phần tử list từ GET /Submission/my (camelCase hoặc PascalCase .NET) → Submission dùng trên ContributionsPage.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function mapSubmissionListRowToSubmission(row: Record<string, unknown>): Submission {
// [VI] Khai báo biến/hằng số.
  const recRaw = pickField(row, 'recording', 'Recording') as Record<string, unknown> | undefined;
// [VI] Khai báo biến/hằng số.
  const rec = recRaw && typeof recRaw === 'object' ? recRaw : undefined;

// [VI] Khai báo biến/hằng số.
  const instrumentRaw = pickField(rec, 'instrumentIds', 'InstrumentIds');
// [VI] Khai báo biến/hằng số.
  const instrumentIds: string[] = Array.isArray(instrumentRaw)
// [VI] Khai báo hàm/biểu thức hàm.
    ? (instrumentRaw as unknown[]).map((x) => String(x ?? '').trim()).filter(Boolean)
// [VI] Thực thi một bước trong luồng xử lý.
    : [];

// [VI] Khai báo biến/hằng số.
  const recording: SubmissionRecording = {
// [VI] Thực thi một bước trong luồng xử lý.
    title: strNull(pickField(rec, 'title', 'Title')),
// [VI] Thực thi một bước trong luồng xử lý.
    description: strNull(pickField(rec, 'description', 'Description')),
// [VI] Thực thi một bước trong luồng xử lý.
    videoFileUrl: strNull(pickField(rec, 'videoFileUrl', 'VideoFileUrl')),
// [VI] Thực thi một bước trong luồng xử lý.
    audioFileUrl: strNull(pickField(rec, 'audioFileUrl', 'AudioFileUrl')),
// [VI] Thực thi một bước trong luồng xử lý.
    audioFormat: strNull(pickField(rec, 'audioFormat', 'AudioFormat')),
// [VI] Thực thi một bước trong luồng xử lý.
    durationSeconds:
// [VI] Thực thi một bước trong luồng xử lý.
      pickField(rec, 'durationSeconds', 'DurationSeconds') != null
// [VI] Thực thi một bước trong luồng xử lý.
        ? numOr(pickField(rec, 'durationSeconds', 'DurationSeconds'), 0)
// [VI] Thực thi một bước trong luồng xử lý.
        : null,
// [VI] Thực thi một bước trong luồng xử lý.
    fileSizeBytes:
// [VI] Thực thi một bước trong luồng xử lý.
      pickField(rec, 'fileSizeBytes', 'FileSizeBytes') != null
// [VI] Thực thi một bước trong luồng xử lý.
        ? numOr(pickField(rec, 'fileSizeBytes', 'FileSizeBytes'), 0)
// [VI] Thực thi một bước trong luồng xử lý.
        : null,
// [VI] Thực thi một bước trong luồng xử lý.
    uploadedById: str(
// [VI] Thực thi một bước trong luồng xử lý.
      pickField(rec, 'uploadedById', 'UploadedById') ??
// [VI] Thực thi một bước trong luồng xử lý.
        pickField(row, 'contributorId', 'ContributorId', 'uploadedById', 'UploadedById'),
// [VI] Thực thi một bước trong luồng xử lý.
    ),
// [VI] Thực thi một bước trong luồng xử lý.
    communeId: strNull(pickField(rec, 'communeId', 'CommuneId')),
// [VI] Thực thi một bước trong luồng xử lý.
    ethnicGroupId: strNull(pickField(rec, 'ethnicGroupId', 'EthnicGroupId')),
// [VI] Thực thi một bước trong luồng xử lý.
    ceremonyId: strNull(pickField(rec, 'ceremonyId', 'CeremonyId')),
// [VI] Thực thi một bước trong luồng xử lý.
    vocalStyleId: strNull(pickField(rec, 'vocalStyleId', 'VocalStyleId')),
// [VI] Thực thi một bước trong luồng xử lý.
    musicalScaleId: strNull(pickField(rec, 'musicalScaleId', 'MusicalScaleId')),
// [VI] Thực thi một bước trong luồng xử lý.
    performanceContext: strNull(pickField(rec, 'performanceContext', 'PerformanceContext')),
// [VI] Thực thi một bước trong luồng xử lý.
    lyricsOriginal: strNull(pickField(rec, 'lyricsOriginal', 'LyricsOriginal')),
// [VI] Thực thi một bước trong luồng xử lý.
    lyricsVietnamese: strNull(pickField(rec, 'lyricsVietnamese', 'LyricsVietnamese')),
// [VI] Thực thi một bước trong luồng xử lý.
    performerName: strNull(pickField(rec, 'performerName', 'PerformerName')),
// [VI] Thực thi một bước trong luồng xử lý.
    performerAge:
// [VI] Thực thi một bước trong luồng xử lý.
      pickField(rec, 'performerAge', 'PerformerAge') != null
// [VI] Thực thi một bước trong luồng xử lý.
        ? numOr(pickField(rec, 'performerAge', 'PerformerAge'), 0)
// [VI] Thực thi một bước trong luồng xử lý.
        : null,
// [VI] Thực thi một bước trong luồng xử lý.
    composer: strNull(pickField(rec, 'composer', 'Composer')),
// [VI] Thực thi một bước trong luồng xử lý.
    language: strNull(pickField(rec, 'language', 'Language')),
// [VI] Thực thi một bước trong luồng xử lý.
    recordingLocation: strNull(pickField(rec, 'recordingLocation', 'RecordingLocation')),
// [VI] Thực thi một bước trong luồng xử lý.
    recordingDate: strNull(pickField(rec, 'recordingDate', 'RecordingDate')),
// [VI] Thực thi một bước trong luồng xử lý.
    gpsLatitude:
// [VI] Thực thi một bước trong luồng xử lý.
      pickField(rec, 'gpsLatitude', 'GpsLatitude') != null
// [VI] Thực thi một bước trong luồng xử lý.
        ? numOr(pickField(rec, 'gpsLatitude', 'GpsLatitude'), 0)
// [VI] Thực thi một bước trong luồng xử lý.
        : null,
// [VI] Thực thi một bước trong luồng xử lý.
    gpsLongitude:
// [VI] Thực thi một bước trong luồng xử lý.
      pickField(rec, 'gpsLongitude', 'GpsLongitude') != null
// [VI] Thực thi một bước trong luồng xử lý.
        ? numOr(pickField(rec, 'gpsLongitude', 'GpsLongitude'), 0)
// [VI] Thực thi một bước trong luồng xử lý.
        : null,
// [VI] Thực thi một bước trong luồng xử lý.
    tempo:
// [VI] Thực thi một bước trong luồng xử lý.
      pickField(rec, 'tempo', 'Tempo') != null ? numOr(pickField(rec, 'tempo', 'Tempo'), 0) : null,
// [VI] Thực thi một bước trong luồng xử lý.
    keySignature: strNull(pickField(rec, 'keySignature', 'KeySignature')),
// [VI] Thực thi một bước trong luồng xử lý.
    instrumentIds,
// [VI] Thực thi một bước trong luồng xử lý.
  };

// [VI] Khai báo biến/hằng số.
  const submissionId = str(pickField(row, 'id', 'Id'));
// [VI] Khai báo biến/hằng số.
  const recordingId = str(
// [VI] Thực thi một bước trong luồng xử lý.
    pickField(row, 'recordingId', 'RecordingId') ?? pickField(rec, 'id', 'Id'),
// [VI] Thực thi một bước trong luồng xử lý.
  );

// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    id: submissionId,
// [VI] Thực thi một bước trong luồng xử lý.
    recordingId: recordingId || submissionId,
// [VI] Thực thi một bước trong luồng xử lý.
    contributorId: str(
// [VI] Thực thi một bước trong luồng xử lý.
      pickField(row, 'contributorId', 'ContributorId', 'uploadedById', 'UploadedById'),
// [VI] Thực thi một bước trong luồng xử lý.
    ),
// [VI] Thực thi một bước trong luồng xử lý.
    currentStage: numOr(pickField(row, 'currentStage', 'CurrentStage'), 0),
// [VI] Thực thi một bước trong luồng xử lý.
    status: numOr(pickField(row, 'status', 'Status'), 0),
// [VI] Thực thi một bước trong luồng xử lý.
    notes: strNull(pickField(row, 'notes', 'Notes')),
// [VI] Thực thi một bước trong luồng xử lý.
    submittedAt: str(
// [VI] Thực thi một bước trong luồng xử lý.
      pickField(row, 'submittedAt', 'SubmittedAt', 'createdAt', 'CreatedAt') ||
// [VI] Thực thi một bước trong luồng xử lý.
        new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
    ),
// [VI] Thực thi một bước trong luồng xử lý.
    updatedAt: strNull(pickField(row, 'updatedAt', 'UpdatedAt')),
// [VI] Thực thi một bước trong luồng xử lý.
    recording,
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const submissionService = {
// [VI] Thực thi một bước trong luồng xử lý.
  /**
// [VI] Thực thi một bước trong luồng xử lý.
   * Danh sách đóng góp của user đang đăng nhập.
// [VI] Thực thi một bước trong luồng xử lý.
   * Backend đôi khi yêu cầu `userId` trên query, đôi khi lại lấy theo JWT.
// [VI] Thực thi một bước trong luồng xử lý.
   * Vì vậy FE sẽ thử theo thứ tự:
// [VI] Thực thi một bước trong luồng xử lý.
   * 1) Có `userId` (userId + page/pageSize)
// [VI] Thực thi một bước trong luồng xử lý.
   * 2) Không `userId` (chỉ page/pageSize)
// [VI] Thực thi một bước trong luồng xử lý.
   */
// [VI] Khai báo hàm/biểu thức hàm.
  getMySubmissions: async (userId: string, page: number = 1, pageSize: number = 10) => {
// [VI] Khai báo biến/hằng số.
    const uid = userId.trim().toLowerCase();
// [VI] Khai báo biến/hằng số.
    const attempts: Array<Record<string, unknown>> = [
// [VI] Thực thi một bước trong luồng xử lý.
      { page, pageSize, userId },
// [VI] Thực thi một bước trong luồng xử lý.
      { page, pageSize },
// [VI] Thực thi một bước trong luồng xử lý.
    ];

// [VI] Khai báo biến/hằng số.
    let lastErr: unknown;
// [VI] Vòng lặp (for).
    for (let attemptIndex = 0; attemptIndex < attempts.length; attemptIndex++) {
// [VI] Khai báo biến/hằng số.
      const params = attempts[attemptIndex];
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
      try {
// [VI] Khai báo biến/hằng số.
        const raw = await api.get<unknown>('/Submission/my', { params });

// [VI] Khai báo biến/hằng số.
        const env = raw as Record<string, unknown> | null;
// [VI] Khai báo biến/hằng số.
        const rows = extractSubmissionRows(raw);
// [VI] Khai báo biến/hằng số.
        const data = rows.map((r) => mapSubmissionListRowToSubmission(r)).filter((s) => s.id);

// [VI] Khai báo biến/hằng số.
        const filtered = uid
// [VI] Thực thi một bước trong luồng xử lý.
          ? data.filter(
// [VI] Khai báo hàm/biểu thức hàm.
              (s) => !s.contributorId || String(s.contributorId).trim().toLowerCase() === uid,
// [VI] Thực thi một bước trong luồng xử lý.
            )
// [VI] Thực thi một bước trong luồng xử lý.
          : data;

// [VI] Khai báo biến/hằng số.
        const isSuccess =
// [VI] Thực thi một bước trong luồng xử lý.
          env && typeof env === 'object' && 'isSuccess' in env
// [VI] Thực thi một bước trong luồng xử lý.
            ? Boolean((env as Record<string, unknown>).isSuccess)
// [VI] Thực thi một bước trong luồng xử lý.
            : true;
// [VI] Khai báo biến/hằng số.
        const message =
// [VI] Thực thi một bước trong luồng xử lý.
          env && typeof env === 'object' && 'message' in env
// [VI] Thực thi một bước trong luồng xử lý.
            ? String((env as Record<string, unknown>).message ?? '')
// [VI] Thực thi một bước trong luồng xử lý.
            : '';

// [VI] Trả về kết quả từ hàm.
        return { isSuccess, message, data: filtered } satisfies SubmissionListResponse;
// [VI] Thực thi một bước trong luồng xử lý.
      } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
        lastErr = err;
// [VI] Khai báo biến/hằng số.
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;

// [VI] Thực thi một bước trong luồng xử lý.
        // Chỉ fallback khi endpoint có thể yêu cầu/không yêu cầu userId.
// [VI] Thực thi một bước trong luồng xử lý.
        // Các mã khác (401/500/...) thì không nên che giấu.
// [VI] Khai báo biến/hằng số.
        const isFallbackable = status === 400 || status === 404;
// [VI] Rẽ nhánh điều kiện (if).
        if (!isFallbackable || attemptIndex === attempts.length - 1) {
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
          throw err;
// [VI] Thực thi một bước trong luồng xử lý.
        }
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    }

// [VI] Ném lỗi (throw) để báo hiệu thất bại.
    throw lastErr;
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Get submissions by status (paginated) */
// [VI] Khai báo hàm/biểu thức hàm.
  getSubmissionsByStatus: async (status: number, page: number = 1, pageSize: number = 10) => {
// [VI] Trả về kết quả từ hàm.
    return api.get<SubmissionListResponse>(
// [VI] Thực thi một bước trong luồng xử lý.
      `/Submission/get-by-status?status=${status}&page=${page}&pageSize=${pageSize}`,
// [VI] Thực thi một bước trong luồng xử lý.
    );
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Get submission detail by ID */
// [VI] Khai báo hàm/biểu thức hàm.
  getSubmissionById: async (id: string) => {
// [VI] Trả về kết quả từ hàm.
    return api.get<SubmissionDetailResponse>(`/Submission/${id}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Delete a submission */
// [VI] Khai báo hàm/biểu thức hàm.
  deleteSubmission: async (id: string) => {
// [VI] Trả về kết quả từ hàm.
    return api.delete<{ isSuccess: boolean; message: string }>(`/Submission/${id}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Confirm submission (final step) */
// [VI] Khai báo hàm/biểu thức hàm.
  confirmSubmission: async (submissionId: string) => {
// [VI] Trả về kết quả từ hàm.
    return api.put<{ isSuccess: boolean; message: string; data: boolean }>(
// [VI] Thực thi một bước trong luồng xử lý.
      `/Submission/confirm-submit-submission?submissionId=${submissionId}`,
// [VI] Thực thi một bước trong luồng xử lý.
      {},
// [VI] Thực thi một bước trong luồng xử lý.
    );
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Request edit for a submission */
// [VI] Khai báo hàm/biểu thức hàm.
  requestEditSubmission: async (submissionId: string) => {
// [VI] Thực thi một bước trong luồng xử lý.
    // We send submissionId as a JSON string `"guid"` assuming it binds to [FromBody] Guid submissionId
// [VI] Thực thi một bước trong luồng xử lý.
    // or we might need { submissionId } depending on backend. We will try passing just the string wrapper.
// [VI] Trả về kết quả từ hàm.
    return api.put<{ isSuccess: boolean; message: string; data: boolean }>(
// [VI] Thực thi một bước trong luồng xử lý.
      '/Submission/edit-request-submission',
// [VI] Thực thi một bước trong luồng xử lý.
      `"${submissionId}"`,
// [VI] Thực thi một bước trong luồng xử lý.
      { headers: { 'Content-Type': 'application/json' } },
// [VI] Thực thi một bước trong luồng xử lý.
    );
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
};
