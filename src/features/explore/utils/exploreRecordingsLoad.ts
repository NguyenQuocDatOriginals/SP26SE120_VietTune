// [VI] Nhập (import) các phụ thuộc cho file.
import axios from 'axios';

// [VI] Nhập (import) các phụ thuộc cho file.
import type { ExploreSearchMode } from '@/components/features/ExploreSearchHeader';
// [VI] Nhập (import) các phụ thuộc cho file.
import { applyGuestFilters } from '@/features/explore/utils/exploreGuestFilters';
// [VI] Nhập (import) các phụ thuộc cho file.
import { recordingService } from '@/services/recordingService';
// [VI] Nhập (import) các phụ thuộc cho file.
import { fetchVerifiedSubmissionsAsRecordings } from '@/services/researcherArchiveService';
// [VI] Nhập (import) các phụ thuộc cho file.
import { semanticSearchService } from '@/services/semanticSearchService';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { Recording, SearchFilters } from '@/types';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type ExploreDataSource =
// [VI] Thực thi một bước trong luồng xử lý.
  | 'recordingGuest'
// [VI] Thực thi một bước trong luồng xử lý.
  | 'recordingApi'
// [VI] Thực thi một bước trong luồng xử lý.
  | 'searchApi'
// [VI] Thực thi một bước trong luồng xử lý.
  | 'archiveFallback'
// [VI] Thực thi một bước trong luồng xử lý.
  | 'semanticLocal'
// [VI] Thực thi một bước trong luồng xử lý.
  | 'empty';

// [VI] Khai báo kiểu (type) để mô tả dữ liệu.
type ApiResponseType = { items: Recording[]; total: number; totalPages: number };

