import { AlertTriangle, Sparkles } from 'lucide-react';

import { getSemanticSearchCircuitBreakerState } from '@/services/semanticSearchService';
import { cn } from '@/utils/helpers';

export type SemanticSearchSummaryBarProps = {
  query: string;
  totalResults: number;
  elapsedMs?: number;
  className?: string;
};

function formatElapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function cooldownMinutesRemaining(endsAt: number): number {
  const remaining = Math.max(0, endsAt - Date.now());
  return Math.ceil(remaining / 60_000);
}

export default function SemanticSearchSummaryBar({
  query,
  totalResults,
  elapsedMs,
  className,
}: SemanticSearchSummaryBarProps) {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const breaker = getSemanticSearchCircuitBreakerState();
  const displayQuery = trimmed.length > 120 ? `${trimmed.slice(0, 117)}…` : trimmed;

  return (
    <div
      className={cn(
        'mb-4 rounded-xl border border-secondary-200/70 bg-gradient-to-r from-secondary-50/90 to-cream-50/80 px-4 py-3 text-sm shadow-sm',
        className,
      )}
      role="status"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="inline-flex items-center gap-1.5 font-semibold text-primary-900">
          <Sparkles className="h-4 w-4 shrink-0 text-secondary-600" aria-hidden />
          Tìm theo ngữ nghĩa
        </span>
        <span className="text-neutral-500" aria-hidden>
          ·
        </span>
        <span className="text-neutral-700">
          <span className="text-neutral-500">Mô tả:</span>{' '}
          <q className="font-medium text-neutral-900 not-italic">{displayQuery}</q>
        </span>
      </div>
      <p className="mt-1.5 text-neutral-600">
        {totalResults > 0
          ? `Tìm thấy ${totalResults} bản thu phù hợp`
          : 'Chưa có bản thu khớp mô tả'}
        {elapsedMs != null ? ` · ${formatElapsed(elapsedMs)}` : null}
      </p>
      {breaker.isCoolingDown ? (
        <p className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200/80 bg-amber-50/90 px-2.5 py-2 text-xs font-medium text-amber-950">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
          Hệ thống tìm kiếm ngữ nghĩa tạm nghỉ sau lỗi máy chủ. Thử lại sau khoảng{' '}
          {cooldownMinutesRemaining(breaker.cooldownEndsAt)} phút.
        </p>
      ) : null}
    </div>
  );
}
