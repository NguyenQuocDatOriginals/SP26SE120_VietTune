// [VI] Nhập (import) các phụ thuộc cho file.
import type { Recording } from '@/types';

// [VI] Thực thi một bước trong luồng xử lý.
/** Tokenize for loose accent-insensitive matching (aligned with SemanticSearchPage). */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function tokenizeExploreSemantic(text: string): string[] {
// [VI] Trả về kết quả từ hàm.
  return text
// [VI] Thực thi một bước trong luồng xử lý.
    .toLowerCase()
// [VI] Thực thi một bước trong luồng xử lý.
    .normalize('NFD')
// [VI] Thực thi một bước trong luồng xử lý.
    .replace(/\p{Diacritic}/gu, '')
// [VI] Thực thi một bước trong luồng xử lý.
    .split(/\s+/)
// [VI] Thực thi một bước trong luồng xử lý.
    .filter(Boolean);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function scoreRecordingSemantic(r: Recording, tokens: string[]): number {
// [VI] Khai báo biến/hằng số.
  const title = (r.title || '') + ' ' + (r.titleVietnamese || '');
// [VI] Khai báo biến/hằng số.
  const desc = r.description || '';
// [VI] Khai báo biến/hằng số.
  const ethnicityName =
// [VI] Thực thi một bước trong luồng xử lý.
    typeof r.ethnicity === 'object' && r.ethnicity !== null
// [VI] Thực thi một bước trong luồng xử lý.
      ? (r.ethnicity.name || '') + ' ' + (r.ethnicity.nameVietnamese || '')
// [VI] Thực thi một bước trong luồng xử lý.
      : '';
// [VI] Khai báo biến/hằng số.
  const tags = (r.tags || []).join(' ');
// [VI] Khai báo biến/hằng số.
  const instruments = (r.instruments ?? [])
// [VI] Khai báo hàm/biểu thức hàm.
    .map((i) => `${i.name ?? ''} ${i.nameVietnamese ?? ''}`)
// [VI] Thực thi một bước trong luồng xử lý.
    .join(' ');
// [VI] Khai báo biến/hằng số.
  const searchable = [title, desc, ethnicityName, tags, instruments]
// [VI] Thực thi một bước trong luồng xử lý.
    .join(' ')
// [VI] Thực thi một bước trong luồng xử lý.
    .toLowerCase()
// [VI] Thực thi một bước trong luồng xử lý.
    .normalize('NFD')
// [VI] Thực thi một bước trong luồng xử lý.
    .replace(/\p{Diacritic}/gu, '');
// [VI] Khai báo biến/hằng số.
  let score = 0;
// [VI] Vòng lặp (for).
  for (const t of tokens) {
// [VI] Rẽ nhánh điều kiện (if).
    if (searchable.includes(t)) score += 1;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return score;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** Rank by semantic token overlap; drops zero-score rows (same contract as SemanticSearchPage). */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function rankRecordingsBySemanticQuery(
// [VI] Thực thi một bước trong luồng xử lý.
  recordings: Recording[],
// [VI] Thực thi một bước trong luồng xử lý.
  rawQuery: string,
// [VI] Thực thi một bước trong luồng xử lý.
): Recording[] {
// [VI] Khai báo biến/hằng số.
  const trimmed = rawQuery.trim();
// [VI] Rẽ nhánh điều kiện (if).
  if (!trimmed) return recordings;
// [VI] Khai báo biến/hằng số.
  const tokens = tokenizeExploreSemantic(trimmed);
// [VI] Rẽ nhánh điều kiện (if).
  if (tokens.length === 0) return recordings;
// [VI] Trả về kết quả từ hàm.
  return recordings
// [VI] Khai báo hàm/biểu thức hàm.
    .map((r) => ({ r, score: scoreRecordingSemantic(r, tokens) }))
// [VI] Khai báo hàm/biểu thức hàm.
    .filter((x) => x.score > 0)
// [VI] Khai báo hàm/biểu thức hàm.
    .sort((a, b) => b.score - a.score)
// [VI] Khai báo hàm/biểu thức hàm.
    .map((x) => x.r);
// [VI] Thực thi một bước trong luồng xử lý.
}
