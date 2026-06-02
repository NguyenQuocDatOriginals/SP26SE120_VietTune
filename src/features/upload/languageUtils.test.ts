import { describe, expect, it } from 'vitest';

import {
  isPlaceholderLanguage,
  matchLanguageToDropdown,
  reconcileLanguageFields,
} from '@/features/upload/languageUtils';

describe('languageUtils', () => {
  it('maps Vietnamese aliases to Tiếng Việt', () => {
    expect(matchLanguageToDropdown('tiếng Việt')).toBe('Tiếng Việt');
    expect(matchLanguageToDropdown('Vietnamese')).toBe('Tiếng Việt');
  });

  it('treats unknown placeholders as empty', () => {
    expect(isPlaceholderLanguage('unknown')).toBe(true);
    expect(matchLanguageToDropdown('unknown')).toBeNull();
  });

  it('reconciles Khác + tiếng Việt to dropdown option', () => {
    expect(reconcileLanguageFields('Khác', 'tiếng Việt', false)).toEqual({
      language: 'Tiếng Việt',
      customLanguage: '',
    });
  });

  it('clears language when noLanguage is checked', () => {
    expect(reconcileLanguageFields('Khác', 'foo', true)).toEqual({
      language: '',
      customLanguage: '',
    });
  });

  it('promotes Khác + unknown custom to noLanguage', () => {
    expect(reconcileLanguageFields('Khác', 'unknown', false)).toEqual({
      language: '',
      customLanguage: '',
      noLanguage: true,
    });
  });
});

