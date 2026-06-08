import { ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import {
  collectUniqueSources,
  shouldShowPerRowSource,
  type MetadataSuggestionLayout,
} from '@/components/features/upload/metadata-suggestions/formatCompactSource';
import MetadataSuggestionItemRow from '@/components/features/upload/metadata-suggestions/MetadataSuggestionItemRow';
import MetadataSuggestionSecondaryList from '@/components/features/upload/metadata-suggestions/MetadataSuggestionSecondaryList';
import type { AdvisoryMetadataSuggestionField } from '@/types/instrumentDetection';
import type { MetadataSuggestionGroup } from '@/utils/metadataSuggestionNormalize';

const READABLE_TITLES: Record<AdvisoryMetadataSuggestionField, string> = {
  ethnicGroup: 'Dân tộc',
  eventType: 'Loại sự kiện',
  musicalScale: 'Âm giai',
  region: 'Khu vực',
  vocalStyle: 'Lời hát',
};

type MetadataSuggestionCardProps = {
  group: MetadataSuggestionGroup;
  primaryAction?: ReactNode;
  emptyMessage?: string;
  layout?: MetadataSuggestionLayout;
};

export default function MetadataSuggestionCard({
  group,
  primaryAction,
  emptyMessage = 'Chưa có gợi ý phù hợp',
  layout = 'compact',
}: MetadataSuggestionCardProps) {
  const hasPrimary = Boolean(group.primary?.label?.trim());
  const secondary = group.secondary ?? [];
  const isReadable = layout === 'readable';

  const allItems = [
    ...(group.primary ? [group.primary] : []),
    ...secondary,
  ];
  const perRowSource = shouldShowPerRowSource(allItems);
  const sharedSources = perRowSource ? [] : collectUniqueSources(allItems);

  const displayTitle = isReadable ? (READABLE_TITLES[group.id] ?? group.title) : group.title;
  const sectionLabelClass = isReadable
    ? 'mb-1.5 text-xs font-medium text-neutral-600'
    : 'mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500';

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-lg border border-neutral-200/90 bg-white shadow-sm ${
        isReadable ? 'max-h-[420px]' : 'max-h-[360px]'
      }`}
      aria-labelledby={`metadata-suggestion-${group.id}`}
      aria-label={displayTitle}
    >
      <header
        className={`flex shrink-0 flex-wrap items-center gap-1.5 border-b border-neutral-100 ${
          isReadable ? 'px-4 py-2.5' : 'px-3 py-2'
        }`}
      >
        <h4
          id={`metadata-suggestion-${group.id}`}
          className={
            isReadable ? 'text-sm font-semibold text-neutral-900' : 'text-xs font-semibold text-neutral-900'
          }
        >
          {displayTitle}
        </h4>
        {group.conflictDetected && (
          <span
            className={`rounded-full bg-amber-50 px-2 py-px font-medium text-amber-900 ring-1 ring-amber-200/70 ${
              isReadable ? 'text-xs' : 'text-[10px]'
            }`}
          >
            Nguồn không đồng nhất
          </span>
        )}
        {group.requiresExpertVerification && (
          <span
            className={`inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-px font-medium text-amber-900 ring-1 ring-amber-200/70 ${
              isReadable ? 'text-xs' : 'text-[10px]'
            }`}
          >
            {isReadable ? <ShieldAlert className="h-3 w-3 shrink-0" aria-hidden /> : null}
            Cần chuyên gia xác minh
          </span>
        )}
      </header>

      <div className={`min-h-0 flex-1 overflow-y-auto ${isReadable ? 'px-4 py-3' : 'px-3 py-2'}`}>
        <div className={isReadable ? 'space-y-3' : 'space-y-2'}>
          <section aria-label="Gợi ý chính">
            <p className={sectionLabelClass}>Gợi ý chính</p>
            {hasPrimary && group.primary ? (
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <MetadataSuggestionItemRow
                    item={group.primary}
                    variant="primary"
                    layout={layout}
                    hideSource={!perRowSource}
                  />
                </div>
                {primaryAction ? <div className="shrink-0">{primaryAction}</div> : null}
              </div>
            ) : (
              <p
                className={`leading-snug text-neutral-500 ${isReadable ? 'text-xs' : 'text-[11px]'}`}
              >
                {emptyMessage}
              </p>
            )}
          </section>

          <section aria-label="Gợi ý phụ">
            <p className={sectionLabelClass}>Gợi ý phụ</p>
            <MetadataSuggestionSecondaryList
              items={secondary}
              layout={layout}
              hideSource={!perRowSource}
            />
          </section>

          {!perRowSource && sharedSources.length > 0 ? (
            <p className="border-t border-neutral-100 pt-2 text-xs text-neutral-500">
              {sharedSources.join(' · ')}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
