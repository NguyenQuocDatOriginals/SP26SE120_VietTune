import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import MetadataSuggestionReadOnlyPanel from '@/components/features/upload/metadata-suggestions/MetadataSuggestionReadOnlyPanel';
import type { MetadataSuggestion } from '@/types/instrumentDetection';

describe('MetadataSuggestionReadOnlyPanel', () => {
  it('renders formal card layout with primary/secondary labels', () => {
    const suggestions: MetadataSuggestion[] = [
      { field: 'eventType', value: 'Biểu diễn', sourceInstrument: 'Đàn bầu', confidence: 0.98 },
      { field: 'eventType', value: 'Lễ hội', sourceInstrument: 'Đàn tranh', confidence: 0.95 },
    ];

    render(<MetadataSuggestionReadOnlyPanel suggestions={suggestions} />);

    expect(screen.getByText('Gợi ý metadata (chỉ đọc)')).toBeTruthy();
    expect(screen.getByText('Gợi ý chính')).toBeTruthy();
    expect(screen.getByText('Gợi ý phụ')).toBeTruthy();
    expect(screen.queryByText('Chính')).toBeNull();
    expect(screen.queryByText('Phụ')).toBeNull();
    expect(screen.getByText('Nguồn: Đàn bầu')).toBeTruthy();
    expect(screen.getByText('98%')).toBeTruthy();
  });
});
