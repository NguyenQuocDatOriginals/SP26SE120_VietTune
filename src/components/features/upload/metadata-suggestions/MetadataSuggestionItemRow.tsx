import ConfidencePill from '@/components/features/upload/metadata-suggestions/ConfidencePill';
import { formatCompactSourceDisplay } from '@/components/features/upload/metadata-suggestions/formatCompactSource';
import type { MetadataSuggestionItem } from '@/utils/metadataSuggestionNormalize';

type MetadataSuggestionItemRowProps = {
  item: MetadataSuggestionItem;
  variant?: 'primary' | 'secondary';
};

/** Primary suggestion — slightly emphasized, still compact. */
export default function MetadataSuggestionItemRow({
  item,
  variant = 'secondary',
}: MetadataSuggestionItemRowProps) {
  if (variant === 'secondary') {
    return null;
  }

  const source = formatCompactSourceDisplay(item.source) ?? item.source;

  return (
    <div className="rounded-md border border-primary-100/80 bg-primary-50/40 px-2.5 py-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 flex-1 text-sm font-medium text-neutral-900">{item.label}</p>
        <ConfidencePill confidence={item.confidence} />
      </div>
      {source ? <p className="mt-0.5 text-[11px] text-neutral-500">{source}</p> : null}
    </div>
  );
}
