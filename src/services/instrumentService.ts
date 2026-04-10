// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from './api';

// [VI] Nhập (import) các phụ thuộc cho file.
import { Instrument, PaginatedResponse, ApiResponse } from '@/types';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const instrumentService = {
// [VI] Thực thi một bước trong luồng xử lý.
  // Get all instruments
// [VI] Khai báo hàm/biểu thức hàm.
  getInstruments: async (page: number = 1, pageSize: number = 50) => {
// [VI] Trả về kết quả từ hàm.
    return api.get<PaginatedResponse<Instrument>>(`/instruments?page=${page}&pageSize=${pageSize}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Get instrument by ID
// [VI] Khai báo hàm/biểu thức hàm.
  getInstrumentById: async (id: string) => {
// [VI] Trả về kết quả từ hàm.
    return api.get<ApiResponse<Instrument>>(`/instruments/${id}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Search instruments
// [VI] Khai báo hàm/biểu thức hàm.
  searchInstruments: async (query: string) => {
// [VI] Trả về kết quả từ hàm.
    return api.get<ApiResponse<Instrument[]>>(`/instruments/search?q=${query}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Create instrument (admin)
// [VI] Khai báo hàm/biểu thức hàm.
  createInstrument: async (data: Partial<Instrument>) => {
// [VI] Trả về kết quả từ hàm.
    return api.post<ApiResponse<Instrument>>('/instruments', data);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Update instrument (admin)
// [VI] Khai báo hàm/biểu thức hàm.
  updateInstrument: async (id: string, data: Partial<Instrument>) => {
// [VI] Trả về kết quả từ hàm.
    return api.put<ApiResponse<Instrument>>(`/instruments/${id}`, data);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Delete instrument (admin)
// [VI] Khai báo hàm/biểu thức hàm.
  deleteInstrument: async (id: string) => {
// [VI] Trả về kết quả từ hàm.
    return api.delete<ApiResponse<void>>(`/instruments/${id}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
};
