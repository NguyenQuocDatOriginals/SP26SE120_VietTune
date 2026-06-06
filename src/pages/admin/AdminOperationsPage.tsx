import { Activity, ArrowUpRight, ClipboardCopy, Compass } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import BackButton from '@/components/common/BackButton';
import Card from '@/components/common/Card';
import { isAdminOperationsPageEnabled } from '@/config/adminOperationsConfig';
import AdminBreadcrumbs from '@/features/admin/shell/AdminBreadcrumbs';
import { buildAdminBreadcrumbItems } from '@/features/admin/shell/adminBreadcrumbUtils';
import { getSemanticSearchCircuitBreakerState } from '@/services/semanticSearchService';
import { useAuthStore } from '@/stores/authStore';
import { notifyLine, uiToast } from '@/uiToast';

function formatCountdownMs(endsAt: number, now: number): string {
  const ms = Math.max(0, endsAt - now);
  const s = Math.ceil(ms / 1000);
  if (s >= 60) return `${Math.ceil(s / 60)} phút`;
  return `${s}s`;
}

export default function AdminOperationsPage() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const enabled = isAdminOperationsPageEnabled();
  const [now, setNow] = useState(() => Date.now());

  const adminBreadcrumbItems = useMemo(
    () => buildAdminBreadcrumbItems(location.pathname, null),
    [location.pathname],
  );

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const circuit = useMemo(() => getSemanticSearchCircuitBreakerState(), [now]);
  const cooling = circuit.isCoolingDown;

  const diagnosticsPayload = useMemo(
    () => ({
      generatedAt: new Date(now).toISOString(),
      appMode: import.meta.env.MODE,
      appName: import.meta.env.VITE_APP_NAME ?? 'VietTune',
      userId: user?.id ?? null,
      userRole: user?.role ?? null,
      adminOperationsPageEnabled: enabled,
      semanticSearch: {
        circuitBreakerCooldownMs: circuit.cooldownMsTotal,
        isCoolingDown: cooling,
        cooldownEndsAt: cooling ? new Date(circuit.cooldownEndsAt).toISOString() : null,
      },
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      href: typeof window !== 'undefined' ? window.location.href : '',
    }),
    [circuit.cooldownEndsAt, circuit.cooldownMsTotal, cooling, enabled, now, user?.id, user?.role],
  );

  const copyDiagnostics = useCallback(async () => {
    const text = JSON.stringify(diagnosticsPayload, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      uiToast.success(notifyLine('Đã sao chép', 'Gói chẩn đoán đã vào clipboard.'));
    } catch {
      uiToast.error(notifyLine('Lỗi', 'Trình duyệt không cho phép sao chép.'));
    }
  }, [diagnosticsPayload]);

  if (!enabled) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-4">
            <AdminBreadcrumbs items={adminBreadcrumbItems} />
          </div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">Vận hành &amp; quản trị AI</h1>
            <BackButton to="/admin" fallback="/admin" />
          </div>
          <Card variant="bordered" className="p-6 sm:p-8">
            <p className="mb-3 font-semibold text-neutral-900">Trang chưa bật (feature flag)</p>
            <p className="text-sm font-medium leading-relaxed text-neutral-700">
              Đặt biến môi trường <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">VITE_ADMIN_OPERATIONS_PAGE=true</code> rồi
              build lại để kích hoạt route P3: nhật ký vận hành AI, chẩn đoán semantic search, và liên kết nhanh tới các workspace
              nghiên cứu.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4">
          <AdminBreadcrumbs items={adminBreadcrumbItems} />
        </div>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-primary-800">
              <Activity className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide">P3 — Vận hành</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 sm:text-3xl">Vận hành &amp; quản trị AI</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-neutral-700">
              Khung tin cậy &amp; kiểm toán: trạng thái tìm kiếm ngữ nghĩa, placeholder nhật ký job (chờ BE), và xuất chẩn đoán nhanh
              cho hỗ trợ kỹ thuật. Không nhúng đồ thị nặng — dùng liên kết tới Researcher / Explore.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void copyDiagnostics()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 border-neutral-300/90 bg-surface-panel px-5 text-sm font-semibold text-neutral-900 shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
            >
              <ClipboardCopy className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              Sao chép chẩn đoán
            </button>
            <BackButton to="/admin" fallback="/admin" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card variant="bordered" className="p-6 sm:p-8">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-neutral-900">
              Tìm kiếm ngữ nghĩa (Explore)
            </h2>
            <p className="mb-4 text-sm font-medium leading-relaxed text-neutral-700">
              Sau lỗi máy chủ (5xx), client bật circuit breaker ~3 phút — cùng logic với Explore (
              <code className="rounded bg-neutral-100 px-1 text-xs">semanticSearchService</code>).
            </p>
            <div
              className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                cooling
                  ? 'border-amber-300/80 bg-amber-50/90 text-amber-950'
                  : 'border-emerald-200/80 bg-emerald-50/80 text-emerald-950'
              }`}
            >
              {cooling ? (
                <>
                  Đang cooldown — còn khoảng{' '}
                  <strong>{formatCountdownMs(circuit.cooldownEndsAt, now)}</strong> (kết thúc{' '}
                  {new Date(circuit.cooldownEndsAt).toLocaleString('vi-VN')}).
                </>
              ) : (
                <>Không trong thời gian cooldown (có thể gọi API theo luồng Explore).</>
              )}
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-600"
            >
              Mở Explore
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </Link>
          </Card>

          <Card variant="bordered" className="p-6 sm:p-8">
            <h2 className="mb-3 text-lg font-semibold text-neutral-900">Đồ thị tri thức &amp; RAG</h2>
            <p className="mb-4 text-sm font-medium leading-relaxed text-neutral-700">
              Trực quan hóa nặng mở tại Researcher; KB / embedding backfill vẫn từ dashboard chính.
            </p>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  to="/researcher"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-600"
                >
                  <Compass className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
                  Cổng Researcher
                  <ArrowUpRight className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-600"
                >
                  Về dashboard quản trị (Giám sát AI → backfill)
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                </Link>
              </li>
            </ul>
          </Card>

          <Card variant="bordered" className="p-6 sm:p-8 lg:col-span-2">
            <h2 className="mb-3 text-lg font-semibold text-neutral-900">Nhật ký job AI / phiên bản mô hình</h2>
            <p className="mb-4 text-sm font-medium text-neutral-600">
              Chờ contract BE (logs, model version, rollback). Hiện không gọi API — chỉ hiển thị placeholder.
            </p>
            <div className="overflow-hidden rounded-xl border border-neutral-200/90">
              <table className="w-full min-w-[280px] text-left text-sm">
                <thead className="bg-neutral-50/90 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  <tr>
                    <th className="px-4 py-3">Thời điểm</th>
                    <th className="px-4 py-3">Loại</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/80 bg-surface-panel font-medium text-neutral-800">
                  <tr>
                    <td className="px-4 py-4 text-neutral-500" colSpan={4}>
                      Chưa có dữ liệu — khi backend cung cấp endpoint đọc log, bảng sẽ được nối dữ liệu thật.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
