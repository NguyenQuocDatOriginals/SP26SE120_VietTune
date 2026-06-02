import { LANGUAGES } from '@/features/upload/uploadConstants';
import { isUnknownValue } from '@/features/upload/unknownValueUtils';

const LANGUAGE_ALIAS_TO_OPTION: Record<string, string> = {
  'tiếng việt': 'Tiếng Việt',
  vietnamese: 'Tiếng Việt',
  vi: 'Tiếng Việt',
  'tieng viet': 'Tiếng Việt',
};

/** AI/backend placeholders that must not become "Khác" + custom text. */
export function isPlaceholderLanguage(value: string | null | undefined): boolean {
  return isUnknownValue(value);
}

/** Map free-text or AI language to a dropdown option, or null → use "Khác" + custom. */
export function matchLanguageToDropdown(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || isPlaceholderLanguage(trimmed)) return null;
  if (LANGUAGES.includes(trimmed)) return trimmed;
  const alias = LANGUAGE_ALIAS_TO_OPTION[trimmed.toLowerCase()];
  if (alias && LANGUAGES.includes(alias)) return alias;
  return null;
}

/**
 * When dropdown is "Khác" but custom text matches a known option (e.g. AI wrote "tiếng Việt"),
 * promote to that option so UI is not contradictory.
 */
export function reconcileLanguageFields(
  language: string,
  customLanguage: string,
  noLanguage: boolean,
): { language: string; customLanguage: string; noLanguage?: boolean } {
  if (noLanguage) return { language: '', customLanguage: '' };
  if (language === 'Khác' && isUnknownValue(customLanguage)) {
    return { language: '', customLanguage: '', noLanguage: true };
  }
  if (language !== 'Khác' || !customLanguage.trim()) {
    return { language, customLanguage: language === 'Khác' ? customLanguage : '' };
  }
  const matched = matchLanguageToDropdown(customLanguage);
  if (matched) return { language: matched, customLanguage: '' };
  return { language, customLanguage };
}
