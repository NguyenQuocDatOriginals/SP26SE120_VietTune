// [VI] Nhập (import) các phụ thuộc cho file.
import type { AxiosRequestConfig } from 'axios';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type ServiceApiClient = {
// [VI] Khai báo hàm/biểu thức hàm.
  get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
// [VI] Khai báo hàm/biểu thức hàm.
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
// [VI] Khai báo hàm/biểu thức hàm.
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
// [VI] Thực thi một bước trong luồng xử lý.
};
