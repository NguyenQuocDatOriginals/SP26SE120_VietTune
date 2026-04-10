// [VI] Nhập (import) các phụ thuộc cho file.
import axios from 'axios';

// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from './api';

// [VI] Nhập (import) các phụ thuộc cho file.
import { API_BASE_URL } from '@/config/constants';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { RecordingDto } from '@/services/recordingDto';
// [VI] Nhập (import) các phụ thuộc cho file.
import {
// [VI] Thực thi một bước trong luồng xử lý.
  Recording,
// [VI] Thực thi một bước trong luồng xử lý.
  SearchFilters,
// [VI] Thực thi một bước trong luồng xử lý.
  PaginatedResponse,
// [VI] Thực thi một bước trong luồng xử lý.
  ApiResponse,
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

// [VI] Khai báo biến/hằng số.
const guestApiClient = axios.create({
// [VI] Thực thi một bước trong luồng xử lý.
  baseURL: API_BASE_URL,
// [VI] Thực thi một bước trong luồng xử lý.
  timeout: 30000,
// [VI] Thực thi một bước trong luồng xử lý.
  headers: {
// [VI] Thực thi một bước trong luồng xử lý.
    'Content-Type': 'application/json',
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
});

// [VI] Khai báo hàm/biểu thức hàm.
function asRecord(value: unknown): Record<string, unknown> | null {
// [VI] Trả về kết quả từ hàm.
  return value && typeof value === 'object' && !Array.isArray(value)
// [VI] Thực thi một bước trong luồng xử lý.
    ? (value as Record<string, unknown>)
// [VI] Thực thi một bước trong luồng xử lý.
    : null;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function pickString(obj: Record<string, unknown>, keys: string[]): string {
// [VI] Vòng lặp (for).
  for (const key of keys) {
// [VI] Khai báo biến/hằng số.
    const raw = obj[key];
// [VI] Rẽ nhánh điều kiện (if).
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return '';
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function pickStringArray(obj: Record<string, unknown>, keys: string[]): string[] {
// [VI] Vòng lặp (for).
  for (const key of keys) {
// [VI] Khai báo biến/hằng số.
    const raw = obj[key];
// [VI] Rẽ nhánh điều kiện (if).
    if (Array.isArray(raw)) {
// [VI] Khai báo biến/hằng số.
      const arr = raw.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean);
// [VI] Rẽ nhánh điều kiện (if).
      if (arr.length > 0) return arr;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Rẽ nhánh điều kiện (if).
    if (typeof raw === 'string' && raw.trim()) {
// [VI] Khai báo biến/hằng số.
      const arr = raw
// [VI] Thực thi một bước trong luồng xử lý.
        .split(',')
// [VI] Khai báo hàm/biểu thức hàm.
        .map((x) => x.trim())
// [VI] Thực thi một bước trong luồng xử lý.
        .filter(Boolean);
// [VI] Rẽ nhánh điều kiện (if).
      if (arr.length > 0) return arr;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return [];
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function normalizeObjectKeys(input: unknown): unknown {
// [VI] Rẽ nhánh điều kiện (if).
  if (Array.isArray(input)) return input.map(normalizeObjectKeys);
// [VI] Khai báo biến/hằng số.
  const obj = asRecord(input);
// [VI] Rẽ nhánh điều kiện (if).
  if (!obj) return input;
// [VI] Khai báo biến/hằng số.
  const out: Record<string, unknown> = {};
// [VI] Vòng lặp (for).
  for (const [key, value] of Object.entries(obj)) {
// [VI] Khai báo biến/hằng số.
    const normalizedKey = /^[A-Z]/.test(key) ? key.charAt(0).toLowerCase() + key.slice(1) : key;
// [VI] Thực thi một bước trong luồng xử lý.
    out[normalizedKey] = normalizeObjectKeys(value);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return out;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function mapGuestRowToRecording(row: unknown, index: number): Recording {
// [VI] Khai báo biến/hằng số.
  const normalized = asRecord(normalizeObjectKeys(row)) ?? {};
// [VI] Khai báo biến/hằng số.
  const id =
// [VI] Thực thi một bước trong luồng xử lý.
    pickString(normalized, ['id', 'recordingId', 'submissionId']) || `guest-recording-${index}`;
// [VI] Khai báo biến/hằng số.
  const title = pickString(normalized, ['title', 'titleVietnamese', 'name']) || 'Không có tiêu đề';
// [VI] Khai báo biến/hằng số.
  const audioUrl = pickString(normalized, [
// [VI] Thực thi một bước trong luồng xử lý.
    'audioUrl',
// [VI] Thực thi một bước trong luồng xử lý.
    'audioFileUrl',
// [VI] Thực thi một bước trong luồng xử lý.
    'audioData',
// [VI] Thực thi một bước trong luồng xử lý.
    'mediaUrl',
// [VI] Thực thi một bước trong luồng xử lý.
    'url',
// [VI] Thực thi một bước trong luồng xử lý.
  ]);
// [VI] Khai báo biến/hằng số.
  const uploadedDate =
// [VI] Thực thi một bước trong luồng xử lý.
    pickString(normalized, ['uploadedDate', 'createdAt', 'uploadedAt']) ||
// [VI] Thực thi một bước trong luồng xử lý.
    new Date(0).toISOString();
// [VI] Khai báo biến/hằng số.
  const regionRaw = pickString(normalized, ['region', 'regionCode']);
// [VI] Khai báo biến/hằng số.
  const regionValues = Object.values(Region);
// [VI] Khai báo biến/hằng số.
  const region = regionValues.includes(regionRaw as Region)
// [VI] Thực thi một bước trong luồng xử lý.
    ? (regionRaw as Region)
// [VI] Thực thi một bước trong luồng xử lý.
    : Region.RED_RIVER_DELTA;

// [VI] Khai báo biến/hằng số.
  const topLevelInstruments = pickStringArray(normalized, [
// [VI] Thực thi một bước trong luồng xử lý.
    'instrumentNames',
// [VI] Thực thi một bước trong luồng xử lý.
    'instruments',
// [VI] Thực thi một bước trong luồng xử lý.
    'instrumentTags',
// [VI] Thực thi một bước trong luồng xử lý.
  ]);
// [VI] Khai báo biến/hằng số.
  const culturalContext = asRecord(normalized.culturalContext);
// [VI] Khai báo biến/hằng số.
  const contextInstruments = culturalContext
// [VI] Thực thi một bước trong luồng xử lý.
    ? pickStringArray(culturalContext, ['instruments'])
// [VI] Thực thi một bước trong luồng xử lý.
    : [];
// [VI] Khai báo biến/hằng số.
  const mergedInstrumentNames = Array.from(
// [VI] Thực thi một bước trong luồng xử lý.
    new Set([...topLevelInstruments, ...contextInstruments]),
// [VI] Thực thi một bước trong luồng xử lý.
  );
// [VI] Khai báo biến/hằng số.
  const rawTags = pickStringArray(normalized, ['tags', 'tagNames', 'metadataTags', 'keywords']);

// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    id,
// [VI] Thực thi một bước trong luồng xử lý.
    title,
// [VI] Thực thi một bước trong luồng xử lý.
    titleVietnamese: pickString(normalized, ['titleVietnamese']),
// [VI] Thực thi một bước trong luồng xử lý.
    description: pickString(normalized, ['description']),
// [VI] Thực thi một bước trong luồng xử lý.
    ethnicity: {
// [VI] Thực thi một bước trong luồng xử lý.
      id: pickString(normalized, ['ethnicityId']) || 'guest-ethnicity',
// [VI] Thực thi một bước trong luồng xử lý.
      name: pickString(normalized, ['ethnicityName', 'ethnicity']) || 'Không xác định',
// [VI] Thực thi một bước trong luồng xử lý.
      nameVietnamese:
// [VI] Thực thi một bước trong luồng xử lý.
        pickString(normalized, ['ethnicityNameVietnamese', 'ethnicityName', 'ethnicity']) ||
// [VI] Thực thi một bước trong luồng xử lý.
        'Không xác định',
// [VI] Thực thi một bước trong luồng xử lý.
      region,
// [VI] Thực thi một bước trong luồng xử lý.
      recordingCount: 0,
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    region,
// [VI] Thực thi một bước trong luồng xử lý.
    recordingType: RecordingType.OTHER,
// [VI] Thực thi một bước trong luồng xử lý.
    duration: Number(normalized.duration ?? 0) || 0,
// [VI] Thực thi một bước trong luồng xử lý.
    audioUrl,
// [VI] Thực thi một bước trong luồng xử lý.
    waveformUrl: pickString(normalized, ['waveformUrl']),
// [VI] Thực thi một bước trong luồng xử lý.
    coverImage: pickString(normalized, ['coverImage', 'thumbnailUrl']),
// [VI] Khai báo hàm/biểu thức hàm.
    instruments: mergedInstrumentNames.map((name, idx) => ({
// [VI] Thực thi một bước trong luồng xử lý.
      id: `guest-inst-${idx}-${name}`,
// [VI] Thực thi một bước trong luồng xử lý.
      name,
// [VI] Thực thi một bước trong luồng xử lý.
      nameVietnamese: name,
// [VI] Thực thi một bước trong luồng xử lý.
      category: InstrumentCategory.STRING,
// [VI] Thực thi một bước trong luồng xử lý.
      images: [],
// [VI] Thực thi một bước trong luồng xử lý.
      recordingCount: 0,
// [VI] Thực thi một bước trong luồng xử lý.
    })),
// [VI] Thực thi một bước trong luồng xử lý.
    performers: [],
// [VI] Thực thi một bước trong luồng xử lý.
    recordedDate: pickString(normalized, ['recordedDate', 'recordingDate']),
// [VI] Thực thi một bước trong luồng xử lý.
    uploadedDate,
// [VI] Thực thi một bước trong luồng xử lý.
    uploader: {
// [VI] Thực thi một bước trong luồng xử lý.
      id: pickString(normalized, ['uploaderId', 'uploadedById']) || 'guest-uploader',
// [VI] Thực thi một bước trong luồng xử lý.
      username: pickString(normalized, ['uploaderName', 'uploadedByName']) || 'guest',
// [VI] Thực thi một bước trong luồng xử lý.
      email: '',
// [VI] Thực thi một bước trong luồng xử lý.
      fullName: pickString(normalized, ['uploaderName', 'uploadedByName']) || 'Guest',
// [VI] Thực thi một bước trong luồng xử lý.
      role: UserRole.USER,
// [VI] Thực thi một bước trong luồng xử lý.
      createdAt: uploadedDate,
// [VI] Thực thi một bước trong luồng xử lý.
      updatedAt: uploadedDate,
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    tags: rawTags,
// [VI] Thực thi một bước trong luồng xử lý.
    metadata: {
// [VI] Thực thi một bước trong luồng xử lý.
      recordingQuality: RecordingQuality.FIELD_RECORDING,
// [VI] Thực thi một bước trong luồng xử lý.
      lyrics: pickString(normalized, ['lyrics']),
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    verificationStatus: VerificationStatus.VERIFIED,
// [VI] Thực thi một bước trong luồng xử lý.
    viewCount: Number(normalized.viewCount ?? 0) || 0,
// [VI] Thực thi một bước trong luồng xử lý.
    likeCount: Number(normalized.likeCount ?? 0) || 0,
// [VI] Thực thi một bước trong luồng xử lý.
    downloadCount: Number(normalized.downloadCount ?? 0) || 0,
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function pickGuestRows(input: unknown): Recording[] {
// [VI] Khai báo hàm/biểu thức hàm.
  if (Array.isArray(input)) return input.map((row, idx) => mapGuestRowToRecording(row, idx));
// [VI] Khai báo biến/hằng số.
  const root = asRecord(input);
// [VI] Rẽ nhánh điều kiện (if).
  if (!root) return [];
// [VI] Khai báo biến/hằng số.
  const candidates: unknown[] = [
// [VI] Thực thi một bước trong luồng xử lý.
    root.items,
// [VI] Thực thi một bước trong luồng xử lý.
    root.data,
// [VI] Thực thi một bước trong luồng xử lý.
    root.records,
// [VI] Thực thi một bước trong luồng xử lý.
    root.result,
// [VI] Thực thi một bước trong luồng xử lý.
    asRecord(root.data)?.items,
// [VI] Thực thi một bước trong luồng xử lý.
    asRecord(root.data)?.records,
// [VI] Thực thi một bước trong luồng xử lý.
    asRecord(root.data)?.data,
// [VI] Thực thi một bước trong luồng xử lý.
    asRecord(root.result)?.items,
// [VI] Thực thi một bước trong luồng xử lý.
  ];
// [VI] Vòng lặp (for).
  for (const candidate of candidates) {
// [VI] Rẽ nhánh điều kiện (if).
    if (Array.isArray(candidate)) {
// [VI] Khai báo hàm/biểu thức hàm.
      return candidate.map((row, idx) => mapGuestRowToRecording(row, idx));
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return [];
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function toGuestPaginatedResponse(
// [VI] Thực thi một bước trong luồng xử lý.
  input: unknown,
// [VI] Thực thi một bước trong luồng xử lý.
  page: number,
// [VI] Thực thi một bước trong luồng xử lý.
  pageSize: number,
// [VI] Thực thi một bước trong luồng xử lý.
): PaginatedResponse<Recording> {
// [VI] Khai báo biến/hằng số.
  const root = asRecord(input) ?? {};
// [VI] Khai báo biến/hằng số.
  const rows = pickGuestRows(input);
// [VI] Khai báo biến/hằng số.
  const pageRaw = root.page ?? asRecord(root.data)?.page;
// [VI] Khai báo biến/hằng số.
  const pageSizeRaw = root.pageSize ?? asRecord(root.data)?.pageSize;
// [VI] Khai báo biến/hằng số.
  const totalRaw =
// [VI] Thực thi một bước trong luồng xử lý.
    root.total ?? root.totalCount ?? asRecord(root.data)?.total ?? asRecord(root.data)?.totalCount;
// [VI] Khai báo biến/hằng số.
  const total = typeof totalRaw === 'number' ? totalRaw : rows.length;
// [VI] Khai báo biến/hằng số.
  const totalPagesRaw = root.totalPages ?? asRecord(root.data)?.totalPages;
// [VI] Khai báo biến/hằng số.
  const totalPages =
// [VI] Thực thi một bước trong luồng xử lý.
    typeof totalPagesRaw === 'number'
// [VI] Thực thi một bước trong luồng xử lý.
      ? totalPagesRaw
// [VI] Thực thi một bước trong luồng xử lý.
      : Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    items: rows,
// [VI] Thực thi một bước trong luồng xử lý.
    total,
// [VI] Thực thi một bước trong luồng xử lý.
    totalPages,
// [VI] Thực thi một bước trong luồng xử lý.
    page: typeof pageRaw === 'number' ? pageRaw : page,
// [VI] Thực thi một bước trong luồng xử lý.
    pageSize: typeof pageSizeRaw === 'number' ? pageSizeRaw : pageSize,
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const recordingService = {
// [VI] Thực thi một bước trong luồng xử lý.
  // Get all recordings with pagination (backend: GET /api/Recording)
// [VI] Thực thi một bước trong luồng xử lý.
  getRecordings: async (
// [VI] Thực thi một bước trong luồng xử lý.
    page: number = 1,
// [VI] Thực thi một bước trong luồng xử lý.
    pageSize: number = 20,
// [VI] Thực thi một bước trong luồng xử lý.
    opts?: { signal?: AbortSignal },
// [VI] Khai báo hàm/biểu thức hàm.
  ) => {
// [VI] Trả về kết quả từ hàm.
    return api.get<PaginatedResponse<Recording>>(`/Recording?page=${page}&pageSize=${pageSize}`, {
// [VI] Thực thi một bước trong luồng xử lý.
      signal: opts?.signal,
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /**
// [VI] Thực thi một bước trong luồng xử lý.
   * Guest-only catalog (no Authorization header): GET /api/RecordingGuest
// [VI] Thực thi một bước trong luồng xử lý.
   * Uses raw axios client to avoid global auth interceptor/token injection.
// [VI] Thực thi một bước trong luồng xử lý.
   */
// [VI] Thực thi một bước trong luồng xử lý.
  getGuestRecordings: async (
// [VI] Thực thi một bước trong luồng xử lý.
    page: number = 1,
// [VI] Thực thi một bước trong luồng xử lý.
    pageSize: number = 20,
// [VI] Thực thi một bước trong luồng xử lý.
    opts?: { signal?: AbortSignal },
// [VI] Khai báo hàm/biểu thức hàm.
  ) => {
// [VI] Khai báo biến/hằng số.
    const qs = `?page=${page}&pageSize=${pageSize}`;
// [VI] Khai báo biến/hằng số.
    const reqOpts = { signal: opts?.signal };
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const response = await guestApiClient.get<unknown>(`/RecordingGuest${qs}`, reqOpts);
// [VI] Trả về kết quả từ hàm.
      return toGuestPaginatedResponse(response.data, page, pageSize);
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (primaryErr) {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
      try {
// [VI] Thực thi một bước trong luồng xử lý.
        // Compatibility fallback for backends exposing camelCase route.
// [VI] Khai báo biến/hằng số.
        const fallbackRes = await guestApiClient.get<unknown>(`/recordingGuest${qs}`, reqOpts);
// [VI] Trả về kết quả từ hàm.
        return toGuestPaginatedResponse(fallbackRes.data, page, pageSize);
// [VI] Thực thi một bước trong luồng xử lý.
      } catch {
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
        throw primaryErr;
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /** Researcher: GET /api/Recording/search-by-filter — verified catalog with ID metadata filters. */
// [VI] Khai báo hàm/biểu thức hàm.
  searchRecordingsByFilter: async (query: Record<string, string | number | undefined>) => {
// [VI] Khai báo biến/hằng số.
    const params = new URLSearchParams();
// [VI] Vòng lặp (for).
    for (const [k, v] of Object.entries(query)) {
// [VI] Rẽ nhánh điều kiện (if).
      if (v === undefined || v === '') continue;
// [VI] Thực thi một bước trong luồng xử lý.
      params.set(k, String(v));
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Trả về kết quả từ hàm.
    return api.get<unknown>(`/Recording/search-by-filter?${params.toString()}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Get recording by ID (backend: GET /api/Recording/{id})
// [VI] Khai báo hàm/biểu thức hàm.
  getRecordingById: async (id: string) => {
// [VI] Trả về kết quả từ hàm.
    return api.get<ApiResponse<Recording>>(`/Recording/${id}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Search recordings (backend: GET /api/Search/songs with query params)
// [VI] Thực thi một bước trong luồng xử lý.
  searchRecordings: async (
// [VI] Thực thi một bước trong luồng xử lý.
    filters: SearchFilters,
// [VI] Thực thi một bước trong luồng xử lý.
    page: number = 1,
// [VI] Thực thi một bước trong luồng xử lý.
    pageSize: number = 20,
// [VI] Thực thi một bước trong luồng xử lý.
    opts?: { signal?: AbortSignal },
// [VI] Khai báo hàm/biểu thức hàm.
  ) => {
// [VI] Khai báo biến/hằng số.
    const params = new URLSearchParams();
// [VI] Rẽ nhánh điều kiện (if).
    if (filters.query) params.append('q', filters.query);
// [VI] Thực thi một bước trong luồng xử lý.
    params.append('page', String(page));
// [VI] Thực thi một bước trong luồng xử lý.
    params.append('pageSize', String(pageSize));
// [VI] Rẽ nhánh điều kiện (if).
    if (filters.regions?.length) params.append('region', filters.regions.join(','));
// [VI] Rẽ nhánh điều kiện (if).
    if (filters.recordingTypes?.length) params.append('type', filters.recordingTypes.join(','));
// [VI] Rẽ nhánh điều kiện (if).
    if (filters.tags?.length) params.append('tags', filters.tags.join(','));
// [VI] Trả về kết quả từ hàm.
    return api.get<PaginatedResponse<Recording>>(`/Search/songs?${params.toString()}`, {
// [VI] Thực thi một bước trong luồng xử lý.
      signal: opts?.signal,
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Upload new recording (backend: POST /api/Recording with JSON body)
// [VI] Khai báo hàm/biểu thức hàm.
  uploadRecording: async (data: Partial<Recording>) => {
// [VI] Trả về kết quả từ hàm.
    return api.post<ApiResponse<Recording>>('/Recording', data);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Update recording (backend: PUT /api/Recording/{id}/upload — OpenAPI RecordingDto)
// [VI] Khai báo hàm/biểu thức hàm.
  updateRecording: async (id: string, data: RecordingDto) => {
// [VI] Trả về kết quả từ hàm.
    return api.put<ApiResponse<Recording>>(`/Recording/${id}/upload`, data);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Create submission (backend: POST /api/Submission/create-submission)
// [VI] Thực thi một bước trong luồng xử lý.
  createSubmission: async (data: {
// [VI] Thực thi một bước trong luồng xử lý.
    audioFileUrl?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    videoFileUrl?: string;
// [VI] Thực thi một bước trong luồng xử lý.
    uploadedById: string;
// [VI] Khai báo hàm/biểu thức hàm.
  }) => {
// [VI] Trả về kết quả từ hàm.
    return api.post<{
// [VI] Thực thi một bước trong luồng xử lý.
      isSuccess: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
      message: string;
// [VI] Thực thi một bước trong luồng xử lý.
      data: {
// [VI] Thực thi một bước trong luồng xử lý.
        audioFileUrl?: string;
// [VI] Thực thi một bước trong luồng xử lý.
        videoFileUrl?: string;
// [VI] Thực thi một bước trong luồng xử lý.
        uploadedById: string;
// [VI] Thực thi một bước trong luồng xử lý.
        submissionId: string;
// [VI] Thực thi một bước trong luồng xử lý.
        recordingId: string;
// [VI] Thực thi một bước trong luồng xử lý.
      };
// [VI] Thực thi một bước trong luồng xử lý.
    }>('/Submission/create-submission', data);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Delete recording (backend: DELETE /api/Recording/{id})
// [VI] Khai báo hàm/biểu thức hàm.
  deleteRecording: async (id: string) => {
// [VI] Trả về kết quả từ hàm.
    return api.delete<ApiResponse<void>>(`/Recording/${id}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Get popular recordings (backend: GET /api/Song/popular)
// [VI] Khai báo hàm/biểu thức hàm.
  getPopularRecordings: async (limit: number = 10) => {
// [VI] Trả về kết quả từ hàm.
    return api.get<ApiResponse<Recording[]>>(`/Song/popular?pageSize=${limit}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Get recent recordings (backend: GET /api/Song/recent)
// [VI] Khai báo hàm/biểu thức hàm.
  getRecentRecordings: async (limit: number = 10) => {
// [VI] Trả về kết quả từ hàm.
    return api.get<ApiResponse<Recording[]>>(`/Song/recent?pageSize=${limit}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Get featured recordings (backend: GET /api/Song/featured)
// [VI] Khai báo hàm/biểu thức hàm.
  getFeaturedRecordings: async (limit: number = 10) => {
// [VI] Trả về kết quả từ hàm.
    return api.get<ApiResponse<Recording[]>>(`/Song/featured?pageSize=${limit}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
};
