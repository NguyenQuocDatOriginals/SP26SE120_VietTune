import { describe, expect, it } from 'vitest';

import { isUnknownValue, sanitizeAiString } from '@/features/upload/unknownValueUtils';

describe('unknownValueUtils', () => {
  it('detects placeholder strings', () => {
    expect(isUnknownValue('unknown')).toBe(true);
    expect(isUnknownValue('Không rõ')).toBe(true);
    expect(isUnknownValue(null)).toBe(true);
    expect(isUnknownValue('Tiếng Việt')).toBe(false);
  });

  it('sanitize returns null for unknown', () => {
    expect(sanitizeAiString('unknown')).toBeNull();
    expect(sanitizeAiString('  Ma sap  ')).toBe('Ma sap');
  });
});
