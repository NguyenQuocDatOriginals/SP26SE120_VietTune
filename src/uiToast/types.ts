// [VI] Thực thi một bước trong luồng xử lý.
/** Normalized API error attached by Axios response interceptor — no toast here. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type NormalizedApiError = {
// [VI] Thực thi một bước trong luồng xử lý.
  /** e.g. HTTP_403, NETWORK, TIMEOUT */
// [VI] Thực thi một bước trong luồng xử lý.
  code: string;
// [VI] Thực thi một bước trong luồng xử lý.
  httpStatus?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  /** Best-effort backend message; callers decide whether to show it. */
// [VI] Thực thi một bước trong luồng xử lý.
  rawMessage: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const NORMALIZED_API_ERROR_KEY = '__viettuneNormalizedApiError' as const;
