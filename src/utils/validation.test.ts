// [VI] Nhập (import) các phụ thuộc cho file.
import { describe, expect, it } from 'vitest';

// [VI] Nhập (import) các phụ thuộc cho file.
import {
// [VI] Thực thi một bước trong luồng xử lý.
  validateAudioFile,
// [VI] Thực thi một bước trong luồng xử lý.
  validateEmail,
// [VI] Thực thi một bước trong luồng xử lý.
  validateImageFile,
// [VI] Thực thi một bước trong luồng xử lý.
  validatePassword,
// [VI] Thực thi một bước trong luồng xử lý.
} from './validation';

// [VI] Khai báo hàm/biểu thức hàm.
describe('validation utils', () => {
// [VI] Khai báo hàm/biểu thức hàm.
  it('validates audio file type and size', () => {
// [VI] Khai báo biến/hằng số.
    const ok = new File([new Uint8Array([1, 2, 3])], 'a.mp3', { type: 'audio/mpeg' });
// [VI] Thực thi một bước trong luồng xử lý.
    expect(validateAudioFile(ok)).toEqual({ valid: true });

// [VI] Khai báo biến/hằng số.
    const badType = new File([new Uint8Array([1])], 'a.txt', { type: 'text/plain' });
// [VI] Thực thi một bước trong luồng xử lý.
    expect(validateAudioFile(badType).valid).toBe(false);
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Khai báo hàm/biểu thức hàm.
  it('validates image file type and size', () => {
// [VI] Khai báo biến/hằng số.
    const ok = new File([new Uint8Array([1, 2, 3])], 'a.png', { type: 'image/png' });
// [VI] Thực thi một bước trong luồng xử lý.
    expect(validateImageFile(ok)).toEqual({ valid: true });

// [VI] Khai báo biến/hằng số.
    const bad = new File([new Uint8Array([1])], 'a.gif', { type: 'image/gif' });
// [VI] Thực thi một bước trong luồng xử lý.
    expect(validateImageFile(bad).valid).toBe(false);
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Khai báo hàm/biểu thức hàm.
  it('validates email format', () => {
// [VI] Thực thi một bước trong luồng xử lý.
    expect(validateEmail('tester@example.com')).toBe(true);
// [VI] Thực thi một bước trong luồng xử lý.
    expect(validateEmail('not-an-email')).toBe(false);
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Khai báo hàm/biểu thức hàm.
  it('validates password complexity', () => {
// [VI] Khai báo biến/hằng số.
    const strong = validatePassword('Abcdef1');
// [VI] Thực thi một bước trong luồng xử lý.
    expect(strong.valid).toBe(true);
// [VI] Thực thi một bước trong luồng xử lý.
    expect(strong.errors).toEqual([]);

// [VI] Khai báo biến/hằng số.
    const weak = validatePassword('abc');
// [VI] Thực thi một bước trong luồng xử lý.
    expect(weak.valid).toBe(false);
// [VI] Thực thi một bước trong luồng xử lý.
    expect(weak.errors.length).toBeGreaterThan(0);
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
});
