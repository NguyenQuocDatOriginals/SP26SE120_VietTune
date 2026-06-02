import { ArrowUpRight, BookMarked, Compass, Database, Share2, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ADMIN_GOVERNANCE_TARGETS } from '@/features/admin/governance/adminGovernanceTargets';
import { cn } from '@/utils/helpers';

const ICONS: Record<string, LucideIcon> = {
  'master-data': Database,
  'kb-admin': BookMarked,
  'researcher-kg': Share2,
  'kb-public': Compass,
};

/**
 * Second-row governance shortcuts (desktop). Mobile unchanged — strip hidden at call site.
 */
export default function AdminGovernanceStrip() {
  return (
    <section className="mb-6 sm:mb-8" aria-label="Liên kết quản trị tri thức & taxonomy">
      <p className="mb-3 text-sm font-semibold text-primary-800">Tri thức & taxonomy</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ADMIN_GOVERNANCE_TARGETS.map((t) => {
          const Icon = ICONS[t.id] ?? Compass;
          return (
            <Link
              key={t.id}
              to={t.to}
              className={cn(
                'group flex min-h-[44px] flex-col rounded-2xl border border-secondary-200/70 bg-gradient-to-br from-surface-panel to-secondary-50/40 p-4 shadow-sm ring-1 ring-secondary-200/30 transition-all',
                'hover:border-primary-300/60 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              )}
            >
              <span className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <Icon className="h-4 w-4 shrink-0 text-primary-700" strokeWidth={2.25} aria-hidden />
                  {t.title}
                </span>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary-600"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </span>
              <span className="text-xs font-medium leading-relaxed text-neutral-600">{t.description}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
