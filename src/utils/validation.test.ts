import { describe, expect, it } from 'vitest';

import {
  validateAudioFile,
  validateEmail,
  validateImageFile,
  validatePassword,
} from './validation';

describe('validation utils', () => {
  it('validates audio file type and size', () => {
    const ok = new File([new Uint8Array([1, 2, 3])], 'a.mp3', { type: 'audio/mpeg' });
    expect(validateAudioFile(ok)).toEqual({ valid: true });

    const badType = new File([new Uint8Array([1])], 'a.txt', { type: 'text/plain' });
    expect(validateAudioFile(badType).valid).toBe(false);
  });

  it('validates image file type and size', () => {
    const ok = new File([new Uint8Array([1, 2, 3])], 'a.png', { type: 'image/png' });
    expect(validateImageFile(ok)).toEqual({ valid: true });

    const bad = new File([new Uint8Array([1])], 'a.gif', { type: 'image/gif' });
    expect(validateImageFile(bad).valid).toBe(false);
  });

  it('validates email format', () => {
    expect(validateEmail('tester@example.com')).toBe(true);
    expect(validateEmail('not-an-email')).toBe(false);
  });

  it('validates password complexity', () => {
    const strong = validatePassword('Abcdef1');
    expect(strong.valid).toBe(true);
    expect(strong.errors).toEqual([]);

    const weak = validatePassword('abc');
    expect(weak.valid).toBe(false);
    expect(weak.errors.length).toBeGreaterThan(0);
  });
});
