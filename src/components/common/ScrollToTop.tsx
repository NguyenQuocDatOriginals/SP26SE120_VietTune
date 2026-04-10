/**
 * Tài liệu hoá tiếng Việt cho file TSX.
 * Ghi chú: TSX/JSX không thể chú thích "từng dòng" bằng `//` trong phần JSX mà không phá cú pháp,
 * nên file này được chú thích theo khối/chức năng chính (component/handler/luồng dữ liệu).
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**

 * Component trang (page).

 * - Trách nhiệm: hiển thị UI và điều phối các thao tác chính của trang.

 */


export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
