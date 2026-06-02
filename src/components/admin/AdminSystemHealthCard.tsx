import { Activity, Database, ListOrdered, Server } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { adminApi, type AdminSystemHealth } from '@/services/adminApi';
import { getErrorMessage } from '@/utils/httpError';
import { cn } from '@/utils/helpers';

function statusTone(status: string | undefined): string {
  const s = (status ?? '').toLowerCase();
  if (s.includes('healthy') || s.includes('ok')) {
    return 'border-emerald-200/80 bg-emerald-50/90 text-emerald-900';
  }
  if (s.includes('degraded') || s.includes('warn')) {
    return 'border-amber-200/80 bg-amber-50/90 text-amber-950';
  }
  if (s.includes('unhealthy') || s.includes('error') || s.includes('down')) {
    return 'border-red-200/80 bg-red-50/90 text-red-900';
  }
  return 'border-neutral-200/80 bg-surface-panel text-neutral-900';
}

export default function AdminSystemHealthCard() {
  const [health, setHealth] = useState<AdminSystemHealth | null>(null);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadState('loading');
    setErrorMessage(null);
    try {
      const data = await adminApi.getSystemHealth();
      setHealth(data);
      setLoadState('ok');
    } catch (err) {
      setHealth(null);
      setLoadState('error');
      setErrorMessage(getErrorMessage(err, 'Không tải được trạng thái hệ thống.'));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl bg-surface-panel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary-600" strokeWidth={2.5} aria-hidden />
          Sức khỏe hệ thống
        </h3>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loadState === 'loading'}
          className="text-sm font-semibold text-primary-700 hover:text-primary-800 disabled:opacity-50"
        >
          {loadState === 'loading' ? 'Đang tải…' : 'Làm mới'}
        </button>
      </div>

      {loadState === 'error' && (
        <p className="text-sm font-medium text-red-700">{errorMessage}</p>
      )}

      {loadState === 'loading' && !health && (
        <p className="text-sm text-neutral-600">Đang lấy dữ liệu từ GET /api/Admin/system-health…</p>
      )}

      {health && (
        <div className="space-y-4">
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold',
              statusTone(health.status),
            )}
          >
            <Server className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            Trạng thái: {health.status ?? '—'}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200/70 bg-white/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Uptime</p>
              <p className="mt-1 text-lg font-bold text-neutral-900">{health.uptime ?? '—'}</p>
            </div>
            <div className="rounded-xl border border-neutral-200/70 bg-white/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 flex items-center gap-1">
                <Database className="h-3.5 w-3.5" aria-hidden />
                DB connections
              </p>
              <p className="mt-1 text-lg font-bold tabular-nums text-neutral-900">
                {health.dbConnections ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200/70 bg-white/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 flex items-center gap-1">
                <ListOrdered className="h-3.5 w-3.5" aria-hidden />
                Queue length
              </p>
              <p className="mt-1 text-lg font-bold tabular-nums text-neutral-900">
                {health.queueLength ?? 0}
              </p>
            </div>
          </div>

          {health.services && Object.keys(health.services).length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-neutral-700">Dịch vụ</p>
              <ul className="flex flex-wrap gap-2">
                {Object.entries(health.services).map(([name, value]) => (
                  <li
                    key={name}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-800"
                  >
                    <span className="text-neutral-500">{name}:</span>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
