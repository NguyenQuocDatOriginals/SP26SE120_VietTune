import { useMemo } from 'react';
import { Info } from 'lucide-react';

import MetadataSuggestionCard from '@/components/features/upload/metadata-suggestions/MetadataSuggestionCard';
import type { MetadataSuggestion } from '@/types/instrumentDetection';
import { groupMetadataSuggestionsForAdvisory } from '@/utils/instrumentMetadataMapper';
import { normalizeMetadataSuggestionGroups } from '@/utils/metadataSuggestionNormalize';

type MetadataSuggestionReadOnlyPanelProps = {
  suggestions: MetadataSuggestion[];
};

export default function MetadataSuggestionReadOnlyPanel({
  suggestions,
}: MetadataSuggestionReadOnlyPanelProps) {
  const groups = useMemo(() => {
    const advisory = groupMetadataSuggestionsForAdvisory(suggestions);
    return normalizeMetadataSuggestionGroups(advisory);
  }, [suggestions]);

  if (groups.length === 0) {
    return null;
  }

  return (
    <section
      className="mt-3 rounded-xl border border-neutral-200/90 bg-surface-muted p-3"
      aria-label="Gợi ý metadata chỉ đọc"
    >
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-500" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Gợi ý metadata (chỉ đọc)</h3>
          <p className="mt-0.5 text-[11px] leading-snug text-neutral-600">
            Đây là gợi ý từ AI dựa trên phân tích nhạc cụ — không phải metadata cuối cùng. Chuyên
            gia sẽ xác minh trước khi công bố.
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        {groups.map((group) => (
          <MetadataSuggestionCard key={group.id} group={group} />
        ))}
      </div>
    </section>
  );
}
