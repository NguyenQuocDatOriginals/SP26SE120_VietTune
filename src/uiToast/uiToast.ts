// [VI] Nhập (import) các phụ thuộc cho file.
import axios from 'axios';
// [VI] Nhập (import) các phụ thuộc cho file.
import toast, { type ToastOptions } from 'react-hot-toast';

// [VI] Nhập (import) các phụ thuộc cho file.
import { interpolate } from './interpolate';
// [VI] Nhập (import) các phụ thuộc cho file.
import { MESSAGE_CATALOG, resolveCatalogMessage, type MessageKey } from './messageCatalog';
// [VI] Nhập (import) các phụ thuộc cho file.
import { getNormalizedApiError } from './normalizeApiError';

// [VI] Khai báo hàm/biểu thức hàm.
function isMessageKey(s: string): s is MessageKey {
// [VI] Trả về kết quả từ hàm.
  return Object.prototype.hasOwnProperty.call(MESSAGE_CATALOG, s);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function resolveText(
// [VI] Thực thi một bước trong luồng xử lý.
  messageOrKey: string,
// [VI] Thực thi một bước trong luồng xử lý.
  vars?: Record<string, string | number | undefined>,
// [VI] Thực thi một bước trong luồng xử lý.
): string {
// [VI] Rẽ nhánh điều kiện (if).
  if (isMessageKey(messageOrKey)) {
// [VI] Trả về kết quả từ hàm.
    return resolveCatalogMessage(messageOrKey, vars);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return interpolate(messageOrKey, vars ?? {});
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo biến/hằng số.
const defaultDuration = 5000;

// [VI] Khai báo hàm/biểu thức hàm.
function baseOptions(overrides?: ToastOptions): ToastOptions {
// [VI] Trả về kết quả từ hàm.
  return { duration: defaultDuration, ...overrides };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** Map HTTP status to catalog key for generic API failures. */
// [VI] Khai báo hàm/biểu thức hàm.
function statusToMessageKey(status: number | undefined): MessageKey {
// [VI] Rẽ nhánh điều kiện (if).
  if (status == null) return 'common.network';
// [VI] Rẽ nhánh điều kiện (if).
  if (status === 400) return 'common.http_400';
// [VI] Rẽ nhánh điều kiện (if).
  if (status === 401) return 'common.http_401';
// [VI] Rẽ nhánh điều kiện (if).
  if (status === 403) return 'common.http_403';
// [VI] Rẽ nhánh điều kiện (if).
  if (status === 404) return 'common.http_404';
// [VI] Rẽ nhánh điều kiện (if).
  if (status === 422) return 'common.http_422';
// [VI] Rẽ nhánh điều kiện (if).
  if (status >= 500) return 'common.http_500';
// [VI] Trả về kết quả từ hàm.
  return 'common.unknown';
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function codeToMessageKey(code: string): MessageKey {
// [VI] Rẽ nhánh điều kiện (if).
  if (code === 'NETWORK') return 'common.network';
// [VI] Rẽ nhánh điều kiện (if).
  if (code === 'TIMEOUT') return 'common.timeout';
// [VI] Trả về kết quả từ hàm.
  return 'common.unknown';
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Thin wrapper over react-hot-toast. Feature code should import only this module.
// [VI] Thực thi một bước trong luồng xử lý.
 * Swapping the underlying library later = edit this file only.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const uiToast = {
// [VI] Thực thi một bước trong luồng xử lý.
  success(
// [VI] Thực thi một bước trong luồng xử lý.
    messageOrKey: string,
// [VI] Thực thi một bước trong luồng xử lý.
    vars?: Record<string, string | number | undefined>,
// [VI] Thực thi một bước trong luồng xử lý.
    options?: ToastOptions,
// [VI] Thực thi một bước trong luồng xử lý.
  ): string {
// [VI] Trả về kết quả từ hàm.
    return toast.success(resolveText(messageOrKey, vars), baseOptions(options));
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  error(
// [VI] Thực thi một bước trong luồng xử lý.
    messageOrKey: string,
// [VI] Thực thi một bước trong luồng xử lý.
    vars?: Record<string, string | number | undefined>,
// [VI] Thực thi một bước trong luồng xử lý.
    options?: ToastOptions,
// [VI] Thực thi một bước trong luồng xử lý.
  ): string {
// [VI] Trả về kết quả từ hàm.
    return toast.error(resolveText(messageOrKey, vars), baseOptions(options));
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  info(
// [VI] Thực thi một bước trong luồng xử lý.
    messageOrKey: string,
// [VI] Thực thi một bước trong luồng xử lý.
    vars?: Record<string, string | number | undefined>,
// [VI] Thực thi một bước trong luồng xử lý.
    options?: ToastOptions,
// [VI] Thực thi một bước trong luồng xử lý.
  ): string {
// [VI] Trả về kết quả từ hàm.
    return toast(resolveText(messageOrKey, vars), {
// [VI] Thực thi một bước trong luồng xử lý.
      ...baseOptions(options),
// [VI] Thực thi một bước trong luồng xử lý.
      icon: 'ℹ️',
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  warning(
// [VI] Thực thi một bước trong luồng xử lý.
    messageOrKey: string,
// [VI] Thực thi một bước trong luồng xử lý.
    vars?: Record<string, string | number | undefined>,
// [VI] Thực thi một bước trong luồng xử lý.
    options?: ToastOptions,
// [VI] Thực thi một bước trong luồng xử lý.
  ): string {
// [VI] Trả về kết quả từ hàm.
    return toast(resolveText(messageOrKey, vars), {
// [VI] Thực thi một bước trong luồng xử lý.
      ...baseOptions(options),
// [VI] Thực thi một bước trong luồng xử lý.
      icon: '⚠️',
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  promise<T>(
// [VI] Thực thi một bước trong luồng xử lý.
    p: Promise<T>,
// [VI] Thực thi một bước trong luồng xử lý.
    msgs: {
// [VI] Thực thi một bước trong luồng xử lý.
      loading: string;
// [VI] Thực thi một bước trong luồng xử lý.
      success: string;
// [VI] Thực thi một bước trong luồng xử lý.
      error: string;
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    vars?: {
// [VI] Thực thi một bước trong luồng xử lý.
      loading?: Record<string, string | number | undefined>;
// [VI] Thực thi một bước trong luồng xử lý.
      success?: Record<string, string | number | undefined>;
// [VI] Thực thi một bước trong luồng xử lý.
      error?: Record<string, string | number | undefined>;
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
  ): Promise<T> {
// [VI] Trả về kết quả từ hàm.
    return toast.promise(p, {
// [VI] Thực thi một bước trong luồng xử lý.
      loading: resolveText(msgs.loading, vars?.loading),
// [VI] Thực thi một bước trong luồng xử lý.
      success: resolveText(msgs.success, vars?.success),
// [VI] Thực thi một bước trong luồng xử lý.
      error: resolveText(msgs.error, vars?.error),
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  /**
// [VI] Thực thi một bước trong luồng xử lý.
   * Use in catch blocks when you choose to surface an error.
// [VI] Thực thi một bước trong luồng xử lý.
   * Prefers payload from `attachNormalizedApiError` (Axios interceptor).
// [VI] Thực thi một bước trong luồng xử lý.
   */
// [VI] Thực thi một bước trong luồng xử lý.
  fromApiError(
// [VI] Thực thi một bước trong luồng xử lý.
    err: unknown,
// [VI] Thực thi một bước trong luồng xử lý.
    fallbackKey: MessageKey = 'common.unknown',
// [VI] Thực thi một bước trong luồng xử lý.
    options?: ToastOptions,
// [VI] Thực thi một bước trong luồng xử lý.
  ): string {
// [VI] Rẽ nhánh điều kiện (if).
    if (axios.isAxiosError(err)) {
// [VI] Khai báo biến/hằng số.
      const n = getNormalizedApiError(err) ?? null;
// [VI] Rẽ nhánh điều kiện (if).
      if (n) {
// [VI] Khai báo biến/hằng số.
        const key =
// [VI] Thực thi một bước trong luồng xử lý.
          n.httpStatus != null ? statusToMessageKey(n.httpStatus) : codeToMessageKey(n.code);
// [VI] Trả về kết quả từ hàm.
        return toast.error(resolveCatalogMessage(key), baseOptions(options));
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Trả về kết quả từ hàm.
    return toast.error(resolveCatalogMessage(fallbackKey), baseOptions(options));
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
};
