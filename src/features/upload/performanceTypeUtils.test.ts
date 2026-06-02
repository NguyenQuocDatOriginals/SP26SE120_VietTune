import { describe, expect, it } from 'vitest';

import {
  hasValidDetectedInstruments,
  mergeInstrumentDetectionSignals,
  normalizePerformanceTypeKey,
  PERFORMANCE_TYPE,
} from '@/features/upload/performanceTypeUtils';

describe('performanceTypeUtils', () => {
  it('normalizes Vietnamese labels to keys', () => {
    expect(normalizePerformanceTypeKey('Nhạc cụ')).toBe(PERFORMANCE_TYPE.INSTRUMENTAL);
    expect(normalizePerformanceTypeKey('instrumental')).toBe(PERFORMANCE_TYPE.INSTRUMENTAL);
  });

  it('detects valid instruments in mixed arrays', () => {
    expect(hasValidDetectedInstruments([{ name: 'Đàn bầu' }])).toBe(true);
    expect(hasValidDetectedInstruments(['Đàn nhị'])).toBe(true);
    expect(hasValidDetectedInstruments([])).toBe(false);
  });

  it('merges detection signals without duplicates', () => {
    const merged = mergeInstrumentDetectionSignals(
      [{ name: 'Đàn bầu', confidence: 0.9 }],
      ['Đàn bầu', 'Đàn nhị'],
    );
    expect(merged).toHaveLength(2);
    expect(merged.map((i) => i.name)).toEqual(['Đàn bầu', 'Đàn nhị']);
  });
});
