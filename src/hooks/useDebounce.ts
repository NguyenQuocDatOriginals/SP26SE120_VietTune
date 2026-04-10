// [VI] Nhập (import) các phụ thuộc cho file.
import { useState, useEffect } from 'react';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function useDebounce<T>(value: T, delay: number): T {
// [VI] Khai báo biến/hằng số.
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

// [VI] Khai báo hàm/biểu thức hàm.
  useEffect(() => {
// [VI] Khai báo biến/hằng số.
    const handler = setTimeout(() => {
// [VI] Thực thi một bước trong luồng xử lý.
      setDebouncedValue(value);
// [VI] Thực thi một bước trong luồng xử lý.
    }, delay);

// [VI] Khai báo hàm/biểu thức hàm.
    return () => {
// [VI] Thực thi một bước trong luồng xử lý.
      clearTimeout(handler);
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Thực thi một bước trong luồng xử lý.
  }, [value, delay]);

// [VI] Trả về kết quả từ hàm.
  return debouncedValue;
// [VI] Thực thi một bước trong luồng xử lý.
}
