import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import MetadataSuggestionSecondaryList from '@/components/features/upload/metadata-suggestions/MetadataSuggestionSecondaryList';

describe('MetadataSuggestionSecondaryList', () => {
  it('shows at most 3 items until expanded', () => {
    const items = [1, 2, 3, 4, 5].map((n) => ({
      label: `Gợi ý ${n}`,
      confidence: 0.9,
      source: `Nguồn suy luận: Nhạc cụ ${n}`,
    }));

    render(<MetadataSuggestionSecondaryList items={items} />);

    expect(screen.getByText('Gợi ý 1')).toBeTruthy();
    expect(screen.getByText('Gợi ý 3')).toBeTruthy();
    expect(screen.queryByText('Gợi ý 4')).toBeNull();
    expect(screen.getByRole('button', { name: 'Xem thêm 2 gợi ý' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Xem thêm 2 gợi ý' }));
    expect(screen.getByText('Gợi ý 5')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Thu gọn' })).toBeTruthy();
  });

  it('renders compact empty line', () => {
    render(<MetadataSuggestionSecondaryList items={[]} />);
    expect(screen.getByText('Chưa có gợi ý phụ phù hợp')).toBeTruthy();
  });
});
