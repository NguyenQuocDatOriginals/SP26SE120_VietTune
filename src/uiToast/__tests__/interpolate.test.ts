// [VI] Nhập (import) các phụ thuộc cho file.
import { describe, expect, it } from 'vitest';

// [VI] Nhập (import) các phụ thuộc cho file.
import { interpolate } from '../interpolate';

// [VI] Khai báo hàm/biểu thức hàm.
describe('interpolate', () => {
// [VI] Khai báo hàm/biểu thức hàm.
  it('replaces {{key}} with string values', () => {
// [VI] Thực thi một bước trong luồng xử lý.
    expect(interpolate('Bước {{step}}', { step: 2 })).toBe('Bước 2');
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Khai báo hàm/biểu thức hàm.
  it('replaces with number', () => {
// [VI] Thực thi một bước trong luồng xử lý.
    expect(interpolate('n={{n}}', { n: 0 })).toBe('n=0');
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Khai báo hàm/biểu thức hàm.
  it('missing key becomes empty string', () => {
// [VI] Thực thi một bước trong luồng xử lý.
    expect(interpolate('x{{a}}y', {})).toBe('xy');
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
});
