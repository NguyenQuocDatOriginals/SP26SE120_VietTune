// [VI] Nhập (import) các phụ thuộc cho file.
import { describe, expect, it } from 'vitest';

// [VI] Nhập (import) các phụ thuộc cho file.
import { extractArray, extractObject } from './apiHelpers';

// [VI] Khai báo hàm/biểu thức hàm.
describe('apiHelpers', () => {
// [VI] Khai báo hàm/biểu thức hàm.
  describe('extractArray', () => {
// [VI] Khai báo hàm/biểu thức hàm.
    it('returns array directly', () => {
// [VI] Thực thi một bước trong luồng xử lý.
      expect(extractArray<number>([1, 2, 3])).toEqual([1, 2, 3]);
// [VI] Thực thi một bước trong luồng xử lý.
    });

// [VI] Khai báo hàm/biểu thức hàm.
    it('unwraps nested envelope keys', () => {
// [VI] Khai báo biến/hằng số.
      const payload = {
// [VI] Thực thi một bước trong luồng xử lý.
        Data: {
// [VI] Thực thi một bước trong luồng xử lý.
          items: [{ id: 'a' }, { id: 'b' }],
// [VI] Thực thi một bước trong luồng xử lý.
        },
// [VI] Thực thi một bước trong luồng xử lý.
      };
// [VI] Thực thi một bước trong luồng xử lý.
      expect(extractArray<{ id: string }>(payload)).toEqual([{ id: 'a' }, { id: 'b' }]);
// [VI] Thực thi một bước trong luồng xử lý.
    });

// [VI] Khai báo hàm/biểu thức hàm.
    it('returns empty array for non-array payloads', () => {
// [VI] Thực thi một bước trong luồng xử lý.
      expect(extractArray<string>({ foo: 'bar' })).toEqual([]);
// [VI] Thực thi một bước trong luồng xử lý.
      expect(extractArray<string>(null)).toEqual([]);
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Khai báo hàm/biểu thức hàm.
  describe('extractObject', () => {
// [VI] Khai báo hàm/biểu thức hàm.
    it('unwraps data object', () => {
// [VI] Thực thi một bước trong luồng xử lý.
      expect(extractObject({ data: { id: 'x' } })).toEqual({ id: 'x' });
// [VI] Thực thi một bước trong luồng xử lý.
    });

// [VI] Khai báo hàm/biểu thức hàm.
    it('unwraps item object', () => {
// [VI] Thực thi một bước trong luồng xử lý.
      expect(extractObject({ item: { id: 'x' } })).toEqual({ id: 'x' });
// [VI] Thực thi một bước trong luồng xử lý.
    });

// [VI] Khai báo hàm/biểu thức hàm.
    it('returns null for invalid input', () => {
// [VI] Thực thi một bước trong luồng xử lý.
      expect(extractObject(null)).toBeNull();
// [VI] Thực thi một bước trong luồng xử lý.
      expect(extractObject('text')).toBeNull();
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
});
