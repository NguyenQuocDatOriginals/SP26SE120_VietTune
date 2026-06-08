import { useEffect, useMemo, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import Footer from './Footer';
import Header from './Header';

import ErrorBoundary from '@/components/common/ErrorBoundary';
import NotificationFeedBootstrap from '@/components/common/NotificationFeedBootstrap';
import backgroundImage from '@/components/image/background.png';
import { setItem } from '@/services/storageService';
import {
  VECTOR_SYNC_ON_INIT_ENABLED,
  vectorSyncService,
} from '@/services/vectorSyncService';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // Optional: vector resync when backend VectorSyncController is enabled (VITE_ENABLE_VECTOR_SYNC=true)
  const vectorSyncFired = useRef(false);
  useEffect(() => {
    if (!VECTOR_SYNC_ON_INIT_ENABLED || vectorSyncFired.current) return;
    vectorSyncFired.current = true;
    void vectorSyncService.resync();
  }, []);
  const backgroundAttachment = useMemo(() => {
    if (typeof navigator === 'undefined') return 'fixed';

    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const maxTouchPoints = navigator.maxTouchPoints || 0;
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1);
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // iOS Safari does not reliably support fixed attachment; use scroll fallback.
    return isIOS || prefersReducedMotion ? 'scroll' : 'fixed';
  }, []);


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
      (currentPath === '/' && user?.role === UserRole.EXPERT);
    if (!skipSave) {
      void setItem('lastVisitedPage', currentPath);
    }
  }, [location, user?.role]);

  const mainBackgroundStyle = useMemo(
    () => ({
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover' as const,
      backgroundPosition: 'top center' as const,
      backgroundRepeat: 'no-repeat' as const,
      backgroundAttachment,
    }),
    [backgroundAttachment],
  );

  return (
    <div className="flex flex-col min-h-screen min-w-0 overflow-x-hidden bg-cream-100">
      <NotificationFeedBootstrap />
      <Header />
      {/* Đủ chừa fixed header (pt-4 + nav có thể wrap 2 dòng); khoảng đệm tối ưu để nội dung cân đối với header */}
      <main className="flex-grow min-w-0 w-full pt-24 lg:pt-20" style={mainBackgroundStyle}>
        <ErrorBoundary region="main">
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
