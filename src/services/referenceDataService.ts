// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Reference Data Service — fetches dropdown data from the backend API.
// [VI] Thực thi một bước trong luồng xử lý.
 *
// [VI] Thực thi một bước trong luồng xử lý.
 * Endpoints:
// [VI] Thực thi một bước trong luồng xử lý.
 *  - /api/ReferenceData/ethnic-groups → ethnicities
// [VI] Thực thi một bước trong luồng xử lý.
 *  - /api/ReferenceData/provinces     → provinces (with regionCode)
// [VI] Thực thi một bước trong luồng xử lý.
 *  - /api/District                    → districts
// [VI] Thực thi một bước trong luồng xử lý.
 *  - /api/Commune                     → communes
// [VI] Thực thi một bước trong luồng xử lý.
 *  - /api/ReferenceData/ceremonies    → event types / ceremonies
// [VI] Thực thi một bước trong luồng xử lý.
 *  - /api/ReferenceData/vocal-styles  → vocal styles
// [VI] Thực thi một bước trong luồng xử lý.
 *  - /api/ReferenceData/musical-scales → musical scales
// [VI] Thực thi một bước trong luồng xử lý.
 *  - /api/ReferenceData/tags          → tags
// [VI] Thực thi một bước trong luồng xử lý.
 *  - /api/Instrument                  → instruments
// [VI] Thực thi một bước trong luồng xử lý.
 */

// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from '@/services/api';
// [VI] Nhập (import) các phụ thuộc cho file.
import { logServiceWarn } from '@/services/serviceLogger';

