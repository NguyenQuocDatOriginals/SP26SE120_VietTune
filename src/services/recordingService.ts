import { apiFetch, apiFetchLoose, apiOk, asApiEnvelope, openApiQueryRecord } from '@/api';
import type {
  ApiRecordingListQuery,
  ApiRecordingSearchByFilterQuery,
  ApiSubmissionDto,
} from '@/api';
import type { RecordingUploadDto } from '@/api';
import { legacyGetAnonymous } from '@/api/legacyHttp';
import { buildSubmissionLookupMaps } from '@/services/expertModerationApi';
import { PAGE_SIZE_DEFAULT } from '@/config/pagination';
import {
  Recording,
  SearchFilters,
  PaginatedResponse,
  ApiResponse,
  Region,
  RecordingType,
  RecordingQuality,
  VerificationStatus,
  UserRole,
  InstrumentCategory,
} from '@/types';
import { pickContributorFieldsFromApiRow } from '@/utils/contributorFields';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(obj: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const raw = obj[key];
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
  }
  return '';
}

function pickStringArray(obj: Record<string, unknown>, keys: string[]): string[] {
  for (const key of keys) {
    const raw = obj[key];
    if (Array.isArray(raw)) {
      const arr = raw.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean);
      if (arr.length > 0) return arr;
    }
    if (typeof raw === 'string' && raw.trim()) {
      const arr = raw
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      if (arr.length > 0) return arr;
    }
  }
  return [];
}

function normalizeObjectKeys(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(normalizeObjectKeys);
  const obj = asRecord(input);
  if (!obj) return input;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const normalizedKey = /^[A-Z]/.test(key) ? key.charAt(0).toLowerCase() + key.slice(1) : key;
    out[normalizedKey] = normalizeObjectKeys(value);
  }
  return out;
}

