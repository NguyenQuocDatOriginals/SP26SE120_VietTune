// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from './api';

// [VI] Nhập (import) các phụ thuộc cho file.
import { Performer, PaginatedResponse, ApiResponse } from '@/types';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const performerService = {
// [VI] Thực thi một bước trong luồng xử lý.
  // Get all performers/masters
// [VI] Khai báo hàm/biểu thức hàm.
  getPerformers: async (page: number = 1, pageSize: number = 50) => {
// [VI] Trả về kết quả từ hàm.
    return api.get<PaginatedResponse<Performer>>(`/performers?page=${page}&pageSize=${pageSize}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Get performer by ID
// [VI] Khai báo hàm/biểu thức hàm.
  getPerformerById: async (id: string) => {
// [VI] Trả về kết quả từ hàm.
    return api.get<ApiResponse<Performer>>(`/performers/${id}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Search performers
// [VI] Khai báo hàm/biểu thức hàm.
  searchPerformers: async (query: string) => {
// [VI] Trả về kết quả từ hàm.
    return api.get<ApiResponse<Performer[]>>(`/performers/search?q=${query}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Create performer
// [VI] Khai báo hàm/biểu thức hàm.
  createPerformer: async (data: Partial<Performer>) => {
// [VI] Trả về kết quả từ hàm.
    return api.post<ApiResponse<Performer>>('/performers', data);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Update performer
// [VI] Khai báo hàm/biểu thức hàm.
  updatePerformer: async (id: string, data: Partial<Performer>) => {
// [VI] Trả về kết quả từ hàm.
    return api.put<ApiResponse<Performer>>(`/performers/${id}`, data);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Delete performer
// [VI] Khai báo hàm/biểu thức hàm.
  deletePerformer: async (id: string) => {
// [VI] Trả về kết quả từ hàm.
    return api.delete<ApiResponse<void>>(`/performers/${id}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
};
