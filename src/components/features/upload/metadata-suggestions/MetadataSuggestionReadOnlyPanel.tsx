import { Info } from 'lucide-react';
import { useMemo } from 'react';

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
      data-testid="metadata-suggestion-readonly-panel"
      className="mt-3 rounded-xl border border-neutral-200/90 bg-surface-muted p-4"
      aria-label="Gợi ý metadata chỉ đọc"
    >
      <div className="flex items-start gap-2 border-b border-neutral-200/70 pb-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" aria-hidden />
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Gợi ý metadata (chỉ đọc)</h3>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600 sm:text-sm">
            Đây là gợi ý từ AI dựa trên phân tích nhạc cụ — không phải metadata cuối cùng. Chuyên
            gia sẽ xác minh trước khi công bố.
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        {groups.map((group) => (
          <MetadataSuggestionCard key={group.id} group={group} layout="readable" />
        ))}
      </div>
    </section>
  );
}
