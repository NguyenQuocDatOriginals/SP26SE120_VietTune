// [VI] Nhập (import) các phụ thuộc cho file.
import { describe, expect, it } from 'vitest';

// [VI] Nhập (import) các phụ thuộc cho file.
import { normalizeSearchText, scoreSearchOption, tokenizeSearchText } from './searchText';

// [VI] Khai báo hàm/biểu thức hàm.
describe('searchText utils', () => {
// [VI] Khai báo hàm/biểu thức hàm.
  it('normalizes vietnamese diacritics and spaces', () => {
// [VI] Thực thi một bước trong luồng xử lý.
    expect(normalizeSearchText('  Đàn   Bầu ')).toBe('dan bau');
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Khai báo hàm/biểu thức hàm.
  it('tokenizes normalized query', () => {
// [VI] Thực thi một bước trong luồng xử lý.
    expect(tokenizeSearchText('Đàn Bầu truyền thống')).toEqual(['dan', 'bau', 'truyen', 'thong']);
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Khai báo hàm/biểu thức hàm.
  it('scores matching options and excludes unrelated ones', () => {
// [VI] Thực thi một bước trong luồng xử lý.
    expect(scoreSearchOption('Đàn bầu', 'dan')).toBeGreaterThan(0);
// [VI] Thực thi một bước trong luồng xử lý.
    expect(scoreSearchOption('Sáo trúc', 'dan bau')).toBe(-1);
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
});
