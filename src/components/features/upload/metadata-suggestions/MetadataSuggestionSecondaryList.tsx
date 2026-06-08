import { useId, useState } from 'react';

import type { MetadataSuggestionLayout } from '@/components/features/upload/metadata-suggestions/formatCompactSource';
import MetadataSuggestionCompactRow from '@/components/features/upload/metadata-suggestions/MetadataSuggestionCompactRow';
import type { MetadataSuggestionItem } from '@/utils/metadataSuggestionNormalize';

const DEFAULT_VISIBLE = 3;

type MetadataSuggestionSecondaryListProps = {
  items: MetadataSuggestionItem[];
  maxVisible?: number;
  emptyMessage?: string;
  layout?: MetadataSuggestionLayout;
  hideSource?: boolean;
};

export default function MetadataSuggestionSecondaryList({
  items,
  maxVisible = DEFAULT_VISIBLE,
  emptyMessage = 'Chưa có gợi ý phụ phù hợp',
  layout = 'compact',
  hideSource = false,
}: MetadataSuggestionSecondaryListProps) {
  const listId = useId();
  const [expanded, setExpanded] = useState(false);
  const isReadable = layout === 'readable';

  if (items.length === 0) {
    return (
      <p className={`leading-snug text-neutral-500 ${isReadable ? 'text-xs' : 'text-[11px]'}`}>
        {emptyMessage}
      </p>
    );
  }

  const hiddenCount = Math.max(0, items.length - maxVisible);
  const visible = expanded || hiddenCount === 0 ? items : items.slice(0, maxVisible);

  return (
    <div>
      <ul
        id={listId}
        className={isReadable ? 'm-0 list-none divide-y divide-neutral-100/80 p-0' : 'm-0 list-none p-0'}
      >
        {visible.map((item) => (
          <MetadataSuggestionCompactRow
            key={`${item.label}-${item.source ?? ''}-${item.confidence ?? 'na'}`}
            item={item}
            layout={layout}
            hideSource={hideSource}
          />
        ))}
      </ul>
      {hiddenCount > 0 ? (
        <button
          type="button"
          className={
            isReadable
              ? 'mt-2 min-h-[44px] text-sm font-medium text-primary-700 hover:text-primary-800 hover:underline'
              : 'mt-1 text-[11px] font-medium text-primary-700 hover:text-primary-800 hover:underline'
          }
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Thu gọn' : `Xem thêm ${hiddenCount} gợi ý`}
        </button>
      ) : null}
    </div>
  );
}
