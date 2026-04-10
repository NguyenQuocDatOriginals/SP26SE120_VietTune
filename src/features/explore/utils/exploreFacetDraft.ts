// [VI] Nhập (import) các phụ thuộc cho file.
import type { ExploreFilterOptions } from '@/constants/exploreFilterOptions';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { Recording, SearchFilters } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { Region, RecordingType } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { normalizeSearchText } from '@/utils/searchText';

// [VI] Thực thi một bước trong luồng xử lý.
/** Draft facet state for Explore sidebar (applied -> `SearchFilters` on "Apply"). */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type ExploreFacetDraft = {
// [VI] Thực thi một bước trong luồng xử lý.
  query: string;
// [VI] Thực thi một bước trong luồng xử lý.
  ethnicityIds: string[];
// [VI] Thực thi một bước trong luồng xử lý.
  recordingTypes: RecordingType[];
// [VI] Thực thi một bước trong luồng xử lý.
  region: Region | null;
// [VI] Thực thi một bước trong luồng xử lý.
  genreTags: string[];
// [VI] Thực thi một bước trong luồng xử lý.
  instrumentTags: string[];
// [VI] Thực thi một bước trong luồng xử lý.
  culturalTags: string[];
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function createEmptyExploreFacetDraft(): ExploreFacetDraft {
// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    query: '',
// [VI] Thực thi một bước trong luồng xử lý.
    ethnicityIds: [],
// [VI] Thực thi một bước trong luồng xử lý.
    recordingTypes: [],
// [VI] Thực thi một bước trong luồng xử lý.
    region: null,
// [VI] Thực thi một bước trong luồng xử lý.
    genreTags: [],
// [VI] Thực thi một bước trong luồng xử lý.
    instrumentTags: [],
// [VI] Thực thi một bước trong luồng xử lý.
    culturalTags: [],
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function exploreDraftToSearchFilters(d: ExploreFacetDraft): SearchFilters {
// [VI] Khai báo biến/hằng số.
  const facetTags = [...d.genreTags, ...d.instrumentTags, ...d.culturalTags];
// [VI] Khai báo biến/hằng số.
  const ethnicityNames = d.ethnicityIds.filter(Boolean);
// [VI] Khai báo biến/hằng số.
  const tags = [...facetTags, ...ethnicityNames];
// [VI] Khai báo biến/hằng số.
  const out: SearchFilters = {};
// [VI] Khai báo biến/hằng số.
  const q = d.query.trim();
// [VI] Rẽ nhánh điều kiện (if).
  if (q) out.query = q;
// [VI] Rẽ nhánh điều kiện (if).
  if (ethnicityNames.length) out.ethnicityIds = [...ethnicityNames];
// [VI] Rẽ nhánh điều kiện (if).
  if (d.recordingTypes.length) out.recordingTypes = [...d.recordingTypes];
// [VI] Rẽ nhánh điều kiện (if).
  if (d.region) out.regions = [d.region];
// [VI] Rẽ nhánh điều kiện (if).
  if (tags.length) out.tags = tags;
// [VI] Trả về kết quả từ hàm.
  return out;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function searchFiltersToExploreDraft(
// [VI] Thực thi một bước trong luồng xử lý.
  f: SearchFilters,
// [VI] Thực thi một bước trong luồng xử lý.
  opts: ExploreFilterOptions,
// [VI] Thực thi một bước trong luồng xử lý.
): ExploreFacetDraft {
// [VI] Khai báo biến/hằng số.
  const genreSet = new Set(opts.genreTags.map((g) => g.label));
// [VI] Khai báo biến/hằng số.
  const instrSet = new Set(opts.instruments.map((i) => i.label));
// [VI] Khai báo biến/hằng số.
  const cultSet = new Set(opts.culturalContexts.map((c) => c.label));
// [VI] Khai báo biến/hằng số.
  const ethnicityLabels = new Set(opts.ethnicities.map((e) => e.label));

// [VI] Khai báo biến/hằng số.
  const rawTags = f.tags ?? [];
// [VI] Khai báo biến/hằng số.
  const genreTags: string[] = [];
// [VI] Khai báo biến/hằng số.
  const instrumentTags: string[] = [];
// [VI] Khai báo biến/hằng số.
  const culturalTags: string[] = [];
// [VI] Khai báo biến/hằng số.
  const extraEthnicity: string[] = [];
// [VI] Khai báo biến/hằng số.
  const leftover: string[] = [];

// [VI] Vòng lặp (for).
  for (const t of rawTags) {
// [VI] Rẽ nhánh điều kiện (if).
    if (genreSet.has(t)) genreTags.push(t);
// [VI] Nhánh điều kiện bổ sung (else).
    else if (instrSet.has(t)) instrumentTags.push(t);
// [VI] Nhánh điều kiện bổ sung (else).
    else if (cultSet.has(t)) culturalTags.push(t);
// [VI] Nhánh điều kiện bổ sung (else).
    else if (ethnicityLabels.has(t)) extraEthnicity.push(t);
// [VI] Nhánh điều kiện bổ sung (else).
    else leftover.push(t);
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Khai báo biến/hằng số.
  const baseEth = f.ethnicityIds ?? [];
// [VI] Khai báo biến/hằng số.
  const ethnicityIds = [...new Set([...baseEth, ...extraEthnicity])];

// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    query: f.query ?? '',
// [VI] Thực thi một bước trong luồng xử lý.
    ethnicityIds,
// [VI] Thực thi một bước trong luồng xử lý.
    recordingTypes: f.recordingTypes ? [...f.recordingTypes] : [],
// [VI] Thực thi một bước trong luồng xử lý.
    region: f.regions?.[0] ?? null,
// [VI] Thực thi một bước trong luồng xử lý.
    genreTags: [...genreTags, ...leftover],
// [VI] Thực thi một bước trong luồng xử lý.
    instrumentTags,
// [VI] Thực thi một bước trong luồng xử lý.
    culturalTags,
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** Tag + instrument-name haystack for guest filtering. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function recordingFacetHaystack(r: Recording): string {
// [VI] Khai báo biến/hằng số.
  const tags = (r.tags ?? []).map((t) => normalizeSearchText(t)).join(' ');
// [VI] Khai báo biến/hằng số.
  const inst = (r.instruments ?? [])
// [VI] Khai báo hàm/biểu thức hàm.
    .map((i) => normalizeSearchText(`${i.name ?? ''} ${i.nameVietnamese ?? ''}`))
// [VI] Thực thi một bước trong luồng xử lý.
    .join(' ');
// [VI] Trả về kết quả từ hàm.
  return normalizeSearchText(`${tags} ${inst}`);
// [VI] Thực thi một bước trong luồng xử lý.
}
