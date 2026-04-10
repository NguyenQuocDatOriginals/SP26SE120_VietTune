// [VI] Nhập (import) các phụ thuộc cho file.
import * as Sentry from '@sentry/react';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { ErrorInfo } from 'react';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface ErrorReportContext {
// [VI] Thực thi một bước trong luồng xử lý.
  /** Khu vực / route (main, auth, admin) để lọc lỗi trên dashboard */
// [VI] Thực thi một bước trong luồng xử lý.
  region?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  [key: string]: unknown;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** Reporter được gọi trong componentDidCatch; có thể gắn Sentry, LogRocket, v.v. */
// [VI] Khai báo biến/hằng số.
let reporter: ((error: Error, errorInfo?: ErrorInfo, context?: ErrorReportContext) => void) | null =
// [VI] Thực thi một bước trong luồng xử lý.
  null;

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Khởi tạo error reporting: nếu có VITE_SENTRY_DSN thì bật Sentry;
// [VI] Thực thi một bước trong luồng xử lý.
 * có thể gọi thêm setErrorReporter cho LogRocket hoặc service khác.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function initErrorReporting(): void {
// [VI] Khai báo biến/hằng số.
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
// [VI] Rẽ nhánh điều kiện (if).
  if (dsn && typeof dsn === 'string' && dsn.trim() !== '') {
// [VI] Thực thi một bước trong luồng xử lý.
    Sentry.init({
// [VI] Thực thi một bước trong luồng xử lý.
      dsn,
// [VI] Thực thi một bước trong luồng xử lý.
      environment: import.meta.env.MODE,
// [VI] Thực thi một bước trong luồng xử lý.
      integrations: [Sentry.browserTracingIntegration()],
// [VI] Thực thi một bước trong luồng xử lý.
      tracesSampleRate: 0.1,
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Khai báo hàm/biểu thức hàm.
    setErrorReporter((error, errorInfo, context) => {
// [VI] Thực thi một bước trong luồng xử lý.
      Sentry.captureException(error, {
// [VI] Thực thi một bước trong luồng xử lý.
        extra: {
// [VI] Thực thi một bước trong luồng xử lý.
          componentStack: errorInfo?.componentStack,
// [VI] Thực thi một bước trong luồng xử lý.
          ...context,
// [VI] Thực thi một bước trong luồng xử lý.
        },
// [VI] Thực thi một bước trong luồng xử lý.
      });
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Đăng ký reporter tùy chỉnh (LogRocket, custom backend, v.v.).
// [VI] Thực thi một bước trong luồng xử lý.
 * Gọi sau initErrorReporting nếu muốn thêm bên cạnh Sentry.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function setErrorReporter(
// [VI] Khai báo hàm/biểu thức hàm.
  fn: (error: Error, errorInfo?: ErrorInfo, context?: ErrorReportContext) => void,
// [VI] Thực thi một bước trong luồng xử lý.
): void {
// [VI] Thực thi một bước trong luồng xử lý.
  reporter = fn;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Báo lỗi từ Error Boundary (hoặc bất kỳ đâu).
// [VI] Thực thi một bước trong luồng xử lý.
 * Nếu đã gọi setErrorReporter (Sentry/LogRocket), sẽ gửi lên service;
// [VI] Thực thi một bước trong luồng xử lý.
 * không thì chỉ log trong DEV.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function reportError(
// [VI] Thực thi một bước trong luồng xử lý.
  error: Error,
// [VI] Thực thi một bước trong luồng xử lý.
  errorInfo?: ErrorInfo,
// [VI] Thực thi một bước trong luồng xử lý.
  context?: ErrorReportContext,
// [VI] Thực thi một bước trong luồng xử lý.
): void {
// [VI] Rẽ nhánh điều kiện (if).
  if (reporter) {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Thực thi một bước trong luồng xử lý.
      reporter(error, errorInfo, context);
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (e) {
// [VI] Rẽ nhánh điều kiện (if).
      if (import.meta.env.DEV) {
// [VI] Thực thi một bước trong luồng xử lý.
        console.error('Error reporter threw:', e);
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Rẽ nhánh điều kiện (if).
  if (import.meta.env.DEV) {
// [VI] Thực thi một bước trong luồng xử lý.
    console.error('[ErrorBoundary] reportError:', error, errorInfo, context);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}