// [VI] Khai báo hàm/biểu thức hàm.
function asApiResponse(value: unknown): ApiResponseType {
// [VI] Rẽ nhánh điều kiện (if).
  if (!value || typeof value !== 'object') {
// [VI] Trả về kết quả từ hàm.
    return { items: [], total: 0, totalPages: 1 };
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Khai báo biến/hằng số.
  const root = value as Record<string, unknown>;
// [VI] Khai báo biến/hằng số.
  const items = Array.isArray(root.items) ? (root.items as Recording[]) : [];
// [VI] Khai báo biến/hằng số.
  const total = typeof root.total === 'number' ? root.total : items.length;
// [VI] Khai báo biến/hằng số.
  const totalPages = typeof root.totalPages === 'number' ? root.totalPages : 1;
// [VI] Trả về kết quả từ hàm.
  return { items, total, totalPages };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function isExploreRequestAborted(e: unknown): boolean {
// [VI] Rẽ nhánh điều kiện (if).
  if (axios.isCancel(e)) return true;
// [VI] Rẽ nhánh điều kiện (if).
  if (axios.isAxiosError(e)) {
// [VI] Trả về kết quả từ hàm.
    return e.code === 'ERR_CANCELED' || e.name === 'CanceledError';
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return false;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type ExploreLoadInput = {
// [VI] Thực thi một bước trong luồng xử lý.
  signal?: AbortSignal;
// [VI] Thực thi một bước trong luồng xử lý.
  currentPage: number;
// [VI] Thực thi một bước trong luồng xử lý.
  exploreMode: ExploreSearchMode;
// [VI] Thực thi một bước trong luồng xử lý.
  filters: SearchFilters;
// [VI] Thực thi một bước trong luồng xử lý.
  sqActive: string;
// [VI] Thực thi một bước trong luồng xử lý.
  isAuthenticated: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type ExploreLoadSuccess = {
// [VI] Thực thi một bước trong luồng xử lý.
  recordings: Recording[];
// [VI] Thực thi một bước trong luồng xử lý.
  totalResults: number;
// [VI] Thực thi một bước trong luồng xử lý.
  dataSource: ExploreDataSource;
// [VI] Thực thi một bước trong luồng xử lý.
  /** Set when primary API failed but archive fallback (or empty) was used. */
// [VI] Thực thi một bước trong luồng xử lý.
  fetchWarning?: string;
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Khai báo hàm/biểu thức hàm.
function sortByUploadedDesc(items: Recording[]): Recording[] {
// [VI] Trả về kết quả từ hàm.
  return [...items].sort(
// [VI] Khai báo hàm/biểu thức hàm.
    (a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime(),
// [VI] Thực thi một bước trong luồng xử lý.
  );
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Single Explore fetch path: keyword vs semantic, guest vs auth, with optional AbortSignal.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function loadExploreRecordings(input: ExploreLoadInput): Promise<ExploreLoadSuccess> {
// [VI] Khai báo biến/hằng số.
  const { signal, currentPage, exploreMode, filters, sqActive, isAuthenticated } = input;
// [VI] Khai báo biến/hằng số.
  const apiOpts = { signal };

// [VI] Khai báo biến/hằng số.
  const facetOnly: SearchFilters = { ...filters };
// [VI] Rẽ nhánh điều kiện (if).
  if (exploreMode === 'semantic') delete facetOnly.query;

// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Khai báo biến/hằng số.
    let response: ApiResponseType;

// [VI] Rẽ nhánh điều kiện (if).
    if (exploreMode === 'semantic' && sqActive) {
// [VI] Rẽ nhánh điều kiện (if).
      if (!isAuthenticated) {
// [VI] Khai báo biến/hằng số.
        const semanticResponse = await semanticSearchService.searchSemantic({
// [VI] Thực thi một bước trong luồng xử lý.
          q: sqActive,
// [VI] Thực thi một bước trong luồng xử lý.
          topK: 10,
// [VI] Thực thi một bước trong luồng xử lý.
        });
// [VI] Khai báo biến/hằng số.
        const ranked = semanticResponse.map((r) => ({
// [VI] Thực thi một bước trong luồng xử lý.
          ...r.recording,
// [VI] Thực thi một bước trong luồng xử lý.
          _semanticScore: r.similarityScore,
// [VI] Thực thi một bước trong luồng xử lý.
        }));
// [VI] Khai báo biến/hằng số.
        const pooled = applyGuestFilters(ranked, facetOnly);
// [VI] Thực thi một bước trong luồng xử lý.
        response = { items: pooled, total: pooled.length, totalPages: 1 };
// [VI] Thực thi một bước trong luồng xử lý.
      } else {
// [VI] Khai báo biến/hằng số.
        const semanticResponse = await semanticSearchService.searchSemantic({
// [VI] Thực thi một bước trong luồng xử lý.
          q: sqActive,
// [VI] Thực thi một bước trong luồng xử lý.
          topK: 10,
// [VI] Thực thi một bước trong luồng xử lý.
        });
// [VI] Khai báo biến/hằng số.
        const ranked = semanticResponse.map((r) => ({
// [VI] Thực thi một bước trong luồng xử lý.
          ...r.recording,
// [VI] Thực thi một bước trong luồng xử lý.
          _semanticScore: r.similarityScore,
// [VI] Thực thi một bước trong luồng xử lý.
        }));
// [VI] Khai báo biến/hằng số.
        const pooled =
// [VI] Thực thi một bước trong luồng xử lý.
          Object.keys(facetOnly).length > 0 ? applyGuestFilters(ranked, facetOnly) : ranked;
// [VI] Thực thi một bước trong luồng xử lý.
        response = { items: pooled, total: pooled.length, totalPages: 1 };
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    } else if (!isAuthenticated) {
// [VI] Khai báo biến/hằng số.
      const guestRes = await recordingService.getGuestRecordings(currentPage, 20, apiOpts);
// [VI] Khai báo biến/hằng số.
      const activeFilters = exploreMode === 'semantic' ? facetOnly : filters;
// [VI] Khai báo biến/hằng số.
      const filteredGuestItems = applyGuestFilters(
// [VI] Thực thi một bước trong luồng xử lý.
        Array.isArray(guestRes?.items) ? guestRes.items : [],
// [VI] Thực thi một bước trong luồng xử lý.
        activeFilters,
// [VI] Thực thi một bước trong luồng xử lý.
      );
// [VI] Thực thi một bước trong luồng xử lý.
      response = {
// [VI] Thực thi một bước trong luồng xử lý.
        items: filteredGuestItems,
// [VI] Thực thi một bước trong luồng xử lý.
        total: filteredGuestItems.length,
// [VI] Thực thi một bước trong luồng xử lý.
        totalPages: 1,
// [VI] Thực thi một bước trong luồng xử lý.
      };
// [VI] Thực thi một bước trong luồng xử lý.
    } else if (Object.keys(exploreMode === 'semantic' ? facetOnly : filters).length > 0) {
// [VI] Khai báo biến/hằng số.
      const activeFilters = exploreMode === 'semantic' ? facetOnly : filters;
// [VI] Khai báo biến/hằng số.
      const res = await recordingService.searchRecordings(activeFilters, currentPage, 20, apiOpts);
// [VI] Thực thi một bước trong luồng xử lý.
      response = asApiResponse(res);
// [VI] Thực thi một bước trong luồng xử lý.
    } else {
// [VI] Khai báo biến/hằng số.
      const res = await recordingService.getRecordings(currentPage, 20, apiOpts);
// [VI] Thực thi một bước trong luồng xử lý.
      response = asApiResponse(res);
// [VI] Thực thi một bước trong luồng xử lý.
    }

// [VI] Khai báo biến/hằng số.
    const apiItems = Array.isArray(response?.items) ? response.items : [];
// [VI] Khai báo biến/hằng số.
    const apiTotal = typeof response?.total === 'number' ? response.total : apiItems.length;
// [VI] Khai báo biến/hằng số.
    let dataSource: ExploreDataSource = 'empty';

// [VI] Rẽ nhánh điều kiện (if).
    if (exploreMode === 'semantic' && sqActive) {
// [VI] Thực thi một bước trong luồng xử lý.
      dataSource = apiItems.length > 0 ? 'searchApi' : 'empty';
// [VI] Thực thi một bước trong luồng xử lý.
    } else if (!isAuthenticated) {
// [VI] Thực thi một bước trong luồng xử lý.
      dataSource = apiItems.length > 0 ? 'recordingGuest' : 'empty';
// [VI] Thực thi một bước trong luồng xử lý.
    } else if (Object.keys(exploreMode === 'semantic' ? facetOnly : filters).length > 0) {
// [VI] Thực thi một bước trong luồng xử lý.
      dataSource = apiItems.length > 0 ? 'searchApi' : 'empty';
// [VI] Thực thi một bước trong luồng xử lý.
    } else {
// [VI] Thực thi một bước trong luồng xử lý.
      dataSource = apiItems.length > 0 ? 'recordingApi' : 'empty';
// [VI] Thực thi một bước trong luồng xử lý.
    }

// [VI] Trả về kết quả từ hàm.
    return {
// [VI] Thực thi một bước trong luồng xử lý.
      recordings: sortByUploadedDesc(apiItems),
// [VI] Thực thi một bước trong luồng xử lý.
      totalResults: apiTotal,
// [VI] Thực thi một bước trong luồng xử lý.
      dataSource,
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Thực thi một bước trong luồng xử lý.
  } catch (error) {
// [VI] Rẽ nhánh điều kiện (if).
    if (isExploreRequestAborted(error)) throw error;
// [VI] Khai báo biến/hằng số.
    const warning = 'Không tải được dữ liệu. Bạn có thể thử lại sau.';
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const apiFallback = await fetchVerifiedSubmissionsAsRecordings({ signal });
// [VI] Rẽ nhánh điều kiện (if).
      if (signal?.aborted) throw error;

// [VI] Khai báo biến/hằng số.
      let localFallback: Recording[] = [];
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
      try {
// [VI] Khai báo biến/hằng số.
        const { getLocalRecordingMetaList, getLocalRecordingFull } =
// [VI] Thực thi một bước trong luồng xử lý.
          await import('@/services/recordingStorage');
// [VI] Khai báo biến/hằng số.
        const { migrateVideoDataToVideoData } = await import('@/utils/helpers');
// [VI] Khai báo biến/hằng số.
        const { convertLocalToRecording } = await import('@/utils/localRecordingToRecording');
// [VI] Khai báo biến/hằng số.
        const { ModerationStatus } = await import('@/types');

// [VI] Khai báo biến/hằng số.
        const meta = await getLocalRecordingMetaList();
// [VI] Khai báo biến/hằng số.
        const migrated = migrateVideoDataToVideoData(meta as import('@/types').LocalRecording[]);
// [VI] Khai báo biến/hằng số.
        const approved = migrated.filter(
// [VI] Khai báo hàm/biểu thức hàm.
          (r) =>
// [VI] Thực thi một bước trong luồng xử lý.
            r.moderation &&
// [VI] Thực thi một bước trong luồng xử lý.
            typeof r.moderation === 'object' &&
// [VI] Thực thi một bước trong luồng xử lý.
            'status' in r.moderation &&
// [VI] Thực thi một bước trong luồng xử lý.
            (r.moderation as { status?: string }).status === ModerationStatus.APPROVED,
// [VI] Thực thi một bước trong luồng xử lý.
        );
// [VI] Khai báo biến/hằng số.
        const fullItems = await Promise.all(approved.map((r) => getLocalRecordingFull(r.id ?? '')));
// [VI] Khai báo biến/hằng số.
        const locals = fullItems.filter((r): r is import('@/types').LocalRecording => r != null);
// [VI] Khai báo hàm/biểu thức hàm.
        localFallback = await Promise.all(locals.map((r) => convertLocalToRecording(r)));
// [VI] Thực thi một bước trong luồng xử lý.
      } catch (e) {
// [VI] Thực thi một bước trong luồng xử lý.
        console.warn('Local fallback failed', e);
// [VI] Thực thi một bước trong luồng xử lý.
      }

// [VI] Khai báo biến/hằng số.
      const combined = [...apiFallback, ...localFallback];
// [VI] Khai báo biến/hằng số.
      const uniqueFallbackMap = new Map<string, Recording>();
// [VI] Vòng lặp (for).
      for (const r of combined) {
// [VI] Rẽ nhánh điều kiện (if).
        if (r.id && !uniqueFallbackMap.has(r.id)) {
// [VI] Thực thi một bước trong luồng xử lý.
          uniqueFallbackMap.set(r.id, r);
// [VI] Thực thi một bước trong luồng xử lý.
        }
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Khai báo biến/hằng số.
      const uniqueFallback = Array.from(uniqueFallbackMap.values());

// [VI] Khai báo biến/hằng số.
      const activeFilters = exploreMode === 'semantic' ? facetOnly : filters;
// [VI] Khai báo biến/hằng số.
      const filteredFallback = !isAuthenticated
// [VI] Thực thi một bước trong luồng xử lý.
        ? applyGuestFilters(uniqueFallback, activeFilters)
// [VI] Thực thi một bước trong luồng xử lý.
        : uniqueFallback;
// [VI] Khai báo biến/hằng số.
      const sorted = sortByUploadedDesc(filteredFallback);
// [VI] Khai báo biến/hằng số.
      const sliceLen = exploreMode === 'semantic' && sqActive ? sorted.length : 20;
// [VI] Trả về kết quả từ hàm.
      return {
// [VI] Thực thi một bước trong luồng xử lý.
        recordings: sorted.slice(0, sliceLen),
// [VI] Thực thi một bước trong luồng xử lý.
        totalResults: sorted.length,
// [VI] Thực thi một bước trong luồng xử lý.
        dataSource: sorted.length > 0 ? 'archiveFallback' : 'empty',
// [VI] Thực thi một bước trong luồng xử lý.
        fetchWarning: warning,
// [VI] Thực thi một bước trong luồng xử lý.
      };
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (inner) {
// [VI] Rẽ nhánh điều kiện (if).
      if (isExploreRequestAborted(inner)) throw inner;
// [VI] Trả về kết quả từ hàm.
      return {
// [VI] Thực thi một bước trong luồng xử lý.
        recordings: [],
// [VI] Thực thi một bước trong luồng xử lý.
        totalResults: 0,
// [VI] Thực thi một bước trong luồng xử lý.
        dataSource: 'empty',
// [VI] Thực thi một bước trong luồng xử lý.
        fetchWarning: warning,
// [VI] Thực thi một bước trong luồng xử lý.
      };
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}
