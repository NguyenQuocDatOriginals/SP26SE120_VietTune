import type { EntityKind, EntityFormValues, ReferenceEntity } from '../types/masterDataTypes';

import type { ApiInstrumentDto, ApiEthnicGroupDto, ApiCeremonyDto, ApiVocalStyleDto } from '@/api';
import { legacyGet } from '@/api/legacyHttp';
import { logEvent } from '@/services/errorReporting';
import { ethnicityService } from '@/services/ethnicityService';
import { instrumentService } from '@/services/instrumentService';
import { ritualService } from '@/services/ritualService';
import { vocalStyleService } from '@/services/vocalStyleService';

export const masterDataService = {
  list: async (kind: EntityKind, page: number, pageSize: number, search?: string) => {
    switch (kind) {
      case 'instruments': {
        let items: ReferenceEntity<ApiInstrumentDto>[];
        let total: number;
        if (search && search.trim()) {
          const list = await instrumentService.searchInstrumentsByName(search);
          total = list.length;
          const start = (page - 1) * pageSize;
          items = list.slice(start, start + pageSize).map((item) => ({
            id: item.id!,
            name: item.name!,
            isActive: true,
            raw: item,
          })) as ReferenceEntity<ApiInstrumentDto>[];
        } else {
          const res = await instrumentService.getInstruments(page, pageSize);
          items = (res.items?.map((item) => ({
            id: item.id!,
            name: item.name!,
            isActive: true,
            raw: item,
          })) ?? []) as ReferenceEntity<ApiInstrumentDto>[];
          total = res.total || 0;
        }
        return { items, total };
      }
      case 'ethnicities': {
        let items: ReferenceEntity<ApiEthnicGroupDto>[];
        let total: number;
        if (search && search.trim()) {
          const list = await ethnicityService.searchEthnicitiesByName(search);
          total = list.length;
          const start = (page - 1) * pageSize;
          items = list.slice(start, start + pageSize).map((item) => ({
            id: item.id!,
            name: item.name!,
            isActive: true,
            raw: item,
          })) as ReferenceEntity<ApiEthnicGroupDto>[];
        } else {
          const res = await ethnicityService.getEthnicities(page, pageSize);
          items = (res.items?.map((item) => ({
            id: item.id!,
            name: item.name!,
            isActive: true,
            raw: item,
          })) ?? []) as ReferenceEntity<ApiEthnicGroupDto>[];
          total = res.total || 0;
        }
        return { items, total };
      }
      case 'rituals': {
        let items: ReferenceEntity<ApiCeremonyDto>[];
        let total: number;
        if (search && search.trim()) {
          const list = await ritualService.searchCeremoniesByName(search);
          total = list.length;
          const start = (page - 1) * pageSize;
          items = list.slice(start, start + pageSize).map((item) => ({
            id: item.id!,
            name: item.name!,
            isActive: true,
            raw: item,
          })) as ReferenceEntity<ApiCeremonyDto>[];
        } else {
          const res = await ritualService.getCeremonies(page, pageSize);
          items = (res.items?.map((item) => ({
            id: item.id!,
            name: item.name!,
            isActive: true,
            raw: item,
          })) ?? []) as ReferenceEntity<ApiCeremonyDto>[];
          total = res.total || 0;
        }
        return { items, total };
      }
      case 'vocalStyles': {
        let items: ReferenceEntity<ApiVocalStyleDto>[];
        let total: number;
        if (search && search.trim()) {
          const list = await vocalStyleService.searchVocalStylesByName(search);
          total = list.length;
          const start = (page - 1) * pageSize;
          items = list.slice(start, start + pageSize).map((item) => ({
            id: item.id!,
            name: item.name!,
            isActive: true,
            raw: item,
          })) as ReferenceEntity<ApiVocalStyleDto>[];
        } else {
          const res = await vocalStyleService.getVocalStyles(page, pageSize);
          items = (res.items?.map((item) => ({
            id: item.id!,
            name: item.name!,
            isActive: true,
            raw: item,
          })) ?? []) as ReferenceEntity<ApiVocalStyleDto>[];
          total = res.total || 0;
        }
        return { items, total };
      }
      default:
        throw new Error(`Unsupported entity kind: ${kind}`);
    }
  },

  create: async (kind: EntityKind, data: EntityFormValues) => {
    switch (kind) {
      case 'instruments':
        return await instrumentService.createInstrument(data);
      case 'ethnicities':
        return await ethnicityService.createEthnicity(data);
      case 'rituals':
        return await ritualService.createCeremony(data);
      case 'vocalStyles':
        return await vocalStyleService.createVocalStyle(data);
      default:
        throw new Error(`Unsupported entity kind: ${kind}`);
    }
  },

  update: async (kind: EntityKind, id: string, data: EntityFormValues) => {
    switch (kind) {
      case 'instruments':
        return await instrumentService.updateInstrument(id, data);
      case 'ethnicities':
        return await ethnicityService.updateEthnicity(id, data);
      case 'rituals':
        return await ritualService.updateCeremony(id, data);
      case 'vocalStyles':
        return await vocalStyleService.updateVocalStyle(id, data);
      default:
        throw new Error(`Unsupported entity kind: ${kind}`);
    }
  },

  delete: async (kind: EntityKind, id: string) => {
    switch (kind) {
      case 'instruments':
        return await instrumentService.deleteInstrument(id);
      case 'ethnicities':
        return await ethnicityService.deleteEthnicity(id);
      case 'rituals':
        return await ritualService.deleteCeremony(id);
      case 'vocalStyles':
        return await vocalStyleService.deleteVocalStyle(id);
      default:
        throw new Error(`Unsupported entity kind: ${kind}`);
    }
  },

  /**
   * Reference count before delete. Without `VITE_MASTER_DATA_USAGE_PATH`, returns 0 (unknown → allow delete in UI).
   * When set, performs GET `{API_BASE_URL}/{path}` with `{kind}` and `{id}` substituted (encodeURIComponent).
   * Expect JSON like `{ count }` or `{ usageCount }`.
   */
  checkUsage: async (kind: EntityKind, id: string): Promise<number> => {
    const tmpl = (import.meta.env.VITE_MASTER_DATA_USAGE_PATH as string | undefined)?.trim();
    if (!tmpl) return 0;
    try {
      const path = tmpl
        .replace('{kind}', encodeURIComponent(kind))
        .replace('{id}', encodeURIComponent(id));
      const normalized = path.startsWith('/') ? path.slice(1) : path;
      const res = await legacyGet<unknown>(normalized);
      if (res && typeof res === 'object' && !Array.isArray(res)) {
        const o = res as Record<string, unknown>;
        const raw = o.count ?? o.usageCount ?? o.referenceCount;
        const n = typeof raw === 'number' ? raw : Number(raw);
        if (Number.isFinite(n)) return Math.max(0, Math.floor(n));
      }
    } catch {
      logEvent('master_data.usage_check_failed', { kind, id });
    }
    return 0;
  },
};
