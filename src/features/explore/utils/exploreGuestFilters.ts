// [VI] Nhập (import) các phụ thuộc cho file.
import { recordingFacetHaystack } from '@/features/explore/utils/exploreFacetDraft';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { Recording, SearchFilters } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { normalizeSearchText } from '@/utils/searchText';

// [VI] Thực thi một bước trong luồng xử lý.
/** Client-side facet + keyword filter for guest catalog rows. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function applyGuestFilters(rows: Recording[], filters: SearchFilters): Recording[] {
// [VI] Khai báo biến/hằng số.
  const query = normalizeSearchText(filters.query ?? '');
// [VI] Khai báo biến/hằng số.
  const selectedRegions = filters.regions ?? [];
// [VI] Khai báo biến/hằng số.
  const selectedTypes = filters.recordingTypes ?? [];
// [VI] Khai báo biến/hằng số.
  const dateFrom = filters.dateFrom ? new Date(filters.dateFrom).getTime() : null;
// [VI] Khai báo biến/hằng số.
  const dateTo = filters.dateTo ? new Date(filters.dateTo).getTime() : null;
// [VI] Khai báo biến/hằng số.
  const tags = (filters.tags ?? []).map((t) => normalizeSearchText(t)).filter(Boolean);
// [VI] Khai báo biến/hằng số.
  const ethnicityIds = filters.ethnicityIds ?? [];

// [VI] Khai báo hàm/biểu thức hàm.
  return rows.filter((r) => {
// [VI] Rẽ nhánh điều kiện (if).
    if (query) {
// [VI] Khai báo biến/hằng số.
      const title = normalizeSearchText(`${r.title ?? ''} ${r.titleVietnamese ?? ''}`);
// [VI] Khai báo biến/hằng số.
      const desc = normalizeSearchText(r.description ?? '');
// [VI] Khai báo biến/hằng số.
      const tagText = normalizeSearchText((r.tags ?? []).join(' '));
// [VI] Khai báo biến/hằng số.
      const haystack = `${title} ${desc} ${tagText}`;
// [VI] Rẽ nhánh điều kiện (if).
      if (!haystack.includes(query)) return false;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Rẽ nhánh điều kiện (if).
    if (selectedRegions.length > 0 && !selectedRegions.includes(r.region)) return false;
// [VI] Rẽ nhánh điều kiện (if).
    if (selectedTypes.length > 0 && !selectedTypes.includes(r.recordingType)) return false;
// [VI] Rẽ nhánh điều kiện (if).
    if (ethnicityIds.length > 0) {
// [VI] Khai báo biến/hằng số.
      const ok = ethnicityIds.some(
// [VI] Khai báo hàm/biểu thức hàm.
        (id) =>
// [VI] Thực thi một bước trong luồng xử lý.
          id === r.ethnicity.id || id === r.ethnicity.name || id === r.ethnicity.nameVietnamese,
// [VI] Thực thi một bước trong luồng xử lý.
      );
// [VI] Rẽ nhánh điều kiện (if).
      if (!ok) return false;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Rẽ nhánh điều kiện (if).
    if (tags.length > 0) {
// [VI] Khai báo biến/hằng số.
      const hay = recordingFacetHaystack(r);
// [VI] Khai báo hàm/biểu thức hàm.
      if (!tags.every((t) => hay.includes(t))) return false;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Rẽ nhánh điều kiện (if).
    if (dateFrom || dateTo) {
// [VI] Khai báo biến/hằng số.
      const ts = new Date(r.recordedDate || r.uploadedDate || 0).getTime();
// [VI] Rẽ nhánh điều kiện (if).
      if (Number.isFinite(dateFrom) && ts < (dateFrom as number)) return false;
// [VI] Rẽ nhánh điều kiện (if).
      if (Number.isFinite(dateTo) && ts > (dateTo as number)) return false;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Trả về kết quả từ hàm.
    return true;
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
}