function mapGuestRowToRecording(row: unknown, index: number, lookups?: Record<string, any>): Recording {
  const normalized = asRecord(normalizeObjectKeys(row)) ?? {};
  const id =
    pickString(normalized, ['id', 'recordingId', 'submissionId']) || `guest-recording-${index}`;
  const title = pickString(normalized, ['title', 'titleVietnamese', 'name']) || 'Không có tiêu đề';
  const audioUrl = pickString(normalized, [
    'audioUrl',
    'audioFileUrl',
    'audioData',
    'mediaUrl',
    'url',
  ]);
  const uploadedDate =
    pickString(normalized, ['uploadedDate', 'createdAt', 'uploadedAt']) ||
    new Date(0).toISOString();
  let topLevelInstruments: string[] = [];
  const rawInsts = normalized.instruments || normalized.instrumentList;
  if (Array.isArray(rawInsts)) {
    topLevelInstruments = rawInsts.map(i => {
      if (typeof i === 'string') return i;
      if (i && typeof i === 'object') return (i as any).nameVietnamese || (i as any).name || '';
      return '';
    }).filter(Boolean);
  }
  if (topLevelInstruments.length === 0) {
    topLevelInstruments = pickStringArray(normalized, ['instrumentNames', 'instrumentTags']);
  }

  const culturalContext = asRecord(normalized.culturalContext);
  const contextInstruments = culturalContext
    ? pickStringArray(culturalContext, ['instruments'])
    : [];
  const mergedInstrumentNames = Array.from(
    new Set([...topLevelInstruments, ...contextInstruments]),
  );
  const rawTags = pickStringArray(normalized, ['tags', 'tagNames', 'metadataTags', 'keywords']);

  const ethObj = asRecord(normalized.ethnicity) || asRecord(normalized.ethnicGroup);
  const ethId = (ethObj?.id as string) || pickString(normalized, ['ethnicityId', 'ethnicGroupId']);
  const ethName = (ethObj?.nameVietnamese as string) || (ethObj?.name as string) || pickString(normalized, ['ethnicityName', 'ethnicGroupName']) || (ethId && lookups?.ethnicById?.[String(ethId).trim().toLowerCase()]);

  const ceremonyId = pickString(normalized, ['ceremonyId']);
  if (ceremonyId && !normalized.ceremonyName) {
     const ceremonyName = lookups?.ceremonyById?.[String(ceremonyId).trim().toLowerCase()];
     if (ceremonyName) normalized.ceremonyName = ceremonyName;
  }

  const communeId = pickString(normalized, ['communeId']);
  if (communeId && !normalized.communeName) {
     const communeName = lookups?.communeById?.[String(communeId).trim().toLowerCase()];
     if (communeName) normalized.communeName = communeName;
  }

  const regionRaw = pickString(normalized, ['region', 'regionCode']) || (ethObj?.region as string);
  const regionValues = Object.values(Region);
  const region = regionValues.includes(regionRaw as Region)
    ? (regionRaw as Region)
    : Region.RED_RIVER_DELTA;

  const contrib = pickContributorFieldsFromApiRow(normalized);
  const uploaderIdFlat = pickString(normalized, ['uploaderId', 'uploadedById']);
  const uploaderDisplayName =
    contrib.fullName || pickString(normalized, ['uploaderName', 'uploadedByName']) || 'Guest';
  const uploaderHandle = contrib.username || '';
  const performerName = pickString(normalized, ['performerName', 'PerformerName']);

  return {
    ...normalized,
    id,
    title,
    titleVietnamese: pickString(normalized, ['titleVietnamese']),
    description: pickString(normalized, ['description']),
    ethnicity: {
      id: ethId || 'guest-ethnicity',
      name: ethName || 'Không xác định',
      nameVietnamese: ethName || 'Không xác định',
      region,
      recordingCount: 0,
    },
    region,
    recordingType: RecordingType.OTHER,
    duration: Number(normalized.duration ?? 0) || 0,
    audioUrl,
    waveformUrl: pickString(normalized, ['waveformUrl']),
    coverImage: pickString(normalized, ['coverImage', 'thumbnailUrl']),
    instruments: mergedInstrumentNames.map((name, idx) => ({
      id: `guest-inst-${idx}-${name}`,
      name,
      nameVietnamese: name,
      category: InstrumentCategory.STRING,
      images: [],
      recordingCount: 0,
    })),
    performers: [],
    ...(performerName ? { performerName } : {}),
    recordedDate: pickString(normalized, ['recordedDate', 'recordingDate']),
    uploadedDate,
    uploader: {
      id: contrib.id || uploaderIdFlat || 'guest-uploader',
      username: uploaderHandle,
      email: '',
      fullName: uploaderDisplayName,
      role: UserRole.CONTRIBUTOR,
      createdAt: uploadedDate,
      updatedAt: uploadedDate,
    },
    tags: rawTags,
    metadata: {
      recordingQuality: RecordingQuality.FIELD_RECORDING,
      lyrics: pickString(normalized, ['lyrics']),
    },
    verificationStatus: VerificationStatus.VERIFIED,
    viewCount: Number(normalized.viewCount ?? 0) || 0,
    likeCount: Number(normalized.likeCount ?? 0) || 0,
    downloadCount: Number(normalized.downloadCount ?? 0) || 0,
  };
}

function pickGuestRows(input: unknown, lookups?: Record<string, any>): Recording[] {
  const root = asRecord(input) ?? {};
  const candidates: unknown[] = [
    root.items,
    root.data,
    root.records,
    root.result,
    asRecord(root.data)?.items,
    asRecord(root.data)?.records,
    asRecord(root.data)?.data,
    asRecord(root.result)?.items,
  ];
  let rows: unknown[] = [];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      rows = candidate;
      break;
    }
  }
  if (rows.length === 0 && Array.isArray(input)) {
    rows = input;
  }
  return rows.map((row, idx) => mapGuestRowToRecording(row, idx, lookups));
}

function toGuestPaginatedResponse(
  input: unknown,
  page: number,
  pageSize: number,
  lookups?: Record<string, any>
): PaginatedResponse<Recording> {
  const root = asRecord(input) ?? {};
  const rows = pickGuestRows(input, lookups);
  const pageRaw = root.page ?? asRecord(root.data)?.page;
  const pageSizeRaw = root.pageSize ?? asRecord(root.data)?.pageSize;
  const totalRaw =
    root.total ?? root.totalCount ?? asRecord(root.data)?.total ?? asRecord(root.data)?.totalCount;
  const total = typeof totalRaw === 'number' ? totalRaw : rows.length;
  const totalPagesRaw = root.totalPages ?? asRecord(root.data)?.totalPages;
  const totalPages =
    typeof totalPagesRaw === 'number'
      ? totalPagesRaw
      : Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  return {
    items: rows,
    total,
    totalPages,
    page: typeof pageRaw === 'number' ? pageRaw : page,
    pageSize: typeof pageSizeRaw === 'number' ? pageSizeRaw : pageSize,
  };
}

