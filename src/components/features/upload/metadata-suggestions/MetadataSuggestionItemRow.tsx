import ConfidencePill from '@/components/features/upload/metadata-suggestions/ConfidencePill';
import {
  formatCompactSourceDisplay,
  type MetadataSuggestionLayout,
} from '@/components/features/upload/metadata-suggestions/formatCompactSource';
import type { MetadataSuggestionItem } from '@/utils/metadataSuggestionNormalize';

type MetadataSuggestionItemRowProps = {
  item: MetadataSuggestionItem;
  variant?: 'primary' | 'secondary';
  layout?: MetadataSuggestionLayout;
  hideSource?: boolean;
};

/** Primary suggestion — slightly emphasized, still compact. */
export default function MetadataSuggestionItemRow({
  item,
  variant = 'secondary',
  layout = 'compact',
  hideSource = false,
}: MetadataSuggestionItemRowProps) {
  if (variant === 'secondary') {
    return null;
  }

  const source = formatCompactSourceDisplay(item.source) ?? item.source;
  const isReadable = layout === 'readable';
  const pillVariant = isReadable ? 'tiered' : 'neutral';

  return (
    <div
      className={
        isReadable
          ? 'rounded-md border border-primary-100/80 border-l-4 border-l-primary-500 bg-primary-50/60 px-3 py-2'
          : 'rounded-md border border-primary-100/80 bg-primary-50/40 px-2.5 py-1.5'
      }
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={
            isReadable
              ? 'min-w-0 flex-1 text-base font-semibold text-neutral-900'
              : 'min-w-0 flex-1 text-sm font-medium text-neutral-900'
          }
        >
          {item.label}
        </p>
        <ConfidencePill confidence={item.confidence} variant={pillVariant} />
      </div>
      {!hideSource && source ? (
        <p className={`mt-0.5 text-neutral-500 ${isReadable ? 'text-xs' : 'text-[11px]'}`}>
          {source}
        </p>
      ) : null}
    </div>
  );
}
