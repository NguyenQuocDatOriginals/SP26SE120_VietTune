import type { MetadataSuggestionItem } from '@/utils/metadataSuggestionNormalize';

export type MetadataSuggestionLayout = 'compact' | 'readable';

/** Short source line for compact rows (e.g. "Nguồn: Đàn nhị"). */
export function formatCompactSourceDisplay(source?: string | null): string | null {
  if (!source?.trim()) return null;
  const stripped = source.trim().replace(/^Nguồn suy luận:\s*/i, '');
  if (!stripped) return null;
  return `Nguồn: ${stripped}`;
}

/** Unique formatted source lines across suggestion items. */
export function collectUniqueSources(items: readonly MetadataSuggestionItem[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const formatted = formatCompactSourceDisplay(item.source);
    if (formatted && !seen.has(formatted)) {
      seen.add(formatted);
      out.push(formatted);
    }
  }
  return out;
}

/** When false, show a single shared source footer instead of per-row source lines. */
export function shouldShowPerRowSource(items: readonly MetadataSuggestionItem[]): boolean {
  return collectUniqueSources(items).length !== 1;
}
