// [VI] Nhập (import) các phụ thuộc cho file.
import axios, { type AxiosError } from 'axios';

// [VI] Nhập (import) các phụ thuộc cho file.
import { NORMALIZED_API_ERROR_KEY, type NormalizedApiError } from './types';

// [VI] Khai báo hàm/biểu thức hàm.
function pickRawMessage(data: unknown): string | null {
// [VI] Rẽ nhánh điều kiện (if).
  if (data == null) return null;
// [VI] Rẽ nhánh điều kiện (if).
  if (typeof data === 'string') return data.trim() || null;
// [VI] Rẽ nhánh điều kiện (if).
  if (typeof data === 'object') {
// [VI] Khai báo biến/hằng số.
    const o = data as Record<string, unknown>;
// [VI] Khai báo biến/hằng số.
    const m = o.message ?? o.Message ?? o.detail ?? o.Detail;
// [VI] Rẽ nhánh điều kiện (if).
    if (typeof m === 'string') return m.trim() || null;
// [VI] Rẽ nhánh điều kiện (if).
    if (Array.isArray(m) && typeof m[0] === 'string') return m[0].trim() || null;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return null;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function normalizeAxiosError(error: AxiosError): NormalizedApiError {
// [VI] Khai báo biến/hằng số.
  const status = error.response?.status;
// [VI] Khai báo biến/hằng số.
  const rawMessage = pickRawMessage(error.response?.data);

// [VI] Khai báo biến/hằng số.
  let code: string;
// [VI] Rẽ nhánh điều kiện (if).
  if (status != null) {
// [VI] Thực thi một bước trong luồng xử lý.
    code = `HTTP_${status}`;
// [VI] Thực thi một bước trong luồng xử lý.
  } else if (error.code === 'ECONNABORTED') {
// [VI] Thực thi một bước trong luồng xử lý.
    code = 'TIMEOUT';
// [VI] Thực thi một bước trong luồng xử lý.
  } else if (error.message?.toLowerCase().includes('network') || error.code === 'ERR_NETWORK') {
// [VI] Thực thi một bước trong luồng xử lý.
    code = 'NETWORK';
// [VI] Thực thi một bước trong luồng xử lý.
  } else {
// [VI] Thực thi một bước trong luồng xử lý.
    code = 'UNKNOWN';
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    code,
// [VI] Thực thi một bước trong luồng xử lý.
    httpStatus: status,
// [VI] Thực thi một bước trong luồng xử lý.
    rawMessage,
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** Call from Axios response error interceptor only — never show toast here. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function attachNormalizedApiError(error: AxiosError): void {
// [VI] Khai báo biến/hằng số.
  const normalized = normalizeAxiosError(error);
// [VI] Thực thi một bước trong luồng xử lý.
  Object.defineProperty(error, NORMALIZED_API_ERROR_KEY, {
// [VI] Thực thi một bước trong luồng xử lý.
    value: normalized,
// [VI] Thực thi một bước trong luồng xử lý.
    enumerable: false,
// [VI] Thực thi một bước trong luồng xử lý.
    configurable: true,
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function getNormalizedApiError(error: unknown): NormalizedApiError | null {
// [VI] Rẽ nhánh điều kiện (if).
  if (!axios.isAxiosError(error)) return null;
// [VI] Khai báo biến/hằng số.
  const v = (error as AxiosError & Record<string, unknown>)[NORMALIZED_API_ERROR_KEY];
// [VI] Trả về kết quả từ hàm.
  return v && typeof v === 'object' ? (v as NormalizedApiError) : null;
// [VI] Thực thi một bước trong luồng xử lý.
}
