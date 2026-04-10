// [VI] Thực thi một bước trong luồng xử lý.
/** Kết quả thao tác ghi server — UI quyết định có gọi uiToast hay không. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type MutationOk = { ok: true };
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type MutationFail = { ok: false; error: unknown; httpStatus?: number };
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type MutationResult = MutationOk | MutationFail;

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function mutationOk(): MutationOk {
// [VI] Trả về kết quả từ hàm.
  return { ok: true };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function mutationFail(error: unknown, httpStatus?: number): MutationFail {
// [VI] Trả về kết quả từ hàm.
  return { ok: false, error, httpStatus };
// [VI] Thực thi một bước trong luồng xử lý.
}