function toPaginatedRecordingsResponse(
  input: unknown,
  page: number,
  pageSize: number,
  lookups?: Record<string, any>
): PaginatedResponse<Recording> {
  const root = asRecord(input) ?? {};
  const items = pickGuestRows(input, lookups);
  const pageRaw = root.page ?? asRecord(root.data)?.page;
  const pageSizeRaw = root.pageSize ?? asRecord(root.data)?.pageSize;
  const totalRaw =
    root.total ?? root.totalCount ?? asRecord(root.data)?.total ?? asRecord(root.data)?.totalCount;
  const total = typeof totalRaw === 'number' ? totalRaw : items.length;
  const totalPagesRaw = root.totalPages ?? asRecord(root.data)?.totalPages;
  const totalPages =
    typeof totalPagesRaw === 'number'
      ? totalPagesRaw
      : Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  return {
    items,
    total,
    totalPages,
    page: typeof pageRaw === 'number' ? pageRaw : page,
    pageSize: typeof pageSizeRaw === 'number' ? pageSizeRaw : pageSize,
  };
}


type RecordingSearchByFilterResponse =
  | Record<string, unknown>[]
  | {
      data?: Record<string, unknown>[] | { items?: Record<string, unknown>[]; Items?: Record<string, unknown>[] };
      Data?: Record<string, unknown>[] | { items?: Record<string, unknown>[]; Items?: Record<string, unknown>[] };
      items?: Record<string, unknown>[];
      Items?: Record<string, unknown>[];
      records?: Record<string, unknown>[];
      result?: Record<string, unknown>[] | { items?: Record<string, unknown>[] };
      value?: Record<string, unknown>[];
    };

