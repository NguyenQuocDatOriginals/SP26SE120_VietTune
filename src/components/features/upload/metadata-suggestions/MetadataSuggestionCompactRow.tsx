import ConfidencePill from '@/components/features/upload/metadata-suggestions/ConfidencePill';
import {
  formatCompactSourceDisplay,
  type MetadataSuggestionLayout,
} from '@/components/features/upload/metadata-suggestions/formatCompactSource';
import type { MetadataSuggestionItem } from '@/utils/metadataSuggestionNormalize';

type MetadataSuggestionCompactRowProps = {
  item: MetadataSuggestionItem;
  layout?: MetadataSuggestionLayout;
  hideSource?: boolean;
};

/** Compact secondary suggestion — label, % pill, short source. */
export default function MetadataSuggestionCompactRow({
  item,
  layout = 'compact',
  hideSource = false,
}: MetadataSuggestionCompactRowProps) {
  const source = formatCompactSourceDisplay(item.source);
  const isReadable = layout === 'readable';
  const pillVariant = isReadable ? 'tiered' : 'neutral';

  return (
    <li
      className={
        isReadable
          ? 'border-b border-neutral-100/80 py-2 last:border-b-0 last:pb-0'
          : 'border-b border-neutral-100/80 py-1 last:border-b-0 last:pb-0'
      }
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={
            isReadable
              ? 'min-w-0 text-sm font-medium text-neutral-800'
              : 'min-w-0 truncate text-xs font-medium text-neutral-800'
          }
        >
          {item.label}
        </span>
        <ConfidencePill confidence={item.confidence} variant={pillVariant} />
      </div>
      {!hideSource && source ? (
        <p
          className={`mt-0.5 text-neutral-500 ${isReadable ? 'text-xs' : 'truncate text-[11px]'}`}
        >
          {source}
        </p>
      ) : null}
    </li>
  );
}
