/**
 * Tài liệu hoá tiếng Việt cho file TSX.
 * Ghi chú: TSX/JSX không thể chú thích "từng dòng" bằng `//` trong phần JSX mà không phá cú pháp,
 * nên file này được chú thích theo khối/chức năng chính (component/handler/luồng dữ liệu).
 */
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import Footer from './Footer';
import Header from './Header';

import ErrorBoundary from '@/components/common/ErrorBoundary';
import { setItem } from '@/services/storageService';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';

/**

 * Component trang (page).

 * - Trách nhiệm: hiển thị UI và điều phối các thao tác chính của trang.

 */


export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Researcher: trang chủ là Cổng nghiên cứu — chuyển "/" sang "/researcher" nếu đã xác thực và kích hoạt
  useEffect(() => {
    if (location.pathname === '/' && user?.role === UserRole.RESEARCHER && user?.isActive) {
      navigate('/researcher', { replace: true });
    }
  }, [location.pathname, user?.role, user?.isActive, navigate]);

  // Expert: trang chủ là Kiểm duyệt — chuyển "/" sang "/moderation" nếu đã xác thực và kích hoạt
  useEffect(() => {
    if (location.pathname === '/' && user?.role === UserRole.EXPERT && user?.isActive) {
      navigate('/moderation', { replace: true });
    }
  }, [location.pathname, user?.role, user?.isActive, navigate]);

  useEffect(() => {
    // Ghi nhớ trang truy cập cuối cùng (trừ đăng nhập/đăng ký và "/" khi Researcher/Expert)
    const currentPath = location.pathname;
    const skipSave =
      currentPath === '/login' ||
      currentPath === '/register' ||
      (currentPath === '/' &&
        (user?.role === UserRole.RESEARCHER || user?.role === UserRole.EXPERT));
    if (!skipSave) {
      void setItem('lastVisitedPage', currentPath);
    }
  }, [location, user?.role]);

  return (
    <div
      className="flex flex-col min-h-screen min-w-0 overflow-x-hidden"
      style={{ backgroundColor: '#FFF2D6' }}
    >
      <Header />
      {/* Đủ chừa fixed header (pt-4 + nav có thể wrap 2 dòng); lg:pt-[4.75rem] trước đây quá thấp → nội dung/Hồ sơ bị che */}
      <main className="flex-grow min-w-0 w-full pt-32 lg:pt-40">
        <ErrorBoundary region="main">
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
