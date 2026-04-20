import type { ExploreSearchMode } from '@/components/features/ExploreSearchHeader';
import { applyGuestFilters } from '@/features/explore/utils/exploreGuestFilters';
import { recordingService } from '@/services/recordingService';
import { fetchVerifiedSubmissionsAsRecordings } from '@/services/researcherArchiveService';
import { fetchRecordingsSearchByFilter } from '@/services/researcherRecordingFilterSearch';
import { semanticSearchService } from '@/services/semanticSearchService';
import type { Recording, SearchFilters } from '@/types';

export type ExploreDataSource =
  | 'recordingGuest'
  | 'recordingApi'
  | 'searchApi'
  | 'archiveFallback'
  | 'semanticLocal'
  | 'empty';

type ApiResponseType = { items: Recording[]; total: number; totalPages: number };

function asApiResponse(value: unknown): ApiResponseType {
  if (!value || typeof value !== 'object') {
    return { items: [], total: 0, totalPages: 1 };
  }
  const root = value as Record<string, unknown>;
  const items = Array.isArray(root.items) ? (root.items as Recording[]) : [];
  const total = typeof root.total === 'number' ? root.total : items.length;
  const totalPages = typeof root.totalPages === 'number' ? root.totalPages : 1;
  return { items, total, totalPages };
}

export function isExploreRequestAborted(e: unknown): boolean {
  if (e && typeof e === 'object') {
    const name = (e as { name?: string }).name;
    if (name === 'AbortError' || name === 'CanceledError') return true;
    const code = (e as { code?: string }).code;
    if (code === 'ERR_CANCELED') return true;
  }
  return false;
}

export type ExploreLoadInput = {
  signal?: AbortSignal;
  currentPage: number;
  exploreMode: ExploreSearchMode;
  filters: SearchFilters;
  sqActive: string;
  isAuthenticated: boolean;
};

export type ExploreLoadSuccess = {
  recordings: Recording[];
  totalResults: number;
  dataSource: ExploreDataSource;
  /** Set when primary API failed but archive fallback (or empty) was used. */
  fetchWarning?: string;
};

