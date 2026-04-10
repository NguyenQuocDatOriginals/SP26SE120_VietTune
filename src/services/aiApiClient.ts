// [VI] Nhập (import) các phụ thuộc cho file.
import axios, { AxiosInstance } from 'axios';

// [VI] Nhập (import) các phụ thuộc cho file.
import { getItem } from '@/services/storageService';

// [VI] Khai báo kiểu (type) để mô tả dữ liệu.
type CreateAiApiClientOptions = {
// [VI] Thực thi một bước trong luồng xử lý.
  baseURL: string;
// [VI] Thực thi một bước trong luồng xử lý.
  timeout?: number;
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Shared AI HTTP client factory.
// [VI] Thực thi một bước trong luồng xử lý.
 * Keeps token header behavior consistent for AI endpoints.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function createAiApiClient({
// [VI] Thực thi một bước trong luồng xử lý.
  baseURL,
// [VI] Thực thi một bước trong luồng xử lý.
  timeout = 45000,
// [VI] Thực thi một bước trong luồng xử lý.
}: CreateAiApiClientOptions): AxiosInstance {
// [VI] Khai báo biến/hằng số.
  const token = getItem('access_token');
// [VI] Trả về kết quả từ hàm.
  return axios.create({
// [VI] Thực thi một bước trong luồng xử lý.
    baseURL: baseURL.replace(/\/$/, ''),
// [VI] Thực thi một bước trong luồng xử lý.
    timeout,
// [VI] Thực thi một bước trong luồng xử lý.
    headers: {
// [VI] Thực thi một bước trong luồng xử lý.
      'Content-Type': 'application/json',
// [VI] Thực thi một bước trong luồng xử lý.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
}
