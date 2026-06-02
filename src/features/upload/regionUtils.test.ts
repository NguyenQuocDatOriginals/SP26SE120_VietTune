import { describe, expect, it } from 'vitest';

import { resolveUploadRegionLabel } from '@/features/upload/regionUtils';

const REGIONS = [
  'Bắc Trung Bộ',
  'Đồng bằng sông Cửu Long',
  'Đồng bằng sông Hồng',
  'Đông Bắc',
  'Đông Nam Bộ',
  'Nam Trung Bộ',
  'Tây Bắc',
  'Tây Nguyên',
];

describe('resolveUploadRegionLabel', () => {
  it('maps region code to dropdown label', () => {
    expect(resolveUploadRegionLabel('DBSCL', REGIONS)).toBe('Đồng bằng sông Cửu Long');
  });

  it('keeps an already-valid label', () => {
    expect(resolveUploadRegionLabel('Đồng bằng sông Cửu Long', REGIONS)).toBe(
      'Đồng bằng sông Cửu Long',
    );
  });
});
