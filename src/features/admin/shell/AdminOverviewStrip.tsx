import { Bot, Database, Music, Users } from 'lucide-react';

import { cn } from '@/utils/helpers';

export type AdminOverviewStripProps = {
  remoteTotalRecordings: number;
  allUsersCount: number;
  aiFlaggedCount: number;
  remoteKbCount: number;
};

function formatInt(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('vi-VN');
}

/**
 * Quick snapshot cards — **desktop only** (`lg+`); hidden on mobile per P1 scope.
 */
export default function AdminOverviewStrip({
  remoteTotalRecordings,
  allUsersCount,
  aiFlaggedCount,
  remoteKbCount,
}: AdminOverviewStripProps) {
  const tiles = [
    {
      key: 'rec',
      label: 'Bản ghi (ước tính API)',
      value: formatInt(remoteTotalRecordings),
      icon: Music,
      tone: 'from-primary-100/95 to-secondary-50/90 ring-primary-200/50',
      iconClass: 'text-primary-700',
    },
    {
      key: 'users',
      label: 'Người dùng (danh sách)',
      value: formatInt(allUsersCount),
      icon: Users,
      tone: 'from-secondary-100/95 to-surface-panel ring-secondary-200/50',
      iconClass: 'text-secondary-800',
    },
    {
      key: 'ai',
      label: 'Cờ AI / QA',
      value: formatInt(aiFlaggedCount),
      icon: Bot,
      tone: 'from-amber-50/95 to-surface-panel ring-amber-200/60',
      iconClass: 'text-amber-800',
    },
    {
      key: 'kb',
      label: 'Mục KB (remote)',
      value: formatInt(remoteKbCount),
      icon: Database,
      tone: 'from-sky-50/95 to-surface-panel ring-sky-200/60',
      iconClass: 'text-sky-800',
    },
  ] as const;

  return (
    <section
      className="mb-6 sm:mb-8"
      aria-label="Tóm tắt vận hành nhanh"
    >
      <p className="mb-3 text-sm font-semibold text-primary-800">Tóm tắt nhanh</p>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {tiles.map(({ key, label, value, icon: Icon, tone, iconClass }) => (
          <div
            key={key}
            className={cn(
              'rounded-2xl border border-secondary-200/60 bg-gradient-to-br p-4 shadow-sm ring-1 ring-inset',
              tone,
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-white/80 p-1.5 shadow-sm">
                <Icon className={cn('h-4 w-4', iconClass)} strokeWidth={2.25} aria-hidden />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
                {label}
              </span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-neutral-900">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