function sortByUploadedDesc(items: Recording[]): Recording[] {
  return [...items].sort(
    (a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime(),
  );
}

async function fetchApprovedLocalFallback(): Promise<Recording[]> {
  try {
    const { getLocalRecordingMetaList, getLocalRecordingFull } = await import('@/services/recordingStorage');
    const { migrateVideoDataToVideoData } = await import('@/utils/helpers');
    const { convertLocalToRecording } = await import('@/utils/localRecordingToRecording');
    const { ModerationStatus } = await import('@/types');

    const meta = await getLocalRecordingMetaList();
    const migrated = migrateVideoDataToVideoData(meta as import('@/types').LocalRecording[]);
    const approved = migrated.filter(
      (r) =>
        r.moderation &&
        typeof r.moderation === 'object' &&
        'status' in r.moderation &&
        (r.moderation as { status?: string }).status === ModerationStatus.APPROVED,
    );
    const fullItems = await Promise.all(approved.map((r) => getLocalRecordingFull(r.id ?? '')));
    const locals = fullItems.filter((r): r is import('@/types').LocalRecording => r != null);
    return Promise.all(locals.map((r) => convertLocalToRecording(r)));
  } catch {
    return [];
  }
}

/**
 * Single Explore fetch path: keyword vs semantic, guest vs auth, with optional AbortSignal.
 */
export async function loadExploreRecordings(input: ExploreLoadInput): Promise<ExploreLoadSuccess> {
  const { signal, currentPage, exploreMode, filters, sqActive, isAuthenticated } = input;
  const apiOpts = { signal };

  const facetOnly: SearchFilters = { ...filters };
  if (exploreMode === 'semantic') delete facetOnly.query;

  try {
    let response: ApiResponseType;

    if (exploreMode === 'semantic' && sqActive) {
      if (!isAuthenticated) {
        const semanticResponse = await semanticSearchService.searchSemantic({
          q: sqActive,
          topK: 10,
        });
        const ranked = semanticResponse.map((r) => ({
          ...r.recording,
          _semanticScore: r.similarityScore,
        }));
        const pooled = applyGuestFilters(ranked, facetOnly);
        response = { items: pooled, total: pooled.length, totalPages: 1 };
      } else {
        const semanticResponse = await semanticSearchService.searchSemantic({
          q: sqActive,
          topK: 10,
        });
        const ranked = semanticResponse.map((r) => ({
          ...r.recording,
          _semanticScore: r.similarityScore,
        }));
        const pooled =
          Object.keys(facetOnly).length > 0 ? applyGuestFilters(ranked, facetOnly) : ranked;
        response = { items: pooled, total: pooled.length, totalPages: 1 };
      }
    } else if (!isAuthenticated) {
      const guestRes = await recordingService.getGuestRecordings(currentPage, 20, apiOpts);
      const activeFilters = exploreMode === 'semantic' ? facetOnly : filters;
      const filteredGuestItems = applyGuestFilters(
        Array.isArray(guestRes?.items) ? guestRes.items : [],
        activeFilters,
      );
      response = {
        items: filteredGuestItems,
        total: filteredGuestItems.length,
        totalPages: 1,
      };
    } else if (Object.keys(exploreMode === 'semantic' ? facetOnly : filters).length > 0) {
      const activeFilters = exploreMode === 'semantic' ? facetOnly : filters;
      const res = await recordingService.searchRecordings(activeFilters, currentPage, 20, apiOpts);
      response = asApiResponse(res);
    } else {
      // Authenticated default Explore view should prioritize verified submissions.
      let verified: Recording[] = [];
      try {
        verified = await fetchVerifiedSubmissionsAsRecordings({ signal });
      } catch {
        verified = [];
      }
      if (verified.length === 0) {
        try {
          // Backup source for verified catalog when submission-based endpoint is restricted.
          verified = await fetchRecordingsSearchByFilter({
            page: 1,
            pageSize: 500,
          });
        } catch {
          verified = [];
        }
      }
      if (verified.length === 0) {
        verified = await fetchApprovedLocalFallback();
      }
      const sorted = sortByUploadedDesc(verified);
      const pageSize = 20;
      const start = Math.max(0, (currentPage - 1) * pageSize);
      const items = sorted.slice(start, start + pageSize);
      response = {
        items,
        total: sorted.length,
        totalPages: Math.max(1, Math.ceil(sorted.length / pageSize)),
      };
    }

    const apiItems = Array.isArray(response?.items) ? response.items : [];
    const apiTotal = typeof response?.total === 'number' ? response.total : apiItems.length;
    let dataSource: ExploreDataSource = 'empty';
    const hasActiveFilters = Object.keys(exploreMode === 'semantic' ? facetOnly : filters).length > 0;

    if (exploreMode === 'semantic' && sqActive) {
      dataSource = apiItems.length > 0 ? 'searchApi' : 'empty';
    } else if (!isAuthenticated) {
      dataSource = apiItems.length > 0 ? 'recordingGuest' : 'empty';
    } else if (hasActiveFilters) {
      dataSource = apiItems.length > 0 ? 'searchApi' : 'empty';
    } else {
      dataSource = apiItems.length > 0 ? 'recordingApi' : 'empty';
    }

    // Default "Bản thu mới nhất": if listing API returns empty, fallback to verified submissions.
    const isDefaultLatestView = exploreMode !== 'semantic' && !sqActive && !hasActiveFilters;
    if (isDefaultLatestView && apiItems.length === 0) {
      try {
        const fallback = await fetchVerifiedSubmissionsAsRecordings({ signal });
        if (fallback.length > 0) {
          const sortedFallback = sortByUploadedDesc(fallback);
          return {
            recordings: sortedFallback.slice(0, 20),
            totalResults: sortedFallback.length,
            dataSource: 'archiveFallback',
          };
        }
      } catch {
        // Keep empty result if fallback is unavailable.
      }
    }

    return {
      recordings: sortByUploadedDesc(apiItems),
      totalResults: apiTotal,
      dataSource,
    };
  } catch (error) {
    if (isExploreRequestAborted(error)) throw error;
    const warning = 'Không tải được dữ liệu. Bạn có thể thử lại sau.';
    try {
      const apiFallback = await fetchVerifiedSubmissionsAsRecordings({ signal });
      if (signal?.aborted) throw error;

      const localFallback = await fetchApprovedLocalFallback();

      const combined = [...apiFallback, ...localFallback];
      const uniqueFallbackMap = new Map<string, Recording>();
      for (const r of combined) {
        if (r.id && !uniqueFallbackMap.has(r.id)) {
          uniqueFallbackMap.set(r.id, r);
        }
      }
      const uniqueFallback = Array.from(uniqueFallbackMap.values());

      const activeFilters = exploreMode === 'semantic' ? facetOnly : filters;
      const filteredFallback = !isAuthenticated
        ? applyGuestFilters(uniqueFallback, activeFilters)
        : uniqueFallback;
      const sorted = sortByUploadedDesc(filteredFallback);
      const sliceLen = exploreMode === 'semantic' && sqActive ? sorted.length : 20;
      return {
        recordings: sorted.slice(0, sliceLen),
        totalResults: sorted.length,
        dataSource: sorted.length > 0 ? 'archiveFallback' : 'empty',
        fetchWarning: warning,
      };
    } catch (inner) {
      if (isExploreRequestAborted(inner)) throw inner;
      return {
        recordings: [],
        totalResults: 0,
        dataSource: 'empty',
        fetchWarning: warning,
      };
    }
  }
}
