import type { ReactNode } from 'react';

import MetadataSuggestionItemRow from '@/components/features/upload/metadata-suggestions/MetadataSuggestionItemRow';
import MetadataSuggestionSecondaryList from '@/components/features/upload/metadata-suggestions/MetadataSuggestionSecondaryList';
import type { MetadataSuggestionGroup } from '@/utils/metadataSuggestionNormalize';

type MetadataSuggestionCardProps = {
  group: MetadataSuggestionGroup;
  primaryAction?: ReactNode;
  emptyMessage?: string;
};

export default function MetadataSuggestionCard({
  group,
  primaryAction,
  emptyMessage = 'Chưa có gợi ý phù hợp',
}: MetadataSuggestionCardProps) {
  const hasPrimary = Boolean(group.primary?.label?.trim());
  const secondary = group.secondary ?? [];

  return (
    <article
      className="flex max-h-[360px] flex-col overflow-hidden rounded-lg border border-neutral-200/90 bg-white shadow-sm"
      aria-labelledby={`metadata-suggestion-${group.id}`}
      aria-label={group.title}
    >
      <header className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-neutral-100 px-3 py-2">
        <h4
          id={`metadata-suggestion-${group.id}`}
          className="text-xs font-semibold text-neutral-900"
        >
          {group.title}
        </h4>
        {group.conflictDetected && (
          <span className="rounded-full bg-amber-50 px-2 py-px text-[10px] font-medium text-amber-900 ring-1 ring-amber-200/70">
            Nguồn không đồng nhất
          </span>
        )}
        {group.requiresExpertVerification && (
          <span className="rounded-full bg-amber-50 px-2 py-px text-[10px] font-medium text-amber-900 ring-1 ring-amber-200/70">
            Cần chuyên gia xác minh
          </span>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-2">
          <section aria-label="Gợi ý chính">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              Gợi ý chính
            </p>
            {hasPrimary && group.primary ? (
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <MetadataSuggestionItemRow item={group.primary} variant="primary" />
                </div>
                {primaryAction ? <div className="shrink-0">{primaryAction}</div> : null}
              </div>
            ) : (
              <p className="text-[11px] leading-snug text-neutral-500">{emptyMessage}</p>
            )}
          </section>

          <section aria-label="Gợi ý phụ">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              Gợi ý phụ
            </p>
            <MetadataSuggestionSecondaryList items={secondary} />
          </section>
        </div>
      </div>
    </article>
  );
}
