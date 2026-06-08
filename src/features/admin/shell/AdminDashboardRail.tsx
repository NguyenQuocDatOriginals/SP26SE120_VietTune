import { Activity, BarChart3, Users, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { AdminDashboardSectionId } from '@/features/admin/adminDashboardTypes';
import { ADMIN_DASHBOARD_NAV_ITEMS } from '@/features/admin/shell/adminNavConfig';
import { cn } from '@/utils/helpers';

const SECTION_ICONS: Record<AdminDashboardSectionId, LucideIcon> = {
  users: Users,
  analytics: BarChart3,
};

export type AdminDashboardRailProps = {
  activeId: AdminDashboardSectionId;
  onSelect: (id: AdminDashboardSectionId) => void;
  /** P3: khi bật `VITE_ADMIN_OPERATIONS_PAGE`, hiện liên kết tới `/admin/operations` dưới cùng rail. */
  showOperationsLink?: boolean;
};

/**
 * Desktop-only (`lg+`) primary nav for `/admin` sections.
 * Mobile keeps the existing horizontal stepper — no duplicate rail UI.
 */
export default function AdminDashboardRail({
  activeId,
  onSelect,
  showOperationsLink = false,
}: AdminDashboardRailProps) {
  return (
    <nav
      className="rounded-2xl border border-secondary-200/70 bg-gradient-to-b from-surface-panel to-secondary-50/50 p-3 shadow-md backdrop-blur-sm"
      aria-label="Điều hướng quản trị (màn hình lớn)"
    >
      <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Trung tâm vận hành
      </p>
      <ul className="flex flex-col gap-1.5">
        {ADMIN_DASHBOARD_NAV_ITEMS.map(({ id, label, shortHint }) => {
          const Icon = SECTION_ICONS[id];
          const active = activeId === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                className={cn(
                  'flex w-full min-h-[44px] flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2',
                  active
                    ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-md shadow-primary-600/25'
                    : 'text-neutral-800 hover:bg-secondary-100/90 hover:text-neutral-900',
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                  <span className="leading-snug">{label}</span>
                </span>
                <span
                  className={cn(
                    'pl-6 text-xs font-medium leading-snug',
                    active ? 'text-white/85' : 'text-neutral-500',
                  )}
                >
                  {shortHint}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {showOperationsLink ? (
        <div className="mt-4 border-t border-neutral-200/80 pt-3">
          <Link
            to="/admin/operations"
            className="flex min-h-[44px] flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-neutral-800 transition-colors hover:bg-secondary-100/90 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2"
          >
            <span className="flex items-center gap-2">
              <Activity className="h-4 w-4 shrink-0 text-primary-700" strokeWidth={2.5} aria-hidden />
              <span className="leading-snug">Vận hành &amp; AI</span>
            </span>
            <span className="pl-6 text-xs font-medium leading-snug text-neutral-500">
              P3 — chẩn đoán, nhật ký (placeholder)
            </span>
          </Link>
        </div>
      ) : null}
    </nav>
  );
}
