import { apiFetch, apiOk, asApiEnvelope, normalizePagedResponse, unwrapServiceResponse } from '@/api';
import type {
  ApiMusicalScaleDto,
  ApiMusicalScaleListQuery,
  ApiPagedResponseMusicalScaleDto,
  ApiServiceResponseMusicalScaleDto,
} from '@/api';
import { PAGE_SIZE_MUSICAL_SCALE_LIST } from '@/config/pagination';

function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export const musicalScaleService = {
  getMusicalScales: async (page: number = 1, pageSize: number = PAGE_SIZE_MUSICAL_SCALE_LIST) => {
    const query: ApiMusicalScaleListQuery = { page, pageSize };
    const res = await apiOk<ApiPagedResponseMusicalScaleDto>(
      asApiEnvelope<ApiPagedResponseMusicalScaleDto>(
        apiFetch.GET('/api/MusicalScale', { params: { query } }),
      ),
    );
    return normalizePagedResponse<ApiMusicalScaleDto>(res);
  },

  getMusicalScaleById: async (id: string) => {
    const res = await apiOk<ApiServiceResponseMusicalScaleDto>(
      asApiEnvelope<ApiServiceResponseMusicalScaleDto>(
        apiFetch.GET('/api/MusicalScale/{id}', { params: { path: { id } } }),
      ),
    );
    return unwrapServiceResponse<ApiMusicalScaleDto>(res);
  },

  searchMusicalScalesByName: async (name: string) => {
    const needle = normalizeForSearch(name);
    if (!needle) return [];

    const res = await musicalScaleService.getMusicalScales(1, 200);
    return (res.items ?? []).filter((item) =>
      normalizeForSearch(item.name ?? '').includes(needle),
    );
  },

  createMusicalScale: async (data: Partial<ApiMusicalScaleDto>) => {
    const res = await apiOk<ApiServiceResponseMusicalScaleDto>(
      asApiEnvelope<ApiServiceResponseMusicalScaleDto>(
        apiFetch.POST('/api/MusicalScale', {
          body: data as ApiMusicalScaleDto,
        }),
      ),
    );
    return unwrapServiceResponse<ApiMusicalScaleDto>(res);
  },

  updateMusicalScale: async (id: string, data: Partial<ApiMusicalScaleDto>) => {
    const res = await apiOk<ApiServiceResponseMusicalScaleDto>(
      asApiEnvelope<ApiServiceResponseMusicalScaleDto>(
        apiFetch.PUT('/api/MusicalScale/{id}', {
          params: { path: { id } },
          body: data as ApiMusicalScaleDto,
        }),
      ),
    );
    return unwrapServiceResponse<ApiMusicalScaleDto>(res);
  },

  deleteMusicalScale: async (id: string) => {
    const res = await apiOk<{ data?: boolean | null } | unknown>(
      asApiEnvelope<unknown>(
        apiFetch.DELETE('/api/MusicalScale/{id}', { params: { path: { id } } }),
      ),
    );
    return res;
  },
};
