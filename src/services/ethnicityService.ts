// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from './api';

// [VI] Nhập (import) các phụ thuộc cho file.
import { Ethnicity, PaginatedResponse, ApiResponse } from '@/types';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const ethnicityService = {
// [VI] Thực thi một bước trong luồng xử lý.
  // Get all ethnicities
// [VI] Khai báo hàm/biểu thức hàm.
  getEthnicities: async (page: number = 1, pageSize: number = 100) => {
// [VI] Trả về kết quả từ hàm.
    return api.get<PaginatedResponse<Ethnicity>>(`/ethnicities?page=${page}&pageSize=${pageSize}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Get ethnicity by ID
// [VI] Khai báo hàm/biểu thức hàm.
  getEthnicityById: async (id: string) => {
// [VI] Trả về kết quả từ hàm.
    return api.get<ApiResponse<Ethnicity>>(`/ethnicities/${id}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Create ethnicity (admin)
// [VI] Khai báo hàm/biểu thức hàm.
  createEthnicity: async (data: Partial<Ethnicity>) => {
// [VI] Trả về kết quả từ hàm.
    return api.post<ApiResponse<Ethnicity>>('/ethnicities', data);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Update ethnicity (admin)
// [VI] Khai báo hàm/biểu thức hàm.
  updateEthnicity: async (id: string, data: Partial<Ethnicity>) => {
// [VI] Trả về kết quả từ hàm.
    return api.put<ApiResponse<Ethnicity>>(`/ethnicities/${id}`, data);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Delete ethnicity (admin)
// [VI] Khai báo hàm/biểu thức hàm.
  deleteEthnicity: async (id: string) => {
// [VI] Trả về kết quả từ hàm.
    return api.delete<ApiResponse<void>>(`/ethnicities/${id}`);
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
};
