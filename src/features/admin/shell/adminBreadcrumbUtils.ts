import {
  parseAdminDashboardSectionParam,
  type AdminDashboardSectionId,
} from '@/features/admin/adminDashboardTypes';
import { ADMIN_DASHBOARD_NAV_ITEMS } from '@/features/admin/shell/adminNavConfig';

export type AdminBreadcrumbItem = {
  /** Hiển thị (tiếng Việt). */
  label: string;
  /** Nếu có — `Link` nội bộ; mục cuối thường không có `to` (trang hiện tại). */
  to?: string;
};

const ROOT: AdminBreadcrumbItem = { label: 'Quản trị', to: '/admin' };

function sectionLabel(id: AdminDashboardSectionId): string {
  return ADMIN_DASHBOARD_NAV_ITEMS.find((x) => x.id === id)?.label ?? id;
}

/**
 * Breadcrumb cho khu `/admin/*` — dùng pathname + (tuỳ chọn) `?section=` khi đang ở `/admin`.
 */
export function buildAdminBreadcrumbItems(
  pathname: string,
  sectionQuery: string | null,
): AdminBreadcrumbItem[] {
  const base = pathname.replace(/\/+$/, '') || '/';

  if (base === '/admin' || base.endsWith('/admin')) {
    const step = parseAdminDashboardSectionParam(sectionQuery);
    return [ROOT, { label: sectionLabel(step) }];
  }
  if (base.endsWith('/admin/master-data')) {
    return [ROOT, { label: 'Dữ liệu tham chiếu (Master Data)' }];
  }
  if (base.endsWith('/admin/knowledge-base')) {
    return [ROOT, { label: 'Knowledge Base (quản trị)' }];
  }
  if (base.endsWith('/admin/create-expert')) {
    return [ROOT, { label: 'Cấp tài khoản Chuyên gia' }];
  }
  if (base.endsWith('/admin/operations')) {
    return [ROOT, { label: 'Vận hành & quản trị AI' }];
  }

  return [ROOT];
}
