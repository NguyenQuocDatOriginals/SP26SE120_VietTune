// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function normalizeSearchText(input: string): string {
// [VI] Trả về kết quả từ hàm.
  return (input ?? '')
// [VI] Thực thi một bước trong luồng xử lý.
    .toLowerCase()
// [VI] Thực thi một bước trong luồng xử lý.
    .normalize('NFD')
// [VI] Thực thi một bước trong luồng xử lý.
    .replace(/[\u0300-\u036f]/g, '')
// [VI] Thực thi một bước trong luồng xử lý.
    .replace(/Đ/g, 'D')
// [VI] Thực thi một bước trong luồng xử lý.
    .replace(/đ/g, 'd')
// [VI] Thực thi một bước trong luồng xử lý.
    .replace(/\s+/g, ' ')
// [VI] Thực thi một bước trong luồng xử lý.
    .trim();
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function tokenizeSearchText(input: string): string[] {
// [VI] Khai báo biến/hằng số.
  const normalized = normalizeSearchText(input);
// [VI] Rẽ nhánh điều kiện (if).
  if (!normalized) return [];
// [VI] Trả về kết quả từ hàm.
  return normalized.split(' ').filter(Boolean);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function isSubsequence(needle: string, haystack: string): boolean {
// [VI] Rẽ nhánh điều kiện (if).
  if (!needle) return true;
// [VI] Khai báo biến/hằng số.
  let j = 0;
// [VI] Vòng lặp (for).
  for (let i = 0; i < haystack.length && j < needle.length; i += 1) {
// [VI] Rẽ nhánh điều kiện (if).
    if (haystack[i] === needle[j]) j += 1;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return j === needle.length;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function scoreToken(token: string, normalizedOption: string): number {
// [VI] Rẽ nhánh điều kiện (if).
  if (!token) return 0;
// [VI] Rẽ nhánh điều kiện (if).
  if (normalizedOption === token) return 500;
// [VI] Rẽ nhánh điều kiện (if).
  if (normalizedOption.startsWith(token)) return 300;
// [VI] Rẽ nhánh điều kiện (if).
  if (normalizedOption.includes(` ${token}`)) return 220;
// [VI] Rẽ nhánh điều kiện (if).
  if (normalizedOption.includes(token)) return 160;
// [VI] Rẽ nhánh điều kiện (if).
  if (isSubsequence(token, normalizedOption)) return 80;
// [VI] Trả về kết quả từ hàm.
  return -1;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Returns a ranking score for an option against a query.
// [VI] Thực thi một bước trong luồng xử lý.
 * Higher is better. Returns -1 when option should be excluded.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function scoreSearchOption(option: string, query: string): number {
// [VI] Khai báo biến/hằng số.
  const normalizedOption = normalizeSearchText(option);
// [VI] Khai báo biến/hằng số.
  const tokens = tokenizeSearchText(query);
// [VI] Rẽ nhánh điều kiện (if).
  if (!tokens.length) return 0;

// [VI] Khai báo biến/hằng số.
  let score = 0;
// [VI] Vòng lặp (for).
  for (const token of tokens) {
// [VI] Khai báo biến/hằng số.
    const tokenScore = scoreToken(token, normalizedOption);
// [VI] Rẽ nhánh điều kiện (if).
    if (tokenScore < 0) return -1;
// [VI] Thực thi một bước trong luồng xử lý.
    score += tokenScore;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return score;
// [VI] Thực thi một bước trong luồng xử lý.
}
