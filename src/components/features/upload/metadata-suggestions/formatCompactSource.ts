/** Short source line for compact rows (e.g. "Nguồn: Đàn nhị"). */
export function formatCompactSourceDisplay(source?: string | null): string | null {
  if (!source?.trim()) return null;
  const stripped = source.trim().replace(/^Nguồn suy luận:\s*/i, '');
  if (!stripped) return null;
  return `Nguồn: ${stripped}`;
}
