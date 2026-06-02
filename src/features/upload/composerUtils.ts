function normalizeComposerKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

/** True when text means folk / unknown composer (matches submit label variants). */
export function isFolkComposerLabel(value: string): boolean {
  const key = normalizeComposerKey(value);
  if (!key) return false;
  if (key === 'dan gian') return true;
  if (key.startsWith('dan gian/khong ro')) return true;
  return false;
}

export function applyComposerInput(
  value: string,
  setComposer: (v: string) => void,
  setComposerUnknown: (v: boolean) => void,
): void {
  if (isFolkComposerLabel(value)) {
    setComposerUnknown(true);
    setComposer('');
    return;
  }
  setComposer(value);
}
