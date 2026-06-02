import { useId, useState } from 'react';

import MetadataSuggestionCompactRow from '@/components/features/upload/metadata-suggestions/MetadataSuggestionCompactRow';
import type { MetadataSuggestionItem } from '@/utils/metadataSuggestionNormalize';

const DEFAULT_VISIBLE = 3;

type MetadataSuggestionSecondaryListProps = {
  items: MetadataSuggestionItem[];
  maxVisible?: number;
  emptyMessage?: string;
};

export default function MetadataSuggestionSecondaryList({
  items,
  maxVisible = DEFAULT_VISIBLE,
  emptyMessage = 'Chưa có gợi ý phụ phù hợp',
}: MetadataSuggestionSecondaryListProps) {
  const listId = useId();
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) {
    return <p className="text-[11px] leading-snug text-neutral-500">{emptyMessage}</p>;
  }

  const hiddenCount = Math.max(0, items.length - maxVisible);
  const visible = expanded || hiddenCount === 0 ? items : items.slice(0, maxVisible);

  return (
    <div>
      <ul id={listId} className="m-0 list-none p-0" role="list">
        {visible.map((item) => (
          <MetadataSuggestionCompactRow
            key={`${item.label}-${item.source ?? ''}-${item.confidence ?? 'na'}`}
            item={item}
          />
        ))}
      </ul>
      {hiddenCount > 0 ? (
        <button
          type="button"
          className="mt-1 text-[11px] font-medium text-primary-700 hover:text-primary-800 hover:underline"
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
