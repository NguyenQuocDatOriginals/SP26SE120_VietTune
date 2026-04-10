// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Recursively unwrap common API envelope shapes into an array.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function extractArray<T>(
// [VI] Thực thi một bước trong luồng xử lý.
  data: unknown,
// [VI] Thực thi một bước trong luồng xử lý.
  keys: string[] = ['data', 'items', 'users', 'results', 'result', 'value', 'Data', 'Items'],
// [VI] Thực thi một bước trong luồng xử lý.
): T[] {
// [VI] Rẽ nhánh điều kiện (if).
  if (Array.isArray(data)) return data as T[];
// [VI] Rẽ nhánh điều kiện (if).
  if (!data || typeof data !== 'object') return [];

// [VI] Khai báo biến/hằng số.
  const obj = data as Record<string, unknown>;
// [VI] Vòng lặp (for).
  for (const key of keys) {
// [VI] Rẽ nhánh điều kiện (if).
    if (key in obj) {
// [VI] Khai báo biến/hằng số.
      const extracted = extractArray<T>(obj[key], keys);
// [VI] Rẽ nhánh điều kiện (if).
      if (extracted.length > 0) return extracted;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return [];
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Unwrap common API envelope shapes into an object.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function extractObject(data: unknown): Record<string, unknown> | null {
// [VI] Rẽ nhánh điều kiện (if).
  if (!data || typeof data !== 'object') return null;
// [VI] Khai báo biến/hằng số.
  const obj = data as Record<string, unknown>;

// [VI] Rẽ nhánh điều kiện (if).
  if ('data' in obj) {
// [VI] Khai báo biến/hằng số.
    const inner = obj.data;
// [VI] Rẽ nhánh điều kiện (if).
    if (inner && typeof inner === 'object' && !Array.isArray(inner))
// [VI] Trả về kết quả từ hàm.
      return inner as Record<string, unknown>;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Rẽ nhánh điều kiện (if).
  if ('item' in obj) {
// [VI] Khai báo biến/hằng số.
    const inner = obj.item;
// [VI] Rẽ nhánh điều kiện (if).
    if (inner && typeof inner === 'object' && !Array.isArray(inner))
// [VI] Trả về kết quả từ hàm.
      return inner as Record<string, unknown>;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return obj;
// [VI] Thực thi một bước trong luồng xử lý.
}
