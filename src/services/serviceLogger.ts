// [VI] Nhập (import) các phụ thuộc cho file.
import { reportError } from '@/services/errorReporting';

// [VI] Khai báo hàm/biểu thức hàm.
function asError(message: string, value?: unknown): Error {
// [VI] Rẽ nhánh điều kiện (if).
  if (value instanceof Error) return value;
// [VI] Rẽ nhánh điều kiện (if).
  if (typeof value === 'string' && value.trim()) return new Error(`${message}: ${value}`);
// [VI] Trả về kết quả từ hàm.
  return new Error(message);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function logServiceError(message: string, error?: unknown): void {
// [VI] Thực thi một bước trong luồng xử lý.
  reportError(asError(message, error), undefined, {
// [VI] Thực thi một bước trong luồng xử lý.
    source: 'service',
// [VI] Thực thi một bước trong luồng xử lý.
    message,
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function logServiceWarn(message: string, detail?: unknown): void {
// [VI] Rẽ nhánh điều kiện (if).
  if (import.meta.env.DEV) {
// [VI] Thực thi một bước trong luồng xử lý.
    console.warn(message, detail);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function logServiceInfo(message: string, detail?: unknown): void {
// [VI] Rẽ nhánh điều kiện (if).
  if (import.meta.env.DEV) {
// [VI] Thực thi một bước trong luồng xử lý.
    console.info(message, detail);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}
