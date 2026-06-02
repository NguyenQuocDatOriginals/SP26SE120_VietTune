import { describe, expect, it, vi } from 'vitest';

import { applyComposerInput, isFolkComposerLabel } from '@/features/upload/composerUtils';

describe('isFolkComposerLabel', () => {
  it('matches Dân gian and full checkbox label', () => {
    expect(isFolkComposerLabel('Dân gian')).toBe(true);
    expect(isFolkComposerLabel('Dân gian/Không rõ')).toBe(true);
    expect(isFolkComposerLabel('  dân gian  ')).toBe(true);
  });

  it('does not match a named composer', () => {
    expect(isFolkComposerLabel('Nguyễn Văn A')).toBe(false);
    expect(isFolkComposerLabel('Dân gian Nguyễn')).toBe(false);
  });
});

describe('applyComposerInput', () => {
  it('ticks folk/unknown and clears the field', () => {
    const setComposer = vi.fn();
    const setComposerUnknown = vi.fn();
    applyComposerInput('Dân gian', setComposer, setComposerUnknown);
    expect(setComposerUnknown).toHaveBeenCalledWith(true);
    expect(setComposer).toHaveBeenCalledWith('');
  });

  it('keeps normal composer text', () => {
    const setComposer = vi.fn();
    const setComposerUnknown = vi.fn();
    applyComposerInput('Trịnh Công Sơn', setComposer, setComposerUnknown);
    expect(setComposerUnknown).not.toHaveBeenCalled();
    expect(setComposer).toHaveBeenCalledWith('Trịnh Công Sơn');
  });
});
