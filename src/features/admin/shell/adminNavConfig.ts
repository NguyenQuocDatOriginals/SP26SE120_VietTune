import type { AdminDashboardSectionId } from '@/features/admin/adminDashboardTypes';

/** Left-rail labels for dashboard sections (`?section=`). Icons live in `AdminDashboardRail.tsx`. */
export type AdminDashboardNavItem = {
  id: AdminDashboardSectionId;
  label: string;
  shortHint: string;
};

export const ADMIN_DASHBOARD_NAV_ITEMS: AdminDashboardNavItem[] = [
  { id: 'users', label: 'Quản lý người dùng', shortHint: 'Vai trò & đóng góp' },
  { id: 'analytics', label: 'Phân tích & thống kê', shortHint: 'Phủ sóng dữ liệu' },
  { id: 'aiMonitoring', label: 'Giám sát AI', shortHint: 'Chất lượng & cờ nội dung' },
  { id: 'moderation', label: 'Kiểm duyệt', shortHint: 'Yêu cầu & hàng chờ' },
];
