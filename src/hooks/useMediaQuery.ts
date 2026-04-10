// [VI] Nhập (import) các phụ thuộc cho file.
import { useState, useEffect } from 'react';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function useMediaQuery(query: string): boolean {
// [VI] Khai báo biến/hằng số.
  const [matches, setMatches] = useState(false);

// [VI] Khai báo hàm/biểu thức hàm.
  useEffect(() => {
// [VI] Khai báo biến/hằng số.
    const media = window.matchMedia(query);
// [VI] Rẽ nhánh điều kiện (if).
    if (media.matches !== matches) {
// [VI] Thực thi một bước trong luồng xử lý.
      setMatches(media.matches);
// [VI] Thực thi một bước trong luồng xử lý.
    }

// [VI] Khai báo biến/hằng số.
    const listener = () => setMatches(media.matches);
// [VI] Thực thi một bước trong luồng xử lý.
    media.addEventListener('change', listener);

// [VI] Khai báo hàm/biểu thức hàm.
    return () => media.removeEventListener('change', listener);
// [VI] Thực thi một bước trong luồng xử lý.
  }, [matches, query]);

// [VI] Trả về kết quả từ hàm.
  return matches;
// [VI] Thực thi một bước trong luồng xử lý.
}
