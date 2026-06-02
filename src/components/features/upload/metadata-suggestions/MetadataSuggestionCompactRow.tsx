import ConfidencePill from '@/components/features/upload/metadata-suggestions/ConfidencePill';
import { formatCompactSourceDisplay } from '@/components/features/upload/metadata-suggestions/formatCompactSource';
import type { MetadataSuggestionItem } from '@/utils/metadataSuggestionNormalize';

type MetadataSuggestionCompactRowProps = {
  item: MetadataSuggestionItem;
};

/** Compact secondary suggestion — label, % pill, short source. */
export default function MetadataSuggestionCompactRow({ item }: MetadataSuggestionCompactRowProps) {
  const source = formatCompactSourceDisplay(item.source);

  return (
    <li className="border-b border-neutral-100/80 py-1 last:border-b-0 last:pb-0">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-xs font-medium text-neutral-800">{item.label}</span>
        <ConfidencePill confidence={item.confidence} />
      </div>
      {source ? <p className="mt-0.5 truncate text-[11px] text-neutral-500">{source}</p> : null}
    </li>
  );
}
