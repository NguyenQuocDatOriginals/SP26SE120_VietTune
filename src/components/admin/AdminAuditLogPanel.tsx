import { ClipboardList } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { adminApi, type AdminAuditLogRow } from '@/services/adminApi';
import { getErrorMessage } from '@/utils/httpError';

function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN');
}

export default function AdminAuditLogPanel() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [items, setItems] = useState<AdminAuditLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadState('loading');
    setErrorMessage(null);
    try {
      const res = await adminApi.getAuditLogs({
        page,
        pageSize,
        from: from || undefined,
        to: to || undefined,
      });
      setItems(res.items);
      setTotal(res.total);
      setLoadState('ok');
    } catch (err) {
      setItems([]);
      setTotal(0);
      setLoadState('error');
      setErrorMessage(getErrorMessage(err, 'Không tải được nhật ký kiểm toán.'));
    }
  }, [page, pageSize, from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl bg-surface-panel">
      <h3 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-primary-600" strokeWidth={2.5} aria-hidden />
        Nhật ký kiểm toán (Admin)
      </h3>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          Từ ngày
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-neutral-300 px-3 text-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          Đến ngày
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-neutral-300 px-3 text-neutral-900"
          />
        </label>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loadState === 'loading'}
          className="h-10 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {loadState === 'loading' ? 'Đang tải…' : 'Lọc'}
        </button>
      </div>

      {loadState === 'error' && (
        <p className="mb-4 text-sm font-medium text-red-700">{errorMessage}</p>
      )}

      <div className="overflow-x-auto rounded-xl border border-neutral-200/80">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-600">
            <tr>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Hành động</th>
              <th className="px-4 py-3">Loại thực thể</th>
              <th className="px-4 py-3">ID thực thể</th>
              <th className="px-4 py-3">User ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loadState === 'loading' && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-600">
                  Đang tải nhật ký…
                </td>
              </tr>
            )}
            {loadState === 'ok' && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-600">
                  Không có bản ghi trong khoảng thời gian đã chọn.
                </td>
              </tr>
            )}
            {items.map((row) => (
              <tr key={row.id || `${row.createdAt}-${row.action}`} className="hover:bg-neutral-50/80">
                <td className="px-4 py-3 whitespace-nowrap font-medium text-neutral-900">
                  {formatDateTime(row.createdAt)}
                </td>
                <td className="px-4 py-3 text-neutral-800">{row.action || '—'}</td>
                <td className="px-4 py-3 text-neutral-700">{row.entityType || '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-600 max-w-[12rem] truncate">
                  {row.entityId || '—'}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-600 max-w-[12rem] truncate">
                  {row.userId || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-700">
        <span>
          Tổng: <strong>{total.toLocaleString('vi-VN')}</strong> — Trang {page}/{totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1 || loadState === 'loading'}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-full border border-neutral-300 px-4 py-1.5 font-semibold disabled:opacity-40"
          >
            Trước
          </button>
          <button
            type="button"
            disabled={page >= totalPages || loadState === 'loading'}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-neutral-300 px-4 py-1.5 font-semibold disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
