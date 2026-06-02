import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { AdminBreadcrumbItem } from '@/features/admin/shell/adminBreadcrumbUtils';
import { cn } from '@/utils/helpers';

export type AdminBreadcrumbsProps = {
  items: AdminBreadcrumbItem[];
  className?: string;
};

/**
 * Dải breadcrumb nhẹ trong khu quản trị (P4 — wayfinding).
 */
export default function AdminBreadcrumbs({ items, className }: AdminBreadcrumbsProps) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('mb-3 sm:mb-4', className)}>
      <ol className="flex flex-wrap items-center gap-1 text-xs font-medium text-neutral-600 sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 ? (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-400" strokeWidth={2.5} aria-hidden />
              ) : null}
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="truncate text-primary-700 transition-colors hover:text-primary-600 hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn('truncate', isLast ? 'font-semibold text-neutral-900' : 'text-neutral-700')}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
