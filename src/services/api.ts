// [VI] Nhập (import) các phụ thuộc cho file.
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// [VI] Nhập (import) các phụ thuộc cho file.
import { API_BASE_URL } from '@/config/constants';
// [VI] Nhập (import) các phụ thuộc cho file.
import { getItem, removeItem } from '@/services/storageService';
// [VI] Nhập (import) các phụ thuộc cho file.
import { attachNormalizedApiError } from '@/uiToast/normalizeApiError';

// [VI] Khai báo biến/hằng số.
const apiClient: AxiosInstance = axios.create({
// [VI] Thực thi một bước trong luồng xử lý.
  baseURL: API_BASE_URL,
// [VI] Thực thi một bước trong luồng xử lý.
  timeout: 30000,
// [VI] Thực thi một bước trong luồng xử lý.
  headers: {
// [VI] Thực thi một bước trong luồng xử lý.
    'Content-Type': 'application/json',
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
});

// [VI] Thực thi một bước trong luồng xử lý.
// Request interceptor
// [VI] Thực thi một bước trong luồng xử lý.
apiClient.interceptors.request.use(
// [VI] Khai báo hàm/biểu thức hàm.
  (config) => {
// [VI] Khai báo biến/hằng số.
    const token = getItem('access_token');
// [VI] Rẽ nhánh điều kiện (if).
    if (token) {
// [VI] Thực thi một bước trong luồng xử lý.
      config.headers.Authorization = `Bearer ${token}`;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Trả về kết quả từ hàm.
    return config;
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Khai báo hàm/biểu thức hàm.
  (error) => {
// [VI] Trả về kết quả từ hàm.
    return Promise.reject(error);
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
);

// [VI] Thực thi một bước trong luồng xử lý.
// Track whether a 401 redirect is in progress to avoid loops
// [VI] Khai báo biến/hằng số.
let isRedirectingToLogin = false;

// [VI] Khai báo hàm/biểu thức hàm.
function isProtectedPath(path: string): boolean {
// [VI] Khai báo biến/hằng số.
  const p = (path || '').toLowerCase();
// [VI] Rẽ nhánh điều kiện (if).
  if (!p || p === '/') return false;
// [VI] Rẽ nhánh điều kiện (if).
  if (p.startsWith('/login') || p.startsWith('/register') || p.startsWith('/confirm-account'))
// [VI] Trả về kết quả từ hàm.
    return false;
// [VI] Rẽ nhánh điều kiện (if).
  if (p.startsWith('/explore') || p.startsWith('/search') || p.startsWith('/semantic-search'))
// [VI] Trả về kết quả từ hàm.
    return false;
// [VI] Rẽ nhánh điều kiện (if).
  if (p.startsWith('/instruments') || p.startsWith('/ethnicities') || p.startsWith('/masters'))
// [VI] Trả về kết quả từ hàm.
    return false;
// [VI] Rẽ nhánh điều kiện (if).
  if (p.startsWith('/about') || p.startsWith('/terms') || p.startsWith('/chatbot')) return false;
// [VI] Thực thi một bước trong luồng xử lý.
  // Recording detail is public; edit page remains protected.
// [VI] Rẽ nhánh điều kiện (if).
  if (p.startsWith('/recordings/') && !p.endsWith('/edit')) return false;
// [VI] Trả về kết quả từ hàm.
  return true;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
// Response interceptor
// [VI] Thực thi một bước trong luồng xử lý.
apiClient.interceptors.response.use(
// [VI] Khai báo hàm/biểu thức hàm.
  (response) => response,
// [VI] Khai báo hàm/biểu thức hàm.
  async (error: AxiosError) => {
// [VI] Rẽ nhánh điều kiện (if).
    if (axios.isAxiosError(error)) {
// [VI] Thực thi một bước trong luồng xử lý.
      attachNormalizedApiError(error);
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Rẽ nhánh điều kiện (if).
    if (error.response?.status === 401 && !isRedirectingToLogin) {
// [VI] Khai báo biến/hằng số.
      const url = error.config?.url ?? '';
// [VI] Khai báo biến/hằng số.
      const isAuthEndpoint = url.includes('/auth/') || url.includes('/Auth/');

// [VI] Thực thi một bước trong luồng xử lý.
      // Auth endpoint failure (bad credentials, confirm email, etc.) — let caller handle
// [VI] Rẽ nhánh điều kiện (if).
      if (isAuthEndpoint) {
// [VI] Trả về kết quả từ hàm.
        return Promise.reject(error);
// [VI] Thực thi một bước trong luồng xử lý.
      }

// [VI] Khai báo biến/hằng số.
      const token = getItem('access_token');
// [VI] Khai báo biến/hằng số.
      const path = typeof window !== 'undefined' ? window.location.pathname : '';

// [VI] Rẽ nhánh điều kiện (if).
      if (!token) {
// [VI] Thực thi một bước trong luồng xử lý.
        // No token at all — redirect only from protected pages
// [VI] Rẽ nhánh điều kiện (if).
        if (isProtectedPath(path)) {
// [VI] Thực thi một bước trong luồng xử lý.
          isRedirectingToLogin = true;
// [VI] Thực thi một bước trong luồng xử lý.
          await removeItem('access_token');
// [VI] Thực thi một bước trong luồng xử lý.
          await removeItem('user');
// [VI] Khai báo biến/hằng số.
          const redirect = path && path !== '/login' ? `?redirect=${encodeURIComponent(path)}` : '';
// [VI] Thực thi một bước trong luồng xử lý.
          window.location.href = `/login${redirect}`;
// [VI] Thực thi một bước trong luồng xử lý.
        }
// [VI] Trả về kết quả từ hàm.
        return Promise.reject(error);
// [VI] Thực thi một bước trong luồng xử lý.
      }

// [VI] Thực thi một bước trong luồng xử lý.
      // Token present but 401: could be role-restricted endpoint or transient server issue.
// [VI] Thực thi một bước trong luồng xử lý.
      // Do NOT auto-logout — let the component display an appropriate error instead.
// [VI] Thực thi một bước trong luồng xử lý.
      // Only logout when there is genuinely no token (handled above).
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Trả về kết quả từ hàm.
    return Promise.reject(error);
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
);

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const api = {
// [VI] Khai báo hàm/biểu thức hàm.
  get: <T>(url: string, config?: AxiosRequestConfig) =>
// [VI] Khai báo hàm/biểu thức hàm.
    apiClient.get<T>(url, config).then((res) => res.data),

// [VI] Khai báo hàm/biểu thức hàm.
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
// [VI] Khai báo hàm/biểu thức hàm.
    apiClient.post<T>(url, data, config).then((res) => res.data),

// [VI] Khai báo hàm/biểu thức hàm.
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
// [VI] Khai báo hàm/biểu thức hàm.
    apiClient.put<T>(url, data, config).then((res) => res.data),

// [VI] Khai báo hàm/biểu thức hàm.
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
// [VI] Khai báo hàm/biểu thức hàm.
    apiClient.patch<T>(url, data, config).then((res) => res.data),

// [VI] Khai báo hàm/biểu thức hàm.
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
// [VI] Khai báo hàm/biểu thức hàm.
    apiClient.delete<T>(url, config).then((res) => res.data),
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất mặc định (export default) nội dung chính của module.
export default apiClient;