// [VI] Thực thi một bước trong luồng xử lý.
// ---------- Types ----------

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface EthnicGroupItem {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  name: string;
// [VI] Thực thi một bước trong luồng xử lý.
  description?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  languageFamily?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  primaryRegion?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  imageUrl?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface ProvinceItem {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  name: string;
// [VI] Thực thi một bước trong luồng xử lý.
  regionCode: string;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface DistrictItem {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  name: string;
// [VI] Thực thi một bước trong luồng xử lý.
  provinceId: string;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface CommuneItem {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  name: string;
// [VI] Thực thi một bước trong luồng xử lý.
  districtId: string;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface CeremonyItem {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  name: string;
// [VI] Thực thi một bước trong luồng xử lý.
  description?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface InstrumentItem {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  name: string;
// [VI] Thực thi một bước trong luồng xử lý.
  category?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  description?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  tuningSystem?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  constructionMethod?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  imageUrl?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  originEthnicGroupId?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface VocalStyleItem {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  name: string;
// [VI] Thực thi một bước trong luồng xử lý.
  description?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface MusicalScaleItem {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  name: string;
// [VI] Thực thi một bước trong luồng xử lý.
  description?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface TagItem {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  name: string;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
// ---------- Paginated response shape ----------

// [VI] Khai báo interface để ràng buộc cấu trúc dữ liệu.
interface PaginatedApiResponse<T> {
// [VI] Thực thi một bước trong luồng xử lý.
  success: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  message?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  data: T[];
// [VI] Thực thi một bước trong luồng xử lý.
  total: number;
// [VI] Thực thi một bước trong luồng xử lý.
  page: number;
// [VI] Thực thi một bước trong luồng xử lý.
  pageSize: number;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
// ---------- Helper: fetch ALL pages ----------

// [VI] Khai báo biến/hằng số.
const DEFAULT_REF_PAGE_SIZE = 250;
// [VI] Thực thi một bước trong luồng xử lý.
/** Parallel page requests per wave (Commune/District có thể >30 trang — gọi tuần tự rất chậm). */
// [VI] Khai báo biến/hằng số.
const REF_PAGE_FETCH_CONCURRENCY = 8;

// [VI] Thực thi một bước trong luồng xử lý.
async function fetchAllPages<T>(url: string, pageSize = DEFAULT_REF_PAGE_SIZE): Promise<T[]> {
// [VI] Khai báo biến/hằng số.
  const separator = url.includes('?') ? '&' : '?';
// [VI] Khai báo biến/hằng số.
  const urlFor = (page: number) => `${url}${separator}page=${page}&pageSize=${pageSize}`;

// [VI] Khai báo biến/hằng số.
  let first;
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Thực thi một bước trong luồng xử lý.
    first = await api.get<PaginatedApiResponse<T>>(urlFor(1));
// [VI] Thực thi một bước trong luồng xử lý.
  } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
    logServiceWarn(`Failed to fetch ${url} page 1`, err);
// [VI] Trả về kết quả từ hàm.
    return [];
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Khai báo biến/hằng số.
  const firstItems = first?.data ?? [];
// [VI] Khai báo biến/hằng số.
  const all: T[] = [...firstItems];
// [VI] Rẽ nhánh điều kiện (if).
  if (firstItems.length === 0) return all;

// [VI] Khai báo biến/hằng số.
  const total = typeof first?.total === 'number' ? first.total : undefined;
// [VI] Rẽ nhánh điều kiện (if).
  if (total !== undefined && all.length >= total) return all;

// [VI] Rẽ nhánh điều kiện (if).
  if (total === undefined) {
// [VI] Khai báo biến/hằng số.
    let page = 2;
// [VI] Khai báo biến/hằng số.
    let lastLen = firstItems.length;
// [VI] Vòng lặp (while).
    while (lastLen === pageSize) {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
      try {
// [VI] Khai báo biến/hằng số.
        const res = await api.get<PaginatedApiResponse<T>>(urlFor(page));
// [VI] Khai báo biến/hằng số.
        const items = res?.data ?? [];
// [VI] Thực thi một bước trong luồng xử lý.
        all.push(...items);
// [VI] Thực thi một bước trong luồng xử lý.
        lastLen = items.length;
// [VI] Rẽ nhánh điều kiện (if).
        if (items.length === 0) break;
// [VI] Thực thi một bước trong luồng xử lý.
        page++;
// [VI] Thực thi một bước trong luồng xử lý.
      } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
        logServiceWarn(`Failed to fetch ${url} page ${page}`, err);
// [VI] Thực thi một bước trong luồng xử lý.
        break;
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Trả về kết quả từ hàm.
    return all;
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Khai báo biến/hằng số.
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
// [VI] Rẽ nhánh điều kiện (if).
  if (totalPages <= 1) return all;

// [VI] Khai báo biến/hằng số.
  const rest = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
// [VI] Vòng lặp (for).
  for (let i = 0; i < rest.length; i += REF_PAGE_FETCH_CONCURRENCY) {
// [VI] Khai báo biến/hằng số.
    const chunk = rest.slice(i, i + REF_PAGE_FETCH_CONCURRENCY);
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const batch = await Promise.all(
// [VI] Khai báo hàm/biểu thức hàm.
        chunk.map((p) => api.get<PaginatedApiResponse<T>>(urlFor(p))),
// [VI] Thực thi một bước trong luồng xử lý.
      );
// [VI] Vòng lặp (for).
      for (const res of batch) {
// [VI] Thực thi một bước trong luồng xử lý.
        all.push(...(res?.data ?? []));
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceWarn(`Failed to fetch ${url} parallel pages`, err);
// [VI] Thực thi một bước trong luồng xử lý.
      break;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return all;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
// ---------- In-memory cache ----------

// [VI] Khai báo biến/hằng số.
const cache: Record<string, { data: unknown[]; ts: number }> = {};
// [VI] Khai báo biến/hằng số.
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes — giảm tải lại Commune/District khi mở Researcher/Moderation

// [VI] Thực thi một bước trong luồng xử lý.
async function cachedFetch<T>(key: string, url: string): Promise<T[]> {
// [VI] Khai báo biến/hằng số.
  const entry = cache[key];
// [VI] Rẽ nhánh điều kiện (if).
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) {
// [VI] Trả về kết quả từ hàm.
    return entry.data as T[];
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Khai báo biến/hằng số.
  const data = await fetchAllPages<T>(url);
// [VI] Thực thi một bước trong luồng xử lý.
  cache[key] = { data, ts: Date.now() };
// [VI] Trả về kết quả từ hàm.
  return data;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
// ---------- Public API ----------

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const referenceDataService = {
// [VI] Thực thi một bước trong luồng xử lý.
  /** Fetch all ethnic groups (dân tộc) */
// [VI] Khai báo hàm/biểu thức hàm.
  getEthnicGroups: () =>
// [VI] Thực thi một bước trong luồng xử lý.
    cachedFetch<EthnicGroupItem>('ethnicGroups', '/ReferenceData/ethnic-groups'),

// [VI] Thực thi một bước trong luồng xử lý.
  /** Fetch all provinces (tỉnh thành) */
// [VI] Khai báo hàm/biểu thức hàm.
  getProvinces: () => cachedFetch<ProvinceItem>('provinces', '/ReferenceData/provinces'),

// [VI] Thực thi một bước trong luồng xử lý.
  /** Fetch all districts (quận huyện) */
// [VI] Khai báo hàm/biểu thức hàm.
  getDistricts: () => cachedFetch<DistrictItem>('districts', '/District'),

// [VI] Thực thi một bước trong luồng xử lý.
  /** Fetch districts by province Id */
// [VI] Khai báo hàm/biểu thức hàm.
  getDistrictsByProvince: (provinceId: string) =>
// [VI] Thực thi một bước trong luồng xử lý.
    cachedFetch<DistrictItem>(
// [VI] Thực thi một bước trong luồng xử lý.
      `districts_prov_${provinceId}`,
// [VI] Thực thi một bước trong luồng xử lý.
      `/District/get-by-province/${provinceId}`,
// [VI] Thực thi một bước trong luồng xử lý.
    ),

// [VI] Thực thi một bước trong luồng xử lý.
  /** Fetch all communes (phường xã) */
// [VI] Khai báo hàm/biểu thức hàm.
  getCommunes: () => cachedFetch<CommuneItem>('communes', '/Commune'),

// [VI] Thực thi một bước trong luồng xử lý.
  /** Fetch communes by district Id */
// [VI] Khai báo hàm/biểu thức hàm.
  getCommunesByDistrict: (districtId: string) =>
// [VI] Thực thi một bước trong luồng xử lý.
    cachedFetch<CommuneItem>(
// [VI] Thực thi một bước trong luồng xử lý.
      `communes_dist_${districtId}`,
// [VI] Thực thi một bước trong luồng xử lý.
      `/Commune/get-by-district/${districtId}`,
// [VI] Thực thi một bước trong luồng xử lý.
    ),

// [VI] Thực thi một bước trong luồng xử lý.
  /** Fetch all ceremonies / event types (nghi lễ / loại sự kiện) */
// [VI] Khai báo hàm/biểu thức hàm.
  getCeremonies: () => cachedFetch<CeremonyItem>('ceremonies', '/ReferenceData/ceremonies'),

// [VI] Thực thi một bước trong luồng xử lý.
  /** Fetch all vocal styles */
// [VI] Khai báo hàm/biểu thức hàm.
  getVocalStyles: () => cachedFetch<VocalStyleItem>('vocalStyles', '/ReferenceData/vocal-styles'),

// [VI] Thực thi một bước trong luồng xử lý.
  /** Fetch all musical scales */
// [VI] Khai báo hàm/biểu thức hàm.
  getMusicalScales: () =>
// [VI] Thực thi một bước trong luồng xử lý.
    cachedFetch<MusicalScaleItem>('musicalScales', '/ReferenceData/musical-scales'),

// [VI] Thực thi một bước trong luồng xử lý.
  /** Fetch all tags */
// [VI] Khai báo hàm/biểu thức hàm.
  getTags: () => cachedFetch<TagItem>('tags', '/ReferenceData/tags'),

// [VI] Thực thi một bước trong luồng xử lý.
  /** Fetch all instruments (nhạc cụ) */
// [VI] Khai báo hàm/biểu thức hàm.
  getInstruments: () => cachedFetch<InstrumentItem>('instruments', '/Instrument'),

// [VI] Thực thi một bước trong luồng xử lý.
  /** Clear cache (e.g. after admin edits reference data) */
// [VI] Khai báo hàm/biểu thức hàm.
  clearCache: () => {
// [VI] Khai báo hàm/biểu thức hàm.
    Object.keys(cache).forEach((k) => delete cache[k]);
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
};