export const recordingService = {
  /** Authenticated title search: GET /api/Recording/search-by-title */
  searchRecordingsByTitle: async (
    title: string,
    page: number = 1,
    pageSize: number = PAGE_SIZE_DEFAULT,
    opts?: { signal?: AbortSignal },
  ): Promise<PaginatedResponse<Recording>> => {
    const data = await apiOk(
      asApiEnvelope<unknown>(
        apiFetchLoose.GET('/api/Recording/search-by-title', {
          params: { query: openApiQueryRecord({ title: title.trim() }) },
          signal: opts?.signal,
        }),
      ),
    );
    const lookups = await buildSubmissionLookupMaps().catch(() => undefined);
    return toPaginatedRecordingsResponse(data, page, pageSize, lookups);
  },

  /** Guest title search (no Authorization): GET /api/RecordingGuest/search-by-title */
  searchGuestRecordingsByTitle: async (
    title: string,
    page: number = 1,
    pageSize: number = PAGE_SIZE_DEFAULT,
    opts?: { signal?: AbortSignal },
  ): Promise<PaginatedResponse<Recording>> => {
    const reqOpts = {
      signal: opts?.signal,
      params: { title: title.trim(), page, pageSize },
    };
    try {
      const data = await legacyGetAnonymous<unknown>('/RecordingGuest/search-by-title', reqOpts);
      const lookups = await buildSubmissionLookupMaps().catch(() => undefined);
      return toGuestPaginatedResponse(data, page, pageSize, lookups);
    } catch (primaryErr) {
      try {
        const data = await legacyGetAnonymous<unknown>('/recordingGuest/search-by-title', reqOpts);
        const lookups = await buildSubmissionLookupMaps().catch(() => undefined);
        return toGuestPaginatedResponse(data, page, pageSize, lookups);
      } catch {
        throw primaryErr;
      }
    }
  },

  getRecordings: async (
    page: number = 1,
    pageSize: number = PAGE_SIZE_DEFAULT,
    opts?: { signal?: AbortSignal },
  ) => {
    const params: ApiRecordingListQuery = { page, pageSize };
    return apiOk(
      asApiEnvelope<PaginatedResponse<Recording>>(
        apiFetch.GET('/api/Recording', {
          params: { query: openApiQueryRecord(params) },
          signal: opts?.signal,
        }),
      ),
    );
  },

  /**
   * Guest-only catalog (no Authorization header): GET /api/RecordingGuest
   * Uses raw axios client to avoid global auth interceptor/token injection.
   */
  getGuestRecordings: async (
    page: number = 1,
    pageSize: number = PAGE_SIZE_DEFAULT,
    opts?: { signal?: AbortSignal },
  ) => {
    const reqOpts = { signal: opts?.signal, params: { page, pageSize } };
    try {
      const data = await legacyGetAnonymous<unknown>('/RecordingGuest', reqOpts);
      const lookups = await buildSubmissionLookupMaps().catch(() => undefined);
      return toGuestPaginatedResponse(data, page, pageSize, lookups);
    } catch (primaryErr) {
      try {
        const data = await legacyGetAnonymous<unknown>('/recordingGuest', reqOpts);
        const lookups = await buildSubmissionLookupMaps().catch(() => undefined);
        return toGuestPaginatedResponse(data, page, pageSize, lookups);
      } catch {
        throw primaryErr;
      }
    }
  },

  /** Guest-only filtered search (no Authorization): GET /api/RecordingGuest/search-by-filter */
  getGuestRecordingsByFilter: async (
    filters: SearchFilters,
    page: number = 1,
    pageSize: number = PAGE_SIZE_DEFAULT,
    opts?: { signal?: AbortSignal },
  ) => {
    const q = filters.query?.trim();
    const ethnicId = filters.ethnicityIds?.find((id) => id?.trim());
    const instrumentId = filters.instrumentIds?.find((id) => id?.trim());
    const regionCode = filters.regions?.[0];
    const reqOpts = {
      signal: opts?.signal,
      params: {
        page,
        pageSize,
        ...(q ? { title: q } : {}),
        ...(ethnicId ? { ethnicGroupId: ethnicId.trim() } : {}),
        ...(instrumentId ? { instrumentId: instrumentId.trim() } : {}),
        ...(regionCode ? { regionCode: String(regionCode) } : {}),
        ...(filters.ceremonyId ? { ceremonyId: filters.ceremonyId.trim() } : {}),
        ...(filters.communeId ? { communeId: filters.communeId.trim() } : {}),
      },
    };
    try {
      const data = await legacyGetAnonymous<unknown>('/RecordingGuest/search-by-filter', reqOpts);
      const lookups = await buildSubmissionLookupMaps().catch(() => undefined);
      return toGuestPaginatedResponse(data, page, pageSize, lookups);
    } catch (primaryErr) {
      try {
        const data = await legacyGetAnonymous<unknown>('/recordingGuest/search-by-filter', reqOpts);
        const lookups = await buildSubmissionLookupMaps().catch(() => undefined);
        return toGuestPaginatedResponse(data, page, pageSize, lookups);
      } catch {
        throw primaryErr;
      }
    }
  },

  /** Researcher: GET /api/Recording/search-by-filter — verified catalog with ID metadata filters. */
  searchRecordingsByFilter: async (query: ApiRecordingSearchByFilterQuery) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === '') continue;
      params.set(k, String(v));
    }
    return apiOk(
      asApiEnvelope<RecordingSearchByFilterResponse>(
        apiFetch.GET('/api/Recording/search-by-filter', {
          params: { query: openApiQueryRecord(query) },
        }),
      ),
    );
  },

  // Get recording by ID (backend: GET /api/Recording/{id})
  getRecordingById: async (id: string) => {
    return apiOk(
      asApiEnvelope<ApiResponse<Recording>>(
        apiFetch.GET('/api/Recording/{id}', {
          params: { path: { id } },
        }),
      ),
    );
  },

  /**
   * Authenticated catalog search with text + facet filters.
   * Legacy `GET /api/Search/songs` was removed from OpenAPI; use `GET /api/Recording/search-by-filter`
   * for metadata filters and `GET /api/Recording/search-by-title` for keyword search.
   */
  searchRecordings: async (
    filters: SearchFilters,
    page: number = 1,
    pageSize: number = PAGE_SIZE_DEFAULT,
    opts?: { signal?: AbortSignal },
  ) => {
    const q = filters.query?.trim();
    const ethnicId = filters.ethnicityIds?.find((id) => id?.trim());
    const instrumentId = filters.instrumentIds?.find((id) => id?.trim());
    const regionCode = filters.regions?.[0];
    const merged: Record<string, string | number> = {
      page,
      pageSize,
    };
    if (q) merged.title = q;
    if (ethnicId) merged.ethnicGroupId = ethnicId.trim();
    if (instrumentId) merged.instrumentId = instrumentId.trim();
    if (regionCode) merged.regionCode = String(regionCode);
    if (filters.ceremonyId) merged.ceremonyId = filters.ceremonyId.trim();
    if (filters.communeId) merged.communeId = filters.communeId.trim();

    const data = await apiOk(
      asApiEnvelope<unknown>(
        apiFetchLoose.GET('/api/Recording/search-by-filter', {
          params: { query: openApiQueryRecord(merged) },
          signal: opts?.signal,
        }),
      ),
    );
    const lookups = await buildSubmissionLookupMaps().catch(() => undefined);
    return toPaginatedRecordingsResponse(data, page, pageSize, lookups);
  },

  // Upload new recording (backend: POST /api/Recording with JSON body)
  uploadRecording: async (data: Partial<Recording>) => {
    return apiOk(
      asApiEnvelope<ApiResponse<Recording>>(
        apiFetchLoose.POST('/api/Recording', {
          body: data as unknown,
        }),
      ),
    );
  },

  // Update recording (backend: PUT /api/Recording/{id}/upload — OpenAPI RecordingDto)
  updateRecording: async (id: string, data: RecordingUploadDto) => {
    return apiOk(
      asApiEnvelope<ApiResponse<Recording>>(
        apiFetch.PUT('/api/Recording/{id}/upload', {
          params: { path: { id } },
          body: data as never,
        }),
      ),
    );
  },

  // Create submission (backend: POST /api/Submission/create-submission)
  createSubmission: async (data: {
    audioFileUrl?: string;
    videoFileUrl?: string;
    uploadedById: string;
  }) => {
    const payload: ApiSubmissionDto & { videoFileUrl?: string } = {
      audioFileUrl: data.audioFileUrl ?? null,
      uploadedById: data.uploadedById,
      videoFileUrl: data.videoFileUrl,
    };
    return apiOk(
      asApiEnvelope<{
        isSuccess: boolean;
        message: string;
        data: {
          audioFileUrl?: string;
          videoFileUrl?: string;
          uploadedById: string;
          submissionId: string;
          recordingId: string;
        };
      }>(
        apiFetch.POST('/api/Submission/create-submission', {
          body: payload,
        }),
      ),
    );
  },

  // Delete recording (backend: DELETE /api/Recording/{id})
  deleteRecording: async (id: string) => {
    return apiOk(
      asApiEnvelope<ApiResponse<void>>(
        apiFetchLoose.DELETE(`/api/Recording/${encodeURIComponent(id)}`, {}),
      ),
    );
  },

  // Get popular recordings
  getPopularRecordings: async (limit: number = 10) => {
    return apiOk(
      asApiEnvelope<ApiResponse<Recording[]>>(
        apiFetchLoose.GET('/api/Recording/search-by-filter', {
          params: { query: { sortBy: 'popular', limit } },
        }),
      ),
    );
  },

  // Get recent recordings
  getRecentRecordings: async (limit: number = 10) => {
    return apiOk(
      asApiEnvelope<ApiResponse<Recording[]>>(
        apiFetchLoose.GET('/api/Recording/search-by-filter', {
          params: { query: { sortBy: 'recent', limit } },
        }),
      ),
    );
  },

  // Get featured recordings
  getFeaturedRecordings: async (limit: number = 10) => {
    return apiOk(
      asApiEnvelope<ApiResponse<Recording[]>>(
        apiFetchLoose.GET('/api/Recording/search-by-filter', {
          params: { query: { sortBy: 'featured', limit } },
        }),
      ),
    );
  },
};
