// [VI] Nhập (import) các phụ thuộc cho file.
import { create } from 'zustand';

// [VI] Nhập (import) các phụ thuộc cho file.
import { SearchFilters } from '@/types';

// [VI] Khai báo interface để ràng buộc cấu trúc dữ liệu.
interface SearchState {
// [VI] Thực thi một bước trong luồng xử lý.
  filters: SearchFilters;
// [VI] Khai báo hàm/biểu thức hàm.
  setFilters: (filters: Partial<SearchFilters>) => void;
// [VI] Khai báo hàm/biểu thức hàm.
  clearFilters: () => void;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo biến/hằng số.
const initialFilters: SearchFilters = {
// [VI] Thực thi một bước trong luồng xử lý.
  query: '',
// [VI] Thực thi một bước trong luồng xử lý.
  ethnicityIds: [],
// [VI] Thực thi một bước trong luồng xử lý.
  regions: [],
// [VI] Thực thi một bước trong luồng xử lý.
  recordingTypes: [],
// [VI] Thực thi một bước trong luồng xử lý.
  instrumentIds: [],
// [VI] Thực thi một bước trong luồng xử lý.
  performerIds: [],
// [VI] Thực thi một bước trong luồng xử lý.
  verificationStatus: [],
// [VI] Thực thi một bước trong luồng xử lý.
  tags: [],
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const useSearchStore = create<SearchState>((set) => ({
// [VI] Thực thi một bước trong luồng xử lý.
  filters: initialFilters,

// [VI] Khai báo hàm/biểu thức hàm.
  setFilters: (newFilters) => {
// [VI] Khai báo hàm/biểu thức hàm.
    set((state) => ({
// [VI] Thực thi một bước trong luồng xử lý.
      filters: { ...state.filters, ...newFilters },
// [VI] Thực thi một bước trong luồng xử lý.
    }));
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Khai báo hàm/biểu thức hàm.
  clearFilters: () => {
// [VI] Thực thi một bước trong luồng xử lý.
    set({ filters: initialFilters });
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
}));
